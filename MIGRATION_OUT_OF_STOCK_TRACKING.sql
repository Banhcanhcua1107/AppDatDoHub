-- ============================================================================
-- MIGRATION: Tạo bảng tracking cho out-of-stock items
-- Mục đích: Theo dõi chính xác khi nào một order-item được báo hết (out-of-stock)
-- Điều này giúp phân biệt giữa "thực sự hết" và "chưa add lại sau khi còn"
-- ============================================================================

-- 1. Tạo bảng để lưu trữ khi order-item được báo hết
CREATE TABLE IF NOT EXISTS "public"."order_item_out_of_stock_events" (
    "id" bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "order_item_id" bigint NOT NULL,
    "menu_item_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "marked_out_of_stock_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "remarked_available_at" timestamp with time zone,
    "is_reordered_after_recovery" boolean DEFAULT false,
    "reordered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."order_item_out_of_stock_events" OWNER TO "postgres";

-- 2. Thêm indexes để query nhanh
CREATE INDEX IF NOT EXISTS idx_order_item_out_of_stock_events_order_item_id 
    ON "public"."order_item_out_of_stock_events" ("order_item_id");

CREATE INDEX IF NOT EXISTS idx_order_item_out_of_stock_events_order_id 
    ON "public"."order_item_out_of_stock_events" ("order_id");

CREATE INDEX IF NOT EXISTS idx_order_item_out_of_stock_events_menu_item_id 
    ON "public"."order_item_out_of_stock_events" ("menu_item_id");

-- 3. Tạo function để theo dõi khi menu_item báo hết
CREATE OR REPLACE FUNCTION "public"."mark_order_items_as_out_of_stock"(
    "p_menu_item_id" "uuid",
    "p_is_available" boolean
) RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
    affected_order_item RECORD;
BEGIN
    -- Nếu menu_item chuyển từ available=true sang available=false (báo hết)
    IF p_is_available = false THEN
        -- Lặp qua tất cả order-items của menu_item này trong các order chưa hoàn thành
        FOR affected_order_item IN
            SELECT oi.id as order_item_id, oi.order_id
            FROM "public"."order_items" oi
            JOIN "public"."orders" o ON oi.order_id = o.id
            WHERE oi.menu_item_id = p_menu_item_id
            AND o.status IN ('pending', 'paid')
            AND oi.status IN ('waiting', 'in_progress', 'completed')
        LOOP
            -- Tạo event ghi nhận thời điểm báo hết
            INSERT INTO "public"."order_item_out_of_stock_events" (
                order_item_id,
                menu_item_id,
                order_id,
                marked_out_of_stock_at
            ) VALUES (
                affected_order_item.order_item_id,
                p_menu_item_id,
                affected_order_item.order_id,
                NOW()
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    ELSE
        -- Nếu chuyển từ available=false sang available=true (báo còn)
        -- [NEW] Xoá trực tiếp order_items của menu_item này
        DELETE FROM "public"."order_items"
        WHERE menu_item_id = p_menu_item_id
        AND order_id IN (
            SELECT o.id FROM "public"."orders" o
            WHERE o.status IN ('pending', 'paid')
        )
        AND status IN ('waiting', 'in_progress', 'completed');
        
        -- Xoá events để clean up
        DELETE FROM "public"."order_item_out_of_stock_events"
        WHERE menu_item_id = p_menu_item_id
        AND remarked_available_at IS NULL;
    END IF;
END;
$$;

-- 4. Tạo function để đánh dấu item đã được add lại
CREATE OR REPLACE FUNCTION "public"."mark_item_as_reordered"(
    "p_order_item_id" bigint
) RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
BEGIN
    -- Cập nhật sự kiện out-of-stock để ghi nhận item đã được add lại
    UPDATE "public"."order_item_out_of_stock_events"
    SET 
        is_reordered_after_recovery = true,
        reordered_at = NOW()
    WHERE order_item_id = p_order_item_id
    AND is_reordered_after_recovery = false;
END;
$$;

-- 5. Tạo function kiểm tra item có trong trạng thái "unavailable" không
-- (tức là đã từng hết, vừa còn, nhưng chưa được add lại)
CREATE OR REPLACE FUNCTION "public"."is_order_item_unavailable"(
    "p_order_item_id" bigint
) RETURNS boolean
LANGUAGE "sql"
AS $$
    SELECT EXISTS(
        SELECT 1
        FROM "public"."order_item_out_of_stock_events"
        WHERE order_item_id = p_order_item_id
        AND marked_out_of_stock_at IS NOT NULL
        AND remarked_available_at IS NOT NULL
        AND is_reordered_after_recovery = false
    );
$$;

-- 6. View để dễ dàng query trạng thái unavailable items theo order
CREATE OR REPLACE VIEW "public"."order_item_unavailable_status" AS
SELECT
    oe.order_item_id,
    oe.order_id,
    oe.menu_item_id,
    oi.customizations->>'name' as item_name,
    oi.quantity,
    oi.unit_price,
    oe.marked_out_of_stock_at,
    oe.remarked_available_at,
    oe.is_reordered_after_recovery,
    oe.reordered_at,
    (oe.remarked_available_at IS NOT NULL AND oe.is_reordered_after_recovery = false) as is_currently_unavailable
FROM "public"."order_item_out_of_stock_events" oe
JOIN "public"."order_items" oi ON oe.order_item_id = oi.id
WHERE oe.marked_out_of_stock_at IS NOT NULL;

-- 7. Trigger khi menu_item.is_available thay đổi
CREATE OR REPLACE FUNCTION "public"."trigger_menu_item_availability_change"()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu trạng thái is_available thay đổi, ghi nhận sự kiện
    IF OLD.is_available IS DISTINCT FROM NEW.is_available THEN
        PERFORM mark_order_items_as_out_of_stock(NEW.id, NEW.is_available);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger (xóa cái cũ nếu có)
DROP TRIGGER IF EXISTS trigger_menu_item_availability_change ON "public"."menu_items";

CREATE TRIGGER trigger_menu_item_availability_change
AFTER UPDATE ON "public"."menu_items"
FOR EACH ROW
EXECUTE FUNCTION "public"."trigger_menu_item_availability_change"();

-- ============================================================================
-- RLS POLICIES - Cho phép app users đọc out-of-stock events
-- ============================================================================

-- Enable RLS
ALTER TABLE "public"."order_item_out_of_stock_events" ENABLE ROW LEVEL SECURITY;

-- Xoá các policy cũ nếu tồn tại
DROP POLICY IF EXISTS "Users can read out-of-stock events from their orders" ON "public"."order_item_out_of_stock_events";
DROP POLICY IF EXISTS "Service role can update out-of-stock events" ON "public"."order_item_out_of_stock_events";
DROP POLICY IF EXISTS "System can insert out-of-stock events" ON "public"."order_item_out_of_stock_events";

-- Policy: Allow reading events từ orders mà user có access
CREATE POLICY "Users can read out-of-stock events from their orders"
ON "public"."order_item_out_of_stock_events"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."orders" o
    WHERE o.id = order_id
  )
);

