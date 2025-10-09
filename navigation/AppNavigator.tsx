import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // [SỬA LỖI] Đã thêm dòng này
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // [SỬA LỖI] Đã thêm dòng này

// [SỬA LỖI] Import đúng tên 'KitchenTabParamList'
import { ROUTES, AuthStackParamList, AppStackParamList, KitchenTabParamList } from '../constants/routes'; 

// --- Import Màn hình ---
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
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
// --- Import màn hình Bếp ---
import KitchenDisplayScreen from '../screens/Kitchen/KitchenDisplayScreen';
import KitchenUtilitiesScreen from '../screens/Kitchen/KitchenUtilitiesScreen';

// --- Khai báo các Navigator ---
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const KitchenTab = createBottomTabNavigator<KitchenTabParamList>();

// --- Navigator cho luồng Xác thực (Giữ nguyên) ---
const AuthNavigator = () => (
    <AuthStack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
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

// [XÓA ĐI] Không cần component tạm thời này nữa
// const KitchenHomeScreen = () => ( ... );

// --- Navigator cho luồng Bếp (Đã cập nhật) ---
const KitchenNavigator = () => (
  <KitchenTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#1E3A8A', // Màu xanh navy đậm
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: '#FFFFFF' },
      tabBarLabelStyle: { fontSize: 12 },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';
        if (route.name === ROUTES.KITCHEN_ORDERS_TAB) {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === ROUTES.KITCHEN_UTILITIES_TAB) {
          iconName = focused ? 'apps' : 'apps-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <KitchenTab.Screen
      name={ROUTES.KITCHEN_ORDERS_TAB}
      component={KitchenDisplayScreen}
      options={{ title: 'Danh sách món' }}
    />
    <KitchenTab.Screen
      name={ROUTES.KITCHEN_UTILITIES_TAB}
      component={KitchenUtilitiesScreen}
      options={{ title: 'Tiện ích' }}
    />
  </KitchenTab.Navigator>
);


// --- Component Navigator Chính (Giữ nguyên) ---
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