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
import TableSelectionScreen from '../screens/Menu/TableSelectionScreen'; 
import SplitOrderScreen from '../screens/Menu/SplitOrderScreen';
import ReturnSelectionScreen from '../screens/Orders/ReturnSelectionScreen';
import ServeStatusScreen from '../screens/Orders/ServeStatusScreen';
import ReturnedItemsDetailScreen from '../screens/Orders/ReturnedItemsDetailScreen';
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

// [SỬA LỖI] Đổi tên component này thành MainAppStack để rõ ràng hơn
const MainAppStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name={ROUTES.APP_TABS} component={BottomTabs} />
    <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
    <AppStack.Screen name={ROUTES.ORDER_CONFIRMATION} component={OrderConfirmationScreen} />
    <AppStack.Screen 
      name={ROUTES.TABLE_SELECTION} 
      component={TableSelectionScreen} 
      // Giữ nguyên header cho màn hình này nếu bạn muốn
      options={{ headerShown: true }} 
    />

    {/* [SỬA LỖI] Xóa 'options' đi. Vì mặc định của Stack này là headerShown: false,
        nên màn hình này sẽ không có header mặc định nữa, chỉ còn header custom của bạn. */}
    <AppStack.Screen 
        name={ROUTES.RETURN_SELECTION} 
        component={ReturnSelectionScreen} 
    />
    <AppStack.Screen 
      name={ROUTES.RETURNED_ITEMS_DETAIL} 
      component={ReturnedItemsDetailScreen} 
    />

    <AppStack.Screen name={ROUTES.SPLIT_ORDER} component={SplitOrderScreen} />
    <AppStack.Screen name={ROUTES.SERVE_STATUS} component={ServeStatusScreen} />
  </AppStack.Navigator>
);

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
      <NavigationContainer>
        {/* [SỬA LỖI] Gọi đúng tên component đã đổi */}
        {isAuthenticated ? <MainAppStack /> : <AuthNavigator />}
      </NavigationContainer>
  );
}