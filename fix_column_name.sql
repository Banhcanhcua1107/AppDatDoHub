-- ============================================================================
-- FIX: Remove duplicate/incorrect item_names column
-- ============================================================================
-- The table has both item_names (incorrect) and item_name (correct)
-- We need to drop the incorrect item_names column that has NOT NULL constraint

-- Drop the incorrect column
ALTER TABLE return_notifications 
DROP COLUMN IF EXISTS item_names;

-- Verify only item_name remains
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'return_notifications' 
ORDER BY ordinal_position;
