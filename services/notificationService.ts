// services/notificationService.ts
/**
 * Service để quản lý tất cả thông báo từ bếp
 * Thống nhất cách gửi thông báo từ các screen khác nhau
 */

import { supabase } from './supabase';
import Toast from 'react-native-toast-message';

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

/**
 * Gửi thông báo sẵn sàng phục vụ
 * Dùng khi bếp hoàn thành một món (chuyển từ in_progress -> served)
 */
export const sendItemReadyNotification = async (
  orderId: string,
  tableName: string,
  itemName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('return_notifications').insert({
      order_id: orderId,
      table_name: tableName,
      item_name: itemName,
      status: 'pending',
      notification_type: 'item_ready',
    });

    if (error) throw error;

    Toast.show({
      type: 'success',
      text1: '✓ Đã gửi thông báo',
      text2: `${itemName} sẵn sàng phục vụ`,
      visibilityTime: 2000,
    });

    return true;
  } catch (error: any) {
    console.error('Lỗi gửi thông báo sẵn sàng phục vụ:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Không thể gửi thông báo',
      visibilityTime: 2000,
    });
    return false;
  }
};

/**
 * Gửi thông báo hết hàng
 * Dùng khi bếp báo hết một món (menu_items.is_available = false)
 */
export const sendOutOfStockNotification = async (
  orderId: string,
  tableName: string,
  itemName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('return_notifications').insert({
      order_id: orderId,
      table_name: tableName,
      item_name: itemName,
      status: 'pending',
      notification_type: 'out_of_stock',
    });

    if (error) throw error;

    Toast.show({
      type: 'info',
      text1: '⚠️  Báo hết hàng',
      text2: `${itemName} đã hết hàng`,
      visibilityTime: 2000,
    });

    return true;
  } catch (error: any) {
    console.error('Lỗi gửi thông báo hết hàng:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Không thể gửi thông báo hết hàng',
      visibilityTime: 2000,
    });
    return false;
  }
};

/**
 * Gửi thông báo trả lại món
 * Dùng khi khách trả lại một món (create return_slip)
 */
export const sendReturnItemNotification = async (
  orderId: string,
  tableName: string,
  itemName: string,
  quantity: number = 1
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('return_notifications').insert({
      order_id: orderId,
      table_name: tableName,
      item_name: `${itemName} (x${quantity})`,
      status: 'pending',
      notification_type: 'return_item',
    });

    if (error) throw error;

    Toast.show({
      type: 'info',
      text1: '↩️  Thông báo trả lại',
      text2: `${itemName} x${quantity} - Khách trả lại`,
      visibilityTime: 2000,
    });

    return true;
  } catch (error: any) {
    console.error('Lỗi gửi thông báo trả lại:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Không thể gửi thông báo trả lại',
      visibilityTime: 2000,
    });
    return false;
  }
};

/**
 * Gửi nhiều thông báo cùng lúc
 * Dùng khi hoàn thành toàn bộ order hoặc báo hết nhiều món
 */
export const sendBulkNotifications = async (
  notifications: {
    orderId: string;
    tableName: string;
    itemName: string;
    type: NotificationType;
  }[]
): Promise<boolean> => {
  try {
    const payload = notifications.map((n) => ({
      order_id: n.orderId,
      table_name: n.tableName,
      item_name: n.itemName,
      status: 'pending',
      notification_type: n.type,
    }));

    const { error } = await supabase
      .from('return_notifications')
      .insert(payload);

    if (error) throw error;

    Toast.show({
      type: 'success',
      text1: `✓ Đã gửi ${notifications.length} thông báo`,
      visibilityTime: 2000,
    });

    return true;
  } catch (error: any) {
    console.error('Lỗi gửi bulk notifications:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Không thể gửi thông báo',
      visibilityTime: 2000,
    });
    return false;
  }
};

/**
 * Lấy danh sách thông báo pending cho một order
 */
export const getOrderNotifications = async (
  orderId: string
): Promise<ReturnNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('return_notifications')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Lỗi lấy thông báo:', error.message);
    return [];
  }
};

/**
 * Đếm thông báo pending cho một order
 */
export const getOrderNotificationCount = async (
  orderId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('return_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    if (error) throw error;

    return count || 0;
  } catch (error: any) {
    console.error('Lỗi đếm thông báo:', error.message);
    return 0;
  }
};

/**
 * Xác nhận (acknowledge) một thông báo
 */
export const acknowledgeNotification = async (
  notificationId: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('return_notifications')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Lỗi xác nhận thông báo:', error.message);
    return false;
  }
};

/**
 * Xóa một thông báo
 */
export const deleteNotification = async (
  notificationId: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('return_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Lỗi xóa thông báo:', error.message);
    return false;
  }
};

export default {
  sendItemReadyNotification,
  sendOutOfStockNotification,
  sendReturnItemNotification,
  sendBulkNotifications,
  getOrderNotifications,
  getOrderNotificationCount,
  acknowledgeNotification,
  deleteNotification,
  NOTIFICATION_TYPE_INFO,
};
