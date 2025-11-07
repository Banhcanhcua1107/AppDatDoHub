// navigation/AdminTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// --- [SỬA ĐỔI] Import các màn hình chức năng thực tế ---
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminMenuScreen from '../screens/Admin/AdminMenuScreen';
import AdminOrdersScreen from '../screens/Admin/AdminOrdersScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminReportsScreen from '../screens/Admin/AdminReportsScreen';
import AdminUtilitiesScreen from '../screens/Admin/AdminUtilitiesScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 5, height: 60, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AdminMenu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'AdminOrders') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'AdminUsers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminReports') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'AdminUtilities') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen} 
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="AdminMenu"
        // --- [SỬA ĐỔI] Trỏ đến AdminMenuScreen ---
        component={AdminMenuScreen}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="AdminOrders"
        // --- [SỬA ĐỔI] Trỏ đến AdminOrdersScreen ---
        component={AdminOrdersScreen}
        options={{ tabBarLabel: 'Đơn hàng' }}
      />
      <Tab.Screen
        name="AdminUsers"
        // --- [SỬA ĐỔI] Trỏ đến AdminUsersScreen ---
        component={AdminUsersScreen}
        options={{ tabBarLabel: 'Nhân viên' }}
      />
      <Tab.Screen
        name="AdminReports"
        // --- [SỬA ĐỔI] Trỏ đến AdminReportsScreen ---
        component={AdminReportsScreen}
        options={{ tabBarLabel: 'Báo cáo' }}
      />
      <Tab.Screen
        name="AdminUtilities"
        // --- [MỚI] Thêm tab Tiện ích ---
        component={AdminUtilitiesScreen}
        options={{ tabBarLabel: 'Tiện ích' }}
      />
    </Tab.Navigator>
  );
}