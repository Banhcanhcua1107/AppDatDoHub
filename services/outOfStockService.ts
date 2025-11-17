import { supabase } from './supabase';

/**
 * Service để quản lý tracking out-of-stock items
 * Theo dõi khi nào một order-item được báo hết và khi nào được add lại
 */

interface OutOfStockEvent {
  id: number;
  order_item_id: number;
  menu_item_id: string;
  order_id: string;
  marked_out_of_stock_at: string;
  remarked_available_at: string | null;
  is_reordered_after_recovery: boolean;
  reordered_at: string | null;
  created_at: string;
}

interface UnavailableItem {
  order_item_id: number;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  marked_out_of_stock_at: string;
  remarked_available_at: string | null;
  is_reordered_after_recovery: boolean;
  reordered_at: string | null;
  is_currently_unavailable: boolean;
}

/**
 * Lấy tất cả các order-items "unavailable" (hết -> còn -> chưa add lại) cho một order
 */
export const getUnavailableItemsForOrder = async (orderId: string): Promise<UnavailableItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_item_unavailable_status')
      .select('*')
      .eq('order_id', orderId)
      .eq('is_currently_unavailable', true);

    if (error) {
      console.warn('[outOfStockService] View might not exist yet, returning empty:', error.message);
      return [];
    }

    console.log('[getUnavailableItemsForOrder] Query orderId:', orderId, 'Found:', data?.length || 0, 'items');
    if (data && data.length > 0) {
      console.log('[getUnavailableItemsForOrder] Items:', data.map(d => ({ order_item_id: d.order_item_id, is_currently_unavailable: d.is_currently_unavailable, remarked_available_at: d.remarked_available_at })));
    }

    return data || [];
  } catch (err) {
    console.error('[outOfStockService] Exception fetching unavailable items:', err);
    return [];
  }
};

/**
 * Kiểm tra một order-item cụ thể có đang ở trạng thái "unavailable" không
 */
export const isOrderItemUnavailable = async (orderItemId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_order_item_unavailable', { p_order_item_id: orderItemId });

    if (error) {
      console.error('[outOfStockService] Error checking item unavailable status:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('[outOfStockService] Exception checking item unavailable status:', err);
    return false;
  }
};

/**
 * Đánh dấu một order-item là đã được add lại (reordered)
 * Gọi khi nhân viên thêm lại item từ menu
 */
export const markItemAsReordered = async (orderItemId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('mark_item_as_reordered', { p_order_item_id: orderItemId });

    if (error) {
      console.error('[outOfStockService] Error marking item as reordered:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[outOfStockService] Exception marking item as reordered:', err);
    return false;
  }
};

/**
 * [DEBUG] Hàm để check toàn bộ dữ liệu events (không filter)
 */
export const debugGetAllEventsForOrder = async (orderId: string): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('order_item_out_of_stock_events')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('[DEBUG] Error fetching all events:', error);
      return;
    }

    console.log('[DEBUG] ALL EVENTS for orderId:', orderId);
    if (!data || data.length === 0) {
      console.log('[DEBUG] - No events found');
      return;
    }

    data.forEach(e => {
      console.log(`[DEBUG] Event ${e.id}:`, {
        order_item_id: e.order_item_id,
        marked_out_of_stock_at: e.marked_out_of_stock_at,
        remarked_available_at: e.remarked_available_at,
        is_reordered_after_recovery: e.is_reordered_after_recovery,
        is_currently_unavailable: (e.remarked_available_at !== null && e.is_reordered_after_recovery === false)
      });
    });
  } catch (err) {
    console.error('[DEBUG] Exception:', err);
  }
};

/**
 * Lấy tất cả out-of-stock events cho một order
 */
export const getOutOfStockEventsForOrder = async (orderId: string): Promise<OutOfStockEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('order_item_out_of_stock_events')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.warn('[getOutOfStockEventsForOrder] Error fetching events:', error.message);
      return [];
    }

    console.log('[getOutOfStockEventsForOrder] Query orderId:', orderId, 'Found:', data?.length || 0, 'events');
    if (data && data.length > 0) {
      console.log('[getOutOfStockEventsForOrder] Events:', data.map(e => ({ 
        order_item_id: e.order_item_id, 
        remarked_available_at: e.remarked_available_at,
        is_reordered_after_recovery: e.is_reordered_after_recovery
      })));
    }

    return data || [];
  } catch (err) {
    console.error('[getOutOfStockEventsForOrder] Exception fetching events:', err);
    return [];
  }
};

