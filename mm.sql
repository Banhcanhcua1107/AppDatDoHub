-- BƯỚC 1: TẠO DANH MỤC "CÀ PHÊ & MATCHA" NẾU CHƯA CÓ
-- Lệnh "ON CONFLICT" đảm bảo bạn có thể chạy lại mã này mà không bị lỗi.
INSERT INTO categories (name) 
VALUES ('Cà phê & Matcha') 
ON CONFLICT (name) DO NOTHING;


-- BƯỚC 2: THÊM TẤT CẢ CÁC MÓN VÀO BẢNG menu_items
-- Tất cả các món sẽ được gán vào danh mục phù hợp
INSERT INTO menu_items 
    (name, price, category_id, is_available)
VALUES 
    (
        'Cà phê Latte',
        40000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Cà phê Mocha',
        55000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Mocha Trắng',
        50000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Americano',
        39000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Cappuccino',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Latte Vani',
        40000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Latte Caramel',
        55000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Macchiato',
        30000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Matcha Latte',
        100000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Matcha Sting',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Mocha Đá',
        50000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Latte Gừng',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE
    ),
    (
        'Cơm gà chiên giòn',
        50000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE
    ),
    (
        'Cơm sườn bì chả',
        60000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE
    ),
    (
        'Cơm chiên dương châu',
        55000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE
    ),
    (
        'Bún bò',
        55000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Bún thịt nướng',
        50000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Phở bò',
        60000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Mì xào hải sản',
        65000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Mì quảng',
        55000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Mì xào bò',
        50000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE
    ),
    (
        'Bánh mì ốp la',
        60000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE
    ),
    (
        'Bánh mì thịt nướng',
        50000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE
    ),
    (
        'Bánh mì chả lụa',
        45000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE
    ),
    (
        'Pesi',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE
    ),
    (
        '7up',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE
    ),
    (
        'Nước suối',
        15000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE
    ),
    (
        'Ép ổi',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE
    ),
    (
        'Ép cam & ca rốt',
        35000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE
    ),
    (
        'Ép dứa',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE
    ),
    (
        'Khoai tây chiên',
        30000,
        (SELECT id FROM categories WHERE name = 'Món Ăn Vặt'),
        TRUE
    ),
    (
        'Trà sữa trân châu',
        35000,
        (SELECT id FROM categories WHERE name = 'Trà Sữa'),
        TRUE
    ),
    (
        'Trà sữa chân châu đường đen',
        25000,
        (SELECT id FROM categories WHERE name = 'Trà Sữa'),
        TRUE
    ),
    (
        'Trà vải hoa hồng',
        30000,
        (SELECT id FROM categories WHERE name = 'Trà Trái Cây'),
        TRUE
    ),
    (
        'Trà đào cam sả',
        40000,
        (SELECT id FROM categories WHERE name = 'Trà Trái Cây'),
        TRUE
    );

-- BƯỚC 3: THÊM CÁC DANH MỤC CÒN THIẾU NẾU CHƯA CÓ
INSERT INTO categories (name) 
VALUES 
    ('Cơm'),
    ('Bún & Mì'),
    ('Bánh Mì'),
    ('Nước đóng lon'),
    ('Nước Ép'),
    ('Món Ăn Vặt'),
    ('Trà Sữa'),
    ('Trà Trái Cây')
ON CONFLICT (name) DO NOTHING;

-- BƯỚC 4: THÔNG BÁO KẾT QUẢ
SELECT 'Đã thêm thành công tất cả các món vào menu!' AS status;