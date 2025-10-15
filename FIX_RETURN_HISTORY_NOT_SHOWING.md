# Fix Lỗi Không Hiển Thị Lịch Sử Trả Món

## Vấn Đề

Khi nhân viên phục vụ bấm "Trả món", dữ liệu được lưu vào database nhưng **không hiển thị** trong màn hình "Lịch sử trả món" của Bếp.

## Nguyên Nhân

Có **2 hệ thống riêng biệt** không đồng bộ với nhau:

### Hệ thống 1: Trả món của Nhân viên (ReturnSelectionScreen)
```
return_slips (phiếu trả món)
  └── return_slip_items (chi tiết món trả)
```

**Dùng cho:**
- ReturnItemsScreen (Nhân viên xem danh sách order có món trả)
- ReturnedItemsDetailScreen (Chi tiết món đã trả)

### Hệ thống 2: Lịch sử trả món của Bếp (ReturnHistoryScreen)
```
return_notifications (thông báo trả món cho bếp)
```

**Dùng cho:**
- ReturnHistoryScreen (Bếp xem lịch sử tất cả món bị trả)

### Vấn đề cụ thể:

Khi trả món, **ReturnSelectionScreen** chỉ insert vào:
- ✅ `return_slips` 
- ✅ `return_slip_items`
- ❌ **KHÔNG** insert vào `return_notifications`

→ Bếp không thấy lịch sử trả món!

## Giải Pháp

Thêm logic insert vào `return_notifications` khi trả món để đồng bộ hóa 2 hệ thống.

### Code đã thêm vào ReturnSelectionScreen.tsx

```tsx
// Sau khi insert vào return_slip_items thành công

// [THÊM MỚI] Lấy thông tin bàn từ order
const { data: orderData } = await supabase
  .from('orders')
  .select(`
    id,
    order_tables (
      tables (
        name
      )
    )
  `)
  .eq('id', orderId)
  .single();

let tableNames = 'Không xác định';
if (orderData && orderData.order_tables && orderData.order_tables.length > 0) {
  tableNames = orderData.order_tables.map((ot: any) => ot.tables.name).join(', ');
}

// Lấy tên món từ items ban đầu
const itemNames = itemsToReturnList.map(returnItem => {
  const originalItem = items.find(i => i.id === returnItem.order_item_id);
  return originalItem?.name || 'Món không xác định';
});

// Insert vào return_notifications để bếp có thể xem lịch sử
const { error: notificationError } = await supabase
  .from('return_notifications')
  .insert({
    order_id: orderId,
    table_name: tableNames,
    item_names: itemNames,
    status: 'pending',
  });

if (notificationError) {
  console.error('Error creating return notification:', notificationError);
  // Không throw error vì đây chỉ là notification, không ảnh hưởng chính
}
```

## Cách Hoạt Động

### Trước khi fix:
```
Nhân viên trả món
    ↓
Insert vào return_slips + return_slip_items
    ↓
ReturnHistoryScreen đọc từ return_notifications
    ↓
❌ Không có dữ liệu → Không hiển thị
```

### Sau khi fix:
```
Nhân viên trả món
    ↓
Insert vào return_slips + return_slip_items
    ↓
Insert vào return_notifications ← MỚI THÊM
    ↓
ReturnHistoryScreen đọc từ return_notifications
    ↓
✅ Có dữ liệu → Hiển thị lịch sử trả món
```

## Luồng Hoạt Động Hoàn Chỉnh

1. **Nhân viên phục vụ** (OrderConfirmationScreen):
   - Khách yêu cầu trả món
   - Nhấn nút "Trả món"
   - Chọn món cần trả và nhập lý do

2. **ReturnSelectionScreen**:
   - Insert vào `return_slips` (tạo phiếu trả)
   - Insert vào `return_slip_items` (chi tiết món trả)
   - **[MỚI]** Insert vào `return_notifications` (thông báo cho bếp)
   - Update `returned_quantity` trong `order_items`

