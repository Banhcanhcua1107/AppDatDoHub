-- ============================================
-- SCRIPT THIẾT LẬP OPTIONS CHO MENU ITEMS
-- ============================================

-- BƯỚC 1: TẠO CÁC NHÓM TUỲ CHỌN (OPTION GROUPS)
-- Các nhóm này sẽ áp dụng cho hầu hết các món ăn
INSERT INTO option_groups (name, type)
VALUES
    ('Chọn size', 'single'),      -- ID: 1
    ('Mức đường', 'single'),      -- ID: 2
    ('Topping (Thúc ăng)', 'multiple'), -- ID: 3
    ('Topping (Đồ ăn)', 'multiple')     -- ID: 4
ON CONFLICT DO NOTHING;

-- BƯỚC 2: TẠO CÁC LỰA CHỌN CHO MỖI NHÓM (OPTION CHOICES)

-- 2.1 Lựa chọn cho "Chọn size"
INSERT INTO option_choices (group_id, name, price_adjustment)
VALUES
    (1, 'Size M', 0),
    (1, 'Size L', 5000),
    (1, 'Size XL', 10000)
ON CONFLICT DO NOTHING;

-- 2.2 Lựa chọn cho "Mức đường"
INSERT INTO option_choices (group_id, name, price_adjustment)
VALUES
    (2, '50% Đường', 0),
    (2, '70% Đường', 0),
    (2, '100% Đường', 0)
ON CONFLICT DO NOTHING;

-- 2.3 Lựa chọn cho "Topping (Thúc ăng)" - Các topping phổ biến
INSERT INTO option_choices (group_id, name, price_adjustment)
VALUES
    (3, 'Trân châu', 7000),
    (3, 'Trân châu đường đen', 7000),
    (3, 'Thạch', 5000),
    (3, 'Pudding', 5000),
    (3, 'Nata de coco', 5000)
ON CONFLICT DO NOTHING;

-- 2.4 Lựa chọn cho "Topping (Đồ ăn)" - Các đồ ăn thêm
INSERT INTO option_choices (group_id, name, price_adjustment)
VALUES
    (4, 'Thêm kem', 8000),
    (4, 'Thêm sô cô la', 5000),
    (4, 'Thêm caramel', 5000),
    (4, 'Thêm mứt', 3000)
ON CONFLICT DO NOTHING;

-- BƯỚC 3: LIÊN KẾT CÁC OPTION GROUPS VỚI MENU ITEMS
-- Vì menu_item_id là bigint, tôi sẽ chèn ID thủ công
-- Trước tiên, hãy lấy ID của các món từ bảng menu_items

-- 3.1 Liên kết cho tất cả các môn cà phê (Size + Mức đường + Topping)
-- Bước 1: Lấy ID của các món cà phê
WITH coffee_ids AS (
    SELECT id FROM menu_items WHERE name IN (
        'Cà phê Latte', 'Cà phê Mocha', 'Mocha Trắng', 'Americano',
        'Cappuccino', 'Latte Vani', 'Latte Caramel', 'Macchiato',
        'Matcha Latte', 'Matcha Sting', 'Mocha Đá', 'Latte Gừng'
    )
)
INSERT INTO menu_item_options (menu_item_id, option_group_id)
SELECT 
    -- Lưu ý: Cần convert uuid sang bigint nếu có thể
    -- Nếu không, bạn cần thêm cột menu_item_id (bigint) vào menu_items
    m.id::text::bigint, og.id
FROM coffee_ids c
CROSS JOIN option_groups og
WHERE og.name IN ('Chọn size', 'Mức đường', 'Topping (Thúc ăng)', 'Topping (Đồ ăn)')
ON CONFLICT DO NOTHING;

-- 3.2 Liên kết cho các món cơm (chỉ Size + Topping đồ ăn)
INSERT INTO menu_item_options (menu_item_id, option_group_id)
SELECT m.id, og.id
FROM menu_items m
CROSS JOIN option_groups og
WHERE m.name IN (
    'Cơm gà chiên giòn',
    'Cơm sườn bì chả',
    'Cơm chiên dương châu'
)
AND og.name IN ('Chọn size', 'Topping (Đồ ăn)')
ON CONFLICT DO NOTHING;

-- 3.3 Liên kết cho các món bún/mì (chỉ Size)
INSERT INTO menu_item_options (menu_item_id, option_group_id)
SELECT m.id, og.id
FROM menu_items m
CROSS JOIN option_groups og
WHERE m.name IN (
    'Bún bò',
    'Bún thịt nướng',
    'Phở bò',
    'Mì xào hải sản',
    'Mì quảng',
    'Mì xào bò'
)
AND og.name IN ('Chọn size')
ON CONFLICT DO NOTHING;

-- 3.4 Liên kết cho bánh mì (chỉ Size)
INSERT INTO menu_item_options (menu_item_id, option_group_id)
SELECT m.id, og.id
FROM menu_items m
CROSS JOIN option_groups og
WHERE m.name IN (
    'Bánh mì ốp la',
    'Bánh mì thịt nướng',
    'Bánh mì chả lụa'
)
AND og.name IN ('Chọn size')
ON CONFLICT DO NOTHING;

-- 3.5 Liên kết cho nước uống (Size + Mức đường + Topping)
INSERT INTO menu_item_options (menu_item_id, option_group_id)
SELECT m.id, og.id
FROM menu_items m
CROSS JOIN option_groups og
WHERE m.name IN (
    'Pesi',
    '7up',
    'Nước suối',
    'Ép ổi',
    'Ép cam & ca rốt',
    'Ép dứa',
    'Trà sữa trân châu',
    'Trà sữa chân châu đường đen',
    'Trà vải hoa hồng',
    'Trà đào cam sả'
)
AND og.name IN ('Chọn size', 'Mức đường', 'Topping (Thúc ăng)')
ON CONFLICT DO NOTHING;

-- BƯỚC 4: KIỂM TRA DỮ LIỆU ĐÃ THÊM
SELECT 'Hoàn thành! Đã thiết lập tất cả các options.' AS status;

-- Bạn có thể chạy những query dưới đây để kiểm tra:
-- SELECT * FROM option_groups;
-- SELECT * FROM option_choices;
-- SELECT COUNT(*) as total_menu_item_options FROM menu_item_options;
