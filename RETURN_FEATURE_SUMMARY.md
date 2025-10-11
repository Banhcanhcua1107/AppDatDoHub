# Tóm tắt Chức năng Trả Món

## ✅ Đã hoàn thành:

### 1. Cơ sở dữ liệu
- ✅ Hướng dẫn tạo bảng `return_notifications`
- ✅ Hướng dẫn thêm RLS policies
- ✅ Enable realtime cho bảng

### 2. Màn hình Kitchen (Bếp)
- ✅ **KitchenDisplayScreen.tsx**: 
  - Thêm nút "TRẢ MÓN" 
  - Tự động ẩn order khi tất cả món đã served
  - Gửi thông báo khi bấm trả món

- ✅ **KitchenDetailScreen.tsx**:
  - Thêm chức năng trả món
  - Gửi thông báo đến staff

- ✅ **ServeStatusScreen.tsx**:
  - Tự động quay lại khi tất cả món đã phục vụ

### 3. Màn hình Staff (Nhân viên)
- ✅ **ReturnNotificationScreen.tsx** (MỚI):
  - Hiển thị thông báo trả món realtime
  - Rung điện thoại khi có thông báo mới
  - Xác nhận đã xử lý
  - Xóa thông báo
  - Badge hiển thị số thông báo chưa xử lý

### 4. Navigation
- ✅ Thêm route `RETURN_NOTIFICATIONS` vào constants
- ✅ Thêm tab "Thông báo" vào BottomTabs
- ✅ Icon thông báo với badge số lượng

### 5. Tài liệu
- ✅ File RETURN_FEATURE_GUIDE.md với hướng dẫn đầy đủ

## 🎯 Cách sử dụng:

### Cho Bếp:
1. Vào màn hình Kitchen Display hoặc Kitchen Detail
2. Khi cần trả món, bấm nút "TRẢ MÓN" (màu xanh lá)
3. Xác nhận → Thông báo được gửi đến staff

### Cho Staff:
1. Vào tab "Thông báo" (icon chuông)
2. Xem danh sách món cần trả (màu đỏ = chưa xử lý)
3. Điện thoại sẽ rung khi có thông báo mới
4. Bấm "Đã xử lý" khi đã xử lý xong
5. Hoặc bấm icon thùng rác để xóa

## 🔧 Cần làm tiếp:

### 1. Chạy SQL trong Supabase:
```sql
-- Copy từ file RETURN_FEATURE_GUIDE.md
-- Phần "1. Tạo bảng trong Supabase"
```

### 2. Test thông báo realtime:
- Mở 2 thiết bị hoặc 2 tài khoản
- Test gửi và nhận thông báo

### 3. Tùy chỉnh (nếu muốn):
- Thay đổi pattern rung
- Thêm âm thanh (cần cài expo-av)
- Thay đổi màu sắc

## 📱 Demo Flow:

```
KITCHEN                          STAFF
  |                               |
  | 1. Bấm "TRẢ MÓN"              |
  |------------------------------>|
  |                               | 2. Điện thoại rung
  |                               | 3. Hiển thị thông báo
  |                               | 4. Bấm "Đã xử lý"
  |<------------------------------|
  | 5. Order tự động ẩn           |
  |   (nếu tất cả món xong)       |
```

## ⚠️ Lưu ý:

1. **Rung điện thoại**: Chỉ hoạt động khi:
   - Điện thoại không ở chế độ im lặng
   - App đang mở và ở màn hình thông báo

2. **Realtime**: Cần kết nối internet ổn định

3. **Auto-hide order**: Order sẽ tự động biến mất khỏi KitchenDisplayScreen khi:
   - Tất cả món có status = 'served'

4. **Badge số lượng**: Hiển thị số thông báo chưa xử lý

## 🎨 Màu sắc:

- Đỏ (#EF4444): Thông báo chưa xử lý
- Xanh lá (#10B981): Đã xử lý / Nút trả món
- Xanh dương (#3B82F6): Header màn hình

## 📞 Support:

Nếu có vấn đề, kiểm tra:
1. Console log có lỗi không
2. Supabase connection
3. Realtime đã enable chưa
4. RLS policies đã đúng chưa
