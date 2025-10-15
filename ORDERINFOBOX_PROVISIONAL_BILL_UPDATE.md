# OrderInfoBox - Thêm Chức năng Tạm Tính

## 🎯 Mục đích
Thay thế nút "In phiếu kiểm đồ" (`print_check`) bằng chức năng **Tạm tính** (`toggle_provisional`) để người dùng có thể bật/tắt trạng thái tạm tính cho order ngay từ OrderInfoBox.

## ✅ Những gì đã thay đổi

### 1. **Interface OrderDetails**
Thêm trường `is_provisional`:
```typescript
interface OrderDetails {
  orderId: string | null;
  orderTime: string;
  totalItems: number;
  totalPrice: number;
  is_provisional?: boolean; // ✨ MỚI
}
```

### 2. **State Management**
Thêm state để quản lý trạng thái loading khi toggle:
```typescript
const [isTogglingProvisional, setIsTogglingProvisional] = useState(false);
```

### 3. **Fetch Order Details**
Cập nhật query để lấy thêm trường `is_provisional`:
```typescript
.select(`id, created_at, is_provisional, order_items(quantity, unit_price), order_tables!inner(table_id)`)
```

### 4. **Menu Actions**
Thay thế action `print_check` bằng `toggle_provisional`:
```typescript
// ❌ CŨ
{ icon: 'print-outline', text: 'In phiếu kiểm đồ', action: 'print_check' }

// ✅ MỚI
{ 
  icon: 'receipt-outline', 
  text: orderDetails?.is_provisional ? 'Tắt Tạm tính' : 'Bật Tạm tính', 
  action: 'toggle_provisional', 
  color: orderDetails?.is_provisional ? '#10B981' : '#6B7280' 
}
```

### 5. **Handle Action Press**
Thêm xử lý cho action `toggle_provisional`:
```typescript
if (action === 'toggle_provisional') {
  setTimeout(() => handleToggleProvisionalBill(), 200);
  return;
}
```

### 6. **Toggle Provisional Bill Function**
Thêm function mới để xử lý toggle:
```typescript
const handleToggleProvisionalBill = async () => {
  // Validate
  if (!orderDetails?.orderId) {
    Toast.show({ type: 'error', ... });
    return;
  }

  setIsTogglingProvisional(true);
  
  try {
    // Gọi RPC function
    const { error } = await supabase.rpc('toggle_provisional_bill_status', {
      p_order_id: orderDetails.orderId
    });
    
    if (error) throw error;

    // Cập nhật UI ngay
    const newStatus = !orderDetails.is_provisional;
    setOrderDetails(prev => prev ? { ...prev, is_provisional: newStatus } : null);
    
    // Hiển thị Toast
    Toast.show({
      type: newStatus ? 'success' : 'info',
      text1: newStatus ? 'Đã bật tạm tính' : 'Đã tắt tạm tính',
      text2: `Bàn ${tableName} - ${newStatus ? 'Hiển thị trong tab Tạm tính' : 'Đã ẩn khỏi tab Tạm tính'}`
    });
    
  } catch (err: any) {
    Toast.show({ type: 'error', ... });
  } finally {
    setIsTogglingProvisional(false);
  }
};
```

### 7. **UI Updates**

#### A. Status Indicator (Trong phần info)
```typescript
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={styles.statusText}>Đang phục vụ</Text>
  {orderDetails.is_provisional && (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
      <Icon name="restaurant" size={16} color="#10B981" />
      <Text style={{ color: '#E0E0E0', fontSize: 12, marginLeft: 4 }}>Tạm tính</Text>
    </View>
  )}
</View>
```

#### B. Quick Action Button (Thay thế nút print_check)
```typescript
<TouchableOpacity
  style={styles.actionButton}
  onPress={handleToggleProvisionalBill}
  disabled={isTogglingProvisional}
>
  {isTogglingProvisional ? (
    <ActivityIndicator size="small" color="#3B82F6" />
  ) : (
    <Icon 
      name="receipt-outline" 
      size={24} 
      color={orderDetails.is_provisional ? '#10B981' : '#555'} 
    />
  )}
</TouchableOpacity>
```

