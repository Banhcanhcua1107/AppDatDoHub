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
import MenuScreen from '../screens/Menu/MenuScreen';

// Màn hình chính của ứng dụng (sau khi đăng nhập)
import HomeScreen from "../screens/Tables/HomeScreen"; // <-- Import màn hình Home

// 3. TẠO RA 2 "STACK" RIÊNG BIỆT
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// 4. TẠO COMPONENT NAVIGATOR CHO LUỒNG XÁC THỰC (CHƯA ĐĂNG NHẬP)
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
      <AppStack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
      {/* <AppStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} /> */}
      {/* Thêm các màn hình khác của bạn ở đây */}
    </AppStack.Navigator>
  );
};

// 6. COMPONENT CHÍNH (TRƯỚC ĐÂY LÀ AppNavigator) SẼ QUYẾT ĐỊNH HIỂN THỊ LUỒNG NÀO
export default function AppNavigator() {
  // Đây là biến quyết định người dùng đã đăng nhập hay chưa.
  // Trong ứng dụng thật, bạn sẽ lấy giá trị này từ Context, Redux, AsyncStorage, etc.
  const { isAuthenticated } = useAuth();  // <-- THAY ĐỔI GIÁ TRỊ NÀY THÀNH `true` ĐỂ XEM MÀN HÌNH HOME

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}