// navigation/AppNavigator.tsx

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import các hằng số và màn hình...
import { ROUTES, AuthStackParamList, AppStackParamList } from '../constants/routes';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import OtpScreenR from '../screens/Auth/OtpScreenR';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import ResetSuccessScreen from '../screens/Auth/ResetSuccessScreen';
import BottomTabs from './BottomTabs';
import MenuScreen from '../screens/Menu/MenuScreen';
import OrderConfirmationScreen from '../screens/Menu/OrderConfirmationScreen';
import TableSelectionScreen from '../screens/Menu/TableSelectionScreen';
import SplitOrderScreen from '../screens/Menu/SplitOrderScreen';
import ReturnSelectionScreen from '../screens/Orders/ReturnSelectionScreen';
import ServeStatusScreen from '../screens/Orders/ServeStatusScreen';
import ReturnedItemsDetailScreen from '../screens/Orders/ReturnedItemsDetailScreen';
import ReturnNotificationScreen from '../screens/Orders/ReturnNotificationScreen';
import ProvisionalBillScreen from '../screens/Orders/ProvisionalBillScreen';
import PrintPreviewScreen from '../screens/Orders/PrintPreviewScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import BillHistoryScreen from '../screens/Utilities/BillHistoryScreen';
// --- [SỬA LỖI] Import KitchenTabs và xóa import KitchenDisplayScreen không cần thiết ---
import KitchenTabs from './KitchenTabs';
import KitchenDetailScreen from '../screens/Kitchen/KitchenDetailScreen';
import KitchenSummaryDetailScreen from '../screens/Kitchen/KitchenSummaryDetailScreen';
import KitchenProcessingReportScreen from 'screens/Kitchen/KitchenProcessingReportScreen';
import ItemAvailabilityScreen from 'screens/Kitchen/ItemAvailabilityScreen';
import ReturnHistoryScreen from 'screens/Kitchen/ReturnHistoryScreen'; // [MỚI]
// --- [THÊM] Import CashierTabs và các màn hình Thu ngân ---
import CashierTabs from './CashierTabs';
import DashboardScreen from '../screens/Cashier/DashboardScreen';
import CashierReportScreen from '../screens/Cashier/CashierReportScreen';
import PurchaseScreen from '../screens/Cashier/PurchaseScreen';
import InventoryScreen from '../screens/Cashier/InventoryScreen';
import CashFundScreen from '../screens/Cashier/CashFundScreen';
import BankFundScreen from '../screens/Cashier/BankFundScreen';
import ExpensesScreen from '../screens/Cashier/ExpensesScreen';
import PromotionsScreen from '../screens/Cashier/PromotionsScreen';
import MenuManagementScreen from '../screens/Cashier/MenuManagementScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
// --- [SỬA LỖI] Khai báo KitchenStack ở đây, MỘT LẦN DUY NHẤT ---
export type KitchenStackParamList = {
  KitchenRoot: undefined; // Màn hình chứa các tab
  KitchenDetail: { orderId: string; tableName: string }; // Màn hình chi tiết
  KitchenSummaryDetail: { itemName: string }; 
  KitchenProcessingReport: undefined;
  ItemAvailability: undefined;
  ReturnHistory: undefined; // [MỚI] Lịch sử trả món
};

const KitchenStack = createNativeStackNavigator<KitchenStackParamList>();

// --- [THÊM] Khai báo CashierStack cho Thu ngân ---
export type CashierStackParamList = {
  CashierRoot: undefined; // Màn hình chứa các tab
  Dashboard: undefined; // Tổng quan
  CashierReport: undefined;
  Purchase: undefined;
  Inventory: undefined;
  CashFund: undefined;
  BankFund: undefined;
  Expenses: undefined;
  Promotions: undefined;
  MenuManagement: undefined;
  // Thêm các màn hình dùng chung
  ChangePassword: undefined;
  BillHistory: undefined;
  // Thêm các màn hình Menu và Order (giống nhân viên)
  Menu: { tableId: string; tableName: string; orderId?: string; fromOrderConfirmation?: boolean };
  OrderConfirmation: { orderId: string; tableId: string; tableName: string };
  TableSelection: any;
  SplitOrder: any;
  ReturnSelection: any;
  ReturnedItemsDetail: { returnId: string };
  ReturnNotifications: undefined;
  ServeStatus: any;
  ProvisionalBill: { orderId: string };
  PrintPreview: { orderId: string };
};

const CashierStack = createNativeStackNavigator<CashierStackParamList>();


// --- Navigator cho luồng Xác thực (Giữ nguyên) ---
const AuthNavigator = () => (
    <AuthStack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        <AuthStack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        <AuthStack.Screen name={ROUTES.OTP} component={OtpScreen} />
        <AuthStack.Screen name={ROUTES.OTP_REGISTER} component={OtpScreenR} />
        <AuthStack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
        <AuthStack.Screen name={ROUTES.RESET_SUCCESS} component={ResetSuccessScreen} />
    </AuthStack.Navigator>
);