-- Policy: Allow updates (nếu cần)
CREATE POLICY "Service role can update out-of-stock events"
ON "public"."order_item_out_of_stock_events"
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Allow inserts (trigger sẽ gọi)
CREATE POLICY "System can insert out-of-stock events"
ON "public"."order_item_out_of_stock_events"
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- Ghi chú: Các bước thực hiện trong app
-- ============================================================================
-- 1. Khi bếp báo hết món (menu_item.is_available = false):
--    - Trigger tự động gọi mark_order_items_as_out_of_stock()
--    - Tạo event trong order_item_out_of_stock_events
--    - App nhận được real-time update và hiện trạng thái "hết món"
--
-- 2. Khi bếp báo còn lại (menu_item.is_available = true):
--    - Trigger tự động gọi mark_order_items_as_out_of_stock()
--    - Cập nhật remarked_available_at cho các event chưa add lại
--    - App nhận được real-time update và hiện trạng thái "không khả dụng"
--    - Chỉ hiển thị trong danh mục "Không khả dụng", không tính vào doanh thu
--
-- 3. Khi nhân viên add lại item từ menu (gửi bếp):
--    - App gọi markItemAsReordered() cho order-item mới
--    - Cập nhật is_reordered_after_recovery = true
--    - Item được loại bỏ khỏi danh mục "Không khả dụng"
--    - Có thể tính vào doanh thu nếu cần
--
-- SETUP:
-- 1. Chạy toàn bộ SQL migration này trong Supabase SQL Editor
-- 2. Nếu gặp lỗi RLS, kiểm tra policy đã được tạo chưa
-- 3. Kiểm tra xem table order_item_out_of_stock_events đã xuất hiện
-- 4. Kiểm tra real-time channel hoạt động bằng cách monitor logs
-- ============================================================================
