// screens/Kitchen/KitchenDisplayScreen.tsx
import React, { useState, useEffect, useCallback } from 'react'; // [SỬA LỖI] Đã xóa chữ 'a,' thừa
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';

// Định nghĩa kiểu dữ liệu cho một món trong phiếu
interface KitchenItem {
  id: number;
  name: string;
  quantity: number;
  note: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

// Định nghĩa kiểu dữ liệu cho một phiếu order
interface OrderTicket {
  order_id: string;
  table_name: string;
  created_at: string;
  items: KitchenItem[];
}

// ---- COMPONENT CON: HIỂN THỊ MỘT MÓN ĂN ----
const KitchenOrderItem: React.FC<{
  item: KitchenItem;
  onStatusChange: () => void;
}> = ({ item, onStatusChange }) => {
  const getStatusStyle = () => {
    switch (item.status) {
      case 'in_progress':
        return { container: 'bg-orange-100', icon: 'flame', color: '#F97316' };
      case 'completed':
        return { container: 'bg-green-100', icon: 'checkmark-done', color: '#10B981' };
      case 'pending':
      default:
        return { container: 'bg-white', icon: 'ellipse-outline', color: '#6B7280' };
    }
  };

  const { container, icon, color } = getStatusStyle();
  const isCompleted = item.status === 'completed';

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onStatusChange}
      disabled={isCompleted}
    >
      <View className={`flex-1 flex-row items-start p-3 rounded-lg ${container}`}>
        <Text style={[styles.itemQuantity, { color: color }]}>{item.quantity}x</Text>
        <View className="flex-1 ml-3">
          <Text
            style={[styles.itemName, isCompleted && styles.itemCompletedText]}
          >
            {item.name}
          </Text>
          {item.note && (
            <View className="bg-yellow-100 p-2 rounded-md mt-1">
              <Text className="text-yellow-800 italic">Ghi chú: {item.note}</Text>
            </View>
          )}
        </View>
        <Icon name={icon} size={24} color={color} />
      </View>
    </TouchableOpacity>
  );
};

// ---- COMPONENT CON: HIỂN THỊ MỘT PHIẾU ORDER ----
const OrderTicketCard: React.FC<{
  ticket: OrderTicket;
  onUpdateItemStatus: (itemId: number, newStatus: KitchenItem['status']) => void;
}> = ({ ticket, onUpdateItemStatus }) => {
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const createTime = new Date(ticket.created_at);
      const diffMinutes = Math.floor((now.getTime() - createTime.getTime()) / 60000);
      setElapsedTime(`${diffMinutes} phút`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 30000); // Cập nhật mỗi 30 giây

    return () => clearInterval(timerInterval);
  }, [ticket.created_at]);

  const handleItemPress = (item: KitchenItem) => {
    let newStatus: KitchenItem['status'] = 'in_progress';
    if (item.status === 'pending') {
      newStatus = 'in_progress';
    } else if (item.status === 'in_progress') {
      newStatus = 'completed';
    }
    onUpdateItemStatus(item.id, newStatus);
  };

  return (
    <View style={styles.ticketCard}>
      {/* Header của phiếu */}
      <View style={styles.ticketHeader}>
        <View className="flex-row items-center">
          <Icon name="receipt-outline" size={28} color="#1E3A8A" />
          <Text style={styles.tableName}>{ticket.table_name}</Text>
        </View>
        <View className="flex-row items-center bg-blue-100 px-3 py-1 rounded-full">
          <Icon name="time-outline" size={16} color="#1E40AF" />
          <Text style={styles.timerText}>{elapsedTime}</Text>
        </View>
      </View>

      {/* Danh sách các món */}
      <View style={styles.itemsList}>
        {ticket.items.map((item) => (
          <KitchenOrderItem
            key={item.id}
            item={item}
            onStatusChange={() => handleItemPress(item)}
          />
        ))}
      </View>
    </View>
  );
};


// ---- COMPONENT CHÍNH: MÀN HÌNH KDS ----
const KitchenDisplayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderTicket[]>([]);

  const fetchKitchenOrders = useCallback(async () => {
    console.log('Fetching kitchen orders...');
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          customizations,
          status,
          orders (
            id,
            created_at,
            order_tables (
              tables (
                name
              )
            )
          )
        `)
        .in('status', ['pending', 'in_progress']) // Chỉ lấy món đang chờ hoặc đang làm
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;

      // Gom nhóm các món theo order_id
      const groupedOrders = data.reduce((acc, item: any) => { // Thêm kiểu 'any' để xử lý nhanh
        const orderId = item.orders?.id;
        if (!orderId) return acc;

        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            table_name: item.orders.order_tables[0]?.tables?.name || 'Bàn không xác định',
            created_at: item.orders.created_at,
            items: [],
          };
        }

        acc[orderId].items.push({
          id: item.id,
          name: item.customizations.name,
          quantity: item.quantity,
          note: item.customizations.note || null,
          status: item.status as KitchenItem['status'],
        });

        return acc;
      }, {} as Record<string, OrderTicket>);

      setOrders(Object.values(groupedOrders));

    } catch (err: any) {
      console.error('Error fetching kitchen orders:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sử dụng useFocusEffect để fetch dữ liệu và đăng ký real-time
  useFocusEffect(
    useCallback(() => {
      fetchKitchenOrders();

      const channel = supabase
        .channel('public:order_items:kitchen')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            console.log('Change received!', payload);
            // Khi có bất kỳ thay đổi nào (món mới, cập nhật trạng thái), fetch lại toàn bộ
            fetchKitchenOrders();
          }
        )
        .subscribe();

      // Dọn dẹp khi màn hình un-focus
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchKitchenOrders])
  );
  
  // Hàm cập nhật trạng thái món ăn
  const handleUpdateItemStatus = async (itemId: number, newStatus: KitchenItem['status']) => {
    try {
        const { error } = await supabase
            .from('order_items')
            .update({ status: newStatus })
            .eq('id', itemId);
        if (error) throw error;
        // Giao diện sẽ tự cập nhật nhờ Supabase Realtime, không cần gọi fetch lại ở đây
    } catch (err: any) {
        console.error("Error updating item status:", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Đang tải danh sách món...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.header}>
        <Icon name="restaurant" size={24} color="white" />
        <Text style={styles.headerTitle}>Bếp & Bar</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
            <OrderTicketCard ticket={item} onUpdateItemStatus={handleUpdateItemStatus}/>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Icon name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Tuyệt vời! Không có món nào đang chờ.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Màu nền xám nhạt
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4B5563',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A', // Màu xanh navy đậm
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  listContainer: {
    padding: 8,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 6,
  },
  itemsList: {
    padding: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemQuantity: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flexWrap: 'wrap',
  },
  itemCompletedText: {
      textDecorationLine: 'line-through',
      color: '#6B7280'
  },
});

export default KitchenDisplayScreen;