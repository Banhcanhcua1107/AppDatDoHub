// constants/routes.ts

import { NavigatorScreenParams } from '@react-navigation/native';
// Đảm bảo đường dẫn này chính xác tới file TableSelectionScreen.tsx của bạn
import { TableSelectionParams } from '../screens/Menu/TableSelectionScreen';
import { ProvisionalOrder, BillItem } from '../screens/Orders/ProvisionalBillScreen';
export const ROUTES = {
  // --- Auth routes ---
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  OTP: 'Otp',
  OTP_REGISTER: 'OtpScreenR',
  RESET_PASSWORD: 'ResetPassword',
  RESET_SUCCESS: 'ResetSuccess',

  // --- App routes ---
  HOME: 'Home',
  MENU: 'Menu',
  ORDER_CONFIRMATION: 'OrderConfirmation',
  TABLE_SELECTION: 'TableSelection', // <-- [ĐÃ THÊM]
  RETURN_SELECTION: 'ReturnSelection',
  // --- Bottom Tab routes ---
  HOME_TAB: 'Sơ đồ',
  ORDER_TAB: 'Order',
  RETURN_ITEMS_TAB: 'Trả món',
  PROVISIONAL_BILL_TAB: 'Tạm tính',
  UTILITIES_TAB: 'Tiện ích',

  // --- Navigator routes ---
  APP_TABS: 'AppTabs',

  SPLIT_ORDER: 'SplitOrder',

  SERVE_STATUS: 'ServeStatus',
  RETURNED_ITEMS_DETAIL: 'ReturnedItemsDetail',
  PROVISIONAL_BILL: 'ProvisionalBill',
  PRINT_PREVIEW: 'PrintPreview',
} as const;

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.OTP]: { email: string };
  [ROUTES.OTP_REGISTER]: { email: string };
  [ROUTES.RESET_PASSWORD]: { email: string };
  [ROUTES.RESET_SUCCESS]: undefined;
};

export type AppTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.ORDER_TAB]: undefined;
  [ROUTES.RETURN_ITEMS_TAB]: undefined;
  [ROUTES.PROVISIONAL_BILL_TAB]: undefined;
  [ROUTES.UTILITIES_TAB]: { screenName: string };
};

export type AppStackParamList = {
  [ROUTES.APP_TABS]: NavigatorScreenParams<AppTabParamList>;
  [ROUTES.MENU]: { tableId: string; tableName: string; orderId?: string };
  [ROUTES.ORDER_CONFIRMATION]: {
    tableId: string;
    tableName: string;
    orderId?: string;
  };
  // <-- [ĐÃ THÊM] Đăng ký màn hình chọn bàn và các tham số của nó
  [ROUTES.TABLE_SELECTION]: TableSelectionParams;

  [ROUTES.SPLIT_ORDER]: {
    sourceOrderId: string;
    sourceTableNames: string;
    targetTable: { id: string; name: string };
  };

  ReturnSelection: {
    orderId: string;
    items: {
      id: number;
      name: string;
      quantity: number;
      unit_price: number;
      image_url: string | null;
    }[];
    source?: string;
  };
  [ROUTES.SERVE_STATUS]: { orderId: string; tableName: string };
  ReturnedItemsDetail: { orderId: string };

  [ROUTES.PROVISIONAL_BILL]: undefined; // Màn hình này không cần tham số khi điều hướng đến
  [ROUTES.PRINT_PREVIEW]: {
    // Màn hình này YÊU CẦU tham số
    order: ProvisionalOrder;
    items: BillItem[];
  };
};
