-- Kiểm tra cấu trúc tất cả các bảng liên quan

-- 1. option_groups
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'option_groups'
ORDER BY ordinal_position;

-- 2. option_choices  
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'option_choices'
ORDER BY ordinal_position;

-- 3. menu_item_options
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'menu_item_options'
ORDER BY ordinal_position;
