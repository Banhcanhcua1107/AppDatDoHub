// src/screens/Orders/OrderScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { AppTabParamList, AppStackParamList, ROUTES } from '../../constants/routes';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
type ActiveOrder = {
  orderId: string;
  tableId: string;
  tableName: string;
  totalPrice: number;
  createdAt: string;
  totalItemCount: number;
};

// --- COMPONENT THẺ ORDER ---
type OrderItemCardProps = {
    item: ActiveOrder;
    navigation: CompositeScreenProps<
        BottomTabScreenProps<AppTabParamList, typeof ROUTES.ORDER_TAB>,
        NativeStackScreenProps<AppStackParamList>
    >['navigation'];
};

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, navigation }) => {
  const formatTimeElapsed = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 1000);
    if (diff < 60) return `${diff}s`;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) return `${hours}h ${remainingMinutes}'`;
    return `${remainingMinutes}'`;
  };

  const handlePressCard = () => {
    navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
        tableId: item.tableId,
        tableName: item.tableName,
        items: [],
    });
  };

  return (
    <View style={styles.cardShadow} className="bg-white rounded-lg mb-4 mx-4">
      <TouchableOpacity onPress={handlePressCard}>
        <View style={{ backgroundColor: '#3B82F6' }} className="flex-row justify-end items-center p-3 rounded-t-lg">
          <View className="flex-row items-center">
            <Ionicons name="copy-outline" size={16} color="white" />
            <Text className="text-white font-bold text-sm ml-1">{item.totalItemCount}</Text>
          </View>
        </View>

        <View className="flex-row p-4 items-start">
          <View className="w-1/2 items-start justify-center border-r border-gray-200 pr-4">
            <Text className="text-gray-800 font-bold text-xl">{item.tableName}</Text>
          </View>
          <View className="w-1/2 pl-4 items-end">
            <Text className="text-gray-900 font-bold text-2xl">
              {item.totalPrice.toLocaleString('vi-VN')}
            </Text>
            {/* [SỬA] Bọc thời gian và icon trong View và dùng justify-between */}
            <View className="flex-row items-center justify-between w-full mt-1">
               <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={15} color="gray" />
                  <Text className="text-gray-600 text-sm ml-1">{formatTimeElapsed(item.createdAt)}</Text>
               </View>
               <Ionicons name="restaurant" size={22} color="#2E8540" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <View className="flex-row justify-around items-center bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <TouchableOpacity className="py-3 items-center justify-center flex-1"><Ionicons name="calculator-outline" size={24} color="gray" /></TouchableOpacity>
          <TouchableOpacity className="py-3 items-center justify-center flex-1"><Ionicons name="restaurant-outline" size={24} color="gray" /></TouchableOpacity>
          <TouchableOpacity className="py-3 items-center justify-center flex-1"><Ionicons name="receipt-outline" size={24} color="gray" /></TouchableOpacity>
          <TouchableOpacity className="py-3 items-center justify-center flex-1"><Ionicons name="ellipsis-horizontal" size={24} color="gray" /></TouchableOpacity>
      </View>
    </View>
  );
};


// --- MÀN HÌNH CHÍNH (Không thay đổi logic) ---
type OrderScreenProps = CompositeScreenProps<
    BottomTabScreenProps<AppTabParamList, typeof ROUTES.ORDER_TAB>,
    NativeStackScreenProps<AppStackParamList>
>;

const OrderScreen = ({ navigation }: OrderScreenProps) => {
  const insets = useSafeAreaInsets();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('tables')
      .select(`id, name, orders!inner(id, created_at, status, order_items(quantity, unit_price))`)
      .eq('status', 'Đang phục vụ')
      .eq('orders.status', 'pending');

    if (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách order đang hoạt động.');
      setLoading(false);
      return;
    }

    const formattedOrders: ActiveOrder[] = data.flatMap(table => (
      table.orders.map(order => {
        const totalPrice = order.order_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        const totalItemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
        return {
          orderId: order.id,
          tableId: table.id,
          tableName: table.name,
          totalPrice: totalPrice,
          createdAt: order.created_at,
          totalItemCount: totalItemCount,
        };
      })
    ));

    setActiveOrders(formattedOrders);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchActiveOrders();
    }, [fetchActiveOrders])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Đang tải danh sách order...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <View style={{ paddingTop: insets.top, backgroundColor: '#3B82F6' }} className="pb-4 px-4 shadow-lg">
         <View className="flex-row items-center justify-center h-12">
             <TouchableOpacity className="flex-row items-center">
                 <Text className="text-white font-bold text-xl">Order</Text>
                 <Text className="text-white text-lg ml-2">Đang phục vụ</Text>
                 <Ionicons name="caret-down" size={16} color="white" className="ml-1" />
            </TouchableOpacity>
         </View>
      </View>

      <FlatList
        data={activeOrders}
        renderItem={({ item }) => <OrderItemCard item={item} navigation={navigation} />}
        keyExtractor={(item) => item.orderId.toString()}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={
            <View className="mt-20 items-center">
                <Ionicons name="file-tray-outline" size={60} color="#9CA3AF"/>
                <Text className="text-gray-500 text-lg mt-4">Không có order nào đang phục vụ</Text>
            </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
});

export default OrderScreen;