## 🎨 Visual Changes

### Trước khi toggle (Chưa bật tạm tính):
```
┌─────────────────────────────────┐
│ Thông tin Bàn 1                 │
├─────────────────────────────────┤
│ Order: 10:30                    │
│ Đang phục vụ                    │  <- Không có icon
│                       5 món     │
│                       250,000đ  │
├─────────────────────────────────┤
│  💰  |  🍴  |  📄  |  ⋯         │
│              ↑ Xám              │
└─────────────────────────────────┘
```

### Sau khi toggle (Đã bật tạm tính):
```
┌─────────────────────────────────┐
│ Thông tin Bàn 1                 │
├─────────────────────────────────┤
│ Order: 10:30                    │
│ Đang phục vụ 🍴 Tạm tính       │  <- Có icon xanh
│                       5 món     │
│                       250,000đ  │
├─────────────────────────────────┤
│  💰  |  🍴  |  📄  |  ⋯         │
│              ↑ Xanh lá          │
└─────────────────────────────────┘
```

## 🔄 User Flow

1. **Người dùng nhấn vào bàn** → OrderInfoBox hiển thị
2. **Nhấn nút receipt (thứ 3 từ trái)** → Toggle tạm tính
3. **Hiển thị loading** → ActivityIndicator trong khi xử lý
4. **Cập nhật UI ngay lập tức**:
   - Icon đổi màu xanh (nếu bật) hoặc xám (nếu tắt)
   - Hiển thị badge "Tạm tính" bên cạnh "Đang phục vụ"
5. **Toast notification** → Thông báo trạng thái mới

## 📊 So sánh với OrderScreen

| Tính năng | OrderScreen | OrderInfoBox |
|-----------|-------------|--------------|
| Vị trí nút | Trong card list item | Quick action button #3 |
| Icon color | Xanh (#2E8540) / Xám | Xanh (#10B981) / Xám (#555) |
| Loading state | ActivityIndicator thay icon | ActivityIndicator thay icon |
| Status badge | Có | Có (giống y hệt) |
| Toast message | Có | Có (giống y hệt) |

## 🧪 Testing Instructions

### Test Case 1: Toggle từ OFF → ON
1. Mở OrderInfoBox của bàn có order (chưa bật tạm tính)
2. Nhấn nút receipt (icon xám)
3. **Expected**: 
   - Loading spinner xuất hiện
   - Toast "Đã bật tạm tính" hiển thị
   - Icon đổi màu xanh
   - Badge "Tạm tính" xuất hiện

### Test Case 2: Toggle từ ON → OFF
1. Mở OrderInfoBox của bàn đã bật tạm tính (icon xanh)
2. Nhấn nút receipt (icon xanh)
3. **Expected**:
   - Loading spinner xuất hiện
   - Toast "Đã tắt tạm tính" hiển thị
   - Icon đổi màu xám
   - Badge "Tạm tính" biến mất

### Test Case 3: Toggle từ menu actions
1. Mở OrderInfoBox
2. Nhấn nút menu (3 chấm)
3. Chọn "Bật Tạm tính" hoặc "Tắt Tạm tính"
4. **Expected**: Giống như test case 1 & 2

### Test Case 4: Không có order
1. Mở OrderInfoBox của bàn không có order
2. Không có nút toggle (bàn trống)
3. **Expected**: Hiển thị "Tạo Order Mới"

## 📝 Notes

- Function `toggle_provisional_bill_status` đã tồn tại trong database (RPC)
- Không cần thay đổi gì ở HomeScreen vì action được xử lý nội bộ
- Text trong menu động: "Bật Tạm tính" khi OFF, "Tắt Tạm tính" khi ON
- Màu sắc nhất quán với OrderScreen

## ✨ Benefits

1. **Tiện lợi hơn**: Không cần vào OrderScreen để toggle tạm tính
2. **Visual feedback rõ ràng**: Icon đổi màu + badge status
3. **Consistent UX**: Giống hệt OrderScreen
4. **Accessible**: Có thể toggle từ 2 chỗ (quick button + menu)

---

**Created**: 15/10/2025  
**Version**: 1.0  
**Component**: OrderInfoBox.tsx
