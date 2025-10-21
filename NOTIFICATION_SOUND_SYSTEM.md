/**
 * NOTIFICATION SOUND SYSTEM DOCUMENTATION
 * ======================================
 * 
 * Hệ thống phát âm thanh thông báo trong ứng dụng
 * 
 * ✨ TÍNH NĂNG
 * -----------
 * - Phát âm thanh "ting ting" khi có thông báo mới
 * - Kết hợp với rung (vibration) để nhận biết rõ hơn
 * - Hoạt động ngay cả khi app ở chế độ im lặng (iOS)
 * - Hoạt động ở background (app chạy nền)
 * 
 * 📂 CẤU TRÚC FILE
 * ----------------
 * utils/soundManager.ts
 *   ├─ initializeAudio() - Khởi tạo audio system
 *   ├─ playNotificationSound() - Phát âm thanh thông báo
 *   ├─ playSystemBeep() - Phát 2 tiếng beep (fallback)
 *   └─ stopNotificationSound() - Dừng phát âm thanh
 * 
 * screens/Orders/OrderScreen.tsx
 *   └─ Realtime subscription payload handler
 *      → Phát âm thanh khi nhận notification (event: INSERT, UPDATE, DELETE)
 * 
 * screens/Orders/ReturnNotificationScreen.tsx
 *   └─ fetchNotifications() callback
 *      → Phát âm thanh khi có notification mới
 * 
 * assets/sounds/
 *   ├─ notification.mp3 (chính) - âm thanh thích hợp
 *   └─ beep.mp3 (fallback) - tiếng beep đơn giản
 * 
 * 🎯 QUI TRÌNH HOẠT ĐỘNG
 * ----------------------
 * 
 * Khi có thông báo mới:
 * 
 * 1. Database insert/update → Supabase realtime event
 * 2. OrderScreen subscription nhận event
 * 3. playNotificationSound() được gọi
 * 4. Audio system khởi tạo (nếu cần)
 * 5. Thử load notification.mp3 từ assets
 *    ✓ Nếu thành công → Phát âm thanh
 *    ✗ Nếu thất bại → Dùng fallback playSystemBeep()
 * 6. Đồng thời Vibration.vibrate() phát rung
 * 7. fetchNotifications() update badge counter
 * 
 * 📱 HÀNH VI TRÊN CÁC NỀN TẢNG
 * ---------------------------
 * 
 * iOS:
 *   ✓ Phát âm thanh ngay cả khi ở chế độ im lặng
 *   ✓ Rung khi màn hình tắt
 *   ✓ Hoạt động ở background
 * 
 * Android:
 *   ✓ Phát âm thanh với âm lượng ứng dụng
 *   ✓ Giảm âm lượng app khác khi phát thông báo
 *   ✓ Rung liên tục
 * 
 * 🔊 CHẤT LƯỢNG ÂM THANH
 * ----------------------
 * 
 * Audio Mode Settings:
 *   - playsInSilentModeIOS: true
 *     → Phát ngay cả khi iPhone ở Silent mode
 *   
 *   - staysActiveInBackground: true
 *     → Tiếp tục phát khi app chạy ở background
 *   
 *   - shouldDuckAndroid: true
 *     → Giảm âm lượng app khác tạm thời
 * 
 * 💾 MEMORY MANAGEMENT
 * --------------------
 * 
 * - Unload sound sau khi phát xong
 * - Cleanup old sounds trước khi phát sound mới
 * - Tránh memory leak
 * - Auto cleanup nếu có lỗi
 * 
 * ⚙️ THIẾT LẬP FILE ÂM THANH
 * --------------------------
 * 
 * Cần tạo 2 file trong assets/sounds/:
 * 
 * 1. notification.mp3
 *    - Âm thanh chính cho thông báo
 *    - Ví dụ: 2 tiếng beep ngắn (ting ting) hoặc tiếng báo động nhẹ
 *    - Thời lượng: 200-300ms
 *    - Format: MP3, 44.1kHz, Mono
 * 
 * 2. beep.mp3
 *    - Tiếng beep đơn giản dùng khi notification.mp3 không có
 *    - 1 tiếng beep ngắn
 *    - Thời lượng: 100ms
 *    - Format: MP3, 44.1kHz, Mono
 * 
 * Nếu không có file, hệ thống sẽ:
 *   1. Thử phát notification.mp3 → Thất bại
 *   2. Thử phát beep.mp3 x2 → Thất bại
 *   3. Fallback: Chỉ phát rung (vibration)
 * 
 * 🧪 DEBUGGING
 * -----------
 * 
 * Console logs:
 * 
 * [SoundManager] Audio mode initialized
 *   → Audio system được khởi tạo thành công
 * 
 * [SoundManager] No notification.mp3 found, using system tone
 *   → Không tìm thấy file, dùng beep fallback
 * 
 * [SoundManager] Notification sound played
 *   → Âm thanh được phát thành công
 * 
 * [OrderScreen] Notification received for order ...
 *   → Thông báo nhận được từ realtime
 * 
 * [OrderScreen] Error playing sound: ...
 *   → Lỗi phát âm thanh (vẫn phát rung)
 * 
 * 🆘 TROUBLESHOOTING
 * ------------------
 * 
 * ❌ Không nghe thấy âm thanh:
 *    ① Kiểm tra âm lượng điện thoại
 *    ② Kiểm tra âm lượng ứng dụng trong cài đặt
 *    ③ Kiểm tra iOS Silent mode (nên BẬT isAudioModeIOS: true)
 *    ④ Kiểm tra file notification.mp3 tồn tại
 * 
 * ❌ Âm thanh phát 2 lần:
 *    - Bình thường nếu có cả notification.mp3 và beep.mp3
 *    - Đây là thiết kế: fallback thành 2 tiếng beep
 * 
 * ❌ Crash khi phát âm thanh:
 *    ① Kiểm tra file path đúng
 *    ② Verify file format (MP3, WAV, M4A)
 *    ③ Kiểm tra dung lượng file (< 100KB)
 * 
 * 📚 API REFERENCE
 * ----------------
 * 
 * playNotificationSound()
 *   - Phát âm thanh thông báo
 *   - Gọi: await playNotificationSound()
 *   - Được gọi tự động trong OrderScreen realtime subscription
 * 
 * playSystemBeep()
 *   - Phát 2 tiếng beep (fallback)
 *   - Gọi: await playSystemBeep()
 * 
 * initializeAudio()
 *   - Khởi tạo audio system
 *   - Tự động gọi khi playNotificationSound() được gọi lần đầu
 * 
 * stopNotificationSound()
 *   - Dừng phát âm thanh (nếu cần)
 *   - Gọi: await stopNotificationSound()
 * 
 * ✅ INTEGRATION CHECKLIST
 * -------------------------
 * ✓ expo-av installed (npm install expo-av)
 * ✓ soundManager.ts created in utils/
 * ✓ OrderScreen.tsx updated with realtime sound
 * ✓ ReturnNotificationScreen.tsx updated with sound + vibration
 * ✓ Import statements added
 * ✓ No TypeScript errors
 * ✓ Audio files needed (notification.mp3, beep.mp3)
 * 
 * 🎉 HOẠT ĐỘNG CUỐI CÙNG
 * ----------------------
 * Người dùng sẽ nghe thấy:
 * - "Ting ting" khi có thông báo mới từ bếp
 * - Kèm theo rung liên tục (3 cái)
 * - Dù app đang chạy nền hoặc ở chế độ im lặng
 */
