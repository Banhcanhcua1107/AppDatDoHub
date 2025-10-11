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


// ---- [CẬP NHẬT] COMPONENT ORDER TICKET ĐÃ ĐƯỢC RÚT GỌN ----
const OrderTicketCard: React.FC<{
  ticket: OrderTicket;
  onProcessAll: (items: KitchenItem[]) => void;
  onNavigate: () => void;
}> = ({ ticket, onProcessAll, onNavigate }) => {
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

  const handleProcessAll = async () => {
    setIsLoadingAll(true);
    await onProcessAll(ticket.items);
    setIsLoadingAll(false);
  }

  // Logic để vô hiệu hóa nút: true nếu KHÔNG có món nào đang chờ
  const hasNoPendingItems = !ticket.items.some(
    item => item.status === STATUS.PENDING
  );

  return (
    <TouchableOpacity onPress={onNavigate} activeOpacity={0.8}>
      <View style={styles.cardShadow}>
        {/* Phần Header chứa Tên bàn và Số lượng món */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <Ionicons name="receipt-outline" size={20} color="white" />
            <Text style={styles.cardTableName}>{ticket.table_name}</Text>
          </View>
          <Text style={styles.cardItemCount}>{ticket.total_items} món</Text>
        </View>

        {/* [ĐÃ XÓA] Phần body hiển thị danh sách món ăn đã được loại bỏ */}

        {/* Phần Footer chứa Thời gian và Nút Chế biến */}
        <View style={styles.cardFooter}>
          <View style={styles.footerTimer}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.footerTimerText}>{elapsedTime}</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, hasNoPendingItems && styles.disabledButton]}
            onPress={(e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài thẻ
                handleProcessAll();
            }}
            disabled={hasNoPendingItems || isLoadingAll}
          >
            {isLoadingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="flame-outline" size={20} color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.actionButtonText}>Chế biến hết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


// ---- COMPONENT CHÍNH: MÀN HÌNH KDS (CẬP NHẬT LOGIC TRUYỀN XUỐNG) ----
const KitchenDisplayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const navigation = useNavigation<KitchenDisplayNavigationProp>();

  // Logic fetch data giữ nguyên vì vẫn cần để tính tổng số món và trạng thái
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
  
  // [ĐÃ XÓA] Hàm handleUpdateItemStatus không còn cần thiết ở màn hình này

  // Hàm chế biến tất cả món đang chờ
  const handleProcessAllItems = async (items: KitchenItem[]) => {
    const itemsToUpdate = items
      .filter(item => item.status === STATUS.PENDING)
      .map(item => item.id);

    if (itemsToUpdate.length === 0) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: STATUS.IN_PROGRESS })
        .in('id', itemsToUpdate);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error processing all items:", err.message);
      Alert.alert("Lỗi", "Không thể chế biến tất cả món: " + err.message);
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
            onProcessAll={handleProcessAllItems} // Chỉ truyền hàm này
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

// --- STYLESHEET (CẬP NHẬT ĐỂ PHÙ HỢP GIAO DIỆN MỚI) ---
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
    // Thẻ bây giờ không có body nên toàn bộ thẻ là một khối
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
  // [CẬP NHẬT] cardFooter bây giờ là phần dưới cùng của thẻ
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12, // Tăng padding cho cân đối
      backgroundColor: 'white',
      borderBottomLeftRadius: 12, // Bo góc dưới
      borderBottomRightRadius: 12,
  },
  footerTimer: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  footerTimerText: {
      marginLeft: 6,
      color: '#6B7280'
  },
  actionButton: {
      backgroundColor: '#F97316',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20
  },
  disabledButton: {
      backgroundColor: '#9CA3AF'
  },
  actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },
  // [ĐÃ XÓA] Các style cho item con không còn cần thiết
});

export default KitchenDisplayScreen;