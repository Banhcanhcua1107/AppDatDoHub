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
      const diffMinutes = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / 60000);
      setElapsedTime(`${diffMinutes}'`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 30000);
    return () => clearInterval(timer);
  }, [ticket.created_at]);

  const hasPendingItems = ticket.items.some(item => item.status === STATUS.PENDING);

  return (
    <TouchableOpacity style={styles.card} onPress={onNavigate} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="restaurant-outline" size={24} color="#059669" />
          <Text style={styles.tableNameLarge}>{ticket.table_name}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.processAllButton, !hasPendingItems && styles.processAllButtonDisabled]}
          onPress={(e) => { e.stopPropagation(); onProcessAll(); }}
          disabled={!hasPendingItems}
        >
          <Text style={styles.processAllButtonText}>CHẾ BIẾN HẾT</Text>
        </TouchableOpacity>
      </View>

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
  card: { backgroundColor: 'white', borderRadius: 12, padding: 0, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, borderWidth: 2, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9FAFB', borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomWidth: 2, borderBottomColor: '#E5E7EB' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableNameLarge: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  processAllButton: { backgroundColor: '#F97316', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  processAllButtonDisabled: { backgroundColor: '#D1D5DB' },
  processAllButtonText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  orderInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'white' },
  orderIdText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  orderMetaGroup: { flexDirection: 'row', gap: 12 },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderMetaText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
});

export default KitchenDisplayScreen;