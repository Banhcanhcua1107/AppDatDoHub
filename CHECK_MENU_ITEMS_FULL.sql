-- Kiểm tra toàn bộ cấu trúc bảng menu_items
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;
