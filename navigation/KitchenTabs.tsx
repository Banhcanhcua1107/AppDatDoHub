// navigation/KitchenTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// [SỬA LỖI] Sử dụng import từ @expo/vector-icons giống như BottomTabs
import { Ionicons } from '@expo/vector-icons'; 

// Import các màn hình của bếp
import KitchenDisplayScreen from '../screens/Kitchen/KitchenDisplayScreen';
import KitchenUtilitiesScreen from '../screens/Kitchen/KitchenUtilitiesScreen';

// Định nghĩa kiểu cho các route trong tab
export type KitchenTabParamList = {
  KitchenDisplay: undefined;
  KitchenUtilities: undefined;
};

const Tab = createBottomTabNavigator<KitchenTabParamList>();

const KitchenTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E3A8A', // Màu xanh đậm cho tab được chọn
        tabBarInactiveTintColor: 'gray',
        // [CẬP NHẬT] Áp dụng style tương tự BottomTabs để đẹp hơn
        tabBarStyle: {
          height: 60, // Chiều cao
          paddingBottom: 5, // Padding dưới
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          // [SỬA LỖI] Dùng đúng kiểu type và component Ionicons từ Expo
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

          if (route.name === 'KitchenDisplay') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'KitchenUtilities') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="KitchenDisplay"
        component={KitchenDisplayScreen}
        options={{ tabBarLabel: 'Màn hình chính' }}
      />
      <Tab.Screen
        name="KitchenUtilities"
        component={KitchenUtilitiesScreen}
        options={{ tabBarLabel: 'Tiện ích' }}
      />
    </Tab.Navigator>
  );
};

export default KitchenTabs;