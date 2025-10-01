// --- START OF FILE HomeScreen.tsx ---

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Pressable, // Sử dụng Pressable để có onLongPress
  TouchableOpacity,
  ActivityIndicator,
  Alert, // Thêm Alert để hiện thông báo
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabParamList, AppStackParamList, ROUTES } from '../../constants/routes';
import { supabase } from '../../services/supabase';
import OrderInfoBox from '../Menu/OrderInfoBox'; // Giữ nguyên import này
// --- KIỂU DỮ LIỆU ---
type TableStatus = 'Trống' | 'Đang phục vụ' | 'Đặt trước';
type TableItemData = {
  id: string;
  name: string;
  status: TableStatus;
};

// --- COMPONENT CHÚ THÍCH ---
const StatusLegend: React.FC<{ color: string; text: string }> = ({ color, text }) => (
    <View className="flex-row items-center mr-5">
      <View style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm mr-2" />
      <Text className="text-gray-600">{text}</Text>
    </View>
);

// --- COMPONENT Ô BÀN (CẬP NHẬT ĐỂ NHẬN onLongPress) ---
const TableGridItem: React.FC<{ 
  item: TableItemData; onPress: () => void; onLongPress: () => void;
}> = ({ item, onPress, onLongPress }) => {
  const getStatusTheme = () => {
    switch (item.status) {
      case 'Trống': return { color: '#3B82F6', textColor: 'text-blue-500' };
      case 'Đang phục vụ': return { color: '#4B5563', textColor: 'text-slate-600' };
      case 'Đặt trước': return { color: '#4338CA', textColor: 'text-indigo-600' };
      default: return { color: '#A1A1AA', textColor: 'text-zinc-400' };
    }
  };


  const theme = getStatusTheme();
  return (
    <View className="w-1/2 p-2">
      <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
        <View className="bg-white rounded-2xl p-4 flex-row items-center" style={styleSheet.shadow}>
          <Icon name="tablet-landscape-outline" size={30} color={theme.color} />
          <View className="ml-3 flex-1"><Text className="text-base font-bold text-gray-800">{item.name}</Text><Text className={`text-sm font-semibold ${theme.textColor}`}>{item.status}</Text></View>
        </View>
      </Pressable>
    </View>
  );
};

// --- PROPS MÀN HÌNH ---
type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, typeof ROUTES.HOME_TAB>,
  NativeStackScreenProps<AppStackParamList>
>;

