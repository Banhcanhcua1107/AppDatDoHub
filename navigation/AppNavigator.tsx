import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from '../context/AuthContext';
// 1. IMPORT CÁC HẰNG SỐ VÀ TYPE TỪ FILE routes.ts CỦA BẠN
import { 
  ROUTES, 
  AuthStackParamList,
  AppStackParamList
} from "../constants/routes"; // <-- Đảm bảo đường dẫn này đúng

// 2. IMPORT TẤT CẢ CÁC MÀN HÌNH CẦN THIẾT
// Màn hình xác thực
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import OtpScreen from "../screens/Auth/OtpScreen";
import OtpScreenR from "../screens/Auth/OtpScreenR";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import ResetSuccessScreen from "../screens/Auth/ResetSuccessScreen";

// Màn hình chính của ứng dụng
import BottomTabs from './BottomTabs';
import MenuScreen from '../screens/Menu/MenuScreen';
import OrderConfirmationScreen from '../screens/Menu/OrderConfirmationScreen'; // <-- [THÊM MỚI] 1. Import màn hình xác nhận order
import { OrderProvider } from '../context/OrderContext';
// 3. TẠO RA 2 "STACK" RIÊNG BIỆT
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// 4. TẠO COMPONENT NAVIGATOR CHO LUỒNG XÁC THỰC (CHƯA ĐĂNG NHẬP) - (Giữ nguyên, không thay đổi)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <AuthStack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <AuthStack.Screen name={ROUTES.OTP} component={OtpScreen} />
      <AuthStack.Screen name={ROUTES.OTP_REGISTER} component={OtpScreenR} />
      <AuthStack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
      <AuthStack.Screen name={ROUTES.RESET_SUCCESS} component={ResetSuccessScreen} />
    </AuthStack.Navigator>
  );
};

// 5. TẠO COMPONENT NAVIGATOR CHO LUỒNG ỨNG DỤNG CHÍNH (ĐÃ ĐĂNG NHẬP)
const AppMainNavigator = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
       <AppStack.Screen name={ROUTES.APP_TABS} component={BottomTabs} />
       <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
       
       {/* // <-- [THÊM MỚI] 2. Đăng ký màn hình xác nhận order vào stack */}
       <AppStack.Screen 
          name={ROUTES.ORDER_CONFIRMATION} 
          component={OrderConfirmationScreen} 
       />
       
    </AppStack.Navigator>
  );
};

// 6. COMPONENT CHÍNH SẼ QUYẾT ĐỊNH HIỂN THỊ LUỒNG NÀO (Giữ nguyên, không thay đổi)
export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <OrderProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </OrderProvider>
  );
}