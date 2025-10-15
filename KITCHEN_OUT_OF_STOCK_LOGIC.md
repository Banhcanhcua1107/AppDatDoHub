# 🍽️ Logic Nghiệp Vụ: Báo Hết Món Ảnh Hưởng Đến Bếp

## 📖 Phân tích Logic Nghiệp Vụ

### **Tình huống:**
1. **Staff** đã order Món A cho nhiều bàn → Gửi bếp (status = `waiting`)
2. **Bếp** đang chế biến một số món A (status = `in_progress`)
3. **Bếp** vào `ItemAvailabilityScreen` → Bấm **"Báo hết"** cho Món A
4. **4 màn hình bếp cần cập nhật:**
   - `KitchenDisplayScreen` - Danh sách order tổng hợp
   - `KitchenDetailScreen` - Chi tiết order của 1 bàn
   - `KitchenSummaryScreen` - Tổng hợp món theo tên
   - `KitchenSummaryDetailScreen` - Chi tiết món theo bàn

---

## ✅ Logic Nghiệp Vụ Hợp Lý

### **Quy tắc xử lý khi món hết (`is_available = false`):**

| Trạng thái món | Khi món HẾT | Lý do |
|---------------|------------|-------|
| **Chờ bếp** (`waiting`) | ❌ **Ẩn hoàn toàn** | Không thể chế biến được → Không hiển thị |
| **Đang làm** (`in_progress`) | ⚠️ **Hiển thị + Badge cảnh báo** | Đang làm rồi → Phải làm tiếp |
| **Hoàn thành** (`completed`) | ✅ **Hiển thị bình thường** | Đã xong → Không ảnh hưởng |
| **Đã trả** (`served`) | ✅ **Ẩn (logic cũ)** | Đã phục vụ xong |

### **Hành vi mong muốn:**

```
Bếp báo hết Món A:
├─ Order #1: Bàn 01 (2x Món A - waiting) → ❌ Biến mất khỏi danh sách
├─ Order #2: Bàn 02 (3x Món A - in_progress) → ⚠️ Hiển thị badge "Hết món"
├─ Order #3: Bàn 03 (1x Món A - completed) → ✅ Hiển thị bình thường
└─ Order #4: Bàn 04 (2x Món A - waiting, 1x Món B - in_progress) 
               → Món A biến mất, giữ lại Món B
```

---

## 🔧 Các Thay Đổi Đã Thực Hiện

### **1. KitchenDisplayScreen.tsx**

#### **A. Cập nhật Interface:**
```typescript
interface KitchenItem {
  id: number;
  name: string;
  quantity: number;
  note: string | null;
  status: KitchenItemStatus;
  is_available?: boolean; // ✅ Thêm mới
}
```

#### **B. Cập nhật Query:**
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    id, quantity, customizations, status, 
    menu_items ( is_available ), // ✅ Thêm is_available
    orders ( id, created_at, order_tables ( tables ( name ) ) )
  `)
  .neq('status', STATUS.SERVED);
```

#### **C. Lọc món hết + chờ bếp:**
```typescript
// Logic: Nếu món hết VÀ đang chờ → Bỏ qua
const isAvailable = item.menu_items?.is_available ?? true;
if (!isAvailable && item.status === STATUS.PENDING) {
  return acc; // Không thêm món này vào danh sách
}

acc[orderId].items.push({
  ...item,
  is_available: isAvailable, // ✅ Lưu trạng thái
});
```

#### **D. Ẩn order không còn món:**
```typescript
// Lọc bỏ order không còn item nào (vì tất cả món hết)
const finalOrders = Object.values(groupedOrders)
  .filter(order => order.items.length > 0); // ✅ Chỉ giữ order có món
```

#### **E. Realtime Listener:**
```typescript
// Lắng nghe thay đổi menu_items
const menuItemsChannel = supabase
  .channel('public:menu_items:kitchen_display')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'menu_items' 
  }, () => {
    console.log('[KitchenDisplay] Món ăn thay đổi trạng thái');
    fetchKitchenOrders(); // ✅ Refresh ngay lập tức
  })
  .subscribe();
```

---

