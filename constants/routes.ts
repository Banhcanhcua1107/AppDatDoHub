import { CartItem } from '../screens/Menu/MenuScreen'; 
// constants/routes.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// 1. THÊM TÊN CÁC ROUTE MỚI
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
  ORDER_CONFIRMATION: "OrderConfirmation", // <-- THÊM ROUTE MỚI

  // --- Bottom Tab routes ---
  HOME_TAB: "Sơ đồ", // Tên route cho tab Home
  RETURN_ITEMS_TAB: "Trả món",
  PROVISIONAL_BILL_TAB: "Tạm tính",
  UTILITIES_TAB: "Tiện ích",
  
  // --- Navigator routes ---
  APP_TABS: "AppTabs", // Tên route cho cả BottomTabNavigator

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

// 3. TẠO TYPE MỚI CHO BOTTOM TABS
export type AppTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.RETURN_ITEMS_TAB]: { screenName: string };
  [ROUTES.PROVISIONAL_BILL_TAB]: { screenName: string };
  [ROUTES.UTILITIES_TAB]: { screenName: string };
};

// Import CartItem từ MenuScreen (giả sử bạn đã export nó)

// 4. CẬP NHẬT APP STACK PARAM LIST
export type AppStackParamList = {
  [ROUTES.APP_TABS]: NavigatorScreenParams<AppTabParamList>;
  [ROUTES.MENU]: { tableId: string; tableName: string; }; 
  // THÊM TYPE CHO MÀN HÌNH MỚI
  [ROUTES.ORDER_CONFIRMATION]: { 
    tableId: string; 
    tableName: string; 
    items: CartItem[]; 
  };
};