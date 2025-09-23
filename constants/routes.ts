// constants/routes.ts

export const ROUTES = {
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  OTP: "Otp", // Dành cho Quên Mật Khẩu
  OTP_REGISTER: "OtpScreenR", // Dành cho Đăng Ký
  RESET_PASSWORD: "ResetPassword",
  RESET_SUCCESS: "ResetSuccess",
} as const;

// Bản thiết kế cho toàn bộ Auth Navigator.
// Export nó ra để tất cả các màn hình có thể sử dụng.
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.OTP]: { email: string };
  [ROUTES.OTP_REGISTER]: { email: string };
  [ROUTES.RESET_PASSWORD]: { email: string };
  [ROUTES.RESET_SUCCESS]: undefined;
};