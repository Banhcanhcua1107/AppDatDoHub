-- ============================================================================
-- DATABASE MIGRATION: Add notification_type to return_notifications table
-- ============================================================================
-- Purpose: Support three types of notifications from kitchen to service staff
-- Types: 'return_item', 'item_ready', 'out_of_stock'
-- Date: 2025-10-20
-- ============================================================================

-- 1. ALTER TABLE: Add missing columns to return_notifications
-- ============================================================================

-- Add notification_type column if it doesn't exist
ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'return_item';

-- Add item_name column if it doesn't exist  
ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);

-- Add CHECK constraint for notification_type if it doesn't exist
-- Note: In PostgreSQL, we can't use IF NOT EXISTS for constraints before version 13
-- If you get error "constraint already exists", that means it's already there - which is OK!
-- ALTER TABLE return_notifications
-- ADD CONSTRAINT check_notification_type 
--   CHECK (notification_type IN ('return_item', 'item_ready', 'out_of_stock'));

-- Alternative commands if columns already exist:
-- ALTER TABLE return_notifications ALTER COLUMN notification_type SET DEFAULT 'return_item';
-- ALTER TABLE return_notifications ALTER COLUMN item_name SET NOT NULL;


-- 2. INSERT EXAMPLES: Different notification scenarios
-- ============================================================================
-- NOTE: Don't run these! They're just examples of how data looks
-- Real data will be inserted by your app using notificationService.ts

-- Example 1: Item ready for serving (Sẵn sàng phục vụ)
-- When kitchen staff completes an item
-- INSERT INTO return_notifications (
--   order_id, table_name, item_name, status, notification_type
-- ) VALUES ('order-uuid', 'Bàn 02', 'Item Name', 'pending', 'item_ready');

-- Example 2: Out of stock notification (Hết hàng)
-- When kitchen staff reports an item is out of stock
-- INSERT INTO return_notifications (
--   order_id, table_name, item_name, status, notification_type
-- ) VALUES ('order-uuid', 'Bàn 05', 'Item Name', 'pending', 'out_of_stock');

-- Example 3: Return item notification (Trả lại món)
-- When service staff reports a returned item from customer
-- INSERT INTO return_notifications (
--   order_id, table_name, item_name, status, notification_type
-- ) VALUES ('order-uuid', 'Bàn 08', 'Item Name (x2)', 'pending', 'return_item');


-- 3. USEFUL QUERIES
-- ============================================================================

-- Query 3.1: Get all pending notifications for specific order
-- Replace 'YOUR-ORDER-ID' with actual order ID
SELECT 
  id,
  order_id,
  table_name,
  item_name,
  notification_type,
  status
FROM return_notifications
WHERE order_id = 'YOUR-ORDER-ID'
  AND status = 'pending'
ORDER BY created_at DESC;

-- Query 3.2: Count pending notifications by type
-- Shows statistics for last 24 hours
SELECT 
  notification_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM return_notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY notification_type
ORDER BY total_count DESC;

-- Query 3.3: Get notifications for specific table
-- Replace 'Bàn 02' with actual table name
SELECT 
  id,
  order_id,
  table_name,
  item_name,
  notification_type,
  status
FROM return_notifications
WHERE table_name = 'Bàn 02'
  AND status = 'pending'
ORDER BY created_at DESC;

-- Query 3.4: Get unacknowledged notifications by type
-- Count of pending notifications from last 24 hours
SELECT 
  notification_type,
  COUNT(*) as pending_count
FROM return_notifications
WHERE status = 'pending'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY notification_type;


-- 4. CREATE VIEW: For easier querying
-- ============================================================================

CREATE OR REPLACE VIEW v_pending_notifications AS
SELECT 
  id,
  order_id,
  table_name,
  item_name,
  notification_type,
  status,
  EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_since_creation
FROM return_notifications
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Usage: SELECT * FROM v_pending_notifications;


-- 5. CREATE FUNCTION: For app integration
-- ============================================================================

