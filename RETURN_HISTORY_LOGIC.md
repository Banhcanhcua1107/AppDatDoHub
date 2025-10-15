# LOGIC NGHIỆP VỤ TRẢ MÓN - RETURN HISTORY FEATURE

## 📋 Tổng quan
Tính năng "Lịch sử trả món" cho phép nhân viên bếp xem lại tất cả các món đã bị trả về từ khách hàng/nhân viên phục vụ, giúp theo dõi và cải thiện chất lượng món ăn.

## 🔄 Quy trình nghiệp vụ

### 1. Khi nhân viên phục vụ trả món về bếp
```
Nhân viên phục vụ → Màn hình OrderConfirmationScreen 
→ Chọn món cần trả → Chọn lý do 
→ Bấm "Trả món" 
→ Tạo bản ghi trong `return_notifications`
```

**Dữ liệu được lưu:**
- `order_id`: ID đơn hàng
- `table_name`: Tên bàn (VD: Bàn A04)
- `item_names`: Mảng tên các món bị trả (VD: ["Cà điều hồng náu lẩu ngọt", "Gỏi bòn hòn tôm thịt"])
- `status`: "pending" (chờ xử lý)
- `created_at`: Thời gian trả món

### 2. Bếp nhận thông báo realtime
```
Supabase Realtime → KitchenDisplayScreen/KitchenDetailScreen
→ Hiển thị thông báo trả món
→ Nhân viên bếp xử lý
```

### 3. Xem lịch sử trả món
```
Bếp → Tiện ích → Lịch sử trả món
→ Xem danh sách tất cả món đã bị trả
→ Lọc theo trạng thái (Tất cả / Chờ xử lý / Đã xử lý)
→ Tìm kiếm theo bàn hoặc tên món
```

## 🗄️ Cấu trúc Database

### Bảng: `return_notifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | ID duy nhất |
| `order_id` | UUID | ID đơn hàng (FK → orders.id) |
| `table_name` | TEXT | Tên bàn |
| `item_names` | TEXT[] | Mảng tên các món bị trả |
| `status` | TEXT | 'pending' hoặc 'acknowledged' |
| `created_at` | TIMESTAMPTZ | Thời gian trả món |
| `acknowledged_at` | TIMESTAMPTZ | Thời gian xử lý (nullable) |

## 📱 Màn hình: ReturnHistoryScreen

### Chức năng chính:

#### 1. Hiển thị danh sách món trả
- **Card hiển thị:**
  - Tên bàn + icon nhà hàng
  - Trạng thái: "Chờ xử lý" (đỏ) hoặc "Đã xử lý" (xanh lá)
  - Danh sách món bị trả (với icon ⊖)
  - Thời gian trả món (tương đối: "5 phút trước", "2 giờ trước")
  - Thời gian xử lý (nếu đã xử lý)

#### 2. Bộ lọc 3 tab
- **Tất cả**: Hiển thị tất cả món trả (pending + acknowledged)
- **Chờ xử lý**: Chỉ hiển thị status = 'pending'
- **Đã xử lý**: Chỉ hiển thị status = 'acknowledged'

Hiển thị số lượng trong ngoặc: `Tất cả (15)`, `Chờ xử lý (3)`, `Đã xử lý (12)`

#### 3. Tìm kiếm
- Tìm theo **tên bàn**: "A04", "B12"
- Tìm theo **tên món**: "Cà điều", "Gỏi bòn"
- Không phân biệt hoa thường

#### 4. Realtime Updates
- Lắng nghe channel `public:return_notifications:history`
- Tự động cập nhật khi có:
  - Món mới bị trả (INSERT)
  - Trạng thái thay đổi (UPDATE)
  - Món bị xóa (DELETE)

## 🎨 UI/UX Design

### Màu sắc theo trạng thái:

**Pending (Chờ xử lý):**
- Background header: `#FEF2F2` (đỏ nhạt)
- Border: `#FEE2E2`
- Badge: `#FEE2E2` với text `#DC2626`
- Icon: đỏ `#DC2626`

**Acknowledged (Đã xử lý):**
- Background header: `#FEF2F2` (giữ nguyên)
- Text màu xám: `#6B7280`
- Badge: `#D1FAE5` với text `#059669`
- Icon: xanh lá `#10B981`

### Thông tin hiển thị thời gian:

```typescript
formatDate() function:
- < 1 phút: "Vừa xong"
- < 60 phút: "X phút trước"
- < 24 giờ: "X giờ trước"
- < 7 ngày: "X ngày trước"
- >= 7 ngày: "DD/MM/YYYY HH:mm"
```

## 🔐 Bảo mật & Quyền truy cập

### Row Level Security (RLS)
- ✅ **SELECT**: Tất cả người dùng (authenticated)
- ✅ **INSERT**: Chỉ authenticated users
- ✅ **UPDATE**: Chỉ authenticated users (thay đổi status)
- ✅ **DELETE**: Chỉ authenticated users (xóa lịch sử cũ)

## 📊 Use Cases

### UC1: Nhân viên bếp xem lịch sử trả món
**Actor:** Nhân viên bếp
**Flow:**
1. Vào Tiện ích → Lịch sử trả món
2. Hệ thống load tất cả `return_notifications` từ DB
3. Hiển thị danh sách theo thứ tự thời gian (mới nhất trước)

**Expected Result:**
- Màn hình hiển thị danh sách card
- Mỗi card chứa thông tin món trả đầy đủ

### UC2: Lọc món chờ xử lý
**Actor:** Nhân viên bếp
**Flow:**
1. Mở màn hình Lịch sử trả món
2. Bấm tab "Chờ xử lý"
3. Hệ thống lọc `status = 'pending'`

**Expected Result:**
- Chỉ hiển thị món chưa xử lý
- Số lượng trong tab được cập nhật

