// src/context/NotificationContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { playNotificationSound } from '../utils/soundManager';

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

  useEffect(() => {
    console.log('[NotificationContext] Khởi tạo bộ lắng nghe thông báo toàn cầu...');

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
    // Lắng nghe các thông báo MỚI (INSERT) từ bếp gửi cho nhân viên
    const staffChannel = supabase
      .channel('global-staff-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', // Chỉ quan tâm đến thông báo MỚI
          schema: 'public', 
          table: 'return_notifications',
        },
        (payload) => {
          console.log('[NotificationContext] Nhân viên nhận thông báo mới:', payload.new);
          triggerNotificationSound();
        }
      )
      .subscribe();

    // --- BỘ LẮNG NGHE CHO BẾP ---
    // Lắng nghe các yêu cầu hủy/trả món MỚI (INSERT) từ nhân viên
    const kitchenChannel = supabase
      .channel('global-kitchen-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Chỉ quan tâm yêu cầu MỚI
          schema: 'public',
          table: 'cancellation_requests'
        },
        (payload) => {
          console.log('[NotificationContext] Bếp nhận yêu cầu hủy/trả mới:', payload.new);
          triggerNotificationSound();
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