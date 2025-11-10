// screens/Admin/AdminOrdersScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

// Interface cho danh sách đơn hàng (chỉ thông tin cơ bản)
interface OrderSummary {
  id: string;
  created_at: string;
  total_price: number | null;
  status: 'pending' | 'paid' | 'closed' | 'cancelled' | 'completed';
  order_tables: { tables: { name: string } }[];
  // MỚI: Dùng aggregate để đếm số lượng item mà không cần join sâu
  order_items_aggregate: {
    aggregate: {
      sum: {
        quantity: number;
      };
    };
  }[];
}

// Interface cho chi tiết một đơn hàng (bao gồm cả các món ăn)
interface OrderDetail extends OrderSummary {
  order_items: { 
    quantity: number;
    unit_price: number;
    menu_items: { name: string } | null;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  paid: COLORS.success,
  completed: COLORS.success,
  served: COLORS.info,
  closed: '#607D8B',
  cancelled: COLORS.danger,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  completed: 'Hoàn thành',
  served: 'Đã phục vụ',
  closed: 'Đã đóng',
  cancelled: 'Đã hủy',
};

export default function AdminOrdersScreen({ onClose }: { onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // MỚI: State riêng cho đơn hàng đang được xem chi tiết và trạng thái loading
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // THAY ĐỔI: Chỉ tải thông tin tóm tắt, cực kỳ nhanh
  const loadOrders = useCallback(async () => {
    try {
      let query = supabase.from('orders').select(`
        id, created_at, total_price, status,
        order_tables(tables(name)),
        order_items:order_items!inner(count)
      `, { count: 'exact' }).order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      // Chuyển đổi dữ liệu để tính tổng số lượng sản phẩm
      const formattedData = data.map(order => ({
        ...order,
        // Giả lập cấu trúc aggregate để tính tổng số lượng
        order_items_aggregate: [{
          aggregate: {
            sum: {
              // @ts-ignore
              quantity: order.order_items.length 
            }
          }
        }]
      }));
      // @ts-ignore
      setOrders(formattedData);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể tải danh sách đơn hàng: ${error?.message || 'Lỗi không xác định'}`);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // MỚI: Hàm tải chi tiết cho một đơn hàng cụ thể
  const openOrderDetail = async (orderSummary: OrderSummary) => {
    setDetailModalVisible(true);
    setIsLoadingDetails(true);
    setSelectedOrder(null); // Xóa chi tiết cũ

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_tables(tables(name)),
          order_items(quantity, unit_price, menu_items(name))
        `)
        .eq('id', orderSummary.id)
        .single(); // Lấy duy nhất 1 bản ghi

      if (error) throw error;

      // @ts-ignore
      setSelectedOrder(data as OrderDetail);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể tải chi tiết đơn hàng: ${error?.message}`);
      setDetailModalVisible(false); // Đóng modal nếu lỗi
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.toLocaleDateString('vi-VN')}`;
  };

  const getTableName = (order: OrderSummary) => order.order_tables[0]?.tables?.name || 'Mang về';
  // @ts-ignore
  const getItemCount = (order: OrderSummary) => order.order_items.length;


  return (
    <SafeAreaView style={styles.container}>
      {/* Header và Filter Tabs giữ nguyên */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
          <Text style={styles.headerSubtitle}>Xem và lọc theo trạng thái</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={loadOrders} style={styles.headerButton}>
            <Ionicons name="refresh" size={24} color="#111827" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={[styles.headerButton, {backgroundColor: '#FEE2E2'}]}>
              <Ionicons name="close" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterSection}>
          <TouchableOpacity 
            style={[styles.filterTab, selectedStatus === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterTab, selectedStatus === key && styles.filterTabActive]}
              onPress={() => setSelectedStatus(key)}
            >
              <Text style={[styles.filterText, selectedStatus === key && styles.filterTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item: order }) => (
          <TouchableOpacity 
            style={styles.orderRow} 
            onPress={() => openOrderDetail(order)}
            activeOpacity={0.7}
          >
            <View style={styles.orderLeft}>
              <View style={styles.orderInfoLine}>
                <Ionicons name="tablet-portrait-outline" size={16} color="#3B82F6" />
                <Text style={styles.orderTable}>{getTableName(order)}</Text>
              </View>
              <View style={styles.orderInfoLine}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.orderTime}>{formatDate(order.created_at)}</Text>
              </View>
               <View style={styles.orderInfoLine}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" />
                <Text style={styles.orderItems}>{getItemCount(order)} sản phẩm</Text>
              </View>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderTotal}>{(order.total_price || 0).toLocaleString()}đ</Text>
              <View style={[styles.orderStatus, { backgroundColor: STATUS_COLORS[order.status] || '#999' }]}>
                <Text style={styles.statusLabel}>{STATUS_LABELS[order.status] || 'N/A'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>Không có đơn hàng nào</Text>
          </View>
        }
      />

      {/* Detail Modal - Thêm xử lý loading */}
      <Modal visible={detailModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Đơn hàng</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            
            {isLoadingDetails && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
              </View>
            )}

            {selectedOrder && !isLoadingDetails && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.section}><Text style={styles.sectionTitle}>Thông tin</Text>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Bàn:</Text><Text style={styles.infoValue}>{getTableName(selectedOrder)}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Thời gian:</Text><Text style={styles.infoValue}>{formatDate(selectedOrder.created_at)}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Trạng thái:</Text><Text style={[styles.infoValue, { color: STATUS_COLORS[selectedOrder.status], fontWeight: 'bold' }]}>{STATUS_LABELS[selectedOrder.status]}</Text></View>
                </View>
                <View style={styles.section}><Text style={styles.sectionTitle}>Sản phẩm ({selectedOrder.order_items.reduce((sum, item) => sum + item.quantity, 0)})</Text>
                  {selectedOrder.order_items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.menu_items?.name || 'Sản phẩm không xác định'}</Text>
                        <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>{(item.unit_price * item.quantity).toLocaleString()}đ</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.section}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>Tổng cộng:</Text><Text style={styles.totalValue}>{(selectedOrder.total_price || 0).toLocaleString()}đ</Text></View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Bổ sung thêm style cho loading
const styles = StyleSheet.create({
  // ... (giữ nguyên các style cũ)
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: 'white',
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB'
  },
  filterTab: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    marginRight: 10,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingTop: 16 },
  orderRow: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderLeft: { flex: 1, gap: 8 },
  orderRight: { alignItems: 'flex-end' },
  orderInfoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTable: { fontSize: 17, fontWeight: '600', color: '#111827' },
  orderTime: { fontSize: 14, color: '#6B7280' },
  orderItems: { fontSize: 14, color: '#6B7280' },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  orderStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  statusLabel: { fontSize: 12, color: '#fff', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyStateText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingBottom: 24, 
    maxHeight: '85%',
    minHeight: 300, // Chiều cao tối thiểu cho modal
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalScroll: { paddingHorizontal: 20, paddingTop: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  infoLabel: { fontSize: 15, color: '#6B7280' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#111827' },
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  itemQty: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    marginTop: 8 
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  // MỚI: Style cho loading indicator
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280'
  }
});