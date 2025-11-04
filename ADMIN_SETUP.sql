-- ADMIN_SETUP.sql - Script SQL để Setup Tài Khoản Admin
-- ============================================================
-- Chạy script này trong Supabase SQL Editor
-- https://app.supabase.com/project/[YOUR_PROJECT]/sql/new
-- ============================================================

-- BƯỚC 1: Tạo Admin User (Nếu chưa có trong Authentication)
-- ============================================================
-- Chú ý: Bạn cần dùng Supabase Admin CLI hoặc Dashboard để tạo auth user
-- Dashboard: Authentication → Users → "Invite user" / "Create user"
-- Email: admin@admin.com.vn
-- Password: admin123456


-- BƯỚC 2: Thêm Profile cho Admin
-- ============================================================
-- Cách duy nhất: Lấy ID tự động từ auth.users

INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role
)
SELECT
  u.id,
  'Admin Manager',
  u.email,
  'admin'
FROM auth.users u
WHERE u.email = 'admin@admin.com.vn'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);


-- BƯỚC 3: Cập nhật role nếu admin đã có profile nhưng role sai
-- ============================================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@admin.com.vn';


-- BƯỚC 4: Kiểm tra đã setup thành công
-- ============================================================
-- Chạy query này để kiểm tra:

SELECT 
  id,
  full_name,
  email,
  role
FROM public.profiles
WHERE email = 'admin@admin.com.vn' OR role = 'admin'
ORDER BY id DESC;


-- BƯỚC 5: (TÙY CHỌN) RLS Policies cho Admin
-- ============================================================
-- Nếu bạn cần thiết lập RLS để admin có quyền đầy đủ:

-- Policy 1: Admin có thể đọc tất cả profiles
CREATE POLICY "admin_read_all_profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy 2: Admin có thể cập nhật tất cả profiles
CREATE POLICY "admin_update_all_profiles" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy 3: Admin có thể xóa profiles
CREATE POLICY "admin_delete_all_profiles" ON public.profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);


-- BƯỚC 6: (TÙY CHỌN) Setup RLS cho bảng menu_items
-- ============================================================
-- Nếu bạn muốn admin có quyền quản lý menu:

-- Policy: Admin có thể đọc tất cả menu items
CREATE POLICY "admin_read_menu_items" ON public.menu_items
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  OR true  -- Public read
);

-- Policy: Admin có thể thêm menu items
CREATE POLICY "admin_create_menu_items" ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Policy: Admin có thể cập nhật menu items
CREATE POLICY "admin_update_menu_items" ON public.menu_items
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Policy: Admin có thể xóa menu items
CREATE POLICY "admin_delete_menu_items" ON public.menu_items
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);


-- BƯỚC 7: (TÙY CHỌN) Setup RLS cho bảng orders
-- ============================================================

-- Policy: Admin có thể đọc tất cả orders
CREATE POLICY "admin_read_orders" ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Policy: Admin có thể cập nhật orders
CREATE POLICY "admin_update_orders" ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);


-- BƯỚC 8: (TÙY CHỌN) Setup RLS cho bảng users (profiles)
-- ============================================================

-- Policy: Người dùng có thể đọc profile của mình
CREATE POLICY "users_read_own_profile" ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Admin có thể đọc tất cả profiles
CREATE POLICY "admin_read_all_profiles_v2" ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Policy: Admin có thể cập nhật tất cả profiles
CREATE POLICY "admin_update_all_profiles_v2" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);


-- ============================================================
-- DONE! Bây giờ hãy test đăng nhập với:
-- Email:    admin@admin.com.vn
-- Password: admin123456
-- ============================================================

-- Kiểm tra lại dữ liệu admin:
SELECT * FROM public.profiles WHERE role = 'admin';
