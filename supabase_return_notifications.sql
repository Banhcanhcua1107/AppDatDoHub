-- ============================================
-- RETURN NOTIFICATIONS FEATURE - SQL SETUP
-- ============================================
-- Copy toàn bộ file này và chạy trong Supabase SQL Editor

-- 1. Tạo bảng return_notifications
CREATE TABLE IF NOT EXISTS return_notifications (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  item_names TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

-- 2. Tạo các index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_return_notifications_status 
ON return_notifications(status);

CREATE INDEX IF NOT EXISTS idx_return_notifications_created_at 
ON return_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_return_notifications_order_id 
ON return_notifications(order_id);

-- 3. Enable realtime cho bảng
ALTER PUBLICATION supabase_realtime ADD TABLE return_notifications;

-- 4. Enable Row Level Security
ALTER TABLE return_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Xóa policies cũ nếu có
DROP POLICY IF EXISTS "Allow read return_notifications for all users" ON return_notifications;
DROP POLICY IF EXISTS "Allow insert return_notifications for authenticated users" ON return_notifications;
DROP POLICY IF EXISTS "Allow update return_notifications for authenticated users" ON return_notifications;
DROP POLICY IF EXISTS "Allow delete return_notifications for authenticated users" ON return_notifications;

-- 6. Tạo policies mới
-- Policy cho phép đọc tất cả thông báo
CREATE POLICY "Allow read return_notifications for all users"
ON return_notifications FOR SELECT
USING (true);

-- Policy cho phép insert thông báo (chỉ authenticated users)
CREATE POLICY "Allow insert return_notifications for authenticated users"
ON return_notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy cho phép update thông báo (chỉ authenticated users)
CREATE POLICY "Allow update return_notifications for authenticated users"
ON return_notifications FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy cho phép delete thông báo (chỉ authenticated users)
CREATE POLICY "Allow delete return_notifications for authenticated users"
ON return_notifications FOR DELETE
USING (auth.role() = 'authenticated');

-- 7. (TÙY CHỌN) Cập nhật bảng order_items nếu chưa có cột status
-- Uncomment phần này nếu cần
/*
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting' 
CHECK (status IN ('waiting', 'in_progress', 'completed', 'served'));

CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
*/

-- 8. Tạo function để tự động cleanup thông báo cũ (tùy chọn)
-- Xóa thông báo đã acknowledged sau 7 ngày
CREATE OR REPLACE FUNCTION cleanup_old_return_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM return_notifications
  WHERE status = 'acknowledged' 
  AND acknowledged_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 9. Tạo trigger để tự động cleanup mỗi ngày (tùy chọn)
-- Bạn có thể dùng pg_cron hoặc gọi function này định kỳ

-- 10. Kiểm tra kết quả
SELECT 'Setup completed!' AS message;

-- Test data (tùy chọn - để test)
/*
INSERT INTO return_notifications (
  order_id,
  table_name,
  item_names,
  status
) VALUES (
  (SELECT id FROM orders LIMIT 1), -- Lấy order_id đầu tiên
  'Bàn Test',
  ARRAY['Cà phê sữa (x2)', 'Trà đào (x1)'],
  'pending'
);
*/

-- Xem dữ liệu
-- SELECT * FROM return_notifications ORDER BY created_at DESC;
