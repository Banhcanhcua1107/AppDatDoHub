import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';

type KitchenDisplayNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served'
} as const;

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
      const diffMs = now.getTime() - createTime.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      setElapsedTime(hours > 0 ? `${hours}h ${minutes}'` : `${minutes}'`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 30000);
    return () => clearInterval(timer);
  }, [ticket.created_at]);

  const hasPendingItems = ticket.items.some(item => item.status === STATUS.PENDING);
  const completedCount = ticket.items.filter(item => item.status === STATUS.COMPLETED || item.status === STATUS.SERVED).length;

  return (
    <TouchableOpacity style={styles.card} onPress={onNavigate} activeOpacity={0.8}>
      {/* Header xanh navy */}
      <View style={styles.cardHeaderBlue}>
        <Text style={styles.tableName}>{ticket.table_name}</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color="white" />
          <Text style={[styles.timeText, { color: 'white' }]}>{elapsedTime}</Text>
        </View>
      </View>

      {/* Body - Thông tin order */}
      <View style={styles.cardBody}>
        <View style={styles.centerSection}>
          <Text style={styles.orderText}>Bàn {ticket.table_name} Order</Text>
        </View>
        
        <View style={styles.verticalDivider} />
        
        <View style={styles.rightSection}>
          <Text style={styles.completedNumber}>{completedCount}</Text>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
      </View>

      {/* Action buttons row - 2 nút */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.processButton, !hasPendingItems && styles.buttonDisabled]}
          onPress={(e) => { e.stopPropagation(); onProcessAll(); }}
          disabled={!hasPendingItems}
        >
          <Ionicons name="restaurant-outline" size={20} color="white" />
          <Text style={styles.buttonText}>CHẾ BIẾN HẾT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.serveButton]}>
          <Ionicons name="notifications-outline" size={20} color="white" />
          <Text style={styles.buttonText}>TRẢ MÓN</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const KitchenDisplayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const navigation = useNavigation<KitchenDisplayNavigationProp>();

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, customizations, status, orders ( id, created_at, order_tables ( tables ( name ) ) )')
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

      const finalOrders = Object.values(groupedOrders)
        .map(order => ({ ...order, total_items: order.items.reduce((sum, item) => sum + item.quantity, 0) }))
        .filter(order => !order.items.every(item => item.status === STATUS.SERVED));

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchKitchenOrders())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [fetchKitchenOrders])
  );

  const handleProcessAllOrder = async (ticket: OrderTicket) => {
    const itemsToProcess = ticket.items.filter(item => item.status === STATUS.PENDING).map(item => item.id);
    if (itemsToProcess.length === 0) return;

    try {
      const { error } = await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).in('id', itemsToProcess);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error processing all items:", err.message);
      Alert.alert("Lỗi", "Không thể chế biến tất cả món: " + err.message);
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
        <Ionicons name="close" size={28} color="white" />
        <Text style={styles.headerTitle}>Bếp & Bar</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <OrderTicketCard
            ticket={item}
            onNavigate={() => navigation.navigate('KitchenDetail', { orderId: item.order_id, tableName: item.table_name })}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  listContainer: { paddingHorizontal: 12, paddingVertical: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeaderBlue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 10 },
  tableName: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 14, fontWeight: '500' },
  cardBody: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center' },
  centerSection: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  orderText: { fontSize: 18, fontWeight: '600', color: '#1E3A8A' },
  verticalDivider: { width: 2, height: 50, backgroundColor: '#E5E7EB', marginHorizontal: 12 },
  rightSection: { flex: 1, alignItems: 'center', gap: 6 },
  completedNumber: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  processButton: { backgroundColor: '#F97316' },
  serveButton: { backgroundColor: '#10B981' },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});

export default KitchenDisplayScreen;