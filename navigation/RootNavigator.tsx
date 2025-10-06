// navigation/RootNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORT MỌI THỨ TỪ FILE routes.ts
import { ROUTES, AuthStackParamList, AppStackParamList } from '../constants/routes';

// Import các màn hình Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
// ... import các màn hình Auth khác ...

// Import các màn hình App (nằm ngoài Tabs)
import MenuScreen from '../screens/Menu/MenuScreen';
import OrderConfirmationScreen from '../screens/Menu/OrderConfirmationScreen';

// Import AppTabsNavigator vừa tạo
import AppTabsNavigator from './AppNavigator';

// 2. TẠO HAI STACK NAVIGATOR VỚI TYPE TƯƠNG ỨNG
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Component cho luồng xác thực (chưa đăng nhập)
const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
    <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    {/* ... các màn hình Auth khác của bạn ... */}
  </AuthStack.Navigator>
);

// [SỬA LỖI Ở ĐÂY] Component cho luồng ứng dụng chính (đã đăng nhập)
const AppNavigator = () => (
  <AppStack.Navigator
    screenOptions={{ headerShown: false }}
    // Route ban đầu của AppStack là AppTabs
    initialRouteName={ROUTES.APP_TABS}
  >
    {/* Màn hình chính sẽ là cả cụm Bottom Tabs */}
    <AppStack.Screen name={ROUTES.APP_TABS} component={AppTabsNavigator} />

    {/* Các màn hình khác trong AppStack (có thể điều hướng tới từ bên trong Tabs) */}
    <AppStack.Screen name={ROUTES.MENU} component={MenuScreen} />
    <AppStack.Screen name={ROUTES.ORDER_CONFIRMATION} component={OrderConfirmationScreen} />
  </AppStack.Navigator>
);

// 3. NAVIGATOR GỐC - Quyết định hiển thị luồng nào
export default function RootNavigator() {
  // Giả sử bạn có một state để kiểm tra người dùng đã đăng nhập hay chưa
  // Ví dụ: const { isAuthenticated } = useAuth();
  const isAuthenticated = true; // <-- Thay đổi giá trị này để test (true/false)

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
