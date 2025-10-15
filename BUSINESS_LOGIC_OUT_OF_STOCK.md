# 🍽️ Logic Nghiệp Vụ: Báo Hết Món từ Bếp

## 📖 Tình huống

### **Kịch bản:**
1. **Staff** ở `MenuScreen` thêm **Món A** vào Bàn 1 → Bấm "Đồng ý" → Chuyển sang `OrderConfirmationScreen`
2. **Staff** bấm "Gửi bếp" → Món A được gửi vào bếp (status = `pending`)
3. **Bếp** vào `ItemAvailabilityScreen` → Bấm "Báo hết" cho Món A → `is_available = false`
4. **Staff** vẫn đang ở `OrderConfirmationScreen` → **Cần biết Món A đã hết**

---

## ✅ Giải pháp đã triển khai

### **1. Cập nhật Database Schema**
```sql
-- Bảng menu_items đã có cột is_available
menu_items
  ├── id (int)
  ├── name (text)
  ├── price (numeric)
  ├── is_available (boolean) -- ✅ Trạng thái còn hàng
  └── ...
```

### **2. Cập nhật Query trong OrderConfirmationScreen**

#### **Trước đây:**
```typescript
.select(`
  id, status, 
  order_items(
    id, quantity, unit_price, customizations,
    menu_items(name, image_url)  // ❌ Thiếu is_available
  )
`)
```

#### **Sau khi sửa:**
```typescript
.select(`
  id, status, 
  order_items(
    id, quantity, unit_price, customizations,
    menu_items(name, image_url, is_available)  // ✅ Thêm is_available
  )
`)
```

---

### **3. Cập nhật Interface DisplayItem**

```typescript
interface DisplayItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  // ... các trường khác ...
  is_available?: boolean; // ✅ Thêm trường mới
}
```

---

### **4. Hiển thị Badge "Hết món" trên UI**

#### **Component OrderListItem:**
```tsx
const OrderListItem = ({ item, ... }) => {
  const isOutOfStock = item.is_available === false; // ✅ Kiểm tra món hết
  
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>{item.name}</Text>
        
        {/* ✅ Badge cảnh báo món hết */}
        {isOutOfStock && !isPaid && !isReturnedItem && (
          <View className="bg-red-100 px-2 py-1 rounded-full ml-2">
            <Icon name="alert-circle" size={14} color="#DC2626" />
            <Text className="text-red-800 text-xs font-bold">Hết món</Text>
          </View>
        )}
      </View>
    </View>
  );
};
```

---

### **5. Realtime Listener - Tự động cập nhật khi món hết**

```typescript
useFocusEffect(
  useCallback(() => {
    // Kênh 1: Lắng nghe thay đổi order_items, cart_items
    const orderChannel = supabase
      .channel(`public:order_confirmation_v2:${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData(false);
      })
      .subscribe();
    
    // ✅ Kênh 2: Lắng nghe khi bếp báo hết món (UPDATE menu_items)
    const menuItemsChannel = supabase
      .channel('public:menu_items_availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items' },
        (payload) => {
          console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
          fetchAllData(false); // ✅ Refresh để lấy is_available mới
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(menuItemsChannel); // ✅ Cleanup
    };
  }, [orderId])
);
```

---

## 🔄 Luồng hoạt động chi tiết

### **Bước 1: Staff order món**
```
Staff (MenuScreen)
  → Thêm Món A vào giỏ hàng
  → Bấm "Đồng ý"
  → OrderConfirmationScreen
  → Bấm "Gửi bếp"
  
Database: 
  order_items { 
    menu_item_id: A, 
    status: 'pending',
    ...
  }
  
UI hiển thị: 
  ✅ Món A (status: pending, is_available: true)
```

### **Bước 2: Bếp báo hết món**
```
Bếp (ItemAvailabilityScreen)
  → Bấm "Báo hết" cho Món A
  
Database UPDATE: 
  menu_items { 
    id: A, 
    is_available: false  ← ✅ Thay đổi
  }
  
Realtime trigger:
  → menuItemsChannel nhận event UPDATE
  → fetchAllData(false) được gọi
```

### **Bước 3: Staff nhận thông báo realtime**
```
Staff (OrderConfirmationScreen)
  → Realtime listener nhận UPDATE từ menu_items
  → fetchAllData(false) được gọi
  → Query lại order_items + JOIN menu_items
  
