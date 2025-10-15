// navigation/CashierTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import các hằng số và type
import { ROUTES, AppTabParamList } from '../constants/routes';

// Import các màn hình
import HomeScreen from '../screens/Tables/HomeScreen';
import OrderScreen from '../screens/Orders/OrderScreen';
import ProvisionalBillScreen from '../screens/Orders/ProvisionalBillScreen';
import ReturnItemsScreen from '../screens/Orders/ReturnItemsScreen';
import CashierUtilitiesScreen from '../screens/Cashier/CashierUtilitiesScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

const CashierTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';
          if (route.name === ROUTES.HOME_TAB) {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === ROUTES.ORDER_TAB) {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === ROUTES.RETURN_ITEMS_TAB) {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === ROUTES.PROVISIONAL_BILL_TAB) {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === ROUTES.UTILITIES_TAB) {
            iconName = focused ? 'apps' : 'apps-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1: Sơ đồ */}
      <Tab.Screen name={ROUTES.HOME_TAB} component={HomeScreen} options={{ title: 'Sơ đồ' }} />

      {/* Tab 2: Order */}
      <Tab.Screen
        name={ROUTES.ORDER_TAB}
        component={OrderScreen}
        options={{
          title: 'Order',
        }}
      />

      {/* Tab 3: Trả món */}
      <Tab.Screen
        name={ROUTES.RETURN_ITEMS_TAB}
        component={ReturnItemsScreen}
        options={{
          title: 'Trả món',
        }}
      />

      {/* Tab 4: Tạm tính */}
      <Tab.Screen
        name={ROUTES.PROVISIONAL_BILL_TAB}
        component={ProvisionalBillScreen}
        options={{
          title: 'Tạm tính',
        }}
      />

      {/* Tab 5: Tiện ích - SỬ DỤNG CashierUtilitiesScreen */}
      <Tab.Screen
        name={ROUTES.UTILITIES_TAB}
        component={CashierUtilitiesScreen}
        options={{
          title: 'Tiện ích',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
    </Tab.Navigator>
  );
};

export default CashierTabs;
