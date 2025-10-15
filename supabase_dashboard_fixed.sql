-- ============================================
-- DASHBOARD FUNCTION - SQL SETUP (FIXED VERSION)
-- ============================================
-- Copy và chạy trong Supabase SQL Editor

-- Kích hoạt extension nếu chưa có
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo hoặc THAY THẾ hàm cũ bằng hàm mới đã được sửa
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS JSONB 
LANGUAGE plpgsql
AS $$
DECLARE
    -- ĐÃ SỬA: Tên cột chính xác dựa trên cấu trúc database của bạn
    total_column_name TEXT := 'total_price';  -- ✅ Cột tổng tiền (tìm thấy trong OrderConfirmationScreen.tsx:817)
    table_column_name TEXT := 'table_id';     -- ✅ Cột bàn ăn (tìm thấy trong nhiều file)
BEGIN
    RETURN (
        WITH daily_orders AS (
            -- Lấy tất cả các đơn hàng trong ngày hôm nay
            SELECT 
                id,
                status,
                created_at,
                -- Lấy giá trị total từ cột đúng
                COALESCE(
                    (row_to_json(orders)->>total_column_name)::numeric,
                    0
                ) AS total,
                -- Lấy table_id
                (row_to_json(orders)->>table_column_name) AS table_id
            FROM public.orders
            WHERE created_at >= date_trunc('day', now()) 
              AND created_at < date_trunc('day', now()) + interval '1 day'
        ),
        stats AS (
            -- Tính toán các chỉ số thống kê
            SELECT 
                COALESCE(SUM(CASE WHEN status IN ('completed', 'paid', 'closed') THEN total ELSE 0 END), 0) AS "todayRevenue",
                COUNT(*) AS "todayOrders",
                COUNT(DISTINCT table_id) AS "todayCustomers",
                COALESCE(SUM(CASE WHEN status IN ('completed', 'paid', 'closed') THEN 1 ELSE 0 END), 0)::integer AS "paidOrdersCount"
            FROM daily_orders
        ),
        top_items AS (
            -- Lấy các món bán chạy nhất
            SELECT 
                jsonb_agg(item_data ORDER BY quantity DESC) AS items
            FROM (
                SELECT 
                    mi.id,
                    mi.name,
                    SUM(oi.quantity)::integer AS quantity,
                    SUM(oi.quantity * oi.unit_price)::integer AS revenue
                FROM public.order_items oi
                JOIN public.menu_items mi ON oi.menu_item_id = mi.id
                JOIN daily_orders daily_ord ON oi.order_id = daily_ord.id
                GROUP BY mi.id, mi.name
                ORDER BY quantity DESC
                LIMIT 5
            ) item_data
        ),
        recent_activities AS (
            -- Lấy các hoạt động gần đây
            SELECT
                jsonb_agg(activity_data ORDER BY created_at DESC) as activities
            FROM (
                SELECT
                    o.id,
                    COALESCE(
                        (row_to_json(o)->>total_column_name)::numeric,
                        0
                    ) AS amount,
                    o.created_at,
                    o.status,
                    -- Lấy table_id chính xác
                    (row_to_json(o)->>table_column_name) AS table_id
                FROM public.orders o
                ORDER BY o.created_at DESC
                LIMIT 5
            ) activity_data
        )
        -- Xây dựng đối tượng JSON cuối cùng để trả về
        SELECT jsonb_build_object(
            'stats', (SELECT to_jsonb(stats) FROM stats),
            'topItems', COALESCE((SELECT items FROM top_items), '[]'::jsonb),
            'activities', COALESCE((SELECT activities FROM recent_activities), '[]'::jsonb)
        )
    );
END;
$$;

-- Kiểm tra function
SELECT 'Dashboard function created successfully!' AS message;

-- Test function (tùy chọn)
-- SELECT get_dashboard_data();
