// navigation/RootNavigator.tsx (hoặc bạn có thể sửa file AppNavigator.tsx)

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. IMPORT MỌI THỨ TỪ FILE routes.ts
import { 
  ROUTES, 
  AuthStackParamList,
  AppStackParamList
} from "../constants/routes";

// Import tất cả các màn hình
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
// ... import các màn hình Auth khác ...

// Import màn hình Home từ đúng vị trí bạn đã đặt
import HomeScreen from "../screens/Tables/HomeScreen"; 

// 2. TẠO HAI STACK NAVIGATOR VỚI TYPE TƯƠNG ỨNG
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Component cho luồng xác thực (chưa đăng nhập)
const AuthNavigator = () => (
  <AuthStack.Navigator
    initialRouteName={ROUTES.LOGIN} // <-- Dùng ROUTES.LOGIN
    screenOptions={{ headerShown: false }}
  >
    <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
    <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    {/* ... các màn hình Auth khác của bạn ... */}
  </AuthStack.Navigator>
);

// Component cho luồng ứng dụng chính (đã đăng nhập)
const AppNavigator = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name={ROUTES.HOME} component={HomeScreen} />
    </AppStack.Navigator>
);


// 3. NAVIGATOR GỐC - Quyết định hiển thị luồng nào
export default function RootNavigator() {
  // Giả sử bạn có một state để kiểm tra người dùng đã đăng nhập hay chưa
  // Ví dụ: const { isAuthenticated } = useAuth();
  const isAuthenticated = false; // <-- Thay đổi giá trị này để test (true/false)

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}