### UC3: Tìm kiếm món trả theo bàn
**Actor:** Nhân viên bếp
**Flow:**
1. Mở màn hình Lịch sử trả món
2. Nhập "A04" vào search bar
3. Hệ thống filter `table_name.includes("A04")`

**Expected Result:**
- Chỉ hiển thị món trả từ Bàn A04
- Nếu không có → "Không tìm thấy kết quả nào"

### UC4: Realtime - Món mới bị trả
**Actor:** Hệ thống
**Flow:**
1. Nhân viên phục vụ trả món từ OrderConfirmationScreen
2. INSERT vào `return_notifications`
3. Supabase Realtime trigger event
4. ReturnHistoryScreen nhận event
5. Gọi lại `fetchReturnHistory()`

**Expected Result:**
- Món mới xuất hiện đầu danh sách
- Không cần reload màn hình

## 🔗 Integration Points

### 1. ReturnSelectionScreen (Staff)
```typescript
// Khi staff trả món
const { data, error } = await supabase
  .from('return_notifications')
  .insert({
    order_id: orderId,
    table_name: tableName,
    item_names: selectedItems.map(i => i.name),
    status: 'pending'
  });
```

### 2. ReturnNotificationScreen (Kitchen)
```typescript
// Khi bếp xác nhận đã xử lý
const { error } = await supabase
  .from('return_notifications')
  .update({ 
    status: 'acknowledged',
    acknowledged_at: new Date().toISOString()
  })
  .eq('id', notificationId);
```

### 3. ReturnHistoryScreen (Kitchen)
```typescript
// Chỉ xem, không thao tác
const { data } = await supabase
  .from('return_notifications')
  .select('*')
  .order('created_at', { ascending: false });
```

## 🎯 Mục đích nghiệp vụ

### 1. Theo dõi chất lượng
- Xem món nào thường bị trả nhiều
- Phân tích nguyên nhân (món không ngon, chế biến sai)
- Cải thiện quy trình chế biến

### 2. Trách nhiệm rõ ràng
- Biết món nào bị trả, bàn nào trả
- Kiểm tra thời gian trả món
- Đối chiếu với ca làm việc

### 3. Báo cáo quản lý
- Thống kê số lượng món trả theo ngày/tuần/tháng
- So sánh giữa các món ăn
- Đánh giá hiệu suất nhân viên bếp

## ⚠️ Lưu ý kỹ thuật

### 1. Performance
- Dữ liệu lịch sử có thể rất nhiều (hàng nghìn record)
- **Giải pháp:** Có thể implement pagination nếu cần
- Hiện tại: Load tất cả (phù hợp với nhà hàng nhỏ/vừa)

### 2. Data Retention
- Nên xóa dữ liệu cũ (> 3 tháng) định kỳ
- **Implement:** Cron job hoặc xóa thủ công qua SQL

```sql
-- Xóa dữ liệu cũ hơn 90 ngày
DELETE FROM return_notifications 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 3. Realtime Channel
- Channel name: `public:return_notifications:history`
- Khác với channel của ReturnNotificationScreen để tránh conflict
- Tự động unsubscribe khi unmount screen

## 🚀 Tính năng mở rộng (Future)

### 1. Thêm lý do trả món
- Column mới: `return_reason` (TEXT)
- Hiển thị trong card lịch sử

### 2. Thêm ảnh minh chứng
- Column mới: `image_url` (TEXT)
- Upload ảnh món bị trả lên Supabase Storage

### 3. Thống kê nâng cao
- Biểu đồ món trả theo thời gian
- Top 10 món bị trả nhiều nhất
- Phân tích theo nhân viên bếp

### 4. Export báo cáo
- Export Excel/PDF
- Gửi email báo cáo cuối ngày cho quản lý

## ✅ Checklist Implementation

- [x] Tạo bảng `return_notifications` trong Supabase
- [x] Tạo màn hình `ReturnHistoryScreen.tsx`
- [x] Thêm route vào `KitchenStackParamList`
- [x] Thêm navigation vào `AppNavigator.tsx`
- [x] Thêm nút "Lịch sử trả món" trong `KitchenUtilitiesScreen.tsx`
- [x] Implement realtime updates
- [x] Implement search & filter
- [x] Style UI theo design system
- [x] Tạo hàm `formatDate()` trong utils
- [ ] Test trên thiết bị thật
- [ ] Test realtime với multiple users
- [ ] Kiểm tra performance với nhiều dữ liệu

## 📝 Testing Scenarios

### Test 1: Hiển thị danh sách
1. Truy cập Tiện ích → Lịch sử trả món
2. **Expected:** Hiển thị tất cả món đã trả, mới nhất trước

### Test 2: Filter theo status
1. Bấm tab "Chờ xử lý"
2. **Expected:** Chỉ show pending items
3. Bấm tab "Đã xử lý"
4. **Expected:** Chỉ show acknowledged items

### Test 3: Search
1. Nhập "A04" vào search
2. **Expected:** Chỉ show món từ Bàn A04
3. Nhập "Cà điều"
4. **Expected:** Show tất cả món có chứa "Cà điều"

### Test 4: Realtime
1. Mở ReturnHistoryScreen trên thiết bị A (Bếp)
2. Mở OrderConfirmationScreen trên thiết bị B (Staff)
3. Trả món từ thiết bị B
4. **Expected:** Thiết bị A tự động hiển thị món mới bị trả

### Test 5: Empty state
1. Xóa hết dữ liệu return_notifications
2. Mở ReturnHistoryScreen
3. **Expected:** Hiển thị "Chưa có món nào bị trả" với icon

---

**Created:** 2025-01-XX
**Last Updated:** 2025-01-XX
**Version:** 1.0
