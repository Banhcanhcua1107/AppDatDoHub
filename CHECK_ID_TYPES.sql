-- Kiểm tra kiểu dữ liệu của menu_items.id
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'menu_items' AND column_name = 'id';

-- Kiểm tra kiểu dữ liệu của option_groups.id
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'option_groups' AND column_name = 'id';
