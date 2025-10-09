// navigation/AppNavigator.tsx

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import các hằng số và màn hình...
import { ROUTES, AuthStackParamList, AppStackParamList } from '../constants/routes';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
// ... (các import khác giữ nguyên)
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
import ProvisionalBillScreen from '../screens/Orders/ProvisionalBillScreen';
import PrintPreviewScreen from '../screens/Orders/PrintPreviewScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import BillHistoryScreen from '../screens/Utilities/BillHistoryScreen';


const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// --- Navigator cho luồng Xác thực (Giữ nguyên) ---
const AuthNavigator = () => (
    <AuthStack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        {/* ... các màn hình auth khác ... */}
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
        {/* ... các màn hình của nhân viên ... */}
        <AppStack.Screen name={ROUTES.ORDER_CONFIRMATION} component={OrderConfirmationScreen} />
        <AppStack.Screen name={ROUTES.TABLE_SELECTION} component={TableSelectionScreen} options={{ headerShown: true }} />
        <AppStack.Screen name={ROUTES.RETURN_SELECTION} component={ReturnSelectionScreen} />
        <AppStack.Screen name={ROUTES.RETURNED_ITEMS_DETAIL} component={ReturnedItemsDetailScreen} />
        <AppStack.Screen name={ROUTES.SPLIT_ORDER} component={SplitOrderScreen} />
        <AppStack.Screen name={ROUTES.SERVE_STATUS} component={ServeStatusScreen} />
        <AppStack.Screen name={ROUTES.PROVISIONAL_BILL} component={ProvisionalBillScreen} />
        <AppStack.Screen name={ROUTES.PRINT_PREVIEW} component={PrintPreviewScreen} />
        <AppStack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
        <AppStack.Screen name={ROUTES.BILL_HISTORY} component={BillHistoryScreen} />
    </AppStack.Navigator>
);

// --- [THÊM MỚI] Navigator TẠM THỜI cho luồng Bếp ---
const KitchenStack = createNativeStackNavigator();

// Màn hình tạm thời cho bếp
const KitchenHomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E65100' }}>GIAO DIỆN BẾP</Text>
    <Text style={{ marginTop: 8 }}>Đây là nơi hiển thị danh sách các món cần làm.</Text>
  </View>
);

// Component Navigator cho Bếp
const KitchenNavigator = () => (
    <KitchenStack.Navigator>
        <KitchenStack.Screen 
            name="KitchenHome" 
            component={KitchenHomeScreen} 
            options={{ title: 'Bếp - Món chờ chế biến' }} 
        />
        {/* Khi có thêm màn hình cho bếp, bạn sẽ thêm vào đây */}
    </KitchenStack.Navigator>
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
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}