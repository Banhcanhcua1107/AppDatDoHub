-- ============================================================================
-- VERIFY MIGRATION: Check if columns were added successfully
-- ============================================================================
-- Run this query to verify the table structure
-- ============================================================================

-- Check table columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'return_notifications'
ORDER BY ordinal_position;

-- ============================================================================
-- Expected output should include these columns:
-- ============================================================================
-- id               | bigint                | NO       | nextval(...)
-- order_id         | uuid or text          | NO/YES   | NULL
-- table_name       | text                  | NO/YES   | NULL
-- item_name        | character varying     | YES      | NULL ✓ ADDED
-- status           | text                  | NO       | 'pending'::text
-- notification_type| character varying     | YES      | 'return_item'::character varying ✓ ADDED
-- created_at       | timestamp with tz     | NO       | now()
-- acknowledged_at  | timestamp with tz     | YES      | NULL
-- ============================================================================

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'return_notifications'
AND constraint_type = 'CHECK';

-- ============================================================================
-- Expected CHECK constraint:
-- check_notification_type | CHECK ✓
-- ============================================================================

-- Test insert to verify it works
INSERT INTO return_notifications (
  order_id,
  table_name,
  item_name,
  status,
  notification_type
) VALUES (
  'test-' || gen_random_uuid()::text,
  'Bàn 02',
  'Phở Bò',
  'pending',
  'item_ready'
)
RETURNING id, order_id, item_name, notification_type;

-- ============================================================================
-- If you see a row returned with item_name and notification_type values,
-- then EVERYTHING WORKS! ✅
-- ============================================================================