3. **Bếp** (ReturnHistoryScreen):
   - Vào menu Tiện ích → Lịch sử trả món
   - Xem tất cả món đã bị trả
   - Lọc theo trạng thái: Pending / Acknowledged
   - Tìm kiếm theo bàn hoặc tên món

4. **Realtime Sync**:
   - ReturnHistoryScreen subscribe vào `return_notifications` table
   - Khi có món mới bị trả → Tự động cập nhật danh sách

## Cấu Trúc Dữ Liệu

### return_notifications table
```sql
CREATE TABLE return_notifications (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  item_names TEXT[] NOT NULL,           -- Danh sách tên món bị trả
  status TEXT DEFAULT 'pending',         -- 'pending' | 'acknowledged'
  created_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP
);
```

### Ví dụ dữ liệu:
```json
{
  "id": 1,
  "order_id": "abc123",
  "table_name": "Bàn 02, Bàn 03",
  "item_names": ["Cà phê sữa đá", "Trà đào"],
  "status": "pending",
  "created_at": "2025-10-15T10:30:00",
  "acknowledged_at": null
}
```

## File Đã Thay Đổi

- ✅ `screens/Orders/ReturnSelectionScreen.tsx`

## Test Kịch Bản

### Test 1: Trả món đơn giản
1. Đăng nhập với tài khoản Nhân viên
2. Vào order đang phục vụ
3. Nhấn "Trả món"
4. Chọn 1 món, nhập lý do, xác nhận
5. Đăng nhập với tài khoản Bếp
6. Vào "Lịch sử trả món"
7. **✅ Kiểm tra:** Món vừa trả phải hiển thị

### Test 2: Trả nhiều món
1. Trả 3 món cùng lúc
2. Kiểm tra lịch sử trả món
3. **✅ Kiểm tra:** Hiển thị 1 record với 3 tên món

### Test 3: Realtime update
1. Mở ReturnHistoryScreen trên thiết bị A (Bếp)
2. Trả món trên thiết bị B (Nhân viên)
3. **✅ Kiểm tra:** Thiết bị A tự động cập nhật danh sách

### Test 4: Search & Filter
1. Trả nhiều món ở các bàn khác nhau
2. Tìm kiếm theo tên bàn
3. **✅ Kiểm tra:** Lọc đúng kết quả
4. Lọc theo status (Pending/Acknowledged)
5. **✅ Kiểm tra:** Hiển thị đúng trạng thái

## Lưu Ý

1. **Không throw error** nếu insert vào `return_notifications` thất bại
   - Lý do: Đây chỉ là notification, không ảnh hưởng đến logic chính
   - Món vẫn được trả thành công dù notification lỗi

2. **Error handling**: Log error để debug nhưng không ngừng process

3. **Performance**: Insert vào return_notifications sau khi insert vào return_slip_items thành công

4. **Tên bàn**: Lấy từ `order_tables` và ghép lại nếu order có nhiều bàn

5. **Tên món**: Lấy từ `items` param được truyền vào ReturnSelectionScreen

## Tương Lai: Giải Pháp Tốt Hơn

Thay vì insert thủ công ở code, nên tạo **Database Trigger**:

```sql
CREATE OR REPLACE FUNCTION create_return_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Tự động tạo notification khi có return_slip mới
  INSERT INTO return_notifications (order_id, table_name, item_names, status)
  SELECT 
    NEW.order_id,
    string_agg(t.name, ', '),
    ARRAY_AGG(DISTINCT mi.name),
    'pending'
  FROM return_slip_items rsi
  JOIN order_items oi ON rsi.order_item_id = oi.id
  JOIN menu_items mi ON oi.menu_item_id = mi.id
  JOIN order_tables ot ON oi.order_id = ot.order_id
  JOIN tables t ON ot.table_id = t.id
  WHERE rsi.return_slip_id = NEW.id
  GROUP BY NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_return_notification
AFTER INSERT ON return_slips
FOR EACH ROW
EXECUTE FUNCTION create_return_notification();
```

→ Code sẽ đơn giản hơn, logic tập trung ở database
