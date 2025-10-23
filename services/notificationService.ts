// services/notificationService.ts
/**
 * Service để quản lý tất cả các loại thông báo.
 * Tái cấu trúc để thống nhất logic, dễ bảo trì và mở rộng.
 */

import { supabase } from './supabase';

// [CẬP NHẬT] Thêm các loại thông báo mới
export type NotificationType = 
  | 'return_item' 
  | 'item_ready' 
  | 'out_of_stock'
  | 'cancellation_approved'
  | 'cancellation_rejected';

// Interface cho payload của một thông báo
interface NotificationPayload {
  order_id: string;
  table_name: string;
  item_name: string; // Nội dung chính của thông báo
  notification_type: NotificationType;
}

// Interface cho một thông báo đầy đủ từ database
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

// [CẬP NHẬT] Bổ sung thông tin cho các loại thông báo mới
export const NOTIFICATION_TYPE_INFO = {
  return_item: {
    label: 'Trả lại món',
    icon: 'arrow-undo-outline',
    color: '#F97316',
  },
  item_ready: {
    label: 'Sẵn sàng phục vụ',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
  },
  out_of_stock: {
    label: 'Hết hàng',
    icon: 'alert-circle-outline',
    color: '#DC2626',
  },
  cancellation_approved: {
    label: 'Yêu cầu được duyệt',
    icon: 'checkmark-done-circle-outline',
    color: '#16A34A',
  },
  cancellation_rejected: {
    label: 'Yêu cầu bị từ chối',
    icon: 'close-circle-outline',
    color: '#EF4444',
  },
};

/**
 * [HÀM LÕI] Gửi một thông báo duy nhất.
 * Các hàm public khác sẽ gọi hàm này.
 */
const sendNotification = async (payload: NotificationPayload) => {
  const { error } = await supabase.from('return_notifications').insert({
    ...payload,
    status: 'pending',
  });

  if (error) {
    console.error('Lỗi gửi thông báo:', error.message);
    // Ném lỗi để component gọi nó có thể bắt và xử lý
    throw new Error(`Không thể gửi thông báo: ${error.message}`);
  }
};

// --- CÁC HÀM GỬI THÔNG BÁO PUBLIC ---

export const sendItemReadyNotification = (orderId: string, tableName: string, itemName: string) => {
  return sendNotification({
    order_id: orderId,
    table_name: tableName,
    item_name: `Món sẵn sàng: ${itemName}`,
    notification_type: 'item_ready',
  });
};

export const sendOutOfStockNotification = (orderId: string, tableName: string, itemName: string) => {
  return sendNotification({
    order_id: orderId,
    table_name: tableName,
    item_name: `Hết món: ${itemName}`,
    notification_type: 'out_of_stock',
  });
};

export const sendCancellationApprovedNotification = (orderId: string, tableName: string, itemDescription: string) => {
  return sendNotification({
    order_id: orderId,
    table_name: tableName,
    item_name: `Đã duyệt trả: ${itemDescription}`,
    notification_type: 'cancellation_approved',
  });
};

export const sendCancellationRejectedNotification = (orderId: string, tableName: string, itemDescription: string) => {
  return sendNotification({
    order_id: orderId,
    table_name: tableName,
    item_name: `Từ chối trả: ${itemDescription}`,
    notification_type: 'cancellation_rejected',
  });
};

/**
 * Gửi nhiều thông báo cùng lúc (tối ưu hơn gọi lặp).
 */
export const sendBulkNotifications = async (notifications: NotificationPayload[]) => {
  const payloadToInsert = notifications.map(n => ({ ...n, status: 'pending' }));
  const { error } = await supabase.from('return_notifications').insert(payloadToInsert);

  if (error) {
    console.error('Lỗi gửi bulk notifications:', error.message);
    throw new Error(`Không thể gửi hàng loạt thông báo: ${error.message}`);
  }
};


// --- CÁC HÀM QUẢN LÝ THÔNG BÁO KHÁC (Giữ nguyên) ---

export const acknowledgeNotification = async (notificationId: number) => {
  const { error } = await supabase
    .from('return_notifications')
    .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Lỗi xác nhận thông báo:', error.message);
    throw new Error(error.message);
  }
};

export const deleteNotification = async (notificationId: number) => {
  const { error } = await supabase.from('return_notifications').delete().eq('id', notificationId);

  if (error) {
    console.error('Lỗi xóa thông báo:', error.message);
    throw new Error(error.message);
  }
};


export default {
  // Hàm gửi
  sendItemReadyNotification,
  sendOutOfStockNotification,
  sendCancellationApprovedNotification,
  sendCancellationRejectedNotification,
  sendBulkNotifications,
  // Hàm quản lý
  acknowledgeNotification,
  deleteNotification,
  // Dữ liệu tĩnh
  NOTIFICATION_TYPE_INFO,
};