CREATE OR REPLACE FUNCTION create_order_notification(
  p_order_id VARCHAR,
  p_table_name VARCHAR,
  p_item_name VARCHAR,
  p_notification_type VARCHAR
)
RETURNS TABLE (
  id INTEGER,
  order_id VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO return_notifications (
    order_id,
    table_name,
    item_name,
    status,
    notification_type
  )
  VALUES (
    p_order_id,
    p_table_name,
    p_item_name,
    'pending',
    p_notification_type
  )
  RETURNING 
    return_notifications.id,
    return_notifications.order_id;
END;
$$ LANGUAGE plpgsql;

-- Usage in app:
-- const { data, error } = await supabase.rpc('create_order_notification', {
--   p_order_id: 'ORD-001',
--   p_table_name: 'Bàn 02',
--   p_item_name: 'Phở Bò',
--   p_notification_type: 'item_ready'
-- });


-- 6. ENABLE REALTIME (Supabase-specific)
-- ============================================================================

-- Run this in Supabase SQL Editor to enable realtime on return_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE return_notifications;

-- Or if using Supabase dashboard:
-- 1. Go to Database > Publications
-- 2. Find "supabase_realtime" publication
-- 3. Toggle "return_notifications" table


-- 7. TYPESCRIPT TYPES
-- ============================================================================

/*
// Add this to your types/index.ts or services/notificationService.ts

export type NotificationType = 'return_item' | 'item_ready' | 'out_of_stock';

export interface ReturnNotification {
  id: number;
  order_id: string;
  table_name: string;
  item_name: string;
  status: 'pending' | 'acknowledged';
  notification_type: NotificationType;
  created_at: string;
  acknowledged_at?: string;
}

export const NOTIFICATION_TYPE_INFO = {
  return_item: {
    label: 'Trả lại món',
    icon: 'arrow-undo-outline',
    color: '#F97316', // Orange
    description: 'Khách trả lại món này',
  },
  item_ready: {
    label: 'Sẵn sàng phục vụ',
    icon: 'checkmark-circle-outline',
    color: '#10B981', // Green
    description: 'Món đã sẵn sàng, hãy phục vụ',
  },
  out_of_stock: {
    label: 'Hết hàng',
    icon: 'alert-circle-outline',
    color: '#DC2626', // Red
    description: 'Hết hàng, cần báo cho khách',
  },
};
*/


-- 8. INTEGRATION GUIDE
-- ============================================================================

/*
STEP 1: Check current return_notifications table structure
- Go to Supabase Dashboard > Database > Tables > return_notifications
- Check what columns exist (order_id, table_name, status, created_at, etc.)
- Verify if item_name and notification_type columns exist

STEP 2: Execute migration (if needed columns don't exist)
- Copy the ALTER TABLE statements from Section 1
- Run them in Supabase SQL Editor
- Wait for success - ignore "constraint already exists" warnings if it appears

STEP 3: Verify columns were added
- Refresh the table view in Supabase Dashboard
- Should see: id, order_id, table_name, item_name, status, notification_type, created_at, acknowledged_at

STEP 4: Add CHECK constraint (if needed)
- If constraint doesn't exist, Supabase will create it automatically
- If you get constraint error, the constraint already exists - that's OK

STEP 5: Enable Realtime (Supabase Dashboard)
- Go to Database > Publications > supabase_realtime
- Toggle ON for return_notifications table
- If table doesn't appear, click "Manage" and add it

STEP 6: Update existing data (if table has old records)
- Set default values for newly added columns:
  UPDATE return_notifications
  SET item_name = 'Không rõ'
  WHERE item_name IS NULL;
  
  UPDATE return_notifications
  SET notification_type = 'return_item'
  WHERE notification_type IS NULL;

STEP 7: Use notificationService in your screens

A. In KitchenDetailScreen.tsx - When marking item as "Xong" (completed)
   ───────────────────────────────────────────────────────────────────
   
   import { sendItemReadyNotification } from '@/services/notificationService';
   
   const handleCompleteItem = async (item: OrderItem) => {
     // Update database
     await supabase
       .from('order_items')
       .update({ status: 'served' })
       .eq('id', item.id);
     
     // Send notification
     await sendItemReadyNotification(
       item.orderId,
       table.name,
       item.name
     );
   };

B. In ItemAvailabilityScreen.tsx - When reporting out of stock
   ────────────────────────────────────────────────────────────
   
   import { sendOutOfStockNotification } from '@/services/notificationService';
   
   const handleReportOutOfStock = async (menuItem: MenuItem) => {
     // Update menu item
     await supabase
       .from('menu_items')
       .update({ is_available: false })
       .eq('id', menuItem.id);
     
     // Send notification for each order with this item
     for (const orderId of affectedOrderIds) {
       await sendOutOfStockNotification(
         orderId,
         table.name,
         menuItem.name
       );
     }
   };

C. In ReturnSelectionScreen.tsx - When creating return slip
   ─────────────────────────────────────────────────────────
   
   import { sendReturnItemNotification } from '@/services/notificationService';
   
   const handleSubmitReturnSlip = async (items: ReturnItem[]) => {
     // Create return slip
     const { data: slip, error } = await supabase
       .from('return_slips')
       .insert({...})
       .select()
       .single();
     
     // Send notification for each returned item
     for (const item of items) {
       await sendReturnItemNotification(
         orderId,
         table.name,
         item.name,
         item.quantity
       );
     }
   };

D. In OrderScreen.tsx - Already subscribed to per-order notifications
   ──────────────────────────────────────────────────────────────────
   
   // OrderItemCard already has:
   React.useEffect(() => {
     const fetchNotifications = async () => {
       const { count } = await supabase
         .from('return_notifications')
         .select('*', { count: 'exact', head: true })
         .eq('order_id', item.orderId)
         .eq('status', 'pending');
       setNotificationCount(count || 0);
     };
     
     fetchNotifications();
     
     const channel = supabase
       .channel(`return_notifications_${item.orderId}`)
       .on('postgres_changes', { event: '*', schema: 'public', table: 'return_notifications' }, (payload: any) => {
         if (payload.new?.order_id === item.orderId || payload.old?.order_id === item.orderId) {
           fetchNotifications();
         }
       })
       .subscribe();
     
     return () => { supabase.removeChannel(channel); };
   }, [item.orderId]);

E. In ReturnNotificationScreen.tsx - Display notifications with type badges
   ────────────────────────────────────────────────────────────────────────
   
   // Already implemented:
   // - Shows notification_type badge with icon and color
   // - Displays pending/acknowledged status
   // - Uses getNotificationTypeInfo() to get colors and labels


STEP 8: Test the flow
- Kitchen staff marks item as done → 'item_ready' notification sent
- Service staff sees badge on order card
- Service staff clicks badge → sees notification with green checkmark badge
- Service staff acknowledges → notification status changes to 'acknowledged'


STEP 9: Monitor real-time updates
- All notifications sync in real-time via Supabase channels
- No need to refresh manually
- Badge counts update automatically when new notifications arrive
*/


-- 9. BACKUP: Existing data migration (if table already has data)
-- ============================================================================

-- If return_notifications already has data, update the newly added columns:

UPDATE return_notifications
SET item_name = COALESCE(item_name, 'Không rõ')
WHERE item_name IS NULL;

UPDATE return_notifications
SET notification_type = COALESCE(notification_type, 'return_item')
WHERE notification_type IS NULL;


-- 10. ROLLBACK (if needed)
-- ============================================================================

-- To revert this migration:
-- ALTER TABLE return_notifications
-- DROP CONSTRAINT IF EXISTS check_notification_type;
--
-- ALTER TABLE return_notifications
-- DROP COLUMN IF EXISTS notification_type;
--
-- ALTER TABLE return_notifications
-- DROP COLUMN IF EXISTS item_name;
--
-- DROP FUNCTION IF EXISTS create_order_notification(VARCHAR, VARCHAR, VARCHAR, VARCHAR);
--
-- DROP VIEW IF EXISTS v_pending_notifications;
