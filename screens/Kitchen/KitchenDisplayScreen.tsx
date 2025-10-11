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
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // Đường dẫn có thể cần điều chỉnh

type KitchenDisplayNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

// Sử dụng các giá trị enum đã xác thực từ database
const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served'
};

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
  total_items: number;
}

// ---- COMPONENT CON (Giữ nguyên) ----
const KitchenOrderItem: React.FC<{
  item: KitchenItem;
  onStatusChange: (itemId: number, currentStatus: KitchenItemStatus) => void;
}> = ({ item, onStatusChange }) => {
  type IconName = React.ComponentProps<typeof Ionicons>['name'];

  const getStatusStyle = (): { icon: IconName; color: string; textStyle: any } => {
    switch (item.status) {
      case STATUS.IN_PROGRESS:
        return { icon: 'flame-outline', color: '#F97316', textStyle: styles.itemTextInProgress };
      case STATUS.COMPLETED:
      case STATUS.SERVED:
        return { icon: 'checkmark-circle-outline', color: '#10B981', textStyle: styles.itemTextCompleted };
      case STATUS.PENDING:
      default:
        return { icon: 'ellipse-outline', color: '#6B7280', textStyle: {} };
    }
  };

  const { icon, color, textStyle } = getStatusStyle();
  const isCompleted = item.status === STATUS.COMPLETED || item.status === STATUS.SERVED;

  return (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => onStatusChange(item.id, item.status)}
      disabled={isCompleted}
    >
      <Text style={styles.itemQuantity}>{item.quantity}x</Text>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, textStyle]}>{item.name}</Text>
        {item.note && <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>}
      </View>
      <Ionicons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
};


// ---- [CẬP NHẬT] COMPONENT ORDER TICKET ----
const OrderTicketCard: React.FC<{
  ticket: OrderTicket;
  onUpdateItemStatus: (itemId: number, currentStatus: KitchenItemStatus) => void;
  onCompleteAll: (items: KitchenItem[]) => void;
  onNavigate: () => void;
}> = ({ ticket, onUpdateItemStatus, onCompleteAll, onNavigate }) => {
  const [elapsedTime, setElapsedTime] = useState('');
  const [isLoadingAll, setIsLoadingAll] = useState(false);

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

  const handleCompleteAll = async () => {
    setIsLoadingAll(true);
    await onCompleteAll(ticket.items);
    setIsLoadingAll(false);
  }

  const areAllItemsCompleted = ticket.items.every(
    item => item.status === STATUS.COMPLETED || item.status === STATUS.SERVED
  );

  return (
    // TouchableOpacity này bao bọc toàn bộ thẻ để điều hướng
    <TouchableOpacity onPress={onNavigate} activeOpacity={0.8}>
      <View style={styles.cardShadow}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <Ionicons name="receipt-outline" size={20} color="white" />
            <Text style={styles.cardTableName}>{ticket.table_name}</Text>
          </View>
          <Text style={styles.cardItemCount}>{ticket.total_items} món</Text>
        </View>
        <View style={styles.cardBody}>
          {ticket.items.map((item) => (
            <KitchenOrderItem key={item.id} item={item} onStatusChange={onUpdateItemStatus} />
          ))}
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerTimer}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.footerTimerText}>{elapsedTime}</Text>
          </View>
          {/* [ĐÂY LÀ THAY ĐỔI] */}
          {/* Bọc nút "Hoàn thành" trong một View và thêm hàm inline vào onPress */}
          {/* để ngăn sự kiện click lan ra ngoài, tránh việc điều hướng ngoài ý muốn. */}
          <TouchableOpacity
            style={[styles.completeAllButton, areAllItemsCompleted && styles.disabledButton]}
            onPress={(e) => {
              e.stopPropagation(); // Dừng sự kiện tại đây
              handleCompleteAll();
            }}
            disabled={areAllItemsCompleted || isLoadingAll}
          >
            {isLoadingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark-done-outline" size={20} color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.completeAllButtonText}>Hoàn thành tất cả</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


// ---- COMPONENT CHÍNH: MÀN HÌNH KDS (Giữ nguyên)----
const KitchenDisplayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const navigation = useNavigation<KitchenDisplayNavigationProp>();

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id, quantity, customizations, status,
          orders ( id, created_at, order_tables ( tables ( name ) ) )
        `)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED, STATUS.SERVED])
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;

      const groupedOrders = data.reduce((acc, item: any) => {
        const orderId = item.orders?.id;
        if (!orderId || !item.orders) return acc;

        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            table_name: item.orders.order_tables[0]?.tables?.name || 'Mang về',
            created_at: item.orders.created_at,
            items: [],
            total_items: 0,
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

      let finalOrders = Object.values(groupedOrders).map(order => ({
        ...order,
        total_items: order.items.reduce((sum, item) => sum + item.quantity, 0)
      }));

      finalOrders = finalOrders.filter(order =>
        !order.items.every(item => item.status === STATUS.SERVED)
      );

      setOrders(finalOrders);
    } catch (err: any) {
      console.error('Error fetching kitchen orders:', err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách món: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchKitchenOrders();
      const channel = supabase
        .channel('public:order_items:kitchen_v2')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            fetchKitchenOrders();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchKitchenOrders])
  );

  const handleUpdateItemStatus = async (itemId: number, currentStatus: KitchenItemStatus) => {
    let newStatus: KitchenItemStatus = STATUS.IN_PROGRESS;
    if (currentStatus === STATUS.PENDING) {
      newStatus = STATUS.IN_PROGRESS;
    } else if (currentStatus === STATUS.IN_PROGRESS) {
      newStatus = STATUS.COMPLETED;
    } else {
      return;
    }

    try {
      const { error } = await supabase.from('order_items').update({ status: newStatus }).eq('id', itemId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error updating item status:", err.message);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái món: " + err.message);
    }
  };

  const handleCompleteAllItems = async (items: KitchenItem[]) => {
    const itemsToUpdate = items
      .filter(item => item.status === STATUS.PENDING || item.status === STATUS.IN_PROGRESS)
      .map(item => item.id);

    if (itemsToUpdate.length === 0) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: STATUS.COMPLETED })
        .in('id', itemsToUpdate);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error completing all items:", err.message);
      Alert.alert("Lỗi", "Không thể hoàn thành tất cả món: " + err.message);
    }
  }

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
          <OrderTicketCard
            ticket={item}
            onUpdateItemStatus={handleUpdateItemStatus}
            onCompleteAll={handleCompleteAllItems}
            onNavigate={() => navigation.navigate('KitchenDetail', {
              orderId: item.order_id,
              tableName: item.table_name
            })}
          />
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

// --- STYLESHEET (Giữ nguyên) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  
  cardShadow: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardHeaderInfo: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  cardTableName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  cardItemCount: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardBody: {
    padding: 8,
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6'
  },
  footerTimer: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  footerTimerText: {
      marginLeft: 6,
      color: '#6B7280'
  },
  completeAllButton: {
      backgroundColor: '#2E8540',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20
  },
  disabledButton: {
      backgroundColor: '#9CA3AF'
  },
  completeAllButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
    width: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemTextInProgress: {
    color: '#F97316'
  },
  itemTextCompleted: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  itemNote: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default KitchenDisplayScreen;