// --- Navigator cho luồng Nhân Viên (Giữ nguyên) ---
const MainAppStack = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name={ROUTES.APP_TABS} component={BottomTabs} />
        <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
        <AppStack.Screen name={ROUTES.ORDER_CONFIRMATION} component={OrderConfirmationScreen} />
        <AppStack.Screen name={ROUTES.TABLE_SELECTION} component={TableSelectionScreen} options={{ headerShown: true }} />
        <AppStack.Screen name={ROUTES.RETURN_SELECTION} component={ReturnSelectionScreen} />
        <AppStack.Screen name={ROUTES.RETURNED_ITEMS_DETAIL} component={ReturnedItemsDetailScreen} />
        <AppStack.Screen name={ROUTES.RETURN_NOTIFICATIONS} component={ReturnNotificationScreen} />
        <AppStack.Screen name={ROUTES.SPLIT_ORDER} component={SplitOrderScreen} />
        <AppStack.Screen name={ROUTES.SERVE_STATUS} component={ServeStatusScreen} />
        <AppStack.Screen name={ROUTES.PROVISIONAL_BILL} component={ProvisionalBillScreen} />
        <AppStack.Screen name={ROUTES.PRINT_PREVIEW} component={PrintPreviewScreen} />
        <AppStack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
        <AppStack.Screen name={ROUTES.BILL_HISTORY} component={BillHistoryScreen} />
    </AppStack.Navigator>
);


// --- [SỬA LỖI] Xóa bỏ hoàn toàn KitchenNavigator và các component tạm thời cũ ---
// --- Navigator mới cho luồng Bếp ---
const KitchenNavigator = () => (
  <KitchenStack.Navigator screenOptions={{ headerShown: false }}>
    <KitchenStack.Screen name="KitchenRoot" component={KitchenTabs} />
    <KitchenStack.Screen name="KitchenDetail" component={KitchenDetailScreen} />
    <KitchenStack.Screen name="KitchenSummaryDetail" component={KitchenSummaryDetailScreen} />
    <KitchenStack.Screen name="KitchenProcessingReport" component={KitchenProcessingReportScreen} options={{ headerShown: false }} />
    <KitchenStack.Screen name="ItemAvailability" component={ItemAvailabilityScreen} options={{ headerShown: false }} />
    <KitchenStack.Screen name="ReturnHistory" component={ReturnHistoryScreen} options={{ headerShown: false }} />
  </KitchenStack.Navigator>
);

// --- [THÊM] Navigator mới cho luồng Thu ngân ---
const CashierNavigator = () => (
  <CashierStack.Navigator screenOptions={{ headerShown: false }}>
    <CashierStack.Screen name="CashierRoot" component={CashierTabs} />
    {/* Màn hình Thu ngân riêng */}
    <CashierStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, title: 'Tổng quan' }} />
    <CashierStack.Screen name="CashierReport" component={CashierReportScreen} options={{ headerShown: true, title: 'Báo cáo' }} />
    <CashierStack.Screen name="Purchase" component={PurchaseScreen} options={{ headerShown: true, title: 'Mua hàng' }} />
    <CashierStack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: true, title: 'Kho' }} />
    <CashierStack.Screen name="CashFund" component={CashFundScreen} options={{ headerShown: true, title: 'Quỹ tiền mặt' }} />
    <CashierStack.Screen name="BankFund" component={BankFundScreen} options={{ headerShown: true, title: 'Quỹ tiền gửi' }} />
    <CashierStack.Screen name="Expenses" component={ExpensesScreen} options={{ headerShown: true, title: 'Chi phí' }} />
    <CashierStack.Screen name="Promotions" component={PromotionsScreen} options={{ headerShown: true, title: 'Khuyến mãi' }} />
    <CashierStack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ headerShown: true, title: 'Thực đơn' }} />
    {/* Màn hình dùng chung */}
    <CashierStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <CashierStack.Screen name="BillHistory" component={BillHistoryScreen} />
    {/* Màn hình Menu và Order (giống nhân viên) */}
    <CashierStack.Screen name="Menu" component={MenuScreen} />
    <CashierStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <CashierStack.Screen name="TableSelection" component={TableSelectionScreen as any} options={{ headerShown: true }} />
    <CashierStack.Screen name="ReturnSelection" component={ReturnSelectionScreen as any} />
    <CashierStack.Screen name="ReturnedItemsDetail" component={ReturnedItemsDetailScreen} />
    <CashierStack.Screen name="ReturnNotifications" component={ReturnNotificationScreen} />
    <CashierStack.Screen name="SplitOrder" component={SplitOrderScreen as any} />
    <CashierStack.Screen name="ServeStatus" component={ServeStatusScreen as any} />
    <CashierStack.Screen name="ProvisionalBill" component={ProvisionalBillScreen} />
    <CashierStack.Screen name="PrintPreview" component={PrintPreviewScreen} />
  </CashierStack.Navigator>
);


// --- Component Navigator Chính (Đã được cập nhật) ---
export default function AppNavigator() {
  const { isAuthenticated, isLoading, userProfile } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && userProfile ? (
        <>
          {userProfile.role === 'bep' && <KitchenNavigator />}
          {userProfile.role === 'nhan_vien' && <MainAppStack />}
          {userProfile.role === 'thu_ngan' && <CashierNavigator />}
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}