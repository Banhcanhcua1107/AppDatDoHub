// --- START OF FILE: screens/Orders/ProvisionalBillScreen.tsx ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../services/supabase';
import { AppStackParamList, ROUTES } from '../../constants/routes';

// Import component giao diện hóa đơn chung
import BillContent from '../../components/BillContent'; // <-- SỬA ĐÚNG ĐƯỜNG DẪN NẾU CẦN

// --- Định nghĩa và Export các kiểu dữ liệu để file khác có thể dùng ---
type TableInfo = { id: string; name: string };
export interface BillItem { 
    name: string; 
    quantity: number; 
    unit_price: number; 
    totalPrice: number; 
}
export interface ProvisionalOrder { 
    orderId: string;
    tables: TableInfo[];
    totalPrice: number;
    totalItemCount: number;
    createdAt: string;
}

// Định nghĩa kiểu cho navigation
type ProvisionalBillScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'ProvisionalBill'
>;

// --- Component Card hiển thị Order (không thay đổi) ---
const OrderCard: React.FC<{ item: ProvisionalOrder; onPress: () => void; }> = ({ item, onPress }) => {
    const displayTableName = item.tables.map(t => t.name).join(', ');
    const formatTimeElapsed = (startTime: string) => {
        const start = new Date(startTime).getTime(); const now = new Date().getTime(); const diff = Math.floor((now - start) / 1000);
        if (diff < 60) return `${diff}s ago`;
        const minutes = Math.floor(diff / 60); const hours = Math.floor(minutes / 60); const remainingMinutes = minutes % 60;
        if (hours > 0) return `${hours}h ${remainingMinutes}'`;
        return `${remainingMinutes}'`;
    };

    return (
        <TouchableOpacity onPress={onPress} style={styles.cardShadow} className="bg-white rounded-lg mb-4 mx-4">
            <View className="flex-row p-4 items-center">
                <View className="flex-1 pr-4">
                    <Text className="text-gray-800 font-bold text-xl">{displayTableName}</Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={15} color="gray" />
                        <Text className="text-gray-600 text-sm ml-1">{formatTimeElapsed(item.createdAt)}</Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-gray-900 font-bold text-2xl">{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
                    <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full mt-1">
                         <Ionicons name="restaurant" size={16} color="#2E8540" />
                         <Text className="text-green-800 text-xs font-bold ml-1">{item.totalItemCount} món</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ProvisionalBillScreen = () => {
  const navigation = useNavigation<ProvisionalBillScreenNavigationProp>(); 
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [provisionalOrders, setProvisionalOrders] = useState<ProvisionalOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProvisionalOrder | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  // Logic fetch dữ liệu không thay đổi
  const fetchProvisionalOrders = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setLoading(true);
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`id, created_at, order_items(quantity, unit_price), order_tables(tables(id, name))`)
            .eq('status', 'pending')
            .eq('is_provisional', true);
        
        if (error) throw error;
        
        const formattedOrders: ProvisionalOrder[] = data.map(order => {
            const totalPrice = order.order_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
            const totalItemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            const tables = order.order_tables.map((ot: any) => ot.tables).filter(Boolean);
            return {
                orderId: order.id,
                tables: tables,
                totalPrice,
                totalItemCount,
                createdAt: order.created_at,
            };
        }).filter(order => order.tables.length > 0);

        formattedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProvisionalOrders(formattedOrders);
    } catch (err: any) {
        Alert.alert("Lỗi", "Không thể tải danh sách phiếu tạm tính: " + err.message);
    } finally {
        if (isInitialLoad) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!selectedOrder) {
        fetchProvisionalOrders();
    }
  }, [selectedOrder, fetchProvisionalOrders]));

  const handleSelectOrder = async (order: ProvisionalOrder) => {
    setLoading(true);
    setSelectedOrder(order);
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select('quantity, unit_price, customizations')
            .eq('order_id', order.orderId);

        if (error) throw error;
        
        const items: BillItem[] = (data || []).map(item => ({
            name: item.customizations?.name || 'Món đã xóa',
            quantity: item.quantity,
            unit_price: item.unit_price,
            totalPrice: item.quantity * item.unit_price,
        }));
        
        setBillItems(items);
    } catch (error: any) {
        Alert.alert("Lỗi", "Không thể tải chi tiết hóa đơn: " + error.message);
        setSelectedOrder(null);
    } finally {
        setLoading(false);
    }
  };
  
  // Giao diện chi tiết hóa đơn, NAY ĐÃ DÙNG COMPONENT CHUNG
  const BillDetails = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity onPress={() => setSelectedOrder(null)} className="flex-row items-center p-2 -ml-2">
            <Icon name="arrow-back" size={24} color="#333" />
            <Text className="text-lg ml-2 text-gray-700">Danh sách tạm tính</Text>
        </TouchableOpacity>
      </View>

      {/* Dùng ScrollView và component BillContent để hiển thị */}
      {selectedOrder && billItems.length > 0 && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            {/* TRUYỀN PROP `title` VÀO ĐÂY */}
            <BillContent 
                order={selectedOrder} 
                items={billItems} 
                title="PHIẾU TẠM TÍNH" 
            />
        </ScrollView>
      )}
      
      <TouchableOpacity 
            onPress={() => {
                if (selectedOrder && billItems) {
                    navigation.navigate(ROUTES.PRINT_PREVIEW, { 
                        order: selectedOrder, 
                        items: billItems 
                    });
                }
            }}
            className="bg-blue-500 mx-4 mt-6 mb-4 rounded-xl p-4 items-center justify-center flex-row"
      >
            <Icon name="print-outline" size={22} color="white" />
            <Text className="text-white text-lg font-bold ml-2">In phiếu</Text>
      </TouchableOpacity>
    </View>
  );

  // Giao diện chọn order, không thay đổi
  const OrderSelection = () => (
    <FlatList
        data={provisionalOrders}
        keyExtractor={item => item.orderId}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
            <OrderCard item={item} onPress={() => handleSelectOrder(item)} />
        )}
        ListEmptyComponent={
        <View className="flex-1 items-center justify-center mt-20">
            <Icon name="receipt-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center px-10">Chưa có order nào được tạm tính.{"\n"}Vào tab Order và nhấn biểu tượng phiếu in để tạm tính.</Text>
        </View>
        }
    />
  );

  if (loading && !selectedOrder) {
      return (
          <View className="flex-1 justify-center items-center bg-gray-50">
              <ActivityIndicator size="large" />
          </View>
      )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: insets.top + 20 }} className="px-4 pb-3">
        <Text className="text-3xl font-bold text-gray-800">Tạm tính</Text>
      </View>
      {selectedOrder ? <BillDetails /> : <OrderSelection />}
    </View>
  );
};

const styles = StyleSheet.create({ 
    cardShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
});

export default ProvisionalBillScreen;