### **2. KitchenDetailScreen.tsx**

#### **A. Cập nhật Interface:**
```typescript
interface KitchenDetailItem {
  id: number;
  name: string;
  quantity: number;
  note: string | null;
  status: KitchenItemStatus;
  customizations: any;
  is_available?: boolean; // ✅ Thêm mới
}
```

#### **B. Cập nhật Query + Filter:**
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select('id, quantity, customizations, status, menu_items ( is_available )')
  .eq('order_id', orderId)
  .neq('status', STATUS.SERVED);

// Lọc bỏ món hết + chờ bếp
const mappedItems = data
  .map((item: any) => ({
    ...item,
    name: item.customizations.name || 'Món không tên',
    is_available: item.menu_items?.is_available ?? true,
  }))
  .filter((item: any) => {
    // Nếu món hết VÀ đang chờ → Bỏ qua
    if (!item.is_available && item.status === STATUS.PENDING) {
      return false;
    }
    return true;
  });
```

#### **C. Hiển thị Badge "Hết món":**
```typescript
const renderFooterContent = () => {
  const isOutOfStock = item.is_available === false;
  
  return (
    <View style={styles.footerActionsContainer}>
      {/* Badge cảnh báo cho món đang làm */}
      {isOutOfStock && status === STATUS.IN_PROGRESS && (
        <View style={styles.outOfStockBadge}>
          <Ionicons name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.outOfStockText}>Hết món</Text>
        </View>
      )}
      
      {/* Nút Chế biến (chỉ hiển thị nếu còn hàng) */}
      {status === STATUS.PENDING && (
        <TouchableOpacity style={styles.processButton} onPress={...}>
          <Text>Chế biến</Text>
        </TouchableOpacity>
      )}
      
      {/* Nút Xong */}
      {status === STATUS.IN_PROGRESS && (
        <TouchableOpacity style={styles.completeButton} onPress={...}>
          <Text>Xong</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

#### **D. Style cho Badge:**
```typescript
outOfStockBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEF2F2',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
  gap: 4,
  marginRight: 8,
},
outOfStockText: {
  color: '#DC2626',
  fontSize: 12,
  fontWeight: '600',
},
```

#### **E. Realtime Listener:**
```typescript
const menuItemsChannel = supabase
  .channel('public:menu_items:kitchen_detail')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'menu_items' 
  }, () => {
    fetchOrderDetails(); // ✅ Refresh
  })
  .subscribe();
```

---

### **3. KitchenSummaryScreen.tsx**

#### **A. Cập nhật Query:**
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    quantity, customizations, status, created_at, 
    menu_items ( is_available ), // ✅ Thêm is_available
    orders(order_tables(tables(name)))
  `)
  .in('status', STATUS_TO_AGGREGATE);
```

#### **B. Lọc món hết + chờ:**
```typescript
const itemMap = data.reduce((acc, item) => {
  const itemName = item.customizations.name;
  
  // Bỏ qua món hết hàng + đang chờ
  const menuItems = item.menu_items as any;
  const isAvailable = menuItems?.is_available ?? true;
  if (!isAvailable && item.status === 'waiting') {
    return acc; // Không tính món này
  }
  
  // Tính tổng số lượng...
  acc[itemName].total_quantity += item.quantity;
  ...
}, {});
```

#### **C. Realtime Listener:**
```typescript
const menuItemsChannel = supabase
  .channel('public:menu_items:kitchen_summary')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'menu_items' 
  }, () => {
    fetchSummaryData(); // ✅ Refresh
  })
  .subscribe();
```

---

### **4. KitchenSummaryDetailScreen.tsx**

#### **A. Cập nhật Interface:**
```typescript
interface SummaryDetailItem {
  id: number;
  quantity: number;
  status: StatusType;
  customizations: any;
  table_name: string;
  is_available?: boolean; // ✅ Thêm mới
}
```

#### **B. Cập nhật Query + Filter:**
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    id, quantity, status, customizations, 
    menu_items ( is_available ), // ✅ Thêm is_available
    orders ( order_tables ( tables ( name ) ) )
  `)
  .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED])
  .eq('customizations->>name', itemName);

// Lọc bỏ món hết + chờ
const mappedItems = data
  .map((item: any) => ({
    ...item,
    table_name: item.orders?.order_tables[0]?.tables?.name || 'Mang về',
    is_available: item.menu_items?.is_available ?? true,
  }))
  .filter((item: any) => {
    // Nếu món hết VÀ đang chờ → Bỏ qua
    if (!item.is_available && item.status === STATUS.PENDING) {
      return false;
    }
    return true;
  });
```

#### **C. Hiển thị Badge "Hết món":**
```typescript
const renderFooterActions = () => {
  const isOutOfStock = item.is_available === false;
  
  return (
    <View style={styles.footerActionsContainer}>
      {isOutOfStock && status === STATUS.IN_PROGRESS && (
        <View style={styles.outOfStockBadge}>
          <Ionicons name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.outOfStockText}>Hết món</Text>
        </View>
      )}
      
      {status === STATUS.PENDING && (
        <TouchableOpacity onPress={...}>Chế biến</TouchableOpacity>
      )}
      
      {status === STATUS.IN_PROGRESS && (
        <TouchableOpacity onPress={...}>Trả món</TouchableOpacity>
      )}
    </View>
  );
};
```

#### **D. Realtime Listener:**
```typescript
const menuItemsChannel = supabase
  .channel('public:menu_items:kitchen_summary_detail')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'menu_items' 
  }, () => {
    fetchDetails(); // ✅ Refresh
  })
  .subscribe();
```

---

## 🎯 Tổng Kết Logic Nghiệp Vụ

### **✅ Logic HỢP LÝ:**

1. ✅ **Món chờ bếp + hết** → Ẩn hoàn toàn (không thể làm)
2. ✅ **Món đang làm + hết** → Hiển thị badge cảnh báo (phải làm tiếp)
3. ✅ **Món hoàn thành + hết** → Hiển thị bình thường (đã xong)
4. ✅ **Order không còn món** → Ẩn hoàn toàn (tránh hiển thị order trống)
5. ✅ **Realtime update** → Tự động refresh khi báo hết/còn

### **🔄 Luồng hoạt động:**

```
1. Bếp báo hết Món A (is_available = false)
   ↓
2. Realtime trigger → 4 màn hình nhận UPDATE
   ↓
3. Fetch lại data từ DB (có is_available mới)
   ↓
4. Filter:
   ├─ Món A (waiting) → Ẩn
   ├─ Món A (in_progress) → Hiển thị badge "Hết món"
   └─ Món A (completed) → Hiển thị bình thường
   ↓
5. UI tự động cập nhật ⚡
```

---

## 📊 So sánh Trước & Sau

| Tình huống | Trước | Sau |
|-----------|-------|-----|
| Món hết + chờ bếp | ❌ Vẫn hiển thị | ✅ Ẩn hoàn toàn |
| Món hết + đang làm | ❌ Không biết hết | ✅ Badge "Hết món" |
| Order chỉ có món hết | ❌ Hiển thị order trống | ✅ Ẩn order |
| Khi báo hết | ❌ Cần F5 thủ công | ✅ Realtime update |

---

## ✅ Kết luận

### **Logic nghiệp vụ HỢP LÝ vì:**
1. ✅ Không hiển thị món không thể làm (hết + chờ)
2. ✅ Cảnh báo món đang làm nhưng hết (để biết không order thêm)
3. ✅ Không ảnh hưởng món đã hoàn thành
4. ✅ Realtime update → UX tốt, không cần F5
5. ✅ Tránh hiển thị order/tổng hợp trống gây nhầm lẫn

### **Các màn hình hoạt động nhất quán:**
- ✅ **KitchenDisplayScreen** - Ẩn order không còn món
- ✅ **KitchenDetailScreen** - Ẩn món chờ + badge món đang làm
- ✅ **KitchenSummaryScreen** - Không tính món hết + chờ vào tổng hợp
- ✅ **KitchenSummaryDetailScreen** - Ẩn món chờ + badge món đang làm

🎉 **Hoàn thành!** Logic đã hợp lý và đồng bộ giữa tất cả các màn hình Bếp.
