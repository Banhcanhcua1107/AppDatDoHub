-- Kiểm tra toàn bộ cấu trúc bảng menu_item_options
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_item_options'
ORDER BY ordinal_position;
