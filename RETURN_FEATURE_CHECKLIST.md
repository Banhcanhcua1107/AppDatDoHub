# ✅ Checklist Triển khai Chức năng Trả Món

## 📋 Bước 1: Cơ sở dữ liệu Supabase

- [ ] **Chạy SQL Script**
  - Mở Supabase Dashboard → SQL Editor
  - Copy nội dung file `supabase_return_notifications.sql`
  - Paste và chạy
  - Kiểm tra message "Setup completed!"

- [ ] **Kiểm tra bảng**
  ```sql
  SELECT * FROM return_notifications LIMIT 1;
  ```
  - Nếu không lỗi → OK ✅

- [ ] **Kiểm tra Realtime**
  - Vào Database → Publications
  - Tìm `supabase_realtime`
  - Đảm bảo có bảng `return_notifications` ✅

- [ ] **Kiểm tra Policies**
  - Vào Authentication → Policies
  - Tìm bảng `return_notifications`
  - Đảm bảo có 4 policies (SELECT, INSERT, UPDATE, DELETE) ✅

## 📱 Bước 2: Kiểm tra Code

- [x] **Files đã được tạo/cập nhật:**
  - [x] `screens/Orders/ReturnNotificationScreen.tsx` (MỚI)
  - [x] `screens/Kitchen/KitchenDisplayScreen.tsx` (CẬP NHẬT)
  - [x] `screens/Kitchen/KitchenDetailScreen.tsx` (CẬP NHẬT)
  - [x] `screens/Orders/ServeStatusScreen.tsx` (CẬP NHẬT)
  - [x] `constants/routes.ts` (CẬP NHẬT)
  - [x] `navigation/BottomTabs.tsx` (CẬP NHẬT)

- [ ] **Kiểm tra không có lỗi compile**
  ```bash
  npm run android
  # hoặc
  npm run ios
  ```

## 🧪 Bước 3: Test Chức năng

### Test 1: Gửi thông báo từ Kitchen
- [ ] Mở app → Đăng nhập với tài khoản Kitchen
- [ ] Vào màn hình Kitchen Display
- [ ] Tìm 1 order bất kỳ
- [ ] Bấm nút "TRẢ MÓN" (màu xanh lá)
- [ ] Xác nhận trong popup
- [ ] Kiểm tra alert "Thành công" ✅

### Test 2: Nhận thông báo ở Staff
- [ ] Mở app trên thiết bị khác (hoặc tài khoản khác)
- [ ] Đăng nhập với tài khoản Staff
- [ ] Vào tab "Thông báo" (icon chuông)
- [ ] Kiểm tra có thông báo vừa gửi không ✅
- [ ] Kiểm tra điện thoại có rung không ✅
- [ ] Kiểm tra badge có hiển thị số lượng không ✅

### Test 3: Xử lý thông báo
- [ ] Ở màn hình Thông báo (Staff)
- [ ] Bấm nút "Đã xử lý"
- [ ] Kiểm tra thông báo chuyển sang màu xanh ✅
- [ ] Kiểm tra badge giảm số lượng ✅

### Test 4: Xóa thông báo
- [ ] Bấm icon thùng rác
- [ ] Xác nhận xóa
- [ ] Kiểm tra thông báo biến mất ✅

### Test 5: Realtime sync
- [ ] Mở app trên 2 thiết bị
- [ ] Thiết bị 1: Gửi thông báo
- [ ] Thiết bị 2: Kiểm tra nhận ngay lập tức ✅
- [ ] Thiết bị 2: Bấm "Đã xử lý"
- [ ] Thiết bị 1: Refresh → Kiểm tra status đã update ✅

### Test 6: Auto-hide order
- [ ] Vào màn hình Kitchen Display
- [ ] Chọn 1 order đang có món
- [ ] Vào ServeStatusScreen
- [ ] Đánh dấu tất cả món là "Đã phục vụ"
- [ ] Quay lại Kitchen Display
- [ ] Kiểm tra order đã biến mất ✅

## 🎨 Bước 4: Kiểm tra UI/UX

### Màn hình ReturnNotificationScreen
- [ ] Header màu xanh dương (#3B82F6)
- [ ] Icon chuông trắng
- [ ] Badge đỏ hiển thị số lượng (nếu > 0)
- [ ] Card thông báo chưa xử lý: viền trái đỏ
- [ ] Card thông báo đã xử lý: không viền, có icon xanh
- [ ] Nút "Đã xử lý" màu xanh lá
- [ ] Nút xóa màu đỏ
- [ ] Thời gian hiển thị đúng (vừa xong, X phút trước, X giờ trước)

### Màn hình KitchenDisplayScreen
- [ ] Nút "TRẢ MÓN" màu xanh lá
- [ ] Icon thông báo
- [ ] Order biến mất khi tất cả món served

### Tab Bar
- [ ] Tab "Thông báo" có icon chuông
- [ ] Tab active màu xanh dương
- [ ] Badge đỏ hiển thị ở góc icon (nếu có thông báo)

## 🔧 Bước 5: Troubleshooting

### Không nhận được thông báo realtime?
- [ ] Kiểm tra `ALTER PUBLICATION supabase_realtime ADD TABLE return_notifications;`
- [ ] Kiểm tra console log có lỗi không
- [ ] Kiểm tra internet connection
- [ ] Restart app

### Không rung?
- [ ] Kiểm tra điện thoại không ở chế độ im lặng
- [ ] Kiểm tra quyền Vibration (thường có sẵn)
- [ ] Test trên thiết bị thật (không phải emulator)

### Order không tự động ẩn?
- [ ] Kiểm tra tất cả món có status = 'served' chưa
- [ ] Kiểm tra logic filter trong fetchKitchenOrders
- [ ] Kiểm tra realtime channel có hoạt động không

### Lỗi "Cannot find table"?
- [ ] Kiểm tra đã chạy SQL script chưa
- [ ] Kiểm tra tên bảng chính xác
- [ ] Kiểm tra RLS policies

## 📊 Bước 6: Monitoring & Analytics (Tùy chọn)

- [ ] Theo dõi số lượng thông báo trả món mỗi ngày
- [ ] Phân tích món nào hay bị trả nhiều nhất
- [ ] Thời gian xử lý trung bình
- [ ] Tỷ lệ thông báo được xử lý

## 🎯 Tính năng Mở rộng (Nếu cần)

- [ ] Thêm âm thanh thông báo (cài expo-av)
- [ ] Push notification khi app ở background
- [ ] Lọc thông báo theo ngày
- [ ] Xuất báo cáo thông báo trả món
- [ ] Thêm lý do trả món (dropdown)
- [ ] Camera chụp ảnh món lỗi
- [ ] Chat giữa Kitchen và Staff

## ✨ Hoàn thành!

Nếu tất cả checkbox đều tích ✅:
- [ ] **Chúc mừng! Chức năng Trả Món đã sẵn sàng sử dụng! 🎉**

---

## 📞 Support

Nếu gặp vấn đề:
1. Đọc file `RETURN_FEATURE_GUIDE.md`
2. Xem diagram trong `RETURN_FEATURE_DIAGRAM.md`
3. Check console log
4. Check Supabase logs
5. Hỏi team member 😊
