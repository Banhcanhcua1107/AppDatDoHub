// navigation/AdminTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import các màn hình Admin
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/Admin/AdminOrdersScreen';
import AdminUtilitiesScreen from '../screens/Admin/AdminUtilitiesScreen';

// Định nghĩa kiểu cho các route trong tab
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminUtilities: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AdminOrders') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'AdminUtilities') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1: Trang chủ */}
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />

      {/* Tab 2: Đơn hàng */}
      <Tab.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ tabBarLabel: 'Đơn hàng' }}
      />

      {/* Tab 3: Tiện ích */}
      <Tab.Screen
        name="AdminUtilities"
        component={AdminUtilitiesScreen}
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

export default AdminTabs;