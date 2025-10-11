// navigation/KitchenTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// Import các màn hình của bếp
import KitchenDisplayScreen from '../screens/Kitchen/KitchenDisplayScreen';
import KitchenSummaryScreen from '../screens/Kitchen/KitchenSummaryScreen';
import KitchenUtilitiesScreen from '../screens/Kitchen/KitchenUtilitiesScreen';

// Định nghĩa kiểu cho các route trong tab
export type KitchenTabParamList = {
  KitchenDisplay: undefined;
  KitchenSummary: undefined;
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
        tabBarStyle: { 
          paddingBottom: 5, 
          height: 60 
        },
        tabBarLabelStyle: { 
          fontSize: 12 
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';
          let iconSize = size; // Sử dụng một biến để có thể tùy chỉnh

          if (route.name === 'KitchenDisplay') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'KitchenSummary') {
            iconName = focused ? 'analytics' : 'analytics-outline';
            iconSize = size + 5; 
          } else if (route.name === 'KitchenUtilities') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="KitchenDisplay"
        component={KitchenDisplayScreen}
        options={{ tabBarLabel: 'Màn hình chính' }}
      />
      <Tab.Screen
        name="KitchenSummary"
        component={KitchenSummaryScreen}
        options={{ 
          tabBarLabel: 'Tổng hợp',
          // [CẬP NHẬT] Ghi đè style của label cho tab này để tăng cỡ chữ
          tabBarLabelStyle: {
            fontSize: 13,
          }
        }}
      />
      <Tab.Screen
        name="KitchenUtilities"
        component={KitchenUtilitiesScreen}
        options={{ 
          tabBarLabel: 'Tiện ích',
          headerShown: true,
          headerTitle: 'Tiện ích',
          headerTitleAlign: 'center',
         }}
      />
    </Tab.Navigator>
  );
};

export default KitchenTabs;