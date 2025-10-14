# PaymentMethodBox - Hướng dẫn sử dụng

## 📋 Mô tả
Component `PaymentMethodBox` cho phép người dùng chọn phương thức thanh toán (Tiền mặt, Momo, Chuyển khoản) trước khi hoàn tất thanh toán.

## ✨ Tính năng

### 1. **3 Phương thức thanh toán**
- 💵 **Tiền mặt** (màu xanh lá #10B981)
- 💳 **Momo** (màu hồng #D70F64)
- 🏦 **Chuyển khoản** (màu xanh dương #3B82F6)

### 2. **Giao diện đẹp**
- Hiển thị tổng số tiền thanh toán
- Icon và màu sắc phân biệt rõ ràng
- Blur background cho effect chuyên nghiệp
- Animation mượt mà

### 3. **Tích hợp với Database**
- Lưu `payment_method` vào bảng `orders`
- Hiển thị phương thức trong Toast notification

## 🔄 Workflow thanh toán mới

```
Bấm "Thanh toán"
    ↓
Chọn món mới gửi bếp (nếu có)
    ↓
Tính tổng tiền
    ↓
Hiển thị Modal: "Giữ phiên" hay "Kết thúc"?
    ↓
Bấm "Giữ phiên" hoặc "Kết thúc"
    ↓
Hiển thị PaymentMethodBox
    ↓
Chọn: Tiền mặt / Momo / Chuyển khoản
    ↓
Xử lý thanh toán với phương thức đã chọn
    ↓
✅ Hoàn tất & Hiển thị Toast
```

## 🎨 Thiết kế

### Header (Xanh lá #10B981)
```tsx
📇 Chọn phương thức thanh toán
```

### Tổng tiền (Background xanh nhạt)
```tsx
Tổng thanh toán
1,250,000đ
```

### 3 nút phương thức
Mỗi nút có:
- Icon tròn với background màu nhạt
- Tên phương thức (in đậm)
- Mô tả ngắn
- Mũi tên chevron bên phải

## 📂 File Structure

```
components/
  PaymentMethodBox.tsx          # Component chính

screens/
  Menu/
    OrderConfirmationScreen.tsx # Tích hợp PaymentMethodBox
```

## 💾 Database Update

**Cần thêm cột `payment_method` vào bảng `orders`:**

```sql
-- Thêm cột payment_method vào bảng orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Tạo index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
```

## 🔧 Props của PaymentMethodBox

```typescript
interface PaymentMethodBoxProps {
  isVisible: boolean;              // Hiển thị/ẩn box
  onClose: () => void;            // Callback khi đóng
  totalAmount: number;            // Tổng tiền thanh toán
  onSelectMethod: (method: 'cash' | 'momo' | 'transfer') => void; // Callback khi chọn phương thức
}
```

## 📱 Cách sử dụng

### 1. Import component
```tsx
import PaymentMethodBox from '../../components/PaymentMethodBox';
```

### 2. Thêm states
```tsx
const [isPaymentMethodBoxVisible, setPaymentMethodBoxVisible] = useState(false);
const [pendingPaymentAction, setPendingPaymentAction] = useState<'keep' | 'end' | null>(null);
```

### 3. Hiển thị box
```tsx
<PaymentMethodBox
  isVisible={isPaymentMethodBoxVisible}
  onClose={() => {
    setPaymentMethodBoxVisible(false);
    setPendingPaymentAction(null);
  }}
  totalAmount={paymentInfo.amount}
  onSelectMethod={handlePaymentMethodSelect}
/>
```

### 4. Xử lý callback
```tsx
const handlePaymentMethodSelect = (method: 'cash' | 'momo' | 'transfer') => {
  setPaymentMethodBoxVisible(false);
  
  const methodNames = {
    cash: 'Tiền mặt',
    momo: 'Momo',
    transfer: 'Chuyển khoản'
  };
  
  // Xử lý thanh toán với phương thức đã chọn
  if (pendingPaymentAction === 'keep') {
    handleKeepSessionAfterPayment(orderId, amount, methodNames[method]);
  } else if (pendingPaymentAction === 'end') {
    handleEndSessionAfterPayment(orderId, amount, methodNames[method]);
  }
};
```

## 🎯 States flow

```
isPaymentModalVisible (true)
    ↓ Chọn "Giữ phiên" hoặc "Kết thúc"
isPaymentModalVisible (false)
pendingPaymentAction = 'keep' | 'end'
    ↓ Sau 300ms
isPaymentMethodBoxVisible (true)
    ↓ Chọn phương thức
handlePaymentMethodSelect()
    ↓
isPaymentMethodBoxVisible (false)
pendingPaymentAction = null
    ↓
Xử lý thanh toán
```

## ✅ Ưu điểm

1. **UX tốt hơn**: 
   - Chia nhỏ quyết định thành 2 bước rõ ràng
   - Không quá nhiều lựa chọn cùng lúc

2. **Tracking tốt hơn**:
   - Lưu được phương thức thanh toán
   - Có thể thống kê doanh thu theo phương thức

3. **Mở rộng dễ dàng**:
   - Thêm phương thức mới (VNPay, ZaloPay) dễ dàng
   - Có thể thêm logic xử lý riêng cho từng phương thức

4. **Giao diện đẹp**:
   - Giống OrderInfoBox về phong cách
   - Nhất quán với design system của app

## 🔮 Future Enhancements

1. **Tích hợp thanh toán thực**:
   - Momo API
   - VNPay, ZaloPay
   - QR Code scanning

2. **Xác nhận thanh toán**:
   - Upload hình ảnh chuyển khoản
   - OTP verification

3. **Báo cáo chi tiết**:
   - Thống kê doanh thu theo phương thức
   - Biểu đồ phân tích

## 📝 Notes

- Component sử dụng `expo-blur` cho hiệu ứng blur
- Animation smooth với `setTimeout` 300ms
- Responsive design cho nhiều màn hình
- Icon từ `react-native-vector-icons/Ionicons`

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 14/10/2025  
**Version**: 1.0.0
