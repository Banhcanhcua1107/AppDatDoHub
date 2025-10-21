/**
 * Sound Manager - Quản lý âm thanh thông báo
 * Phát âm thanh khi có thông báo mới
 */

import { Audio } from 'expo-av';

let soundObject: Audio.Sound | null = null;

/**
 * Khởi tạo Audio API
 */
export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Phát ngay cả khi ở chế độ im lặng (iPhone)
      staysActiveInBackground: true, // Tiếp tục phát khi app ở background
      shouldDuckAndroid: true, // Giảm âm lượng app khác khi phát thông báo (Android)
    });
    console.log('[SoundManager] Audio mode initialized');
  } catch (error) {
    console.error('[SoundManager] Error initializing audio mode:', error);
  }
};

/**
 * Phát âm thanh thông báo
 * Sử dụng beep sound built-in
 */
export const playNotificationSound = async () => {
  try {
    // Nếu chưa khởi tạo Audio, khởi tạo ngay
    if (!soundObject) {
      await initializeAudio();
    }

    // Unload sound cũ nếu có
    if (soundObject) {
      try {
        await soundObject.unloadAsync();
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.log('[SoundManager] Cleanup error:', cleanupError);
      }
      soundObject = null;
    }

    // Tạo Sound object từ file âm thanh
    // Nếu có file notification.mp3 thì dùng nó, không thì dùng beep tạo từ Audio API
    soundObject = new Audio.Sound();

    // Thử load file từ assets trước
    try {
      await soundObject.loadAsync(require('../assets/sounds/notification.mp3'));
    } catch (error) {
      // Nếu không có file, tạo beep sound từ Audio API
      console.log('[SoundManager] No notification.mp3 found, using system tone', error);
      // Unload và tạo lại
      await soundObject.unloadAsync();
      
      // Sử dụng API để phát tiếng beep đơn giản
      // Tạo 2 tiếng beep ngắn (ting ting)
      await playSystemBeep();
      return;
    }

    // Play sound
    await soundObject.playAsync();
    console.log('[SoundManager] Notification sound played');
  } catch (error) {
    console.error('[SoundManager] Error playing sound:', error);
    // Fallback: thử phát beep system
    try {
      await playSystemBeep();
    } catch (fallbackError) {
      console.error('[SoundManager] Error playing system beep:', fallbackError);
    }
  }
};

/**
 * Phát tiếng beep system (2 lần ngắn)
 * Dùng khi không có file âm thanh
 */
export const playSystemBeep = async () => {
  try {
    // Tạo 2 tiếng beep ngắn liên tiếp
    const { sound: sound1 } = await Audio.Sound.createAsync(
      require('../assets/sounds/beep.mp3')
    );
    
    await sound1.playAsync();
    
    // Wait 150ms rồi phát tiếng thứ 2
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const { sound: sound2 } = await Audio.Sound.createAsync(
      require('../assets/sounds/beep.mp3')
    );
    await sound2.playAsync();

    // Cleanup
    setTimeout(() => {
      sound1.unloadAsync();
      sound2.unloadAsync();
    }, 300);
  } catch (error) {
    console.error('[SoundManager] Error playing system beep:', error);
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
  } catch (error) {
    console.error('[SoundManager] Error stopping sound:', error);
  }
};

export default {
  initializeAudio,
  playNotificationSound,
  playSystemBeep,
  stopNotificationSound,
};
