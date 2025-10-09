// screens/Kitchen/KitchenDisplayScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert, // Thêm Alert để báo lỗi
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

// [QUAN TRỌNG] THAY THẾ CÁC GIÁ TRỊ NÀY BẰNG GIÁ TRỊ ENUM THỰC TẾ TRONG DATABASE CỦA BẠN
const STATUS = {
  PENDING: 'pending',        // Sửa 'CHO_DOI' thành 'pending'
  IN_PROGRESS: 'in_progress',   // Sửa 'DANG_LAM' thành 'in_progress'
  COMPLETED: 'completed',     // Sửa 'HOAN_THANH' thành 'completed'
};

// Định nghĩa lại kiểu dữ liệu để sử dụng các giá trị từ object STATUS
type KitchenItemStatus = typeof STATUS[keyof typeof STATUS];

interface KitchenItem {
  id: number;
  name: string;
  quantity: number;
  note: string | null;
  status: KitchenItemStatus;
}

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

  // [SỬA LỖI] Khai báo kiểu tường minh cho tên icon
  type IconName = React.ComponentProps<typeof Ionicons>['name'];

  const getStatusStyle = (): { containerStyle: any; icon: IconName; color: string } => {
    switch (item.status) {
      case STATUS.IN_PROGRESS:
        return { containerStyle: styles.itemInProgress, icon: 'flame', color: '#F97316' };
      case STATUS.COMPLETED:
        return { containerStyle: styles.itemCompleted, icon: 'checkmark-done', color: '#10B981' };
      case STATUS.PENDING:
      default:
        return { containerStyle: styles.itemPending, icon: 'ellipse-outline', color: '#6B7280' };
    }
  };

  const { containerStyle, icon, color } = getStatusStyle();
  const isCompleted = item.status === STATUS.COMPLETED;

  return (
    <TouchableOpacity
      style={styles.itemContainerTouchable}
      onPress={onStatusChange}
      disabled={isCompleted}
    >
      <View style={[styles.itemContainer, containerStyle]}>
        <Text style={[styles.itemQuantity, { color: color }]}>{item.quantity}x</Text>
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, isCompleted && styles.itemCompletedText]}>
            {item.name}
          </Text>
          {item.note && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>Ghi chú: {item.note}</Text>
            </View>
          )}
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </TouchableOpacity>
  );
};

// ---- COMPONENT CON: HIỂN THỊ MỘT PHIẾU ORDER ----
const OrderTicketCard: React.FC<{
  ticket: OrderTicket;
  onUpdateItemStatus: (itemId: number, newStatus: KitchenItemStatus) => void;
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
    const timerInterval = setInterval(updateTimer, 30000);
    return () => clearInterval(timerInterval);
  }, [ticket.created_at]);

  const handleItemPress = (item: KitchenItem) => {
    let newStatus: KitchenItemStatus = STATUS.IN_PROGRESS;
    if (item.status === STATUS.PENDING) {
      newStatus = STATUS.IN_PROGRESS;
    } else if (item.status === STATUS.IN_PROGRESS) {
      newStatus = STATUS.COMPLETED;
    }
    onUpdateItemStatus(item.id, newStatus);
  };

  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.tableNameContainer}>
          <Ionicons name="receipt-outline" size={28} color="#1E3A8A" />
          <Text style={styles.tableName}>{ticket.table_name}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={16} color="#1E40AF" />
          <Text style={styles.timerText}>{elapsedTime}</Text>
        </View>
      </View>
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
          id, quantity, customizations, status,
          orders ( id, created_at, order_tables ( tables ( name ) ) )
        `)
        // [SỬA LỖI Ở ĐÂY] Sử dụng các giá trị trạng thái đã định nghĩa
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS])
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;

      const groupedOrders = data.reduce((acc, item: any) => {
        const orderId = item.orders?.id;
        if (!orderId) return acc;

        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            table_name: item.orders.order_tables[0]?.tables?.name || 'Mang về',
            created_at: item.orders.created_at,
            items: [],
          };
        }
        acc[orderId].items.push({
          id: item.id,
          name: item.customizations.name,
          quantity: item.quantity,
          note: item.customizations.note || null,
          status: item.status as KitchenItemStatus,
        });
        return acc;
      }, {} as Record<string, OrderTicket>);

      setOrders(Object.values(groupedOrders));
    } catch (err: any) {
      console.error('Error fetching kitchen orders:', err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách món: " + err.message); // Hiển thị lỗi cho người dùng
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchKitchenOrders();
      const channel = supabase
        .channel('public:order_items:kitchen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            console.log('Change received!', payload);
            fetchKitchenOrders();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchKitchenOrders])
  );
  
  const handleUpdateItemStatus = async (itemId: number, newStatus: KitchenItemStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error updating item status:", err.message);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái món: " + err.message);
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
        <Ionicons name="restaurant" size={24} color="white" />
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
            <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Tuyệt vời! Không có món nào đang chờ.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// --- [CẬP NHẬT] Tách style ra để dễ quản lý hơn ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  listContainer: { padding: 8 },
  ticketCard: { backgroundColor: 'white', borderRadius: 12, margin: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableNameContainer: { flexDirection: 'row', alignItems: 'center' },
  tableName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginLeft: 8 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  timerText: { fontSize: 14, fontWeight: '600', color: '#3730A3', marginLeft: 6 },
  itemsList: { padding: 8 },
  itemContainerTouchable: { marginVertical: 4 },
  itemContainer: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 8 },
  itemPending: { backgroundColor: 'white' },
  itemInProgress: { backgroundColor: '#FFEDD5' }, // bg-orange-100
  itemCompleted: { backgroundColor: '#D1FAE5' }, // bg-green-100
  itemQuantity: { fontSize: 20, fontWeight: 'bold', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: '600', color: '#1F2937', flexWrap: 'wrap' },
  itemCompletedText: { textDecorationLine: 'line-through', color: '#6B7280' },
  noteContainer: { backgroundColor: '#FEF3C7', padding: 8, borderRadius: 6, marginTop: 4 },
  noteText: { color: '#92400E', fontStyle: 'italic' },
});

export default KitchenDisplayScreen;