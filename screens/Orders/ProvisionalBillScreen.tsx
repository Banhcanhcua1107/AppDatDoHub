// --- START OF FILE ProvisionalBillScreen.tsx ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native'; // [FIX] Thêm Alert
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface Table {
    id: number;
    name: string;
}

interface BillItem {
    name: string;
    quantity: number;
    unit_price: number;
    totalPrice: number;
}

const ProvisionalBillScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [tablesWithOrders, setTablesWithOrders] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [totalBill, setTotalBill] = useState(0);

  const fetchServingTables = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tables')
      .select('id, name')
      .in('status', ['Đang phục vụ', 'Đặt trước']); // Lấy cả bàn đang phục vụ và đặt trước
    
    if (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách bàn.");
    } else {
      setTablesWithOrders(data || []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
        if (!selectedTable) {
            fetchServingTables();
        }
    }, [selectedTable, fetchServingTables])
  );

  type MenuItemName = {
      name: string;
  }

  const handleSelectTable = async (table: Table) => {
    setLoading(true);
    setSelectedTable(table);

    try {
        const { data: orders } = await supabase.from('orders').select('id').eq('table_id', table.id).in('status', ['pending', 'paid']);
        const orderIds = orders?.map(o => o.id) || [];

        const [pendingItemsRes, cartItemsRes] = await Promise.all([
            orderIds.length > 0 ? supabase.from('order_items').select('quantity, unit_price, menu_items(name)').in('order_id', orderIds) : Promise.resolve({ data: [], error: null }),
            supabase.from('cart_items').select('quantity, unit_price, customizations').eq('table_id', table.id)
        ]);
        
        if (pendingItemsRes.error) throw pendingItemsRes.error;
        if (cartItemsRes.error) throw cartItemsRes.error;

        // [FIX] Xử lý kiểu dữ liệu an toàn
        const pendingItems: BillItem[] = (pendingItemsRes.data || []).map(item => ({
            // [FIX] Ép kiểu an toàn cho dữ liệu trả về từ Supabase
            name: (item.menu_items as MenuItemName[])?.[0]?.name || 'Món đã xóa',
            quantity: item.quantity,
            unit_price: item.unit_price,
            totalPrice: item.quantity * item.unit_price,
        }));

        const cartItems: BillItem[] = (cartItemsRes.data || []).map(item => ({
            name: item.customizations.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            totalPrice: item.quantity * item.unit_price,
        }));

        const allItems = [...pendingItems, ...cartItems];
        setBillItems(allItems);
        // [FIX] Thêm kiểu cho tham số reduce
        setTotalBill(allItems.reduce((sum: number, item: BillItem) => sum + item.totalPrice, 0));

    } catch (error: any) {
        Alert.alert("Lỗi", "Không thể tải chi tiết hóa đơn cho bàn này.");
        console.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const BillDetails = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity onPress={() => setSelectedTable(null)} className="flex-row items-center p-2 -ml-2">
            <Icon name="arrow-back" size={24} color="#333" />
            <Text className="text-lg ml-2 text-gray-700">Chọn bàn khác</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-2xl mx-4 p-5 flex-1 shadow-lg">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">PHIẾU TẠM TÍNH</Text>
          <Text className="text-lg font-semibold text-center text-gray-600 mb-6">{selectedTable?.name}</Text>
          
          <FlatList
              data={billItems}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({item}) => (
                  <View className="flex-row justify-between items-center py-3 border-b border-dashed border-gray-300">
                      <View className="flex-1 pr-2">
                        <Text className="text-base text-gray-800 font-medium">{item.name}</Text>
                        <Text className="text-sm text-gray-500">{item.quantity} x {item.unit_price.toLocaleString('vi-VN')}đ</Text>
                      </View>
                      <Text className="text-base font-semibold text-gray-900">{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
                  </View>
              )}
          />

          <View className="flex-row justify-between items-center pt-5 mt-auto">
              <Text className="text-xl font-bold text-gray-800">TỔNG CỘNG</Text>
              <Text className="text-2xl font-bold text-blue-600">{totalBill.toLocaleString('vi-VN')}đ</Text>
          </View>
      </View>
      
      <TouchableOpacity className="bg-blue-500 mx-4 mt-6 mb-4 rounded-xl p-4 items-center justify-center flex-row">
            <Icon name="print-outline" size={22} color="white" />
            <Text className="text-white text-lg font-bold ml-2">In phiếu</Text>
      </TouchableOpacity>
    </View>
  );

  const TableSelection = () => (
    <View className="flex-1">
        <FlatList
          data={tablesWithOrders}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectTable(item)} className="w-1/2 p-2">
              <View className="bg-white p-6 rounded-2xl items-center justify-center shadow">
                  <Icon name="tablet-landscape-outline" size={40} color="#4B5563" />
                  <Text className="text-lg font-bold text-gray-800 mt-3">{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
                <Text className="text-gray-500">Không có bàn nào đang phục vụ.</Text>
            </View>
          }
        />
    </View>
  );

  if (loading) {
      return (
          <View className="flex-1 justify-center items-center bg-gray-50">
              <ActivityIndicator size="large" />
          </View>
      )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
        <Text className="text-3xl font-bold text-gray-800">Tạm tính</Text>
      </View>
      {selectedTable ? <BillDetails /> : <TableSelection />}
    </View>
  );
};

export default ProvisionalBillScreen;
// --- END OF FILE ProvisionalBillScreen.tsx ---