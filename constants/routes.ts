export const ROUTES = {
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  OTP: "Otp",
  RESET_PASSWORD: "ResetPassword",
  RESET_SUCCESS: "ResetSuccess",
} as const;

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.OTP]: { email: string };
  [ROUTES.RESET_PASSWORD]: { email: string };
  [ROUTES.RESET_SUCCESS]: undefined;
};
