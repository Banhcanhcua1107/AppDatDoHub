// src/context/NotificationContext.tsx

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { playNotificationSound } from '../utils/soundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context không cần truyền giá trị ra ngoài, chỉ dùng để chạy bộ lắng nghe
const NotificationContext = createContext({});

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const lastNotificationTimeRef = useRef<number>(0);
  const userRoleRef = useRef<string>('');

  useEffect(() => {
    console.log('[NotificationContext] Bắt đầu quá trình thiết lập lắng nghe...');
    
    // Hàm lấy và lưu vai trò người dùng từ AsyncStorage
    const initializeUserRole = async () => {
      try {
        const profileJson = await AsyncStorage.getItem('user_profile');
        if (profileJson) {
          const profile = JSON.parse(profileJson);
          userRoleRef.current = profile.role;
          console.log(`[NotificationContext] Vai trò người dùng đã được xác định: ${userRoleRef.current}`);
        } else {
          console.log('[NotificationContext] Không tìm thấy thông tin người dùng.');
        }
      } catch (e) {
        console.error('[NotificationContext] Lỗi khi lấy vai trò người dùng:', e);
      }
    };

    // Hàm kích hoạt âm thanh, có cơ chế debounce để tránh spam
    const triggerNotificationSound = () => {
      const now = Date.now();
      const timeSinceLast = now - lastNotificationTimeRef.current;
      
      if (timeSinceLast > 1500) {
        console.log('[NotificationContext] 🔔 Phát âm thanh thông báo...');
        playNotificationSound();
        lastNotificationTimeRef.current = now;
      } else {
        console.log(`[NotificationContext] ⏸️ Bỏ qua âm thanh (quá gần lần trước: ${timeSinceLast}ms)`);
      }
    };

    // [SỬA LỖI] Hàm async để đảm bảo vai trò được lấy XONG RỒI MỚI thiết lập kênh
    const setupChannels = async () => {
      // Bước 1: Chờ cho đến khi vai trò người dùng được xác định
      await initializeUserRole();

      // Nếu không có vai trò, không thiết lập kênh nào cả
      if (!userRoleRef.current) {
        console.warn('[NotificationContext] Không có vai trò người dùng, không thể thiết lập kênh.');
        return () => {}; // Trả về hàm dọn dẹp rỗng
      }

      console.log(`[NotificationContext] Thiết lập kênh cho vai trò: ${userRoleRef.current}`);

      // --- KÊNH 1: LẮNG NGHE BẢNG "return_notifications" ---
      // Bảng này chứa thông báo từ Bếp -> Nhân viên (món xong, hết món, duyệt/từ chối hủy)
      // VÀ thông báo từ Nhân viên -> Bếp (yêu cầu trả món)
      const returnNotificationsChannel = supabase
        .channel('global-return-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_notifications' },
          (payload) => {
            const notificationType = payload.new.notification_type;
            
            // [QUAN TRỌNG] Logic cho NHÂN VIÊN
            if (userRoleRef.current === 'nhan_vien' || userRoleRef.current === 'staff') {
              // Nhân viên chỉ nghe thông báo từ bếp, không nghe thông báo do chính mình tạo ('return_item')
              if (notificationType !== 'return_item') {
                console.log('[NotificationContext] Nhân viên nhận thông báo từ bếp:', notificationType);
                triggerNotificationSound();
              }
            }
            
            // [QUAN TRỌNG] Logic cho BẾP
            if (userRoleRef.current === 'bep') {
              // Bếp chỉ nghe thông báo 'return_item' (khi nhân viên yêu cầu trả món)
              if (notificationType === 'return_item') {
                 console.log('[NotificationContext] Bếp nhận yêu cầu trả món từ nhân viên.');
                 triggerNotificationSound();
              }
            }
          }
        )
        .subscribe();
        
      // --- KÊNH 2: LẮNG NGHE BẢNG "cancellation_requests" ---
      // Bảng này chỉ chứa yêu cầu hủy/trả từ Nhân viên -> Bếp
      const cancellationRequestsChannel = supabase
        .channel('global-cancellation-requests')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cancellation_requests' },
          (payload) => {
            // [QUAN TRỌNG] Chỉ BẾP mới nghe âm thanh từ kênh này
            if (userRoleRef.current === 'bep') {
              console.log('[NotificationContext] Bếp nhận yêu cầu hủy món mới.');
              triggerNotificationSound();
            }
          }
        )
        .subscribe();
      
      // --- KÊNH 3: LẮNG NGHE BẢNG "menu_items" (Bếp báo hết món) ---
      const menuItemsChannel = supabase
        .channel('global-menu-items-changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items', filter: 'is_available=eq.false' },
          (payload) => {
            // [SỬA LỖI] Chỉ NHÂN VIÊN mới nghe khi có món hết hàng
            if (userRoleRef.current === 'nhan_vien' || userRoleRef.current === 'staff') {
              console.log('[NotificationContext] Nhân viên nhận thông báo hết món.');
              triggerNotificationSound();
            }
          }
        )
        .subscribe();

      // Trả về hàm dọn dẹp để useEffect có thể gọi khi unmount
      return () => {
        console.log('[NotificationContext] Dừng các bộ lắng nghe thông báo...');
        supabase.removeChannel(returnNotificationsChannel);
        supabase.removeChannel(cancellationRequestsChannel);
        supabase.removeChannel(menuItemsChannel);
      };
    };

    // Gọi hàm thiết lập và lưu lại hàm dọn dẹp của nó
    const cleanupPromise = setupChannels();

    // useEffect sẽ gọi hàm này khi component bị hủy
    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) {
          cleanup();
        }
      });
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần duy nhất

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};