-- Kiểm tra đầy đủ cấu trúc bảng option_choices
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'option_choices'
ORDER BY ordinal_position;
