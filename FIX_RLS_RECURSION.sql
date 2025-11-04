-- XÓA CÁC RLS POLICIES BỊ LỖI
-- Chạy SQL này trong Supabase SQL Editor

-- Xóa tất cả policies trên bảng profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_delete_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles_v2" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles_v2" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;

-- Xóa tất cả policies trên bảng menu_items
DROP POLICY IF EXISTS "admin_read_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_create_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_update_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_delete_menu_items" ON public.menu_items;

-- Xóa tất cả policies trên bảng orders
DROP POLICY IF EXISTS "admin_read_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;

-- Kiểm tra RLS enable/disable
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'menu_items', 'orders');

-- TÙY CHỌN: Disable RLS hoàn toàn trên profiles (thời gian test)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Kiểm tra lại policies còn lại
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'menu_items', 'orders');