/**
 * Lấy out-of-stock event cho một order-item cụ thể
 */
export const getOutOfStockEventForItem = async (orderItemId: number): Promise<OutOfStockEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('order_item_out_of_stock_events')
      .select('*')
      .eq('order_item_id', orderItemId)
      .maybeSingle();

    if (error) {
      console.error('[outOfStockService] Error fetching out-of-stock event:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[outOfStockService] Exception fetching out-of-stock event:', err);
    return null;
  }
};

/**
 * Lấy danh sách order-items cho một menu_item trong một order
 * Được dùng để check nếu cần mark items khi menu_item báo còn
 */
export const getOrderItemsForMenuItemInOrder = async (
  orderId: string,
  menuItemId: string
): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('menu_item_id', menuItemId);

    if (error) {
      console.error('[outOfStockService] Error fetching order items:', error);
      return [];
    }

    return (data || []).map(item => item.id);
  } catch (err) {
    console.error('[outOfStockService] Exception fetching order items:', err);
    return [];
  }
};

/**
 * Reset unavailable status cho tất cả order-items của một menu_item trong một order
 * Khi menu_item báo còn lại
 */
export const resetUnavailableStatusForMenuItemInOrder = async (
  orderId: string,
  menuItemId: string
): Promise<boolean> => {
  try {
    // Lấy danh sách order-items của menu_item này trong order
    const orderItemIds = await getOrderItemsForMenuItemInOrder(orderId, menuItemId);

    if (orderItemIds.length === 0) {
      return true; // Không có item nào để reset
    }

    // Xóa hoặc mark failed những events liên quan
    const { error } = await supabase
      .from('order_item_out_of_stock_events')
      .update({
        is_reordered_after_recovery: false,
        remarked_available_at: null, // Reset lại
      })
      .in('order_item_id', orderItemIds)
      .eq('is_reordered_after_recovery', false);

    if (error) {
      console.error('[outOfStockService] Error resetting unavailable status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[outOfStockService] Exception resetting unavailable status:', err);
    return false;
  }
};

/**
 * Lắng nghe real-time changes cho out-of-stock events của một order
 */
export const subscribeToOutOfStockEvents = (
  orderId: string,
  callback: (event: OutOfStockEvent) => void
) => {
  try {
    const subscription = supabase
      .channel(`out-of-stock-events:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_item_out_of_stock_events',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          try {
            if (payload.new) {
              callback(payload.new as OutOfStockEvent);
            }
          } catch (err) {
            console.error('[subscribeToOutOfStockEvents] Error in callback:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[subscribeToOutOfStockEvents] Subscribed to events for order:', orderId);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('[subscribeToOutOfStockEvents] Channel error - RLS might be blocking');
        }
      });

    return subscription;
  } catch (err) {
    console.error('[subscribeToOutOfStockEvents] Failed to subscribe:', err);
    return null;
  }
};

/**
 * [TEST] Simulates marking an order-item as unavailable for testing
 * Mark item as out-of-stock, then mark as available again (without reordering)
 */
export const testMarkItemAsUnavailable = async (orderItemId: number, orderId: string): Promise<boolean> => {
  try {
    console.log('[testMarkItemAsUnavailable] Testing orderId:', orderId, 'orderItemId:', orderItemId);
    
    // Step 1: Mark as out of stock
    const { error: err1 } = await supabase
      .rpc('mark_order_items_as_out_of_stock', { 
        p_order_item_ids: [orderItemId],
        p_order_id: orderId
      });

    if (err1) {
      console.error('[testMarkItemAsUnavailable] Error marking out of stock:', err1);
      return false;
    }
    
    console.log('[testMarkItemAsUnavailable] ✓ Step 1: Marked as out of stock');

    // Step 2: Mark as available again (without reordering) - update remarked_available_at
    const { error: err2 } = await supabase
      .from('order_item_out_of_stock_events')
      .update({ remarked_available_at: new Date().toISOString() })
      .eq('order_item_id', orderItemId)
      .is('remarked_available_at', null);

    if (err2) {
      console.error('[testMarkItemAsUnavailable] Error marking as available:', err2);
      return false;
    }
    
    console.log('[testMarkItemAsUnavailable] ✓ Step 2: Marked as available again');
    console.log('[testMarkItemAsUnavailable] ✅ Item is now in UNAVAILABLE state (hết -> còn -> chưa add lại)');
    
    return true;
  } catch (err) {
    console.error('[testMarkItemAsUnavailable] Exception:', err);
    return false;
  }
};
