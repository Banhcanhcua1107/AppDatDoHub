/**
 * Sound Manager - Quản lý âm thanh thông báo
 * Phát rung và âm thanh khi có thông báo mới
 */

import { Vibration } from 'react-native';

let soundObject: any = null;

/**
 * Khởi tạo Audio API
 */
export const initializeAudio = async () => {
  try {
    console.log('[SoundManager] Audio mode initialized');
  } catch (error) {
    console.error('[SoundManager] Error initializing audio mode:', error);
  }
};

/**
 * Phát âm thanh thông báo
 * Sử dụng rung + nếu có expo-av thì dùng file âm thanh
 */
export const playNotificationSound = async () => {
  try {
    // Phát rung trước (cách đơn giản và có sẵn)
    playVibration();

    // Thử load expo-av nếu có sẵn
    try {
      const { Audio } = await import('expo-av');
      
      if (!soundObject) {
        soundObject = new Audio.Sound();
        try {
          // Thử load file notification.mp3
          await soundObject.loadAsync(require('../assets/sounds/notification.mp3'));
          await soundObject.playAsync();
          console.log('[SoundManager] Notification sound played');
        } catch {
          console.log('[SoundManager] Audio file not available, vibration only');
          soundObject = null;
        }
      }
    } catch {
      // expo-av không có sẵn, chỉ dùng rung
      console.log('[SoundManager] expo-av not available, using vibration only');
    }
  } catch (error) {
    console.error('[SoundManager] Error playing sound:', error);
    // Fallback: chỉ dùng rung
    playVibration();
  }
};

/**
 * Phát rung (ting ting - 2 lần rung ngắn)
 * Hoạt động trên cả iOS và Android
 */
export const playVibration = () => {
  try {
    // Pattern: [delay, vibrate, delay, vibrate]
    // Tạo 2 tiếng rung ngắn (ting ting): 100ms + 100ms delay + 100ms
    const vibrationPattern = [0, 100, 100, 100];
    Vibration.vibrate(vibrationPattern, false);
    console.log('[SoundManager] Vibration triggered');
  } catch (error) {
    console.error('[SoundManager] Error triggering vibration:', error);
  }
};

/**
 * Stop playing sound
 */
export const stopNotificationSound = async () => {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }
    Vibration.cancel();
  } catch (error) {
    console.error('[SoundManager] Error stopping sound:', error);
  }
};

export default {
  initializeAudio,
  playNotificationSound,
  playVibration,
  stopNotificationSound,
};
