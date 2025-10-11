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


// ---- [CẬP NHẬT] COMPONENT ORDER TICKET THEO DESIGN MỚI ----
const OrderTicketCard: React.FC<{
  ticket: OrderTicket;
  onNavigate: () => void;
  onProcessAll: () => void;
}> = ({ ticket, onNavigate, onProcessAll }) => {
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const createTime = new Date(ticket.created_at);
      const diffMinutes = Math.floor((now.getTime() - createTime.getTime()) / 60000);
      setElapsedTime(`${diffMinutes}'`);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 30000);
    return () => clearInterval(timerInterval);
  }, [ticket.created_at]);

  const hasPendingItems = ticket.items.some(item => item.status === STATUS.PENDING);

  return (
    <View style={styles.card}>
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="restaurant-outline" size={24} color="#059669" />
          <Text style={styles.tableNameLarge}>{ticket.table_name}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.processAllButton, !hasPendingItems && styles.processAllButtonDisabled]}
          onPress={onProcessAll}
          disabled={!hasPendingItems}
        >
          <Text style={styles.processAllButtonText}>CHẾ BIẾN HẾT</Text>
        </TouchableOpacity>
      </View>

      {/* Order Info Row */}
      <View style={styles.orderInfoRow}>
        <Text style={styles.orderIdText}>Order: {ticket.order_id.substring(0, 8)}</Text>
        <View style={styles.orderMetaGroup}>
          <View style={styles.orderMeta}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.orderMetaText}>0</Text>
          </View>
          <View style={styles.orderMeta}>
            <Ionicons name="time-outline" size={16} color="#10B981" />
            <Text style={[styles.orderMetaText, { color: '#10B981' }]}>{elapsedTime}</Text>
          </View>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.itemsList}>
        {ticket.items.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemIndex}>{index + 1}</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity > 1 ? `(Đĩa) ` : ''}{item.name}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={[
                  styles.itemActionButton,
                  styles.itemActionOrange,
                  item.status !== STATUS.PENDING && styles.itemActionDisabled
                ]}
                disabled={item.status !== STATUS.PENDING}
              >
                <Ionicons 
                  name="flame" 
                  size={18} 
                  color={item.status === STATUS.PENDING ? "white" : "#D1D5DB"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.itemActionButton,
                  styles.itemActionGreen,
                  item.status !== STATUS.IN_PROGRESS && styles.itemActionDisabled
                ]}
                disabled={item.status !== STATUS.IN_PROGRESS}
              >
                <Ionicons 
                  name="notifications" 
                  size={18} 
                  color={item.status === STATUS.IN_PROGRESS ? "white" : "#D1D5DB"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Đang tải danh sách món...</Text>
      </View>
    );
  }

  const handleProcessAllOrder = async (ticket: OrderTicket) => {
    const itemsToProcess = ticket.items
      .filter(item => item.status === STATUS.PENDING)
      .map(item => item.id);

    if (itemsToProcess.length === 0) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: STATUS.IN_PROGRESS })
        .in('id', itemsToProcess);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error processing all items:", err.message);
      Alert.alert("Lỗi", "Không thể chế biến tất cả món: " + err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.header}>
        <Ionicons name="close" size={28} color="white" />
        <Text style={styles.headerTitle}>Bếp & Bar</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <OrderTicketCard
            ticket={item}
            onNavigate={() => navigation.navigate('KitchenDetail', {
              orderId: item.order_id,
              tableName: item.table_name
            })}
            onProcessAll={() => handleProcessAllOrder(item)}
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

// --- STYLESHEET - DESIGN MỚI THEO HÌNH MẪU ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#4B5563' 
  },
  emptyText: { 
    marginTop: 16, 
    fontSize: 18, 
    color: '#6B7280', 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E3A8A', 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    paddingTop: 20 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 12 
  },
  listContainer: { 
    paddingHorizontal: 12, 
    paddingVertical: 12 
  },
  
  // Card - Thiết kế mới
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  
  // Card Header - Tên bàn + Nút chế biến hết
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  processAllButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  processAllButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  processAllButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  
  // Order Info Row
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  orderIdText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderMetaGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderMetaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Items List
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    width: 20,
  },
  itemName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  itemActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemActionOrange: {
    backgroundColor: '#F97316',
  },
  itemActionGreen: {
    backgroundColor: '#10B981',
  },
  itemActionDisabled: {
    backgroundColor: '#F3F4F6',
  },
});

export default KitchenDisplayScreen;