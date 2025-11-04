// navigation/RootNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORT MỌI THỨ TỪ FILE routes.ts
import { ROUTES, AuthStackParamList } from '../constants/routes';

// Import các màn hình Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
// ... import các màn hình Auth khác ...

// Import các màn hình App (nằm ngoài Tabs)
// import MenuScreen from '../screens/Menu/MenuScreen';
// import OrderConfirmationScreen from '../screens/Menu/OrderConfirmationScreen';

// Import AppTabsNavigator vừa tạo
import AppTabsNavigator from './AppNavigator';
import CashierTabs from './CashierTabs';
import AdminTabs from './AdminTabs';

// Import AuthContext
import { useAuth } from '../context/AuthContext';

// 2. TẠO HAI STACK NAVIGATOR VỚI TYPE TƯƠNG ỨNG
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
// const AppStack = createNativeStackNavigator<AppStackParamList>();

// Component cho luồng xác thực (chưa đăng nhập)
const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
    <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    {/* ... các màn hình Auth khác của bạn ... */}
  </AuthStack.Navigator>
);

// [SỬA LỖI Ở ĐÂY] Component cho luồng ứng dụng chính (đã đăng nhập)
const AppNavigator = ({ userRole }: { userRole: string }) => {
  console.log("🔍 AppNavigator - Chọn navigator cho role:", userRole);
  
  // Nếu admin, return AdminTabs TRỰC TIẾP (không dùng AppStack wrapper)
  if (userRole === 'admin') {
    console.log("✅ ADMIN ROLE - Render AdminTabs directly");
    return <AdminTabs />;
  }
  
  // Nếu cashier, return CashierTabs TRỰC TIẾP
  if (userRole === 'thu_ngan') {
    console.log("✅ CASHIER ROLE - Render CashierTabs directly");
    return <CashierTabs />;
  }
  
  // Nếu user role khác, return AppTabsNavigator
  console.log("✅ USER ROLE - Render AppTabsNavigator directly");
  return <AppTabsNavigator />;
};

// 3. NAVIGATOR GỐC - Quyết định hiển thị luồng nào
export default function RootNavigator() {
  // Sử dụng AuthContext để lấy thông tin user
  const { isAuthenticated, userProfile } = useAuth();

  console.log("🔍 [RootNavigator] isAuthenticated:", isAuthenticated);
  console.log("🔍 [RootNavigator] userProfile:", JSON.stringify(userProfile, null, 2));
  console.log("🔍 [RootNavigator] userRole:", userProfile?.role);

  const userRole = userProfile?.role || 'nhan_vien';
  console.log("🔍 [RootNavigator] Chọn TabsComponent cho role:", userRole);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <>
          <AppNavigator userRole={userRole} />
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
