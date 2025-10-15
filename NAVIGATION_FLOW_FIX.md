# 🔄 Sửa Logic Navigation Flow

## 🎯 Vấn đề ban đầu
Khi người dùng di chuyển giữa các màn hình:
- **Home → Menu → OrderConfirmation → "Thêm món" → Menu → "Đồng ý" → OrderConfirmation**
- Khi bấm nút "Quay về", navigation stack bị chồng chất:
  - `OrderConfirmation → Menu → OrderConfirmation → Menu → Home`

## ✅ Giải pháp đã áp dụng

### 1. **Thêm flag `fromOrderConfirmation` vào route params**
```typescript
// constants/routes.ts
[ROUTES.MENU]: { 
  tableId: string; 
  tableName: string; 
  orderId?: string; 
  fromOrderConfirmation?: boolean  // ✅ Flag mới
};
```

### 2. **Sửa logic "Thêm món" trong OrderConfirmationScreen**
```typescript
// OrderConfirmationScreen.tsx
<TouchableOpacity
  onPress={() =>
    navigation.navigate(ROUTES.MENU, {
      tableId: representativeTable.id,
      tableName: currentTableNameForDisplay,
      orderId: activeOrderId || undefined,
      fromOrderConfirmation: true, // ✅ Đánh dấu đã qua OrderConfirmation
    })
  }
>
```

### 3. **Sửa logic "Đồng ý" trong MenuScreen**
```typescript
// MenuScreen.tsx
const handleConfirmOrder = () => {
  if (cartItems.length === 0 && existingItems.length === 0) {
    Alert.alert('Thông báo', 'Vui lòng thêm món vào giỏ hàng!');
    return;
  }
  
  // ✅ Nếu đã từng qua OrderConfirmation, dùng goBack() để quay về
  if (fromOrderConfirmation) {
    navigation.goBack();
  } else {
    // ✅ Nếu chưa (từ Home), tạo màn hình mới
    navigation.navigate(ROUTES.ORDER_CONFIRMATION, { 
      tableId: tableId, 
      tableName: tableName 
    });
  }
};
```

### 4. **Sửa logic "Quay về" trong OrderConfirmationScreen**
```typescript
// OrderConfirmationScreen.tsx
const handleGoBack = () => {
  navigation.goBack(); // ✅ Luôn quay về màn hình trước đó
};
```

### 5. **Sửa logic "Quay về" trong MenuScreen**
```typescript
// MenuScreen.tsx
const handleGoBackWithConfirmation = () => {
  if (cartItems.length > 0) {
    Alert.alert(
      'Xác nhận',
      'Giỏ hàng của bạn có món chưa được xác nhận. Bạn có muốn hủy những món này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            await handleClearCart();
            navigation.goBack(); // ✅ Quay về màn hình trước đó
          },
        },
      ]
    );
  } else {
    navigation.goBack(); // ✅ Quay về màn hình trước đó
  }
};
```

## 📊 Luồng navigation mới

### **Scenario 1: Từ Home tạo order mới**
```
Home → Menu → OrderConfirmation
       ↑←←←←←←←←←←←←←←←←←←←┘
(Bấm quay về từ OrderConfirmation)
```

### **Scenario 2: Từ OrderConfirmation thêm món**
```
OrderConfirmation → Menu → (bấm "Đồng ý") goBack()
       ↑←←←←←←←←←←←←←←←←←←←←←←←←←←←←┘
```

### **Scenario 3: Từ OrderTab vào OrderConfirmation**
```
OrderTab → OrderConfirmation → (bấm quay về) goBack()
   ↑←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←┘
```

### **Scenario 4: Full flow**
```
Home → Menu (fromOrderConfirmation = undefined)
  ↓
OrderConfirmation → "Thêm món" 
  ↓
Menu (fromOrderConfirmation = true) → "Đồng ý" → goBack()
  ↓
OrderConfirmation (quay lại màn cũ, không tạo mới)
```

## 🔍 Điểm khác biệt chính

| Trường hợp | Trước đây | Sau khi sửa |
|-----------|-----------|-------------|
| Từ Home → Menu → Đồng ý | `navigate()` tạo stack mới | `navigate()` tạo stack mới ✅ |
| Từ OrderConfirmation → Thêm món → Đồng ý | `navigate()` tạo stack mới ❌ | `goBack()` quay về stack cũ ✅ |
| Bấm quay về ở Menu | Về Home | Về màn hình trước đó ✅ |
| Bấm quay về ở OrderConfirmation | Logic phức tạp | `goBack()` đơn giản ✅ |

## ✅ Kết quả
- ✅ Không còn chồng chất navigation stack
- ✅ Logic quay về đơn giản và nhất quán
- ✅ Trải nghiệm người dùng mượt mà hơn
- ✅ Code dễ maintain hơn
