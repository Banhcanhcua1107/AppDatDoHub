// src/context/NotificationContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { playNotificationSound } from '../utils/soundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextType {
  lastNotificationTime?: number;
}

const NotificationContext = createContext<NotificationContextType>({});

export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Provider này sẽ bao bọc toàn bộ ứng dụng của bạn
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // [CẬP NHẬT] Sử dụng useRef thay vì useState để lưu thời gian mà không re-render
  const lastNotificationTimeRef = React.useRef<number>(0);
  // [MỚI] Sử dụng useRef để lưu user role (không re-render, persistent)
  const userRoleRef = React.useRef<string>('');

  useEffect(() => {
    console.log('[NotificationContext] Khởi tạo bộ lắng nghe thông báo toàn cầu...');
    
    // [FIX] Lấy role user hiện tại (async, chạy từng lần)
    const initializeUserRole = async () => {
      try {
        const profileJson = await AsyncStorage.getItem('user_profile');
        if (profileJson) {
          const profile = JSON.parse(profileJson);
          userRoleRef.current = profile.role;
          console.log(`[NotificationContext] User role: ${userRoleRef.current}`);
        }
      } catch (e) {
        console.error('[NotificationContext] Lỗi lấy user role:', e);
      }
    };
    
    // [FIX] Chạy sync trước rồi mới setup channels
    initializeUserRole();

    const triggerNotificationSound = () => {
      // Debounce: chỉ phát âm thanh nếu khoảng cách từ lần trước > 1.5 giây
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTimeRef.current;
      
      if (timeSinceLastNotification > 1500) {
        console.log('[NotificationContext] 🔔 Phát âm thanh thông báo...', `(${timeSinceLastNotification}ms kể từ lần trước)`);
        playNotificationSound();
        lastNotificationTimeRef.current = now;
      } else {
        console.log(`[NotificationContext] ⏸️ Bỏ qua âm thanh (chỉ ${timeSinceLastNotification}ms kể từ lần trước)`);
      }
    };

    // --- BỘ LẮNG NGHE CHO NHÂN VIÊN ---
    // Lắng nghe các thông báo MỚI (INSERT) từ return_notifications
    // [MỚI] Chỉ phát âm thanh nếu user là 'staff' (nhan_vien)
    // Các notification này gửi từ bếp: item_ready, out_of_stock, cancellation_*, return_item (từ bếp yêu cầu trả)
    const staffChannel = supabase
      .channel('global-staff-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT',
          schema: 'public', 
          table: 'return_notifications',
        },
        (payload) => {
          // [FIX] Chỉ phát âm thanh nếu user là nhân viên (staff)
          const notificationType = payload.new.notification_type;
          if (userRoleRef.current === 'nhan_vien' || userRoleRef.current === 'staff') {
            // Nhân viên chỉ nghe khi:
            // - item_ready, out_of_stock, cancellation_approved, cancellation_rejected từ bếp
            // - KHÔNG nghe return_item (return_item là nhân viên gửi cho bếp)
            if (notificationType !== 'return_item') {
              console.log('[NotificationContext] Nhân viên nhận thông báo từ bếp:', payload.new);
              triggerNotificationSound();
            } else {
              console.log('[NotificationContext] ⏭️ Nhân viên bỏ qua (return_item là của bếp)');
            }
          } else {
            console.log(`[NotificationContext] ⏭️ Bỏ qua (user role: ${userRoleRef.current}, không phải staff)`);
          }
        }
      )
      .subscribe();

    // --- BỘ LẮNG NGHE CHO BẾP ---
    // Lắng nghe các yêu cầu hủy/trả món MỚI (INSERT) từ nhân viên
    // [MỚI] Chỉ phát âm thanh nếu user là 'bep'
    // Cũng lắng nghe return_notifications với notification_type='return_item' (nhân viên yêu cầu trả)
    const kitchenChannel = supabase
      .channel('global-kitchen-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cancellation_requests'
        },
        (payload) => {
          // [FIX] Chỉ phát âm thanh nếu user là bếp
          if (userRoleRef.current === 'bep') {
            console.log('[NotificationContext] Bếp nhận yêu cầu hủy/trả mới:', payload.new);
            triggerNotificationSound();
          } else {
            console.log(`[NotificationContext] ⏭️ Bỏ qua (user role: ${userRoleRef.current}, không phải bep)`);
          }
        }
      )
      .subscribe();
    
    // [MỚI] Channel riêng cho return_item notification (nhân viên yêu cầu trả)
    const returnItemChannel = supabase
      .channel('global-return-item-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'return_notifications',
          filter: "notification_type=eq.return_item"
        },
        (payload) => {
          // [FIX] Chỉ phát âm thanh nếu user là bếp
          if (userRoleRef.current === 'bep') {
            console.log('[NotificationContext] Bếp nhận yêu cầu trả từ nhân viên:', payload.new);
            triggerNotificationSound();
          } else {
            console.log(`[NotificationContext] ⏭️ Bỏ qua (user role: ${userRoleRef.current}, không phải bep)`);
          }
        }
      )
      .subscribe();

    // --- BỘ LẮNG NGHE CHO NHÂN VIÊN: MENU_ITEMS (HẾT HÀNG) ---
    // Lắng nghe khi bếp báo hết một món
    const menuItemsChannel = supabase
      .channel('global-menu-items-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items',
          filter: 'is_available=eq.false'
        },
        (payload) => {
          console.log('[NotificationContext] Báo hết hàng:', payload.new);
          triggerNotificationSound();
        }
      )
      .subscribe();

    // --- BỘ LẮNG NGHE CHO BẾP: RETURN_SLIPS (NHÂN VIÊN TRẢ MÓN) ---
    // Lắng nghe khi nhân viên tạo phiếu trả hàng (return_slip)
    const returnSlipsChannel = supabase
      .channel('global-return-slips')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'return_slips'
        },
        (payload) => {
          console.log('[NotificationContext] Nhân viên tạo yêu cầu trả hàng:', payload.new);
          triggerNotificationSound();
        }
      )
      .subscribe();

    // Dọn dẹp khi component unmount
    return () => {
      console.log('[NotificationContext] Dừng bộ lắng nghe thông báo...');
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(kitchenChannel);
      supabase.removeChannel(returnItemChannel);
      supabase.removeChannel(menuItemsChannel);
      supabase.removeChannel(returnSlipsChannel);
    };
  }, []); // Mảng rỗng vì không có dependencies

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};