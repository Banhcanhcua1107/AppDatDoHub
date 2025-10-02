// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from '../context/AuthContext';


// Import các hằng số route và kiểu dữ liệu TypeScript
import { 
  ROUTES, 
  AuthStackParamList,
  AppStackParamList
} from "../constants/routes";

// Import các màn hình
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import OtpScreen from "../screens/Auth/OtpScreen";
import OtpScreenR from "../screens/Auth/OtpScreenR";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import ResetSuccessScreen from "../screens/Auth/ResetSuccessScreen";
import BottomTabs from './BottomTabs';
import MenuScreen from '../screens/Menu/MenuScreen';
import OrderConfirmationScreen from '../screens/Menu/OrderConfirmationScreen';

// =================================================================
// BƯỚC 1: Import màn hình TableSelectionScreen vào đây
import TableSelectionScreen from '../screens/Menu/TableSelectionScreen'; 
// (Hãy chắc chắn đường dẫn `../screens/TableSelectionScreen` là chính xác)
// =================================================================

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
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

const AppNavigatorComponent = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name={ROUTES.APP_TABS} component={BottomTabs} />
    <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
    <AppStack.Screen name={ROUTES.ORDER_CONFIRMATION} component={OrderConfirmationScreen} />
    
    {/* ================================================================= */}
    {/* BƯỚC 2: Thêm màn hình TableSelectionScreen vào Stack Navigator */}
    <AppStack.Screen 
      name={ROUTES.TABLE_SELECTION} 
      component={TableSelectionScreen} 
      // Thêm các tùy chọn nếu cần, ví dụ: để hiển thị header
      options={{ headerShown: true }} 
    />
    {/* ================================================================= */}

  </AppStack.Navigator>
);

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
      <NavigationContainer>
        {isAuthenticated ? <AppNavigatorComponent /> : <AuthNavigator />}
      </NavigationContainer>
  );
}