# Thay Thế Alert.alert Bằng ConfirmModal

## Mục đích
Thay thế tất cả các Alert.alert xác nhận (confirmation dialogs) bằng `ConfirmModal` component để có giao diện đẹp, thống nhất và dễ tùy chỉnh hơn.

## Lợi ích của ConfirmModal

1. **Giao diện đẹp hơn**: Sử dụng react-native-modal với animation mượt mà
2. **Tùy chỉnh dễ dàng**: Hỗ trợ nhiều variant (danger, success, info, warning)
3. **Icon trực quan**: Hiển thị icon phù hợp với từng loại thông báo
4. **Responsive**: Tự động điều chỉnh theo kích thước màn hình
5. **Nhất quán**: Giao diện giống nhau trên tất cả màn hình

## Interface của ConfirmModal

```tsx
interface ConfirmModalProps {
  isVisible: boolean;           // Hiển thị modal
  title: string;                // Tiêu đề
  message: string;              // Nội dung thông báo
  onClose: () => void;          // Callback khi đóng/hủy
  onConfirm: () => void;        // Callback khi xác nhận
  confirmText?: string;         // Text nút xác nhận (mặc định: "Xác nhận")
  cancelText?: string;          // Text nút hủy (mặc định: "Hủy")
  variant?: 'danger' | 'success' | 'info' | 'warning'; // Mặc định: 'danger'
}
```

## Các Variant

- **danger** (đỏ): Xóa, hủy, các hành động nguy hiểm
- **warning** (cam): Cảnh báo, đóng bàn, kết thúc phiên
- **info** (xanh dương): Thông tin, chuyển bàn
- **success** (xanh lá): Xác nhận thành công, hoàn tất

## Files Đã Thay Đổi

### 1. **HomeScreen.tsx**

**Alert cũ:**
```tsx
Alert.alert(`Bàn ${table.name} đã được đặt`, 'Hành động?', [
  { text: 'Hủy' },
  { text: 'Hủy đặt', style: 'destructive', onPress: () => ... },
  { text: 'Bắt đầu phục vụ', onPress: () => ... },
]);
```

**Thay đổi:**
- Thêm state: `cancelReservationModal`, `actionSheetVisible`
- Sử dụng `ActionSheetModal` cho danh sách hành động
- Sử dụng `ConfirmModal` cho xác nhận hủy đặt

**Modal mới:**
```tsx
<ConfirmModal
  isVisible={cancelReservationModal.visible}
  title="Xác nhận Hủy Đặt"
  message={`Bạn có chắc muốn hủy đặt ${cancelReservationModal.table?.name}?`}
  onClose={() => setCancelReservationModal({ visible: false, table: null })}
  onConfirm={() => {
    if (cancelReservationModal.table) {
      updateTableStatus(cancelReservationModal.table.id, 'Trống');
    }
    setCancelReservationModal({ visible: false, table: null });
  }}
  confirmText="Hủy đặt"
  cancelText="Không"
  variant="warning"
/>
```

### 2. **OrderConfirmationScreen.tsx**

**Alert cũ (Hủy món):**
```tsx
Alert.alert('Xác nhận Hủy Món', `Bạn có chắc muốn hủy món "${itemToRemove.name}"?`, [
  { text: 'Không' },
  { text: 'Đồng ý', style: 'destructive', onPress: action },
]);
```

**Modal mới:**
```tsx
<ConfirmModal
  isVisible={cancelItemModal.visible}
  title="Xác nhận Hủy Món"
  message={`Bạn có chắc muốn hủy món "${cancelItemModal.item?.name}"?`}
  onClose={() => setCancelItemModal({ visible: false, item: null })}
  onConfirm={async () => {
    // Logic hủy món...
  }}
  confirmText="Đồng ý"
  cancelText="Không"
  variant="danger"
/>
```

**Alert cũ (Đóng bàn):**
```tsx
Alert.alert('Xác nhận Đóng Bàn', 'Bạn có chắc muốn kết thúc phiên và dọn bàn này không?', [
  { text: 'Hủy' },
  { text: 'Đồng ý', style: 'destructive', onPress: async () => { ... } },
]);
```

