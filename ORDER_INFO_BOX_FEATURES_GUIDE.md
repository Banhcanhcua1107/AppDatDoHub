# Hướng dẫn Tích hợp Chức năng OrderInfoBox

## 📋 Tổng quan

File `OrderInfoBox.tsx` đã được cập nhật đầy đủ các chức năng tương tự như `OrderScreen.tsx`, bao gồm:

## ✅ Các chức năng đã được tích hợp

### 1. **Kiểm tra lên món** (`check_served_status`)
- **Icon**: `notifications-outline`
- **Màu**: Mặc định (#4B5563)
- **Chức năng**: Điều hướng đến màn hình `ServeStatusScreen` để kiểm tra trạng thái lên món của order
- **Navigation**: 
  ```typescript
  navigation.navigate(ROUTES.SERVE_STATUS, {
    orderId: data.orderId,
    tableName: data.tableName,
  });
  ```

### 2. **Thanh toán** (`go_to_payment`)
- **Icon**: `cash-outline`
- **Màu**: Mặc định
- **Chức năng**: Điều hướng đến màn hình xác nhận order để thanh toán
- **Navigation**: `ROUTES.ORDER_CONFIRMATION`

### 3. **Chuyển bàn** (`transfer_table`)
- **Icon**: `swap-horizontal-outline`
- **Màu**: Xanh dương (#3B82F6)
- **Chức năng**: Chuyển order từ bàn hiện tại sang bàn khác (bàn trống)
- **Navigation**: 
  ```typescript
  navigation.navigate(ROUTES.TABLE_SELECTION, {
    mode: 'single',
    action: 'transfer',
    sourceRoute: ROUTES.HOME_TAB,
    sourceTable: { id, name, orderId }
  });
  ```

### 4. **Ghép Order (Thêm món)** (`merge_order`)
- **Icon**: `layers-outline`
- **Màu**: Mặc định
- **Chức năng**: Ghép order từ nhiều bàn thành một, giữ các bàn riêng biệt nhưng chung danh sách món
- **Navigation**: 
  ```typescript
  navigation.navigate(ROUTES.TABLE_SELECTION, {
    mode: 'multiple',
    action: 'merge',
    ...
  });
  ```

### 5. **Gộp Bàn (Chung bill)** (`group_tables`)
- **Icon**: `apps-outline`
- **Màu**: Xanh lá (#10B981)
- **Chức năng**: Gộp nhiều bàn thành một nhóm bàn, chung một bill thanh toán
- **Navigation**: 
  ```typescript
  navigation.navigate(ROUTES.TABLE_SELECTION, {
    mode: 'multiple',
    action: 'group',
    ...
  });
  ```

### 6. **Tách order** (`split_order`)
- **Icon**: `git-compare-outline`
- **Màu**: Mặc định
- **Chức năng**: Tách một phần món từ order hiện tại sang bàn trống khác
- **Navigation**: 
  ```typescript
  navigation.navigate(ROUTES.TABLE_SELECTION, {
    mode: 'single',
    action: 'split',
    ...
  });
  ```
- **Lưu ý**: Sau khi chọn bàn trống, sẽ điều hướng đến `SplitOrderScreen`

### 7. **Hủy order** (`cancel_order`)
- **Icon**: `close-circle-outline`
- **Màu**: Đỏ (#EF4444)
- **Chức năng**: Hủy toàn bộ order và reset trạng thái bàn về "available"
- **Xử lý**: 
  - Hiển thị `ConfirmModal` để xác nhận
  - Gọi RPC function: `cancel_order_and_reset_tables`
  - Hiển thị thông báo thành công/thất bại bằng Toast

### 8. **Tạm tính** (`toggle_provisional`)
- **Icon**: `receipt-outline`
- **Màu**: 
  - Xanh lá (#10B981) khi đang bật tạm tính
  - Xám (#6B7280) khi chưa bật
- **Chức năng**: Bật/tắt chế độ tạm tính cho order
- **Xử lý**:
  - Gọi RPC function: `toggle_provisional_bill_status`
  - Hiển thị Toast thông báo trạng thái mới
  - Cập nhật UI ngay lập tức (icon màu xanh khi bật)
- **Vị trí**: 
  - Có trong menu actions (dấu 3 chấm)
  - Có nút nhanh ở bottom actions (thay thế nút "In phiếu kiểm đồ")
- **UI Indicator**:
  - Icon restaurant màu xanh + text "Tạm tính" hiển thị bên cạnh "Đang phục vụ"
  - Nút quick action đổi màu xanh khi đang bật

## 🔄 Luồng xử lý

### Trong OrderInfoBox:
```typescript
handleActionPress(action) {
  setMenuVisible(false);
  
  if (action === 'cancel_order') {
    // Hiển thị modal xác nhận
    setCancelModalVisible(true);
  } else if (action === 'toggle_provisional') {
    // Toggle trạng thái tạm tính
    handleToggleProvisionalBill();
  } else {
    // Gọi parent handler
    handleParentAction(action, { tableId, tableName, orderId });
  }
}

handleToggleProvisionalBill() {
  // Gọi RPC function
  await supabase.rpc('toggle_provisional_bill_status', { p_order_id });
  
  // Cập nhật UI ngay
  setOrderDetails(prev => ({ ...prev, is_provisional: !prev.is_provisional }));
  
  // Hiển thị Toast
  Toast.show({ ... });
}
```

### Trong HomeScreen:
```typescript
handleOrderAction(action, data) {
  setBoxVisible(false);
  
  switch(action) {
    case 'check_served_status':
      // Navigate to SERVE_STATUS
    case 'transfer_table':
      // Navigate to TABLE_SELECTION with mode: single, action: transfer
    case 'merge_order':
      // Navigate to TABLE_SELECTION with mode: multiple, action: merge
    case 'group_tables':
      // Navigate to TABLE_SELECTION with mode: multiple, action: group
    case 'split_order':
      // Navigate to TABLE_SELECTION with mode: single, action: split
    // ...
  }
}
```

## 📦 Dependencies đã thêm

1. **Toast** - Hiển thị thông báo
   ```typescript
   import Toast from 'react-native-toast-message';
   ```

2. **ConfirmModal** - Modal xác nhận hủy order
   ```typescript
   import ConfirmModal from '../../components/ConfirmModal';
   ```

## 🎯 Điểm khác biệt so với OrderScreen

| Tính năng | OrderScreen | OrderInfoBox |
|-----------|-------------|--------------|
| Hủy order | Hiển thị ConfirmModal | Hiển thị ConfirmModal (tương tự) |
| Tạm tính | Có nút toggle trong card | Có nút toggle trong quick actions + menu |
| Navigation source | `ROUTES.ORDER_TAB` | `ROUTES.HOME_TAB` |
| Xử lý action | Trong component | Cancel & Toggle trong component, còn lại ủy quyền parent |
| UI Modal | Modal menu actions | Modal menu actions (tương tự) |

## 🔧 Cách sử dụng

```typescript
<OrderInfoBox
  isVisible={boxVisible}
  onClose={() => setBoxVisible(false)}
  tableId={selectedTable?.id}
  tableName={selectedTable?.name}
  onActionPress={handleOrderAction}
/>
```

## ⚠️ Lưu ý quan trọng

1. **Cancel Order**: Được xử lý trực tiếp trong OrderInfoBox bằng RPC function
2. **Toggle Provisional**: Được xử lý trực tiếp trong OrderInfoBox, cập nhật UI ngay lập tức
3. **Quick Actions**: Nút thứ 3 (receipt icon) là toggle tạm tính, đổi màu xanh khi đang bật
4. **Navigation**: Các action còn lại được xử lý thông qua parent handler (HomeScreen)

## 📝 Testing Checklist

- [ ] Kiểm tra lên món hoạt động
- [ ] Chuyển bàn từ bàn có order
- [ ] Ghép order từ nhiều bàn
- [ ] Gộp bàn thành nhóm
- [ ] Tách order sang bàn trống
- [ ] Hủy order với modal xác nhận
- [ ] Toggle tạm tính (bật/tắt) với Toast notification
- [ ] Icon tạm tính hiển thị đúng trạng thái (xanh khi bật)
- [ ] Nút quick action đổi màu khi bật tạm tính

---

**Ngày cập nhật**: 15/10/2025
**Phiên bản**: 2.1 - Thêm chức năng Tạm tính
