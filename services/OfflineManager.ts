// src/services/OfflineManager.ts

import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase'; // Đảm bảo đường dẫn này đúng

// Khởi tạo một không gian lưu trữ riêng cho hàng đợi offline
const storage = new MMKV({ id: 'offline-actions-storage' });
const QUEUE_KEY = 'request-queue';

// Định nghĩa cấu trúc của một hành động trong hàng đợi
export interface OfflineAction {
  id: string; // ID duy nhất để theo dõi
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC'; // Loại hành động
  tableName: string; // Bảng trên Supabase
  payload: any; // Dữ liệu cần gửi đi
  timestamp: number; // Thời điểm hành động được tạo
  // Thêm một trường `where` để linh hoạt hơn cho UPDATE và DELETE
  where?: { column: string; value: any }; 
}

class OfflineManager {
  constructor() {
    // Ngay khi ứng dụng khởi động, lắng nghe trạng thái mạng.
    // Nếu có mạng trở lại, tự động xử lý hàng đợi.
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network is back online. Processing queue...');
        this.processQueue();
      }
    });
  }

  // Phương thức private để lấy hàng đợi từ MMKV
  private getQueue(): OfflineAction[] {
    const queueJson = storage.getString(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  }

  // Phương thức private để lưu hàng đợi vào MMKV
  private saveQueue(queue: OfflineAction[]): void {
    storage.set(QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Thêm một hành động mới vào hàng đợi offline.
   * Đây là phương thức mà các component sẽ gọi khi offline.
   */
  public addActionToQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
    const queue = this.getQueue();
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`, // Tạo ID đơn giản
      timestamp: Date.now(),
    };
    queue.push(newAction);
    this.saveQueue(queue);
    console.log('Action added to offline queue:', newAction);
  }

  /**
   * Xử lý và gửi các hành động trong hàng đợi lên Supabase.
   */
  public async processQueue(): Promise<void> {
    let queue = this.getQueue();
    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} actions from the queue...`);

    while (queue.length > 0) {
      const action = queue[0];
      try {
        let response: { error: any } | null = null;

        // Dựa vào `type` của action để gọi hàm Supabase tương ứng
        switch (action.type) {
          case 'INSERT':
            response = await supabase.from(action.tableName).insert(action.payload);
            break;

          case 'UPDATE':
            response = await supabase
              .from(action.tableName)
              .update(action.payload)
              .eq(action.where!.column, action.where!.value);
            break;

          case 'DELETE':
            // --- NÂNG CẤP LOGIC DELETE Ở ĐÂY ---
            const isDeletingMultiple = Array.isArray(action.where?.value);
            if (isDeletingMultiple) {
              // Nếu value là một mảng, dùng .in()
              response = await supabase
                .from(action.tableName)
                .delete()
                .in(action.where!.column, action.where!.value);
            } else {
              // Nếu không, dùng .eq() như cũ
              response = await supabase
                .from(action.tableName)
                .delete()
                .eq(action.where!.column, action.where!.value);
            }
            break;
            // --- KẾT THÚC NÂNG CẤP ---

          case 'RPC':
            response = await supabase.rpc(action.tableName, action.payload);
            break;
        }

        if (response?.error) {
          throw response.error;
        }
        
        console.log(`Action ${action.id} processed successfully.`);
        queue.shift(); 
        this.saveQueue(queue);

      } catch (error) {
        console.error(`Failed to process action ${action.id}. Queue processing paused.`, error);
        return; 
      }
    }
    console.log('Offline queue processed completely.');
  }
}

// Tạo một instance duy nhất (singleton) để toàn bộ ứng dụng sử dụng chung
export const offlineManager = new OfflineManager();