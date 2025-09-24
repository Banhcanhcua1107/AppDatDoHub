import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes'; 
import Icon from 'react-native-vector-icons/Ionicons';

// --- DỮ LIỆU MẪU (Thêm một trạng thái mới để demo bộ lọc) ---
type TableStatus = 'đang sử dụng' | 'bàn trống' | 'chưa dọn';
type PaymentStatus = 'Chưa thanh toán' | 'Đã thanh toán' | 'rỗng';
type TableItemData = { id: string; name: string; status: TableStatus; paymentStatus: PaymentStatus; };

const tableData: TableItemData[] = [ 
  { id: '1', name: 'Bàn 01', status: 'đang sử dụng', paymentStatus: 'Chưa thanh toán' }, 
  { id: '2', name: 'Bàn 02', status: 'bàn trống', paymentStatus: 'rỗng' }, 
  { id: '3', name: 'Bàn 03', status: 'chưa dọn', paymentStatus: 'Đã thanh toán' },
  { id: '4', name: 'Bàn 04', status: 'bàn trống', paymentStatus: 'rỗng' }, 
  { id: '5', name: 'Bàn 05', status: 'đang sử dụng', paymentStatus: 'Chưa thanh toán' }, 
  { id: '6', name: 'Bàn 06', status: 'đang sử dụng', paymentStatus: 'Đã thanh toán' },
];

// --- [MỚI] Component chỉ báo trạng thái bằng màu sắc ---
const StatusIndicator: React.FC<{ status: TableStatus }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'bàn trống': return 'bg-green-500';
      case 'đang sử dụng': return 'bg-orange-500';
      case 'chưa dọn': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  return <View className={`w-3 h-3 rounded-full ${getStatusColor()}`} />;
};

// --- [THIẾT KẾ LẠI] Component Card thông tin bàn ---
const TableItem: React.FC<{ item: TableItemData }> = ({ item }) => {
  const getPaymentInfo = () => {
    switch (item.paymentStatus) {
      case 'Chưa thanh toán': 
        return { text: 'Chưa thanh toán', color: 'text-red-600', bg: 'bg-red-100' };
      case 'Đã thanh toán': 
        return { text: 'Đã thanh toán', color: 'text-green-600', bg: 'bg-green-100' };
      default: 
        return null;
    }
  };

  const paymentInfo = getPaymentInfo();

  return (
    <TouchableOpacity style={styles.shadow} className="bg-white rounded-2xl mx-4 mb-4 p-4 flex-row items-center">
      {/* Icon */}
      <View className="w-14 h-14 bg-blue-100 rounded-xl items-center justify-center mr-4">
        <Icon name="tablet-landscape-outline" size={30} color="#3461FD" />
      </View>
      
      {/* Thông tin chính */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500 mt-1 capitalize">{item.status}</Text>
        {paymentInfo && (
          <View className={`mt-2 self-start px-2 py-1 rounded-full flex-row items-center ${paymentInfo.bg}`}>
            <Icon name="cash-outline" size={14} color={paymentInfo.color.replace('text-', '')} />
            <Text className={`text-xs font-semibold ml-1 ${paymentInfo.color}`}>{paymentInfo.text}</Text>
          </View>
        )}
      </View>
      
      {/* Chỉ báo trạng thái và mũi tên */}
      <View className="items-center ml-2">
        <StatusIndicator status={item.status} />
        <Icon name="chevron-forward-outline" size={24} color="#CBD5E0" className="mt-4" />
      </View>
    </TouchableOpacity>
  );
};

// --- [MỚI] Component nút lọc ---
const FilterButton: React.FC<{ label: string; isActive: boolean; onPress: () => void }> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
  >
    <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
  </TouchableOpacity>
);

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

// --- [THIẾT KẾ LẠI] Toàn bộ màn hình chính ---
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'Tất cả'>('Tất cả');

  const filteredData = activeFilter === 'Tất cả' 
    ? tableData 
    : tableData.filter(item => item.status === activeFilter);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top, paddingBottom: 10, backgroundColor: '#F8F9FA' }} className="px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">Danh sách bàn</Text>
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center" style={styles.shadow}>
              <Icon name="menu" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Bộ lọc */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <FilterButton label="Tất cả" isActive={activeFilter === 'Tất cả'} onPress={() => setActiveFilter('Tất cả')} />
          <FilterButton label="Bàn trống" isActive={activeFilter === 'bàn trống'} onPress={() => setActiveFilter('bàn trống')} />
          <FilterButton label="Đang sử dụng" isActive={activeFilter === 'đang sử dụng'} onPress={() => setActiveFilter('đang sử dụng')} />
          <FilterButton label="Chưa dọn" isActive={activeFilter === 'chưa dọn'} onPress={() => setActiveFilter('chưa dọn')} />
        </ScrollView>
      </View>

      {/* Danh sách bàn */}
      <ScrollView>
          <View className="h-4" /> 
          {filteredData.map(table => (
              <TableItem key={table.id} item={table} />
          ))}
          <View className="h-4" /> 
      </ScrollView>
    </View>
  );
};

// --- [CẬP NHẬT] Style cho bóng đổ mềm mại hơn ---
const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    }
});

export default HomeScreen;