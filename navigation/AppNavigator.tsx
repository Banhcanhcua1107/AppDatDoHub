import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ROUTES } from "../constants/routes";

// Import screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import OtpScreenR from "../screens/Auth/OtpScreenR";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import ResetSuccessScreen from "../screens/Auth/ResetSuccessScreen";

// Định nghĩa type cho toàn bộ Auth flow
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Otp: { email: string };
  ResetPassword: { email: string };
  ResetSuccess: undefined;
};


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
        <Stack.Screen name={ROUTES.OTP} component={OtpScreenR} />
        <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
        <Stack.Screen name={ROUTES.RESET_SUCCESS} component={ResetSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
