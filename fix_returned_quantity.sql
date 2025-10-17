-- Script để fix dữ liệu returned_quantity bị lỗi
-- Chạy script này trong Supabase SQL Editor

-- 1. Kiểm tra các món có returned_quantity bất thường
SELECT 
  oi.id,
  oi.quantity,
  oi.returned_quantity,
  oi.status,
  oi.customizations->>'name' as item_name,
  o.id as order_id,
  ot.tables->>'name' as table_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN LATERAL (
  SELECT jsonb_build_object('name', t.name) as tables
  FROM order_tables ot2
  JOIN tables t ON ot2.table_id = t.id
  WHERE ot2.order_id = o.id
  LIMIT 1
) ot ON true
WHERE oi.status != 'served'
  AND (oi.returned_quantity IS NOT NULL AND oi.returned_quantity > 0)
ORDER BY o.created_at DESC;

-- 2. Reset returned_quantity về 0 cho các món chưa có thao tác trả món thực sự
-- CHÚ Ý: Chỉ chạy nếu bạn chắc chắn muốn reset
-- UPDATE order_items 
-- SET returned_quantity = 0
-- WHERE status IN ('waiting', 'in_progress', 'completed')
--   AND returned_quantity IS NOT NULL
--   AND returned_quantity > 0
--   AND id NOT IN (
--     SELECT DISTINCT order_item_id 
--     FROM return_slip_items
--   );

-- 3. Kiểm tra xem có return_slip_items nào không
SELECT 
  rsi.id,
  rsi.order_item_id,
  rsi.returned_quantity,
  oi.quantity as original_quantity,
  oi.customizations->>'name' as item_name
FROM return_slip_items rsi
JOIN order_items oi ON rsi.order_item_id = oi.id
ORDER BY rsi.created_at DESC
LIMIT 20;
