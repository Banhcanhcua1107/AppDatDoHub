// --- START OF FILE screens/Kitchen/KitchenScreen.tsx ---

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';

// Định nghĩa kiểu dữ liệu
type KitchenItemStatus = 'waiting' | 'in_progress' | 'completed' | 'served';

interface KitchenItem {
  id: number;
  name: string;
  quantity: number;
  status: KitchenItemStatus;
  note: string | null;
}

interface KitchenTicket {
  order_id: string;
  table_name: string;
  created_at: string;
  items: KitchenItem[];
}

// Component cho từng món ăn trong phiếu
const KitchenItemRow: React.FC<{
  item: KitchenItem;
  onStart: () => void;
  onComplete: () => void;
}> = ({ item, onStart, onComplete }) => {
  const isWaiting = item.status === 'waiting';
  const isInProgress = item.status === 'in_progress';

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.note && <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>}
        </View>
      </View>
      {isWaiting && (
        <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={onStart}>
          <Text style={styles.actionButtonText}>Bắt đầu</Text>
        </TouchableOpacity>
      )}
      {isInProgress && (
        <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={onComplete}>
          <Text style={styles.actionButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Component chính của màn hình Bếp
const KitchenScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<KitchenTicket[]>([]);

  const fetchKitchenOrders = React.useCallback(async (isInitial = true) => {
    if (isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(
          `
          id, quantity, status, customizations,
          orders (
            id, created_at,
            order_tables ( tables ( name ) )
          )
        `
        )
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;

      const groupedByOrder = data.reduce((acc, item: any) => {
        const orderId = item.orders.id;
        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            table_name:
              item.orders.order_tables.map((ot: any) => ot.tables.name).join(', ') || 'N/A',
            created_at: item.orders.created_at,
            items: [],
          };
        }
        acc[orderId].items.push({
          id: item.id,
          name: item.customizations?.name || 'Món không tên',
          quantity: item.quantity,
          status: item.status,
          note: item.customizations?.note || null,
        });
        return acc;
      }, {} as Record<string, KitchenTicket>);

      setTickets(Object.values(groupedByOrder));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món cho bếp: ' + err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchKitchenOrders(true);
      const channel = supabase
        .channel('public:order_items:kitchen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
          fetchKitchenOrders(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchKitchenOrders])
  );

  const updateItemStatus = async (itemId: number, newStatus: KitchenItemStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId);
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Lỗi', `Không thể cập nhật trạng thái món: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Màn hình Bếp</Text>
        <TouchableOpacity onPress={() => fetchKitchenOrders(true)}>
            <Icon name="refresh-outline" size={26} color="#1F2937" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.tableName}>Bàn: {item.table_name}</Text>
              <Text style={styles.orderTime}>
                {new Date(item.created_at).toLocaleTimeString('vi-VN')}
              </Text>
            </View>
            {item.items.map((kitchenItem) => (
              <KitchenItemRow
                key={kitchenItem.id}
                item={kitchenItem}
                onStart={() => updateItemStatus(kitchenItem.id, 'in_progress')}
                onComplete={() => updateItemStatus(kitchenItem.id, 'completed')}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon name="checkmark-done-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>Không có món nào đang chờ.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  listContent: { padding: 16 },
  ticketCard: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  tableName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  orderTime: { fontSize: 14, color: '#6B7280' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  itemDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemQuantity: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 10 },
  itemName: { fontSize: 16, color: '#374151' },
  itemNote: { fontSize: 12, color: '#F97316', fontStyle: 'italic', marginTop: 2 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  startButton: { backgroundColor: '#3B82F6' },
  completeButton: { backgroundColor: '#10B981' },
  actionButtonText: { color: 'white', fontWeight: '600' },
  emptyText: { marginTop: 16, fontSize: 16, color: 'gray' },
});

export default KitchenScreen;
// --- END OF FILE screens/Kitchen/KitchenScreen.tsx ---