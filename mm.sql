-- BƯỚC 1: TẠO DANH MỤC "CÀ PHÊ & MATCHA" NẾU CHƯA CÓ
-- Lệnh "ON CONFLICT" đảm bảo bạn có thể chạy lại mã này mà không bị lỗi.
INSERT INTO categories (name) 
VALUES ('Cà phê & Matcha') 
ON CONFLICT (name) DO NOTHING;


-- BƯỚC 2: THÊM TẤT CẢ CÁC MÓN CÀ PHÊ CỦA BẠN VÀO BẢNG menu_items
-- Tất cả các món sẽ được gán vào danh mục "Cà phê & Matcha"
INSERT INTO menu_items 
    (name, image_url, description, price, category_id, is_available, is_hot)
VALUES 
    (
        'Cà phê Latte',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505651/coffee_house/img-1751505653457-244061120.png',
        'Cà phê pha tươi và sữa hấp',
        40000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE, -- Còn hàng
        TRUE  -- Là món hot
    ),
    (
        'Cà phê Mocha',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505674/coffee_house/img-1751505680292-177449698.png',
        'Espresso với sữa và kem tươi',
        55000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Mocha Trắng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505701/coffee_house/img-1751505706709-713500935.png',
        'Espresso, sô cô la trắng, sữa và kem',
        50000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Americano',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505730/coffee_house/img-1751505736325-489166129.png',
        'Espresso và lớp crema nhẹ',
        39000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Cappuccino',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505816/coffee_house/img-1751505821927-690322814.png',
        'Espresso và lớp bọt sữa mịn màng',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        TRUE -- Là món hot
    ),
    (
        'Latte Vani',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505846/coffee_house/img-1751505851491-667969632.png',
        'Espresso, sữa và hương vani',
        40000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Latte Caramel',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505864/coffee_house/img-1751505869988-949004997.png',
        'Espresso, sữa và caramel',
        55000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        TRUE -- Là món hot
    ),
    (
        'Macchiato',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505889/coffee_house/img-1751505895177-578048562.png',
        'Espresso đậm với sữa và bọt',
        30000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Matcha Latte',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505908/coffee_house/img-1751505914136-123797714.png',
        'Trà Xanh với sữa',
        100000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Matcha Sting',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505928/coffee_house/img-1751505934911-147176583.png',
        'Trà Xanh với sting',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Mocha Đá',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505951/coffee_house/img-1751505955421-530401437.png',
        'Espresso, mocha đắng, sữa và đá',
        50000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Latte Gừng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505969/coffee_house/img-1751505974702-535833856.png',
        'Espresso, sữa và hương gừng',
        49000,
        (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'),
        TRUE,
        FALSE
    ),
    (
        'Cơm gà chiên giòn',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220388/hq720_bebk8x.jpg',
        'Cơm gà chiên giòn',
        50000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE,
        FALSE
    ),
    (
        'Cơm sườn bì chả',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220388/com-tam-suon-bi-cha-chay_mm33de.webp',
        'Cơm sườn bì chả',
        60000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE,
        FALSE
    ),
    (
        'Cơm chiên dương châu',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220387/cach-lam-com-chien-duong-chau-ngon-gion-don-gian-tai-nha-202205241534361909_kh8rma.jpg',
        'Cơm chiên dương châu',
        55000,
        (SELECT id FROM categories WHERE name = 'Cơm'),
        TRUE,
        FALSE
    ),
    (
        'Bún bò',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220266/unnamed_bnm5rw.png',
        'Bún bò',
        55000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Bún thịt nướng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220265/maxresdefault_d5r150.jpg',
        'Bún thịt nướng',
        50000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Phở bò',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220264/bun-bo-hue-1_da318989e7c2493f9e2c3e010e722466_azksib.jpg',
        'Phở bò',
        60000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Mì xào hải sản',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219782/Thanh-pham-1-3557-1679473358_syfo4u.jpg',
        'Mì xào hải sản',
        65000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Mì quảng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219781/mi-hoanh-thanh-xa-xiu-0062_apzx7g.jpg',
        'Mì quảng',
        55000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Mì xào bò',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219780/mi_y_xao_thit_bo_thumb_1_ac7005a87d_mrmmxr.webp',
        'Mì xào bò',
        50000,
        (SELECT id FROM categories WHERE name = 'Bún & Mì'),
        TRUE,
        FALSE
    ),
    (
        'Bánh mì ốp la',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219660/bm_opla_8847c2f03b184e1b845b604fa9aa115c_rymco3.png',
        'Bánh mì ốp la',
        60000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE,
        FALSE
    ),
    (
        'Bánh mì thịt nướng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219659/cach-lam-banh-mi-thit-nuong-cuc-don-gian-bang-chai-nhua-co-san-tai-nha-202108201640593483_h78wac.jpg',
        'Bánh mì thịt nướng',
        50000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE,
        FALSE
    ),
    (
        'Bánh mì chả lụa',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219659/banh_mi_ga_xe_2b55e9c8e4_esb10y.webp',
        'Bánh mì chả lụa',
        45000,
        (SELECT id FROM categories WHERE name = 'Bánh Mì'),
        TRUE,
        FALSE
    ),
    (
        'Pesi',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219244/8934588670114-2.jpg_mbledv.webp',
        'Pesi',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE,
        FALSE
    ),
    (
        '7up',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219205/0102356_b54eefe81219486aa7b92e205b102f14_tx3dlm.jpg',
        '7up',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE,
        FALSE
    ),
    (
        'Nước suối',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219209/chai-nuoc-suoi-aquafina-500ml_dgq80t.jpg',
        'Nước suối',
        15000,
        (SELECT id FROM categories WHERE name = 'Nước đóng lon'),
        TRUE,
        FALSE
    ),
    (
        'Ép ổi',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759219068/nuoc-ep-oi-bo-duong_uuu9gm.webp',
        'Ép ổi',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE,
        FALSE
    ),
    (
        'Ép cam & ca rốt',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759218789/nuoc-ep-tao-ca-rot-_osjhf4.jpg',
        'Ép cam & ca rốt',
        35000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE,
        FALSE
    ),
    (
        'Ép dứa',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759218401/nuoc_ep_cam_dua_9_3c1e453889_pjfrgy.webp',
        'Ép dứa',
        30000,
        (SELECT id FROM categories WHERE name = 'Nước Ép'),
        TRUE,
        FALSE
    ),
    (
        'Khoai tây chiên',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759217710/bi-quyet-chien-khoai-tay-thom-ngon-gion-rum-an-hoai-khong-chan-6_ipzvzl.jpg',
        'Khoai tây chiên',
        30000,
        (SELECT id FROM categories WHERE name = 'Món Ăn Vặt'),
        TRUE,
        FALSE
    ),
    (
        'Trà sữa trân châu',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759218401/cach-lam-tran-chau-tra-sua_1_bkm5hw.webp',
        'Trà sữa trân châu',
        35000,
        (SELECT id FROM categories WHERE name = 'Trà Sữa'),
        TRUE,
        FALSE
    ),
    (
        'Trà sữa chân châu đường đen',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759217281/sua_tuoi_tran_chau_duong_den_6e622e3e514c4e5b9d1d46a80b210853_bu7rko.jpg',
        'Trà sữa chân châu đường đen',
        25000,
        (SELECT id FROM categories WHERE name = 'Trà Sữa'),
        TRUE,
        FALSE
    ),
    (
        'Trà vải hoa hồng',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759217436/cach-lam-tra-vai-hoa-hong-thanh-mat-giai-nhiet-cho-ngay-nang-nong-202108270014109911_u177fj.jpg',
        'Trà vải hoa hồng',
        30000,
        (SELECT id FROM categories WHERE name = 'Trà Trái Cây'),
        TRUE,
        FALSE
    ),
    (
        'Trà đào cam sả',
        'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759217404/tra-dao-cam-sa_o9o7mi.webp',
        'Trà đào cam sả',
        40000,
        (SELECT id FROM categories WHERE name = 'Trà Trái Cây'),
        TRUE,
        FALSE
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