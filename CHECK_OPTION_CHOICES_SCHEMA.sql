-- Kiểm tra cấu trúc bảng option_choices
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'option_choices'
ORDER BY ordinal_position;
