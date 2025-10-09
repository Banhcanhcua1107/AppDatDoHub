// navigation/KitchenTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
        tabBarActiveTintColor: '#1E3A8A', 
        tabBarInactiveTintColor: 'gray',
        // [CẬP NHẬT] Áp dụng style giống hệt BottomTabs
        tabBarStyle: { 
          paddingBottom: 5, 
          height: 60 
        },
        tabBarLabelStyle: { 
          fontSize: 12 
        },
        tabBarIcon: ({ focused, color, size }) => {
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
        options={{ 
          tabBarLabel: 'Tiện ích',
          headerShown: true, // Hiển thị header cho trang Tiện ích Bếp
          headerTitle: 'Tiện ích', // Thêm tiêu đề cho header
          headerTitleAlign: 'center',
         }}
      />
    </Tab.Navigator>
  );
};

export default KitchenTabs;