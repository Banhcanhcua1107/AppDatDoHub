-- Query để kiểm tra orders hiện tại
-- Chạy trong Supabase SQL Editor

-- 1. Kiểm tra cấu trúc bảng orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';

-- 2. Xem tất cả orders hôm nay
SELECT 
  id,
  table_id,
  status,
  total_amount,
  total,
  created_at,
  updated_at
FROM orders 
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- 3. Xem orders với status
SELECT 
  status,
  COUNT(*) as count,
  SUM(COALESCE(total_amount, total, 0)) as total_revenue
FROM orders 
WHERE created_at >= CURRENT_DATE
GROUP BY status;

-- 4. Kiểm tra order_items
SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.price,
  mi.name as item_name,
  o.status as order_status,
  o.created_at
FROM order_items oi
JOIN menu_items mi ON mi.id = oi.menu_item_id
JOIN orders o ON o.id = oi.order_id
WHERE o.created_at >= CURRENT_DATE
ORDER BY o.created_at DESC;

-- 5. Nếu muốn update status của order để test
-- UPDATE orders 
-- SET status = 'paid' 
-- WHERE id = 'your-order-id-here';
