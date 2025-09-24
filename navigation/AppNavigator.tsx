// AppNavigator.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. SỬ DỤNG CÁC KIỂU VÀ HẰNG SỐ TỪ FILE TRUNG TÂM
import { ROUTES, AuthStackParamList } from "../constants/routes";

// 2. IMPORT TẤT CẢ CÁC MÀN HÌNH CẦN THIẾT
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import OtpScreen from "../screens/Auth/OtpScreen"; // <-- Import màn hình OTP cho Quên mật khẩu
import OtpScreenR from "../screens/Auth/OtpScreenR"; // <-- Màn hình OTP cho Đăng ký
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import ResetSuccessScreen from "../screens/Auth/ResetSuccessScreen";

// Sử dụng AuthStackParamList đã được export từ constants/routes.ts
const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.LOGIN}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
        <Stack.Screen name={ROUTES.RESET_SUCCESS} component={ResetSuccessScreen} />

        {/* 3. KHAI BÁO 2 MÀN HÌNH OTP RIÊNG BIỆT */}
        
        {/* Màn hình OTP cho luồng "Quên Mật Khẩu" */}
        <Stack.Screen name={ROUTES.OTP} component={OtpScreen} /> 
        
        {/* Màn hình OTP cho luồng "Đăng Ký" */}
        <Stack.Screen name={ROUTES.OTP_REGISTER} component={OtpScreenR} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}