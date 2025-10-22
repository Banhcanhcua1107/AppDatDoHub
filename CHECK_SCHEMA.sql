-- ============================================
-- KIỂM TRA CẤU TRÚC CỦA CÁC BẢNG
-- ============================================

-- Chạy các query này để xem cấu trúc bảng
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;

-- Hoặc nếu dùng Supabase, có thể xem trực tiếp trong Table Editor
