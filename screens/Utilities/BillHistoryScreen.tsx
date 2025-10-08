// screens/History/BillHistoryScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../services/supabase';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import BillContent from '../../components/BillContent';
import { BillItem, ProvisionalOrder } from '../Orders/ProvisionalBillScreen'; // Tái sử dụng type

// Định nghĩa kiểu cho navigation
type BillHistoryNavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Component Card hiển thị Bill (tương tự OrderCard nhưng có chỉnh sửa)
const BillCard: React.FC<{ item: ProvisionalOrder; onPress: () => void }> = ({
  item,
  onPress,
}) => {
  const displayTableName = item.tables.map((t) => t.name).join(', ');
  
  // Format ngày tháng cho lịch sử
  const formatPaymentTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.cardShadow}
      className="bg-white rounded-lg mb-4 mx-4"
    >
      <View className="flex-row p-4 items-center">
        <View className="flex-1 pr-4">
          <Text className="text-gray-800 font-bold text-xl">{displayTableName}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={15} color="gray" />
            <Text className="text-gray-600 text-sm ml-1">{formatPaymentTime(item.createdAt)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-gray-900 font-bold text-2xl">
            {item.totalPrice.toLocaleString('vi-VN')}đ
          </Text>
          <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full mt-1">
            <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
            <Text className="text-blue-800 text-xs font-bold ml-1">{item.totalItemCount} món</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BillHistoryScreen = () => {
  const navigation = useNavigation<BillHistoryNavigationProp>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [completedBills, setCompletedBills] = useState<ProvisionalOrder[]>([]);
  const [selectedBill, setSelectedBill] = useState<ProvisionalOrder | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  const fetchBillHistory = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          updated_at,
          total_price,
          order_items(quantity, unit_price, customizations, returned_quantity, menu_items(name)), 
          order_tables(tables(id, name))
        `)
        .in('status', ['paid', 'closed']) // Lấy các hóa đơn đã thanh toán hoặc đã đóng
        .order('updated_at', { ascending: false }); // Sắp xếp theo ngày thanh toán gần nhất

      if (error) throw error;

      const formattedBills: ProvisionalOrder[] = data
        .map((order) => {
          const totalItemCount = order.order_items.reduce(
              (sum, item) => sum + (item.quantity - item.returned_quantity),
              0
          );
          const tables = order.order_tables.map((ot: any) => ot.tables).filter(Boolean);
          
          return {
            orderId: order.id,
            tables: tables,
            totalPrice: order.total_price || 0, // Dùng total_price đã lưu khi thanh toán
            totalItemCount,
            createdAt: order.updated_at, // Dùng updated_at làm thời gian thanh toán
          };
        })
        .filter((order) => order.totalItemCount > 0 && order.totalPrice > 0);

      setCompletedBills(formattedBills);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải lịch sử hóa đơn: ' + err.message);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Chỉ fetch lại danh sách khi quay về màn hình danh sách
      if (!selectedBill) {
        fetchBillHistory();
      }
    }, [selectedBill, fetchBillHistory])
  );

  const handleSelectBill = async (bill: ProvisionalOrder) => {
    setLoading(true);
    setSelectedBill(bill);
    try {
      // --- [SỬA ĐỔI CÂU TRUY VẤN] ---
      // Lấy trực tiếp `name` từ `menu_items` để làm phẳng cấu trúc
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, unit_price, customizations, returned_quantity, menu_items ( name )') // Sửa đổi tại đây
        .eq('order_id', bill.orderId);

      if (error) throw error;

      const items: BillItem[] = (data || [])
        .map((item) => {
            const finalQuantity = item.quantity - item.returned_quantity;
            if (finalQuantity <= 0) return null;
            const menuItemsArray = item.menu_items as { name: string }[] | null;
            const itemName = menuItemsArray?.[0]?.name || item.customizations?.name || 'Món đã xóa';

            return {
                name: itemName,
                quantity: finalQuantity,
                unit_price: item.unit_price,
                totalPrice: finalQuantity * item.unit_price,
            };
        })
        .filter((item): item is BillItem => item !== null);

      setBillItems(items);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết hóa đơn: ' + error.message);
      setSelectedBill(null);
    } finally {
      setLoading(false);
    }
  };

  // Giao diện chi tiết hóa đơn
  const BillDetails = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => setSelectedBill(null)}
          className="flex-row items-center p-2 -ml-2"
        >
          <Icon name="arrow-back" size={24} color="#333" />
          <Text className="text-lg ml-2 text-gray-700">Lịch sử hóa đơn</Text>
        </TouchableOpacity>
      </View>

      {selectedBill && billItems.length > 0 && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        >
          <BillContent order={selectedBill} items={billItems} title="CHI TIẾT HÓA ĐƠN" />
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => {
          if (selectedBill && billItems) {
            navigation.navigate(ROUTES.PRINT_PREVIEW, {
              order: selectedBill,
              items: billItems,
            });
          }
        }}
        className="bg-blue-500 mx-4 mt-6 mb-4 rounded-xl p-4 items-center justify-center flex-row"
      >
        <Icon name="print-outline" size={22} color="white" />
        <Text className="text-white text-lg font-bold ml-2">In lại phiếu</Text>
      </TouchableOpacity>
    </View>
  );

  // Giao diện chọn hóa đơn
  const BillSelection = () => (
    <FlatList
      data={completedBills}
      keyExtractor={(item) => item.orderId}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      renderItem={({ item }) => <BillCard item={item} onPress={() => handleSelectBill(item)} />}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center mt-20">
          <Icon name="archive-outline" size={60} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4 text-center px-10">
            Chưa có hóa đơn nào được thanh toán.
          </Text>
        </View>
      }
    />
  );

  if (loading && !completedBills.length) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: insets.top + 20 }} className="px-4 pb-3">
        <Text className="text-3xl font-bold text-gray-800">Lịch sử hóa đơn</Text>
      </View>
      {selectedBill ? <BillDetails /> : <BillSelection />}
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default BillHistoryScreen;