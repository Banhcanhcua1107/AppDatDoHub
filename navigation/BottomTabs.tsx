// navigation/BottomTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import các hằng số và type
import { ROUTES, AppTabParamList } from '../constants/routes';

// Import các màn hình
import HomeScreen from '../screens/Tables/HomeScreen';
// [THÊM MỚI] Import 2 màn hình mới
import ProvisionalBillScreen from '../screens/Orders/ProvisionalBillScreen';
import ReturnItemsScreen from '../screens/Orders/ReturnItemsScreen';
// [XÓA] Bạn có thể xóa PlaceholderScreen nếu không dùng ở tab khác
import PlaceholderScreen from '../screens/Placeholders/PlaceholderScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      // screenOptions giữ nguyên
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';
          if (route.name === ROUTES.HOME_TAB) {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === ROUTES.RETURN_ITEMS_TAB) {
            // [THAY ĐỔI] Icon cho "Trả món"
            iconName = focused ? 'arrow-undo-circle' : 'arrow-undo-circle-outline';
          } else if (route.name === ROUTES.PROVISIONAL_BILL_TAB) {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === ROUTES.UTILITIES_TAB) {
            iconName = focused ? 'apps' : 'apps-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name={ROUTES.HOME_TAB} 
        component={HomeScreen} 
        options={{ title: 'Sơ đồ' }}
      />

      {/* [THAY ĐỔI] Tab 2: Trả món */}
      <Tab.Screen 
        name={ROUTES.RETURN_ITEMS_TAB} 
        component={ReturnItemsScreen} // <-- Thay thế ở đây
        // initialParams đã được xóa
        options={{
          title: 'Trả món'
        }}
      />

      {/* [THAY ĐỔI] Tab 3: Tạm tính */}
      <Tab.Screen 
        name={ROUTES.PROVISIONAL_BILL_TAB} 
        component={ProvisionalBillScreen} // <-- Thay thế ở đây
        // initialParams đã được xóa
        options={{
          title: 'Tạm tính'
        }}
      />

      {/* Tab 4: Tiện ích (Vẫn dùng Placeholder) */}
      <Tab.Screen 
        name={ROUTES.UTILITIES_TAB} 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Tiện ích' }}
        options={{
          title: 'Tiện ích'
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;