// --- COMPONENT TOÀN BỘ MÀN HÌNH ---
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [tables, setTables] = React.useState<TableItemData[]>([]);
  const [loading, setLoading] = React.useState(true);


  const [isBoxVisible, setBoxVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{id: string, name: string} | null>(null);
  // Hàm lấy danh sách bàn từ Supabase
  const fetchTables = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('id, name, status')
      .order('id', { ascending: true });

    if (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách bàn.");
      console.error('Lỗi lấy danh sách bàn:', error.message);
    } else if (data) {
      setTables(data.map(item => ({...item, id: String(item.id)})));
    }
    
    if (loading) setLoading(false);
  }, [loading]);

  // Lắng nghe sự kiện và fetch dữ liệu khi vào màn hình
  useFocusEffect(
    React.useCallback(() => {
      fetchTables();
      const channel = supabase
        .channel('public:tables')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => fetchTables())
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    }, [fetchTables])
  );

  // Hàm thêm bàn mới
  const handleAddTable = async () => {
    const lastTableNumber = tables.reduce((max, table) => {
        const num = parseInt(table.name.replace('Bàn ', ''));
        return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newTableName = `Bàn ${String(lastTableNumber + 1).padStart(2, '0')}`;

    const { error } = await supabase.from('tables').insert([{ name: newTableName, status: 'Trống' }]);
    if (error) Alert.alert("Lỗi", "Không thể thêm bàn mới.");
  };
  
  // --- [MỚI] Hàm xử lý khi nhấn vào bàn ---
  const handlePressTable = (table: TableItemData) => {
    if (table.status === 'Trống') {
      navigation.navigate(ROUTES.MENU, { tableId: table.id, tableName: table.name });
    } 
    else if (table.status === 'Đang phục vụ') {
      // Mở OrderInfoBox
      setSelectedTable({ id: table.id, name: table.name });
      setBoxVisible(true);
    }
    else if (table.status === 'Đặt trước') {
        Alert.alert(`Bàn ${table.name} đã được đặt`, "Hành động?",
            [ { text: "Hủy" }, { text: "Hủy đặt", style: 'destructive', onPress: () => updateTableStatus(table.id, 'Trống') }, { text: "Bắt đầu phục vụ", onPress: () => navigation.navigate(ROUTES.MENU, { tableId: table.id, tableName: table.name }) }]
        );
    }
  };

  // --- [MỚI] Hàm xử lý khi nhấn giữ vào bàn ---
  const handleLongPressTable = (table: TableItemData) => {
    if (table.status === 'Trống') {
      Alert.alert(
        `Tùy chọn cho ${table.name}`,
        "Chọn một hành động:",
        [
          { text: "Hủy" },
          { text: "Tạo Order", onPress: () => navigation.navigate(ROUTES.MENU, { tableId: table.id, tableName: table.name }) },
          { text: "Đặt trước", onPress: () => updateTableStatus(table.id, 'Đặt trước') }
        ]
      );
    }
  };

  // --- [MỚI] Hàm chung để cập nhật trạng thái bàn ---
  const updateTableStatus = async (tableId: string, status: TableStatus) => {
    const { error } = await supabase
      .from('tables')
      .update({ status: status })
      .eq('id', tableId);

    if (error) Alert.alert("Lỗi", `Không thể cập nhật trạng thái bàn thành "${status}".`);
  };
  const handleOrderAction = (action: string, data?: any) => {
    setBoxVisible(false); // Đóng box sau khi chọn
    console.log(`Action: ${action}, Data:`, data);
    
    // Điều hướng hoặc xử lý logic dựa trên action
    if (action === 'go_to_payment' || action === 'go_to_order_details') {
        navigation.navigate(ROUTES.ORDER_CONFIRMATION, { tableId: data.tableId, tableName: data.tableName });
    }
    else if (action === 'cancel_order') {
        Alert.alert("Xác nhận", `Bạn có chắc muốn hủy toàn bộ order của bàn ${data.tableName}?`, [
            { text: "Không" },
            { text: "Đồng ý", style: "destructive", onPress: () => { /* Logic hủy order ở đây */ } }
        ]);
    }
    // ... Thêm các xử lý khác cho chuyển bàn, ghép order...
    else {
        Alert.alert("Thông báo", `Chức năng "${action}" đang được phát triển.`);
    }
  };

  // Giao diện loading
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

   return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 20 }} className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Quản lý bàn</Text>
            <Text className="text-base text-gray-500">Nhấn để order, nhấn giữ để đặt bàn</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center" style={styleSheet.menuButtonShadow}>
            <Icon name="menu" size={26} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Chú thích */}
      <View className="flex-row justify-start px-5 py-3">
        <StatusLegend color="#3B82F6" text="Trống" />
        <StatusLegend color="#4B5563" text="Phục vụ" />
        <StatusLegend color="#4338CA" text="Đặt trước" />
      </View>

      {/* Lưới các bàn */}
      <FlatList
        data={tables}
        renderItem={({ item }) => (
          <TableGridItem
            item={item}
            onPress={() => handlePressTable(item)}
            onLongPress={() => handleLongPressTable(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
      />

      {/* Nút thêm bàn mới */}
      <TouchableOpacity
        style={[styleSheet.fab, { bottom: insets.bottom > 0 ? insets.bottom + 10 : 20 }]}
        onPress={handleAddTable}
      >
        <Icon name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* --- [MỚI] Tích hợp OrderInfoBox --- */}
      {/* Component này chỉ render khi selectedTable có dữ liệu */}
      {selectedTable && (
        <OrderInfoBox
          isVisible={isBoxVisible}
          onClose={() => setBoxVisible(false)}
          tableId={selectedTable.id}
          tableName={selectedTable.name}
          onActionPress={handleOrderAction}
        />
      )}
    </View>
  );
};

const styleSheet = StyleSheet.create({
  shadow: {
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  menuButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});

export default HomeScreen;