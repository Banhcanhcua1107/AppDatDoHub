// src/context/NotificationContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { playNotificationSound } from '../utils/soundManager';

const NotificationContext = createContext({});

export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Provider này sẽ bao bọc toàn bộ ứng dụng của bạn
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
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
          console.log('[Global] Nhân viên nhận thông báo mới:', payload.new);
          playNotificationSound();
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
          console.log('[Global] Bếp nhận yêu cầu hủy mới:', payload.new);
          playNotificationSound(); // Bếp cũng nghe được âm thanh này
        }
      )
      .subscribe();


    // Dọn dẹp khi component unmount
    return () => {
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(kitchenChannel);
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần duy nhất

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};