-- =================================================================
-- SCRIPT TỔNG THỂ DUY NHẤT: TÁI THIẾT LẬP TOÀN BỘ HỆ THỐNG
-- Chạy script này sẽ xóa mọi thứ và xây dựng lại từ đầu.
-- =================================================================

-- BƯỚC 1: DỌN DẸP TOÀN BỘ DATABASE (Bảng, Kiểu dữ liệu, Hàm, Trigger)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS return_slip_items CASCADE;
DROP TABLE IF EXISTS return_slips CASCADE;
DROP TABLE IF EXISTS return_notifications CASCADE;
DROP TABLE IF EXISTS cancellation_requests CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_tables CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_item_options CASCADE;
DROP TABLE IF EXISTS option_choices CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;

DROP TYPE IF EXISTS order_status_enum;
DROP TYPE IF EXISTS payment_method_enum;

DROP FUNCTION IF EXISTS public.cancel_order_and_reset_tables(uuid);
DROP FUNCTION IF EXISTS public.cancel_order_and_reset_tables(bigint);
DROP FUNCTION IF EXISTS public.send_provisional_bill(uuid);
DROP FUNCTION IF EXISTS public.handle_table_transfer(bigint, bigint);
DROP FUNCTION IF EXISTS public.handle_table_grouping(uuid, bigint[]);
DROP FUNCTION IF EXISTS public.handle_order_merge(uuid, bigint[]);
DROP FUNCTION IF EXISTS public.handle_order_split(uuid, bigint, jsonb);
DROP FUNCTION IF EXISTS public.handle_order_split(bigint, bigint, jsonb);

DROP TRIGGER IF EXISTS trigger_on_new_order_table_link ON public.order_tables;
DROP FUNCTION IF EXISTS public.update_table_status_on_insert_order_tables();

DROP TRIGGER IF EXISTS trigger_on_order_status_change ON public.orders;
DROP FUNCTION IF EXISTS public.reset_table_status_on_order_close();


-- BƯỚC 2: TẠO LẠI TOÀN BỘ CẤU TRÚC BẢNG
-- 2.1. Bảng cơ bản
CREATE TABLE public.categories (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE);
CREATE TABLE public.tables (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, status TEXT DEFAULT 'Trống', seats INT);

-- 2.2. Bảng Menu và Tùy chọn
CREATE TABLE public.menu_items (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, price NUMERIC(10, 0) NOT NULL, description TEXT, image_url TEXT, category_id UUID REFERENCES categories(id) ON DELETE SET NULL, is_available BOOLEAN DEFAULT TRUE, is_hot BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE);
CREATE TABLE public.option_groups (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, type TEXT NOT NULL);
CREATE TABLE public.option_choices (id BIGSERIAL PRIMARY KEY, group_id BIGINT NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE, name TEXT NOT NULL, price_adjustment NUMERIC(10, 0) NOT NULL DEFAULT 0, UNIQUE(group_id, name));
CREATE TABLE public.menu_item_options (menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE, option_group_id BIGINT NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE, PRIMARY KEY (menu_item_id, option_group_id));

-- 2.3. Bảng Order và các bảng liên quan
CREATE TYPE order_status_enum AS ENUM ('pending', 'paid', 'closed', 'cancelled');
CREATE TABLE public.orders (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), total_price NUMERIC(10, 0), status order_status_enum DEFAULT 'pending', is_provisional BOOLEAN DEFAULT FALSE, payment_method TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id));
CREATE TABLE public.order_items (id BIGSERIAL PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL, quantity INT NOT NULL, unit_price NUMERIC(10, 0) NOT NULL, customizations JSONB, status TEXT DEFAULT 'waiting', returned_quantity INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.order_tables (order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE, PRIMARY KEY (order_id, table_id));
CREATE TABLE public.cart_items (id BIGSERIAL PRIMARY KEY, table_id BIGINT NOT NULL REFERENCES tables(id), menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE, quantity INT NOT NULL, unit_price NUMERIC(10, 0) NOT NULL, total_price NUMERIC(10, 0) NOT NULL, customizations JSONB, unique_id TEXT UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW(), user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id));
CREATE TYPE payment_method_enum AS ENUM ('cash', 'momo', 'transfer');
CREATE TABLE public.transactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), order_id UUID NOT NULL REFERENCES orders(id), amount NUMERIC(10, 0) NOT NULL, payment_method payment_method_enum NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());

