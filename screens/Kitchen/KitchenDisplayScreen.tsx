import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';
import ConfirmModal from '../../components/ConfirmModal';
// [TẮT] Không dùng autoReturnService nữa
// import { startAutoReturnService, stopAutoReturnService } from '../../services/autoReturnService';

type KitchenDisplayNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served',
  RETURNED: 'returned' // [MỚI] Trạng thái đã trả món
} as const;

type KitchenItemStatus = typeof STATUS[keyof typeof STATUS];

interface KitchenItem {
  id: number;
  name: string;
  quantity: number;
  returned_quantity?: number; // [MỚI] Số lượng đã trả
  note: string | null;
  status: KitchenItemStatus;
  is_available?: boolean; // [MỚI] Trạng thái còn hàng
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
  onReturnOrder: () => void;
}> = ({ ticket, onNavigate, onProcessAll, onReturnOrder }) => {
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
  
  const waitingCount = ticket.items.filter(item => item.status === STATUS.PENDING).reduce((sum, item) => sum + item.quantity, 0);
  const inProgressCount = ticket.items.filter(item => item.status === STATUS.IN_PROGRESS).reduce((sum, item) => sum + item.quantity, 0);
  const completedCount = ticket.items.filter(item => item.status === STATUS.COMPLETED).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onNavigate} activeOpacity={0.8}>
      {/* Top row - Tên bàn + Badge tổng */}
      <View style={styles.topRow}>
        <View style={styles.tableInfo}>
          <Text style={styles.tableName}>{ticket.table_name}</Text>
          <View style={styles.timeRowInline}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
          </View>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>{ticket.total_items}</Text>
        </View>
      </View>

      {/* Status row - Hiển thị chi tiết trạng thái */}
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Chờ</Text>
          <Text style={styles.statusValue}>{waitingCount}</Text>
        </View>
        
        <View style={styles.dividerVertical} />
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Đang làm</Text>
          <Text style={styles.statusValue}>{inProgressCount}</Text>
        </View>
        
        <View style={styles.dividerVertical} />
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Xong</Text>
          <Text style={[styles.statusValue, { color: '#10B981' }]}>{completedCount}</Text>
        </View>
      </View>

      {/* Action buttons row */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.processButton, !hasPendingItems && styles.buttonDisabled]}
          onPress={(e) => { e.stopPropagation(); onProcessAll(); }}
          disabled={!hasPendingItems}
          activeOpacity={0.7}
        >
          <Ionicons name="restaurant-outline" size={16} color="white" />
          <Text style={styles.buttonText}>Nhận chế biến</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.serveButton]}
          onPress={(e) => {
            e.stopPropagation();
            onReturnOrder();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={16} color="white" />
          <Text style={styles.buttonText}>Trả món</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const KitchenDisplayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<OrderTicket | null>(null);
  const [isReturnModalVisible, setReturnModalVisible] = useState(false);
  const [pendingCancellations, setPendingCancellations] = useState(0);
  const navigation = useNavigation<KitchenDisplayNavigationProp>();

  const fetchKitchenOrders = useCallback(async () => {
    try {
      // [CẬP NHẬT] Thêm returned_quantity để lọc món đã trả hết
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, returned_quantity, customizations, status, menu_items ( is_available ), orders ( id, created_at, order_tables ( tables ( name ) ) )')
        .neq('status', STATUS.SERVED)
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;

      const groupedOrders = data.reduce((acc, item: any) => {
        const orderId = item.orders?.id;
        if (!orderId || !item.orders) return acc;

        // [FIX] Tính số lượng còn lại
        const returnedQty = item.returned_quantity || 0;
        const remainingQty = item.quantity - returnedQty;
        
        // [FIX] Bỏ qua món đã trả hết
        if (remainingQty <= 0) {
          return acc;
        }

        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            table_name: item.orders.order_tables[0]?.tables?.name || 'Mang về',
            created_at: item.orders.created_at,
            items: [],
            total_items: 0,
          };
        }

        // [CẬP NHẬT] Chỉ bỏ qua món hết hàng VÀ đang chờ
        const isAvailable = item.menu_items?.is_available ?? true;
        
        if (!isAvailable && item.status === STATUS.PENDING) {
          return acc;
        }
        
        // [MỚI] Thêm món với số lượng còn lại
        acc[orderId].items.push({
          id: item.id,
          name: item.customizations.name,
          quantity: remainingQty, // Chỉ hiển thị số lượng còn lại
          returned_quantity: returnedQty,
          note: item.customizations.note || null,
          status: item.status as KitchenItemStatus,
          is_available: isAvailable,
        });

        return acc;
      }, {} as Record<string, OrderTicket>);

      // [CẬP NHẬT] Lọc bỏ order không còn item nào
      const finalOrders = Object.values(groupedOrders)
        .map(order => ({ ...order, total_items: order.items.reduce((sum, item) => sum + item.quantity, 0) }))
        .filter(order => order.items.length > 0);

      setOrders(finalOrders);
    } catch (err: any) {
      console.error('Error fetching kitchen orders:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCancellations = useCallback(async () => {
    const { count, error } = await supabase
      .from('cancellation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (!error) {
      setPendingCancellations(count || 0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setOrders([]);
      setLoading(true);
      fetchKitchenOrders();
      fetchPendingCancellations();
      
      // [TẮT] Service tự động tạo request trả món sau 5 phút
      // const autoReturnInterval = startAutoReturnService();
      
      const channel = supabase
        .channel('public:order_items:kitchen_v2')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchKitchenOrders())
        .subscribe();
      
      // [MỚI] Lắng nghe thay đổi trên menu_items (khi báo hết/còn món)
      const menuItemsChannel = supabase
        .channel('public:menu_items:kitchen_display')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => {
          console.log('[KitchenDisplay] Món ăn thay đổi trạng thái');
          fetchKitchenOrders();
        })
        .subscribe();
      
      // [THÊM] Lắng nghe return_slips - khi nhân viên trả món
      const returnSlipsChannel = supabase
        .channel('public:return_slips:kitchen_display')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_slips' }, () => {
          console.log('[KitchenDisplay] Có trả món mới');
          fetchKitchenOrders();
        })
        .subscribe();
      
      // [THÊM] Lắng nghe cancellation_requests - khi nhân viên yêu cầu hủy
      const cancellationChannel = supabase
        .channel('public:cancellation_requests:kitchen_display')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellation_requests' }, () => {
          console.log('[KitchenDisplay] Có thay đổi trên yêu cầu hủy.');
          fetchPendingCancellations();
        })
        .subscribe();
      
      return () => { 
        // [TẮT] Không cần stop vì đã không start
        // stopAutoReturnService(autoReturnInterval);
        
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
        supabase.removeChannel(returnSlipsChannel);
        supabase.removeChannel(cancellationChannel);
      };
    }, [fetchKitchenOrders, fetchPendingCancellations])
  );

  const handleProcessAllOrder = async (ticket: OrderTicket) => {
    const itemsToProcess = ticket.items.filter(item => item.status === STATUS.PENDING).map(item => item.id);
    if (itemsToProcess.length === 0) return;

    try {
      const { error } = await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).in('id', itemsToProcess);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error processing all items:", err.message);
    }
  };

  const handleReturnOrder = (ticket: OrderTicket) => {
    setSelectedTicket(ticket);
    setReturnModalVisible(true);
  };

  const handleConfirmReturnOrder = async () => {
    if (!selectedTicket) return;
    const originalOrders = orders;
    const ticketToReturn = selectedTicket;

    // [FIX] Chỉ lọc món đã hoàn thành để trả
    const completedItems = ticketToReturn.items.filter(item => item.status === STATUS.COMPLETED);
    
    if (completedItems.length === 0) {
      Alert.alert('Thông báo', 'Không có món nào đã hoàn thành để trả cho khách.');
      setReturnModalVisible(false);
      setSelectedTicket(null);
      return;
    }

    setReturnModalVisible(false);
    setSelectedTicket(null);
    
    try {
      const itemIds = completedItems.map(item => item.id);

      // [FIX] Chỉ update món completed sang 'served' (đã trả cho khách)
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ status: STATUS.SERVED })
        .in('id', itemIds);
      if (updateError) throw updateError;

      // [XÓA] Không tạo return_notifications ở đây
      // return_notifications chỉ được tạo khi NHÂN VIÊN gửi yêu cầu trả món
      
    } catch (err: any) {
      console.error("Error returning items to customer:", err.message);
      Alert.alert('Lỗi', 'Không thể trả món. Vui lòng thử lại.');
      setOrders(originalOrders);
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
        <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => navigation.navigate('CancellationRequests')}
        >
            <Ionicons name="notifications-outline" size={28} color="white" />
            {pendingCancellations > 0 && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{pendingCancellations}</Text>
                </View>
            )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <OrderTicketCard
            ticket={item}
            onNavigate={() => navigation.navigate('KitchenDetail', { orderId: item.order_id, tableName: item.table_name })}
            onProcessAll={() => handleProcessAllOrder(item)}
            onReturnOrder={() => handleReturnOrder(item)}
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

      {/* Modal xác nhận trả món */}
      <ConfirmModal
        isVisible={isReturnModalVisible}
        title="Xác nhận trả món"
        message={selectedTicket ? `Bạn có chắc chắn muốn trả món cho ${selectedTicket.table_name}?` : ''}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onClose={() => setReturnModalVisible(false)}
        onConfirm={handleConfirmReturnOrder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 20 },
  headerTitle: { flex: 1,color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  listContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  
  // Card styles
  card: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    marginBottom: 12, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 4, 
    elevation: 2 
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableInfo: {
    flex: 1,
  },
  tableName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1E3A8A',
    marginBottom: 4,
  },
  timeRowInline: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  elapsedTimeText: { 
    fontSize: 12, 
    fontWeight: '500',
    color: '#6B7280'
  },
  totalBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    marginLeft: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  statusRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    height: 24,
  },
  
  actionRow: { 
    flexDirection: 'row', 
    gap: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    backgroundColor: '#F9FAFB' 
  },
  actionButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 10, 
    borderRadius: 6, 
    gap: 6
  },
  processButton: { backgroundColor: '#1E40AF' },
  serveButton: { backgroundColor: '#F59E0B' },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonText: { color: 'white', fontSize: 13, fontWeight: '600' },


  notificationButton: {
      padding: 4,
  },
  badgeContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#EF4444',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#1E3A8A'
  },
  badgeText: {
      color: 'white',
      fontSize: 11,
      fontWeight: 'bold',
  },
});

export default KitchenDisplayScreen;