# Hướng dẫn thiết lập chức năng Trả Món

## 1. Tạo bảng trong Supabase

Truy cập Supabase SQL Editor và chạy câu lệnh sau:

```sql
-- Tạo bảng return_notifications
CREATE TABLE return_notifications (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  item_names TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

-- Tạo index để tối ưu query
CREATE INDEX idx_return_notifications_status ON return_notifications(status);
CREATE INDEX idx_return_notifications_created_at ON return_notifications(created_at DESC);

-- Enable realtime cho bảng
ALTER PUBLICATION supabase_realtime ADD TABLE return_notifications;

-- Thêm RLS (Row Level Security) nếu cần
ALTER TABLE return_notifications ENABLE ROW LEVEL SECURITY;

-- Policy cho phép đọc tất cả thông báo
CREATE POLICY "Allow read return_notifications for all users"
ON return_notifications FOR SELECT
USING (true);

-- Policy cho phép insert thông báo
CREATE POLICY "Allow insert return_notifications for authenticated users"
ON return_notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy cho phép update thông báo
CREATE POLICY "Allow update return_notifications for authenticated users"
ON return_notifications FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy cho phép delete thông báo
CREATE POLICY "Allow delete return_notifications for authenticated users"
ON return_notifications FOR DELETE
USING (auth.role() = 'authenticated');
```

## 2. Cập nhật bảng order_items (nếu chưa có cột status)

```sql
-- Kiểm tra xem cột status đã tồn tại chưa
-- Nếu chưa có, chạy câu lệnh sau:

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting' 
CHECK (status IN ('waiting', 'in_progress', 'completed', 'served'));

-- Tạo index
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
```

## 3. Cài đặt dependencies

```bash
# Cài đặt expo-av nếu muốn dùng âm thanh (không bắt buộc)
npm install expo-av

# Hoặc chỉ dùng Vibration (đã có sẵn trong React Native)
```

## 4. Thêm file âm thanh (tùy chọn)

Nếu muốn dùng âm thanh thay vì rung:

1. Tải file âm thanh thông báo (định dạng .mp3 hoặc .wav)
2. Đặt vào thư mục `assets/sounds/notification.mp3`
3. Uncomment code sử dụng expo-av trong ReturnNotificationScreen.tsx

## 5. Cấu trúc chức năng

### Màn hình Kitchen (Bếp):
- **KitchenDisplayScreen**: Hiển thị danh sách order, có nút "TRẢ MÓN"
- **KitchenDetailScreen**: Chi tiết order, có nút "TRẢ MÓN"
- **KitchenSummaryScreen**: Tổng hợp món theo loại
- **KitchenSummaryDetailScreen**: Chi tiết món cụ thể

### Màn hình Staff (Nhân viên):
- **ReturnNotificationScreen**: Hiển thị thông báo trả món từ bếp
  - Realtime updates khi có thông báo mới
  - Rung điện thoại khi có thông báo mới
  - Xác nhận đã xử lý
  - Xóa thông báo

### Màn hình Server (Phục vụ):
- **ServeStatusScreen**: Kiểm tra trạng thái món và phục vụ
  - Tự động quay lại khi tất cả món đã phục vụ

## 6. Luồng hoạt động

1. **Bếp phát hiện vấn đề** → Bấm nút "TRẢ MÓN"
2. **Hệ thống tạo thông báo** → Lưu vào bảng `return_notifications`
3. **Staff nhận thông báo realtime** → Điện thoại rung
4. **Staff xử lý** → Bấm "Đã xử lý" hoặc "Xóa"
5. **Order tự động ẩn** → Khi tất cả món đã served hoặc đã xong

## 7. Testing

### Test thông báo realtime:
1. Mở app trên 2 thiết bị (hoặc 2 tài khoản)
2. Thiết bị 1: Vào màn hình Bếp → Bấm "TRẢ MÓN"
3. Thiết bị 2: Vào màn hình "Thông báo" → Kiểm tra có nhận thông báo không

### Test rung:
1. Đảm bảo điện thoại không ở chế độ im lặng
2. Tạo thông báo trả món
3. Kiểm tra điện thoại có rung không

### Test auto-hide order:
1. Tạo order mới với vài món
2. Vào KitchenDetailScreen → Chế biến tất cả món
3. Kiểm tra order có tự động biến mất khỏi KitchenDisplayScreen không

## 8. Tùy chỉnh

### Thay đổi pattern rung:
```typescript
// Trong ReturnNotificationScreen.tsx
Vibration.vibrate([0, 500, 200, 500]); // [delay, rung, dừng, rung]
```

### Thêm âm thanh:
```typescript
// Uncomment code expo-av và thêm file âm thanh vào assets
```

### Thay đổi màu sắc thông báo:
```typescript
// Trong styles của ReturnNotificationScreen
pendingCard: {
  borderLeftColor: '#EF4444', // Đổi màu viền trái
}
```

## 9. Troubleshooting

### Không nhận được thông báo realtime:
- Kiểm tra đã enable realtime cho bảng chưa
- Kiểm tra connection Supabase
- Xem log console có lỗi không

### Không rung:
- Kiểm tra quyền Vibration trong app.json
- Đảm bảo điện thoại không ở chế độ im lặng

### Order không tự động ẩn:
- Kiểm tra logic filter trong fetchKitchenOrders
- Kiểm tra status của order_items đã đúng chưa

## 10. Bảo mật

- Đã thêm RLS policies cho bảng return_notifications
- Chỉ authenticated users mới có thể tạo/sửa/xóa thông báo
- Tất cả users có thể đọc thông báo
