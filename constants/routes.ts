// constants/routes.ts

// 1. GIỮ NGUYÊN ĐỐI TƯỢNG ROUTES CỦA BẠN VÀ THÊM KEY MỚI
export const ROUTES = {
  // --- Các routes cũ của bạn ---
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  OTP: "Otp", 
  OTP_REGISTER: "OtpScreenR", 
  RESET_PASSWORD: "ResetPassword",
  RESET_SUCCESS: "ResetSuccess",

  // --- Thêm route mới cho màn hình chính ---
  HOME: "Home", 
} as const;


// 2. GIỮ NGUYÊN TYPE CHO AUTH STACK
// Nó vẫn sẽ dùng đối tượng ROUTES ở trên
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.OTP]: { email: string };
  [ROUTES.OTP_REGISTER]: { email: string };
  [ROUTES.RESET_PASSWORD]: { email: string };
  [ROUTES.RESET_SUCCESS]: undefined;
};


// 3. TẠO MỘT TYPE MỚI CHO APP STACK (CÁC MÀN HÌNH SAU KHI ĐĂNG NHẬP)
// Nó cũng sẽ dùng đối tượng ROUTES ở trên
export type AppStackParamList = {
  [ROUTES.HOME]: undefined;
  // Thêm các màn hình khác của App vào đây, ví dụ:
  // [ROUTES.PROFILE]: { userId: string };
};