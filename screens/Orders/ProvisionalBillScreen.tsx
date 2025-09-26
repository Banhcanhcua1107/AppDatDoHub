import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrders } from '../../context/OrderContext';

// Dữ liệu bàn mẫu - TRONG DỰ ÁN THỰC TẾ, BẠN NÊN LẤY TỪ MỘT FILE CHUNG
const tableData: { id: string; name: string }[] = [
  { id: '1', name: 'Bàn 01' }, { id: '2', name: 'Bàn 02' },
  { id: '3', name: 'Bàn 03' }, { id: '4', name: 'Bàn 04' },
  { id: '5', name: 'Bàn 05' }, { id: '6', name: 'Bàn 06' },
  { id: '7', name: 'Bàn 07' }, { id: '8', name: 'Bàn 08' },
];

const ProvisionalBillScreen = () => {
  const insets = useSafeAreaInsets();
  const { orders } = useOrders(); // Lấy toàn bộ order từ context
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Lọc ra những bàn đang có order để hiển thị
  const tablesWithOrders = tableData.filter(table => orders[table.id] && orders[table.id].length > 0);

  const selectedOrder = selectedTableId ? orders[selectedTableId] : [];
  const selectedTable = selectedTableId ? tableData.find(t => t.id === selectedTableId) : null;
  const totalBill = selectedOrder.reduce((sum, item) => sum + item.totalPrice, 0);

  // --- COMPONENT CON ---
  const BillDetails = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity onPress={() => setSelectedTableId(null)} className="flex-row items-center p-2 -ml-2">
            <Icon name="arrow-back" size={24} color="#333" />
            <Text className="text-lg ml-2 text-gray-700">Chọn bàn khác</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin hóa đơn */}
      <View className="bg-white rounded-2xl mx-4 p-5 flex-1 shadow-lg">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">PHIẾU TẠM TÍNH</Text>
          <Text className="text-lg font-semibold text-center text-gray-600 mb-6">{selectedTable?.name}</Text>
          
          <FlatList
              data={selectedOrder}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                  <View className="flex-row justify-between items-center py-3 border-b border-dashed border-gray-300">
                      <View className="flex-1 pr-2">
                        <Text className="text-base text-gray-800 font-medium">{item.name}</Text>
                        <Text className="text-sm text-gray-500">{item.quantity} x { (item.totalPrice / item.quantity).toLocaleString('vi-VN') }đ</Text>
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
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => setSelectedTableId(item.id)} 
                className="w-1/2 p-2"
            >
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


  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
        <Text className="text-3xl font-bold text-gray-800">Tạm tính</Text>
      </View>

      {selectedTableId ? <BillDetails /> : <TableSelection />}

    </View>
  );
};

export default ProvisionalBillScreen;