-- 2.4. Bảng cho chức năng Hủy/Trả món
CREATE TABLE public.cancellation_requests (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), order_id UUID NOT NULL REFERENCES orders(id), table_name TEXT, reason TEXT, requested_items JSONB, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.return_slips (id BIGSERIAL PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), reason TEXT, type TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.return_slip_items (id BIGSERIAL PRIMARY KEY, return_slip_id BIGINT NOT NULL REFERENCES return_slips(id) ON DELETE CASCADE, order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE, quantity INT NOT NULL, unit_price NUMERIC(10, 0) NOT NULL);
CREATE TABLE public.return_notifications (id BIGSERIAL PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), table_name TEXT, item_name TEXT NOT NULL, status TEXT DEFAULT 'pending', acknowledged_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), notification_type TEXT);


-- BƯỚC 3: THÊM DỮ LIỆU MẪU
-- 3.1. Thêm bàn mẫu (12 bàn)
INSERT INTO tables (name, seats) VALUES ('Bàn 01', 4), ('Bàn 02', 4), ('Bàn 03', 4), ('Bàn 04', 4), ('Bàn 05', 4), ('Bàn 06', 4), ('Bàn 07', 6), ('Bàn 08', 6), ('Bàn 09', 6), ('Bàn 10', 6), ('Bàn 11', 6), ('Bàn 12', 6);
-- 3.2. Thêm danh mục
INSERT INTO categories (name) VALUES ('Cà phê & Matcha'), ('Cơm'), ('Bún & Mì'), ('Bánh Mì'), ('Nước Giải Khát'), ('Nước Ép'), ('Món Ăn Vặt'), ('Trà Sữa'), ('Trà Trái Cây');
-- 3.3. Thêm toàn bộ menu
INSERT INTO menu_items (name, image_url, description, price, category_id, is_available, is_hot) VALUES 
    ('Cà phê Latte', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505651/coffee_house/img-1751505653457-244061120.png', 'Cà phê pha tươi và sữa hấp', 40000, (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'), TRUE, TRUE),
    ('Cà phê Mocha', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1751505674/coffee_house/img-1751505680292-177449698.png', 'Espresso với sữa và kem tươi', 55000, (SELECT id FROM categories WHERE name = 'Cà phê & Matcha'), TRUE, FALSE),
    ('Cơm gà chiên giòn', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220388/hq720_bebk8x.jpg', 'Cơm gà chiên giòn', 50000, (SELECT id FROM categories WHERE name = 'Cơm'), TRUE, FALSE),
    ('Bún bò', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759220266/unnamed_bnm5rw.png', 'Bún bò', 55000, (SELECT id FROM categories WHERE name = 'Bún & Mì'), TRUE, FALSE),
    ('Trà sữa trân châu', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759218401/cach-lam-tran-chau-tra-sua_1_bkm5hw.webp', 'Hương vị trà sữa truyền thống', 35000, (SELECT id FROM categories WHERE name = 'Trà Sữa'), TRUE, TRUE),
    ('Trà đào cam sả', 'https://res.cloudinary.com/dp0th1tjn/image/upload/v1759217404/tra-dao-cam-sa_o9o7mi.webp', 'Thức uống giải nhiệt sảng khoái', 45000, (SELECT id FROM categories WHERE name = 'Trà Trái Cây'), TRUE, TRUE);
-- (Lưu ý: Rút gọn danh sách menu cho ngắn gọn, bạn có thể dán đầy đủ vào đây)
-- 3.4. Thêm tùy chọn và liên kết
INSERT INTO option_groups (name, type) VALUES ('Chọn size', 'single'), ('Mức đường', 'single'), ('Topping', 'multiple'), ('Món ăn kèm', 'multiple');
INSERT INTO option_choices (group_id, name, price_adjustment) VALUES
    ((SELECT id FROM option_groups WHERE name = 'Chọn size'), 'Size M (Mặc định)', 0),
    ((SELECT id FROM option_groups WHERE name = 'Chọn size'), 'Size L', 7000),
    ((SELECT id FROM option_groups WHERE name = 'Mức đường'), '100% Đường', 0),
    ((SELECT id FROM option_groups WHERE name = 'Mức đường'), '70% Đường', 0),
    ((SELECT id FROM option_groups WHERE name = 'Topping'), 'Trân châu đen', 7000),
    ((SELECT id FROM option_groups WHERE name = 'Món ăn kèm'), 'Thêm trứng ốp la', 10000);
INSERT INTO menu_item_options (menu_item_id, option_group_id) SELECT m.id, og.id FROM menu_items m JOIN categories c ON m.category_id = c.id CROSS JOIN option_groups og WHERE c.name IN ('Cà phê & Matcha', 'Trà Sữa', 'Trà Trái Cây', 'Nước Ép') AND og.name IN ('Chọn size', 'Mức đường', 'Topping');
INSERT INTO menu_item_options (menu_item_id, option_group_id) SELECT m.id, og.id FROM menu_items m JOIN categories c ON m.category_id = c.id CROSS JOIN option_groups og WHERE c.name IN ('Cơm', 'Bún & Mì', 'Bánh Mì') AND og.name IN ('Món ăn kèm');


-- BƯỚC 4: TẠO TRIGGER TỰ ĐỘNG HÓA TRẠNG THÁI BÀN
-- 4.1. Trigger tự động chuyển sang "Đang phục vụ"
CREATE OR REPLACE FUNCTION public.update_table_status_on_insert_order_tables() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tables SET status = 'Đang phục vụ' WHERE id = NEW.table_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trigger_on_new_order_table_link AFTER INSERT ON public.order_tables FOR EACH ROW EXECUTE FUNCTION public.update_table_status_on_insert_order_tables();

-- 4.2. Trigger tự động chuyển về "Trống"
CREATE OR REPLACE FUNCTION public.reset_table_status_on_order_close() RETURNS TRIGGER AS $$
DECLARE
    table_ids_to_reset BIGINT[];
BEGIN
    IF NEW.status IN ('closed', 'cancelled') THEN
        SELECT array_agg(table_id) INTO table_ids_to_reset FROM public.order_tables WHERE order_id = NEW.id;
        IF array_length(table_ids_to_reset, 1) > 0 THEN
            UPDATE public.tables SET status = 'Trống' WHERE id = ANY(table_ids_to_reset);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trigger_on_order_status_change AFTER UPDATE OF status ON public.orders FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION public.reset_table_status_on_order_close();


-- BƯỚC 5: TẠO CÁC HÀM LOGIC (RPC) VỚI QUYỀN THỰC THI ĐÚNG
-- Hàm hủy order
CREATE OR REPLACE FUNCTION public.cancel_order_and_reset_tables(p_order_id uuid) RETURNS void AS $$
BEGIN
    UPDATE public.orders SET status = 'cancelled' WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm gửi tạm tính
CREATE OR REPLACE FUNCTION public.send_provisional_bill(p_order_id UUID) RETURNS void AS $$
BEGIN
    UPDATE public.orders SET is_provisional = true WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm chuyển bàn
CREATE OR REPLACE FUNCTION public.handle_table_transfer(source_table_id_input bigint, target_table_id_input bigint) RETURNS void AS $$
DECLARE order_id_to_move uuid;
BEGIN
    SELECT order_id INTO order_id_to_move FROM public.order_tables JOIN public.orders ON orders.id = order_tables.order_id WHERE order_tables.table_id = source_table_id_input AND orders.status IN ('pending', 'paid') LIMIT 1;
    IF order_id_to_move IS NOT NULL THEN
        UPDATE public.order_tables SET table_id = target_table_id_input WHERE table_id = source_table_id_input AND order_id = order_id_to_move;
    END IF;
    UPDATE public.cart_items SET table_id = target_table_id_input WHERE table_id = source_table_id_input;
    UPDATE public.tables SET status = 'Trống' WHERE id = source_table_id_input;
    UPDATE public.tables SET status = 'Đang phục vụ' WHERE id = target_table_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm gộp bàn
CREATE OR REPLACE FUNCTION public.handle_table_grouping(source_order_id_input uuid, target_table_ids_input bigint[]) RETURNS void AS $$
DECLARE target_id bigint;
BEGIN
    FOREACH target_id IN ARRAY target_table_ids_input LOOP
        INSERT INTO public.order_tables (order_id, table_id) VALUES (source_order_id_input, target_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm ghép order
CREATE OR REPLACE FUNCTION public.handle_order_merge(source_order_id_input uuid, target_table_ids_input bigint[]) RETURNS void AS $$
DECLARE target_order_id uuid;
BEGIN
    FOR target_order_id IN SELECT ot.order_id FROM public.order_tables ot JOIN public.orders o ON ot.order_id = o.id WHERE ot.table_id = ANY(target_table_ids_input) AND o.status = 'pending' LOOP
        UPDATE public.order_items SET order_id = source_order_id_input WHERE order_id = target_order_id;
        UPDATE public.orders SET status = 'cancelled' WHERE id = target_order_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm tách order
CREATE OR REPLACE FUNCTION public.handle_order_split(source_order_id_input uuid, target_table_id_input bigint, items_to_move_input jsonb) RETURNS void AS $$
DECLARE
    new_order_id uuid; item_record jsonb; source_item_id bigint; quantity_to_move int; source_item_record public.order_items;
BEGIN
    INSERT INTO public.orders (status) VALUES ('pending') RETURNING id INTO new_order_id;
    INSERT INTO public.order_tables (order_id, table_id) VALUES (new_order_id, target_table_id_input);
    FOR item_record IN SELECT * FROM jsonb_array_elements(items_to_move_input) LOOP
        source_item_id := (item_record->>'item_id')::bigint; quantity_to_move := (item_record->>'quantity')::int;
        SELECT * INTO source_item_record FROM public.order_items WHERE id = source_item_id;
        IF source_item_record.quantity > quantity_to_move THEN
            UPDATE public.order_items SET quantity = quantity - quantity_to_move WHERE id = source_item_id;
            INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, customizations, status) VALUES (new_order_id, source_item_record.menu_item_id, quantity_to_move, source_item_record.unit_price, source_item_record.customizations, source_item_record.status);
        ELSE
            UPDATE public.order_items SET order_id = new_order_id WHERE id = source_item_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- BƯỚC 6: THIẾT LẬP ROW LEVEL SECURITY (RLS) VÀ POLICIES
-- Bật RLS cho tất cả các bảng
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_slip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_notifications ENABLE ROW LEVEL SECURITY;

-- Tạo Policies
-- Cho phép người dùng đã đăng nhập đọc dữ liệu công khai (menu, bàn...)
CREATE POLICY "Allow authenticated read access" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.option_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.option_choices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.menu_item_options FOR SELECT TO authenticated USING (true);
-- Cho phép người dùng đã đăng nhập có thể thực hiện mọi hành động trên bảng `tables` (vì các logic phức tạp đã được xử lý bởi RPC và Trigger)
CREATE POLICY "Allow full access for authenticated users" ON public.tables FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Cho phép người dùng quản lý `orders` và `cart_items` của chính họ
CREATE POLICY "Allow users to manage their own orders" ON public.orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to manage their own cart items" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Cho phép toàn quyền truy cập vào các bảng liên quan đến order (trong môi trường nhân viên/quản trị viên)
CREATE POLICY "Allow full access for authenticated users" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.order_tables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.cancellation_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.return_slips FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.return_slip_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON public.return_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- BƯỚC 7: THÔNG BÁO HOÀN TẤT
SELECT 'Hoàn thành! Toàn bộ hệ thống đã được thiết lập lại thành công với tất cả các bản vá lỗi.' AS status;