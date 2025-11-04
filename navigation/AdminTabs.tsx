// navigation/AdminTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// --- [SỬA ĐỔI] Import AdminDashboardScreen ---
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminMenuPlaceholder from '../screens/Admin/Placeholders/MenuPlaceholder';
import AdminOrdersPlaceholder from '../screens/Admin/Placeholders/OrdersPlaceholder';
import AdminUsersPlaceholder from '../screens/Admin/Placeholders/UsersPlaceholder';
import AdminReportsPlaceholder from '../screens/Admin/Placeholders/ReportsPlaceholder';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  console.log("✅ [AdminTabs] Rendering admin tabs...");
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AdminMenu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'AdminOrders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'AdminUsers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminReports') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        // --- [SỬA ĐỔI] Trỏ đến AdminDashboardScreen ---
        component={AdminDashboardScreen} 
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="AdminMenu"
        component={AdminMenuPlaceholder}
        options={{
          tabBarLabel: 'Menu',
        }}
      />
      <Tab.Screen
        name="AdminOrders"
        component={AdminOrdersPlaceholder}
        options={{
          tabBarLabel: 'Đơn hàng',
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersPlaceholder}
        options={{
          tabBarLabel: 'Nhân viên',
        }}
      />
      <Tab.Screen
        name="AdminReports"
        component={AdminReportsPlaceholder}
        options={{
          tabBarLabel: 'Báo cáo',
        }}
      />
    </Tab.Navigator>
  );
}