// constants/routes.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { CartItem } from '../screens/Menu/MenuScreen'; // Đảm bảo đường dẫn này đúng

// 1. THÊM TÊN ROUTE CHO TAB MỚI
export const ROUTES = {
  // --- Auth routes ---
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  OTP: "Otp",
  OTP_REGISTER: "OtpScreenR",
  RESET_PASSWORD: "ResetPassword",
  RESET_SUCCESS: "ResetSuccess",

  // --- App routes ---
  HOME: "Home",
  MENU: "Menu",
  ORDER_CONFIRMATION: "OrderConfirmation",

  // --- Bottom Tab routes ---
  HOME_TAB: "Sơ đồ",
  ORDER_TAB: "Order", // <-- [THÊM MỚI] Route cho tab Order
  RETURN_ITEMS_TAB: "Trả món",
  PROVISIONAL_BILL_TAB: "Tạm tính",
  UTILITIES_TAB: "Tiện ích",

  // --- Navigator routes ---
  APP_TABS: "AppTabs",

} as const;

// 2. GIỮ NGUYÊN TYPE CHO AUTH STACK
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.OTP]: { email: string };
  [ROUTES.OTP_REGISTER]: { email: string };
  [ROUTES.RESET_PASSWORD]: { email: string };
  [ROUTES.RESET_SUCCESS]: undefined;
};

// 3. CẬP NHẬT TYPE CHO BOTTOM TABS
export type AppTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.ORDER_TAB]: undefined; // <-- [THÊM MỚI] Type cho tab Order
  [ROUTES.RETURN_ITEMS_TAB]: undefined; // <-- [THAY ĐỔI] Không cần params
  [ROUTES.PROVISIONAL_BILL_TAB]: undefined; // <-- [THAY ĐỔI] Không cần params
  [ROUTES.UTILITIES_TAB]: { screenName: string }; // Giữ lại vì vẫn dùng PlaceholderScreen
};

// 4. CẬP NHẬT APP STACK PARAM LIST
export type AppStackParamList = {
  [ROUTES.APP_TABS]: NavigatorScreenParams<AppTabParamList>;
  [ROUTES.MENU]: { tableId: string; tableName: string; };
  [ROUTES.ORDER_CONFIRMATION]: {
    tableId: string;
    tableName: string;
    items: CartItem[];
  };
};