Database SELECT:
  order_items
    JOIN menu_items (is_available = false)  ← ✅ Lấy trạng thái mới
  
UI tự động cập nhật:
  ⚠️ Món A [Hết món]  ← ✅ Badge đỏ xuất hiện
```

---

## 🎨 Giao diện hiển thị

### **Khi món còn hàng:**
```
┌─────────────────────────────────────┐
│ 🍕 Pizza Hải Sản                    │
│ Size: L, Đường: Bình thường         │
│ Topping: Phô mai, Xúc xích          │
│                             150,000đ │
└─────────────────────────────────────┘
```

### **Khi món HẾT hàng:**
```
┌─────────────────────────────────────┐
│ 🍕 Pizza Hải Sản  ⚠️ [Hết món]     │
│ Size: L, Đường: Bình thường         │
│ Topping: Phô mai, Xúc xích          │
│                             150,000đ │
└─────────────────────────────────────┘
```

---

## 🚀 Các tính năng bổ sung có thể làm

### **Option 1: Thông báo Push Notification**
```typescript
// Khi bếp báo hết món, gửi notification cho tất cả staff
const notifyStaff = async (menuItemId: number) => {
  const { data: pendingOrders } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('menu_item_id', menuItemId)
    .in('status', ['pending', 'in_progress']);
  
  // Gửi notification cho các bàn có order món này
  await sendPushNotification(
    `Món "${item.name}" đã hết hàng. Vui lòng xử lý các order liên quan.`
  );
};
```

### **Option 2: Tự động hủy món trong giỏ hàng**
```typescript
// Khi món hết, tự động xóa khỏi cart_items
const autoRemoveFromCart = async (menuItemId: number) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('menu_item_id', menuItemId);
  
  Toast.show({
    type: 'warning',
    text1: 'Món đã hết',
    text2: `Món "${item.name}" đã được tự động xóa khỏi giỏ hàng.`
  });
};
```

### **Option 3: Đề xuất món thay thế**
```typescript
// Hiển thị modal gợi ý món tương tự
const suggestAlternative = (outOfStockItem: MenuItem) => {
  Alert.alert(
    'Món đã hết',
    `"${outOfStockItem.name}" hiện đã hết. Bạn có muốn thay bằng món tương tự?`,
    [
      { text: 'Hủy món này' },
      { text: 'Xem món khác', onPress: () => navigation.navigate('Menu') }
    ]
  );
};
```

---

## 📊 Tóm tắt

| Thành phần | Trách nhiệm |
|-----------|------------|
| **ItemAvailabilityScreen (Bếp)** | Cập nhật `is_available = false` khi báo hết món |
| **Database (menu_items)** | Lưu trạng thái `is_available` |
| **Realtime Listener** | Lắng nghe UPDATE trên `menu_items` → Trigger refresh |
| **OrderConfirmationScreen (Staff)** | Query `is_available` từ `menu_items` + Hiển thị badge cảnh báo |
| **UI Badge** | Hiển thị ⚠️ **Hết món** khi `is_available = false` |

---

## ✅ Lợi ích

1. ✅ **Staff biết ngay món hết** mà không cần F5 thủ công
2. ✅ **Realtime update** tự động khi bếp thay đổi trạng thái
3. ✅ **Tránh nhầm lẫn** khi giao dịch với khách hàng
4. ✅ **Dễ debug** vì có log realtime trong console
5. ✅ **Scalable** - Có thể mở rộng thêm logic hủy món tự động

---

## 🔧 Cách test

1. **Mở 2 thiết bị:**
   - Thiết bị 1: Staff vào `OrderConfirmationScreen` (đã có món A)
   - Thiết bị 2: Bếp vào `ItemAvailabilityScreen`

2. **Bếp báo hết món A:**
   - Bấm "Báo hết" cho Món A
   - Check console log: `[Realtime] Món ăn thay đổi trạng thái`

3. **Kiểm tra Staff:**
   - Màn hình tự động refresh (không cần F5)
   - Badge ⚠️ **Hết món** xuất hiện bên cạnh tên món

4. **Bếp báo còn món A:**
   - Bấm "Báo còn"
   - Badge biến mất trên màn hình Staff

---

## 🎯 Kết luận

Logic đã được triển khai đầy đủ để:
- ✅ Bếp báo hết món → Staff nhận realtime update
- ✅ UI hiển thị badge cảnh báo rõ ràng
- ✅ Không cần F5 thủ công
- ✅ Code dễ maintain và mở rộng
