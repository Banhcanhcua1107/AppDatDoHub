// constants/routes.ts

import { NavigatorScreenParams } from '@react-navigation/native';
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
  TABLE_SELECTION: 'TableSelection',
  RETURN_SELECTION: 'ReturnSelection',
  
  // --- Bottom Tab routes ---
  HOME_TAB: 'Sơ đồ',
  ORDER_TAB: 'Order',
  RETURN_ITEMS_TAB: 'Trả món',
  RETURN_NOTIFICATIONS: 'ReturnNotifications',
  PROVISIONAL_BILL_TAB: 'Tạm tính',
  UTILITIES_TAB: 'Tiện ích',

  // --- Navigator routes ---
  APP_TABS: 'AppTabs',
  SPLIT_ORDER: 'SplitOrder',
  SERVE_STATUS: 'ServeStatus',
  RETURNED_ITEMS_DETAIL: 'ReturnedItemsDetail',
  PROVISIONAL_BILL: 'ProvisionalBill',
  PRINT_PREVIEW: 'PrintPreview',
  CHANGE_PASSWORD: 'ChangePassword',
  BILL_HISTORY: 'BillHistory',
  RETURN_HISTORY_ARCHIVE: 'ReturnHistoryArchive',
  VIET_QR_CODE: 'VietQRCode',
  MOMO_QR_CODE: 'MoMoQRCode',

  // [THÊM MỚI] Route cho màn hình Bếp
  KITCHEN_TABS: 'KitchenTabs', // Tên cho navigator
  KITCHEN_ORDERS_TAB: 'Bếp Orders', // Tên cho tab 1
  KITCHEN_UTILITIES_TAB: 'Bếp Tiện ích', // Tên cho tab 2
  

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

// [THÊM MỚI] Định nghĩa ParamList cho Navigator của Bếp
export type KitchenTabParamList = {
  [ROUTES.KITCHEN_ORDERS_TAB]: undefined;
  [ROUTES.KITCHEN_UTILITIES_TAB]: undefined;
};

export type AppTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.ORDER_TAB]: undefined;
  [ROUTES.RETURN_ITEMS_TAB]: undefined;
  [ROUTES.RETURN_NOTIFICATIONS]: { orderId?: string };
  [ROUTES.PROVISIONAL_BILL_TAB]: undefined;
  [ROUTES.UTILITIES_TAB]: { screenName: string };
};

export type AppStackParamList = {
  [ROUTES.APP_TABS]: NavigatorScreenParams<AppTabParamList>;
  [ROUTES.MENU]: { tableId: string; tableName: string; orderId?: string; fromOrderConfirmation?: boolean };
  [ROUTES.ORDER_CONFIRMATION]: {
    tableId: string;
    tableName: string;
    orderId?: string;
  };
  [ROUTES.TABLE_SELECTION]: TableSelectionParams;
  [ROUTES.SPLIT_ORDER]: {
    sourceOrderId: string;
    sourceTableNames: string;
    targetTable: { id: string; name: string };
  };
  // [CẬP NHẬT] Thêm các trường cần thiết cho logic 5 phút và hiển thị modal
  [ROUTES.RETURN_SELECTION]: {
    orderId: string;
    tableName?: string; // [THÊM] Tên bàn để hiển thị trong ConfirmModal
    items: {
      id: number;
      name: string;
      quantity: number;
      unit_price: number;
      image_url: string | null;
      status?: string; // [THÊM] Trạng thái món (waiting, in_progress, completed, served)
      created_at?: string; // [THÊM] Thời gian tạo món để tính logic 5 phút
    }[];
    source?: string;
  };
  [ROUTES.SERVE_STATUS]: { orderId: string; tableName: string };
  // [SỬA LỖI] Đổi tên 'ReturnedItemsDetail' thành ROUTES.RETURNED_ITEMS_DETAIL
  [ROUTES.RETURNED_ITEMS_DETAIL]: { orderId: string };
  [ROUTES.RETURN_NOTIFICATIONS]: { orderId?: string };
  [ROUTES.PROVISIONAL_BILL]: undefined;
  [ROUTES.PRINT_PREVIEW]: {
    order: ProvisionalOrder;
    items: BillItem[];
    paymentMethod?: string; // Thêm phương thức thanh toán
    shouldNavigateToHome?: boolean; // Flag để biết có cần quay về Home sau khi đóng không
  };
  [ROUTES.VIET_QR_CODE]: {
    orderId: string;
    amount: number;
    pendingPaymentAction: 'keep' | 'end';
  };
  [ROUTES.MOMO_QR_CODE]: {
    orderId: string;
    amount: number;
    pendingPaymentAction: 'keep' | 'end';
  };
  [ROUTES.CHANGE_PASSWORD]: undefined;
  [ROUTES.BILL_HISTORY]: undefined;
  [ROUTES.RETURN_HISTORY_ARCHIVE]: undefined;
  [ROUTES.ITEM_QUANTITY]: undefined;
  // [XÓA ĐI] Không cần route bếp ở đây nữa vì nó có navigator riêng
  // [ROUTES.KITCHEN_SCREEN]: undefined; 
};