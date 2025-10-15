# Fix Lỗi Navigation Khi Quay Về Sau Khi In Bill

## Vấn Đề

### Lỗi 1: Action 'RESET' not handled
Khi nhấn nút "Đóng" trên màn hình `PrintPreviewScreen` sau khi in bill, ứng dụng báo lỗi:

```
ERROR  The action 'RESET' with payload {"index":0,"routes":[{"name":"AppTabs",...}]} was not handled by any navigator.
```

### Lỗi 2: Không quay về Home sau khi đóng bàn
Khi thanh toán xong ở màn hình `OrderConfirmation` và bấm "Đóng bàn", sau khi in bill xong và bấm nút "Đóng" ở `PrintPreview`, thay vì quay về màn hình Home (Sơ đồ bàn), nó lại quay về màn hình `OrderConfirmation` (đã thanh toán xong).

## Nguyên Nhân

### Lỗi 1
Ứng dụng có 3 loại navigator khác nhau cho 3 vai trò user:
- **Nhân viên** (`nhan_vien`): Sử dụng `MainAppStack` với root là `APP_TABS`
- **Thu ngân** (`thu_ngan`): Sử dụng `CashierNavigator` với root là `CashierRoot`
- **Bếp** (`bep`): Sử dụng `KitchenNavigator` với root là `KitchenRoot`

Code cũ trong `PrintPreviewScreen` cố gắng reset navigation về `ROUTES.APP_TABS`, không tồn tại trong CashierNavigator/KitchenNavigator.

### Lỗi 2
Code cũ chỉ dùng `navigation.goBack()` - chỉ đóng `PrintPreview`, không đóng `OrderConfirmation`, nên user vẫn thấy màn hình đơn hàng đã thanh toán.

## Giải Pháp

Sử dụng `StackActions.popToTop()` để pop tất cả màn hình và quay về root tab navigator.

### Code Mới

```tsx
import { RouteProp, useRoute, useNavigation, StackActions } from '@react-navigation/native';

// Hàm xử lý khi nhấn nút Đóng
const handleClose = () => {
  if (shouldNavigateToHome) {
    // Quay về màn hình Home: đóng tất cả màn hình và về màn hình đầu tiên (tabs)
    // popToTop() sẽ đóng tất cả màn hình trừ màn hình root của stack
    navigation.dispatch(StackActions.popToTop());
  } else {
    // Quay lại màn hình trước đó
    navigation.goBack();
  }
};
```

### Tại sao dùng `popToTop()` thay vì `pop(n)`?

Navigation stack thực tế có thể có nhiều màn hình hơn dự kiến:

- **Luồng thực tế**: `[AppTabs → Menu → OrderConfirmation → PrintPreview]` (4 màn hình!)
- **Nếu dùng `pop(2)`**: Chỉ pop PrintPreview và OrderConfirmation → Còn lại Menu
- **Nếu dùng `popToTop()`**: Pop tất cả trừ AppTabs → Về Home ✅

### Cách Hoạt Động

1. **Từ OrderConfirmation**: Khi thanh toán xong, `OrderConfirmationScreen` navigate đến `PrintPreview` với `shouldNavigateToHome: true`

```tsx
navigation.navigate('PrintPreview', { 
  order, 
  items, 
  paymentMethod: 'cash',
  shouldNavigateToHome: true  // ← Flag này báo cần quay về Home
});
```

2. **Từ ProvisionalBillScreen hoặc BillHistoryScreen**: Không truyền `shouldNavigateToHome`, nên sẽ chỉ `goBack()` bình thường

3. **Navigation Stack**:
   - **Stack thực tế**: `[AppTabs → Menu → OrderConfirmation → PrintPreview]`
   - **Sau khi bấm Đóng với `popToTop()`**: `[AppTabs]` → Về Home tab
   - **Lợi ích**: Không cần đếm số màn hình, luôn về root

## Kết Quả

✅ **Nhân viên**: Có thể in bill và quay về màn hình Home  
✅ **Thu ngân**: Có thể in bill và quay về màn hình Home  
✅ **Bếp**: Có thể in bill và quay về màn hình Home (nếu có chức năng in)  
✅ **Đóng bàn sau thanh toán**: Quay thẳng về Home, không quay về OrderConfirmation  
✅ **In từ màn hình khác**: Chỉ goBack() bình thường  

## File Đã Sửa

- `screens/Orders/PrintPreviewScreen.tsx`

## Lưu Ý Kỹ Thuật

- `StackActions.popToTop()` pop tất cả màn hình trong stack trừ màn hình root
- Hoạt động với mọi độ sâu của navigation stack (2, 3, 4+ màn hình)
- `shouldNavigateToHome` được truyền từ màn hình gọi để quyết định behavior
- Không phụ thuộc vào tên route cụ thể, hoạt động với tất cả các role
- Root của stack là AppTabs/CashierRoot/KitchenRoot (các tabs navigator)
