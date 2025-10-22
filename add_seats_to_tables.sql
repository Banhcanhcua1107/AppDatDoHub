-- ============================================================================
-- DATABASE MIGRATION: Add seats column to tables
-- ============================================================================
-- Purpose: Store the number of seats for each table
-- Date: 2025-10-22
-- ============================================================================

-- 1. Add seats column to tables
-- ============================================================================
ALTER TABLE tables
ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 4;

-- 2. Update existing data
-- ============================================================================
-- Bàn 01-06 (ID 18-23): 4 seats
UPDATE tables
SET seats = 4
WHERE id >= 18 AND id <= 23;

-- Bàn 07-12 (ID 24-29): 6 seats
UPDATE tables
SET seats = 6
WHERE id >= 24 AND id <= 29;

-- Other tables: 4 seats (default)
UPDATE tables
SET seats = 4
WHERE id < 18 OR id > 29;

-- 3. Verify the update
-- ============================================================================
-- Run this to check:
-- SELECT id, name, status, seats FROM tables ORDER BY id;

-- 4. ROLLBACK (if needed)
-- ============================================================================
-- ALTER TABLE tables DROP COLUMN IF EXISTS seats;
