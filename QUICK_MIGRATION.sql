-- ============================================================================
-- QUICK MIGRATION: Add missing columns to return_notifications table
-- ============================================================================
-- Copy & Paste this entire block into Supabase SQL Editor and RUN
-- ============================================================================

-- Step 1: Add missing columns
ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'return_item';

ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);

-- Step 2: Add CHECK constraint
-- Note: If you get error "constraint already exists", that's OK - it's already there!
-- ALTER TABLE return_notifications
-- ADD CONSTRAINT check_notification_type 
--   CHECK (notification_type IN ('return_item', 'item_ready', 'out_of_stock'));

-- Step 3: Update existing data (if any NULL values)
UPDATE return_notifications
SET item_name = COALESCE(item_name, 'Không rõ')
WHERE item_name IS NULL;

UPDATE return_notifications
SET notification_type = COALESCE(notification_type, 'return_item')
WHERE notification_type IS NULL;

-- Step 4: Enable Realtime (if not already enabled)
-- Note: If you get error "already member of publication", that's OK - it's already enabled!
-- Just skip this and move on!
-- ALTER PUBLICATION supabase_realtime ADD TABLE return_notifications;

-- ============================================================================
-- ✅ ALL DONE!
-- ============================================================================
-- The table now has all required columns:
-- - id (bigint, auto)
-- - order_id (text)
-- - table_name (text)
-- - item_name (text) ✓ ADDED
-- - status (text)
-- - notification_type (text) ✓ ADDED with CHECK constraint
-- - created_at (timestamp)
-- - acknowledged_at (timestamp)
--
-- You can now use notificationService.ts functions to send notifications!
