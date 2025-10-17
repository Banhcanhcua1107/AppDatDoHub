// services/autoReturnService.ts
import { supabase } from './supabase';

const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 phút

interface OrderItem {
  id: number;
  order_id: string;
  quantity: number;
  status: string;
  created_at: string;
  customizations: any;
  orders: {
    order_tables: {
      tables: {
        name: string;
      };
    }[];
  };
}

/**
 * Kiểm tra và xử lý các món quá 5 phút chưa được chế biến
 * - Nếu món đang ở trạng thái 'waiting' (pending) và quá 5 phút → Tự động tạo cancellation_request
 * - Nếu món đang ở trạng thái 'in_progress' và quá 5 phút → Tạo cancellation_request yêu cầu bếp xác nhận
 */
export async function checkAndCreateAutoReturn() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - FIVE_MINUTES_MS);

    // Lấy tất cả món đang ở trạng thái 'waiting' hoặc 'in_progress' và đã tồn tại quá 5 phút
    const { data: overdueItems, error } = await supabase
      .from('order_items')
      .select('id, order_id, quantity, status, created_at, customizations, orders ( order_tables ( tables ( name ) ) )')
      .in('status', ['waiting', 'in_progress'])
      .lt('created_at', fiveMinutesAgo.toISOString());

    if (error) {
      console.error('[AutoReturn] Error fetching overdue items:', error);
      return;
    }

    if (!overdueItems || overdueItems.length === 0) {
      console.log('[AutoReturn] No overdue items found');
      return;
    }

    console.log(`[AutoReturn] Found ${overdueItems.length} overdue items`);

    // Xử lý từng món
    for (const item of overdueItems as unknown as OrderItem[]) {
      const tableName = item.orders?.order_tables?.[0]?.tables?.name || 'Mang về';
      const itemName = item.customizations?.name || 'Món không tên';

      // Kiểm tra xem đã có cancellation_request cho order này chưa
      const { data: existingRequest } = await supabase
        .from('cancellation_requests')
        .select('id, requested_items')
        .eq('order_id', item.order_id) // [FIX] Sửa từ 'id' thành 'order_id'
        .eq('status', 'pending')
        .single();

      // Nếu đã có request cho order này, kiểm tra xem item đã trong danh sách chưa
      if (existingRequest) {
        const requestedItems = existingRequest.requested_items as { name: string; quantity: number; order_item_id: number }[];
        const itemExists = requestedItems.some(ri => ri.order_item_id === item.id);
        
        if (itemExists) {
          console.log(`[AutoReturn] Item ${item.id} already in existing request`);
          continue;
        }
        
        // Thêm món vào request hiện có
        const updatedItems = [
          ...requestedItems,
          { name: itemName, quantity: item.quantity, order_item_id: item.id }
        ];
        
        const { error: updateError } = await supabase
          .from('cancellation_requests')
          .update({ requested_items: updatedItems })
          .eq('id', existingRequest.id);
        
        if (updateError) {
          console.error(`[AutoReturn] Error updating cancellation request:`, updateError);
          continue;
        }
        
        console.log(`[AutoReturn] Added item ${item.id} to existing request`);
      } else {
        // Tạo cancellation_request mới
        const requestType = item.status === 'waiting' ? 'auto' : 'confirm_required';
        const reason = item.status === 'waiting' 
          ? `Món đã chờ quá 5 phút mà chưa được chế biến`
          : `Món đang chế biến đã quá 5 phút, yêu cầu xác nhận hủy`;

        const { error: insertError } = await supabase
          .from('cancellation_requests')
          .insert({
            order_id: item.order_id, // [FIX] Sửa từ 'id' thành 'order_id'
            table_name: tableName,
            reason: reason,
            status: 'pending',
            requested_items: [
              { name: itemName, quantity: item.quantity, order_item_id: item.id }
            ],
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`[AutoReturn] Error creating cancellation request:`, insertError);
          continue;
        }

        console.log(`[AutoReturn] Created ${requestType} cancellation request for order ${item.order_id}`);
      }

      // Nếu là món đang chờ (waiting), tự động chuyển về served
      if (item.status === 'waiting') {
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ status: 'served' })
          .eq('id', item.id);

        if (updateError) {
          console.error(`[AutoReturn] Error updating item ${item.id} to served:`, updateError);
        } else {
          console.log(`[AutoReturn] Auto-returned item ${item.id} (${itemName})`);
        }
      }
      // Nếu là món đang làm (in_progress), chờ bếp xác nhận qua CancellationRequestsScreen
    }

  } catch (err: any) {
    console.error('[AutoReturn] Unexpected error:', err.message);
  }
}

/**
 * Bắt đầu interval check mỗi 30 giây
 */
export function startAutoReturnService() {
  console.log('[AutoReturn] Service started');
  
  // Check ngay lập tức
  checkAndCreateAutoReturn();
  
  // Sau đó check mỗi 30 giây
  const interval = setInterval(() => {
    checkAndCreateAutoReturn();
  }, 30000); // 30 giây

  return interval;
}

/**
 * Dừng service
 */
export function stopAutoReturnService(interval: NodeJS.Timeout) {
  console.log('[AutoReturn] Service stopped');
  clearInterval(interval);
}
