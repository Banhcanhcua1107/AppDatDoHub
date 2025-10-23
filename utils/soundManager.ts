// src/utils/soundManager.ts

import { Vibration } from 'react-native';
import { Audio } from 'expo-av';

// Biến toàn cục để lưu trữ đối tượng âm thanh đã được load
// Giúp chúng ta không cần load lại file mỗi lần phát
let sound: Audio.Sound | null = null;

/**
 * Khởi tạo và cấu hình Audio Mode cho toàn bộ ứng dụng.
 * Rất quan trọng: Phải gọi hàm này một lần khi ứng dụng khởi động (ví dụ trong App.tsx).
 * Giúp âm thanh có thể phát ngay cả khi điện thoại ở chế độ im lặng (iOS).
 */
export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Quan trọng nhất cho thông báo
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });
    console.log('[SoundManager] Audio mode đã được khởi tạo.');
  } catch (error) {
    console.error('[SoundManager] Lỗi khi khởi tạo audio mode:', error);
  }
};

/**
 * Phát rung theo một mẫu đơn giản (ting-ting).
 */
export const playVibration = () => {
  // Pattern: [delay, rung, delay, rung]
  Vibration.vibrate([0, 100, 100, 100]);
};

/**
 * Phát âm thanh thông báo và rung.
 * - Lần đầu tiên gọi: Sẽ load file âm thanh và phát.
 * - Những lần gọi sau: Sẽ phát lại ngay lập tức mà không cần load lại.
 */
export const playNotificationSound = async () => {
  // 1. Luôn phát rung để có phản hồi tức thì
  playVibration();

  try {
    // 2. Nếu âm thanh đã được load, chỉ cần phát lại
    if (sound) {
      await sound.replayAsync();
      return;
    }

    // 3. Nếu chưa load (lần đầu tiên), thì tạo và load âm thanh
    console.log('[SoundManager] Đang load file âm thanh lần đầu...');
    const { sound: newSound } = await Audio.Sound.createAsync(
       require('../assets/sounds/notification.mp3') // <-- Đảm bảo đường dẫn này chính xác
    );
    sound = newSound; // Lưu lại để dùng cho những lần sau
    await sound.playAsync();
    console.log('[SoundManager] Âm thanh đã được phát.');

  } catch (error) {
    console.error('[SoundManager] Không thể phát âm thanh:', error);
    // Nếu lỗi, người dùng vẫn nhận được thông báo rung
  }
};

/**
 * Giải phóng tài nguyên âm thanh khỏi bộ nhớ.
 * Nên gọi hàm này khi người dùng đăng xuất hoặc ứng dụng tắt.
 */
export const unloadSound = async () => {
  if (sound) {
    console.log('[SoundManager] Đang giải phóng tài nguyên âm thanh.');
    await sound.unloadAsync();
    sound = null;
  }
};