**Modal mới:**
```tsx
<ConfirmModal
  isVisible={closeSessionModal}
  title="Xác nhận Đóng Bàn"
  message="Bạn có chắc muốn kết thúc phiên và dọn bàn này không?"
  onClose={() => setCloseSessionModal(false)}
  onConfirm={confirmCloseSession}
  confirmText="Đồng ý"
  cancelText="Hủy"
  variant="warning"
/>
```

### 3. **CartDetailModal.tsx**

**Alert cũ:**
```tsx
Alert.alert('Xóa tất cả?', 'Bạn có chắc muốn xóa tất cả các món trong giỏ hàng?', [
  { text: 'Hủy', style: 'cancel' },
  { text: 'Đồng ý', style: 'destructive', onPress: onClearCart },
]);
```

**Modal mới:**
```tsx
<ConfirmModal
  isVisible={clearCartModalVisible}
  title="Xóa tất cả?"
  message="Bạn có chắc muốn xóa tất cả các món trong giỏ hàng?"
  onClose={() => setClearCartModalVisible(false)}
  onConfirm={() => {
    setClearCartModalVisible(false);
    onClearCart();
  }}
  confirmText="Đồng ý"
  cancelText="Hủy"
  variant="danger"
/>
```

### 4. **TableSelectionScreen.tsx**

**Alert cũ:**
```tsx
Alert.alert(
  'Xác nhận Chuyển bàn',
  `Bạn có chắc muốn chuyển toàn bộ order và giỏ hàng từ ${sourceTable.name} sang ${targetTable.name}?`,
  [
    { text: 'Hủy' },
    { text: 'Xác nhận', onPress: async () => { ... } },
  ]
);
```

**Thay đổi:**
- Thêm state: `transferConfirmModal`
- Thay Alert.alert bằng setState

**Modal mới:**
```tsx
<ConfirmModal
  isVisible={transferConfirmModal.visible}
  title="Xác nhận Chuyển bàn"
  message={`Bạn có chắc muốn chuyển toàn bộ order và giỏ hàng từ ${sourceTable?.name} sang ${transferConfirmModal.targetTable?.name}?`}
  onClose={() => setTransferConfirmModal({ visible: false, targetTable: null })}
  onConfirm={async () => {
    // Logic chuyển bàn...
  }}
  confirmText="Xác nhận"
  cancelText="Hủy"
  variant="info"
/>
```

## Pattern Chung Để Thay Thế

### Bước 1: Import ConfirmModal
```tsx
import ConfirmModal from '../../components/ConfirmModal';
```

### Bước 2: Thêm State
```tsx
const [confirmModalVisible, setConfirmModalVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState<YourType | null>(null);
```

### Bước 3: Thay Alert.alert bằng setState
```tsx
// Cũ:
Alert.alert('Title', 'Message', [
  { text: 'Cancel' },
  { text: 'OK', onPress: () => doSomething() }
]);

// Mới:
setConfirmModalVisible(true);
```

### Bước 4: Thêm Modal vào JSX
```tsx
<ConfirmModal
  isVisible={confirmModalVisible}
  title="Title"
  message="Message"
  onClose={() => setConfirmModalVisible(false)}
  onConfirm={() => {
    setConfirmModalVisible(false);
    doSomething();
  }}
  confirmText="OK"
  cancelText="Cancel"
  variant="danger"
/>
```

## Lưu Ý Khi Sử Dụng

1. **Async Operations**: Nếu `onConfirm` thực hiện async operation, hãy đóng modal SAU KHI hoàn tất hoặc NGAY LẬP TỨC tùy theo UX mong muốn

2. **Loading State**: Nếu action mất thời gian, nên đóng modal trước và hiển thị loading indicator

3. **Error Handling**: Xử lý lỗi bằng Toast thay vì Alert để nhất quán

4. **Variant Selection**:
   - Xóa/Hủy → `danger`
   - Cảnh báo/Đóng → `warning`
   - Thông tin → `info`
   - Thành công → `success`

## Kết Quả

✅ Giao diện thống nhất và đẹp hơn  
✅ Dễ bảo trì và mở rộng  
✅ Animation mượt mà  
✅ Tùy chỉnh linh hoạt với variant system  
✅ Không còn Alert.alert native cứng nhắc  

## Các Màn Hình Cần Kiểm Tra Thêm

Tìm kiếm các Alert.alert còn lại trong project với pattern:
```
Alert.alert.*Xác nhận|confirm|chắc
```

Nếu tìm thấy, áp dụng pattern tương tự như trên.
