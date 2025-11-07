// screens/Admin/AdminOrdersScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

// Interface khớp CSDL
interface Order {
  id: string;
  created_at: string;
  total_price: number | null;
  status: 'pending' | 'paid' | 'closed' | 'cancelled' | 'completed';
  order_tables: { tables: { name: string } }[];
  order_items: { 
    quantity: number;
    unit_price: number;
    customizations: { name: string };
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

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      let query = supabase.from('orders').select(`
        id, created_at, total_price, status,
        order_tables(tables(name)),
        order_items(quantity, unit_price, customizations)
      `).order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query.limit(50); // Giới hạn 50 đơn hàng gần nhất
      if (error) throw error;
      setOrders(data as Order[]);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể tải danh sách đơn hàng: ${error?.message || 'Lỗi không xác định'}`);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.toLocaleDateString('vi-VN')}`;
  };

  const getTableName = (order: Order) => order.order_tables[0]?.tables?.name || 'Mang về';
  const getItemCount = (order: Order) => order.order_items.reduce((sum, item) => sum + item.quantity, 0);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
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

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item: order }) => (
          <TouchableOpacity 
            style={styles.orderRow} 
            onPress={() => openOrderDetail(order)}
            activeOpacity={0.6}
          >
            <View style={styles.orderLeft}>
              <Text style={styles.orderTable}>{getTableName(order)}</Text>
              <Text style={styles.orderTime}>{formatDate(order.created_at)}</Text>
              <Text style={styles.orderItems}>{getItemCount(order)} sản phẩm</Text>
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
            <Ionicons name="receipt-outline" size={48} color="#ddd" />
            <Text style={styles.emptyStateText}>Không có đơn hàng nào</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScroll}>
                  {/* Order Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Bàn:</Text>
                      <Text style={styles.infoValue}>{getTableName(selectedOrder)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Thời gian:</Text>
                      <Text style={styles.infoValue}>{formatDate(selectedOrder.created_at)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Trạng thái:</Text>
                      <Text style={[styles.infoValue, { color: STATUS_COLORS[selectedOrder.status] }]}>
                        {STATUS_LABELS[selectedOrder.status]}
                      </Text>
                    </View>
                  </View>

                  {/* Items */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm ({getItemCount(selectedOrder)})</Text>
                    {selectedOrder.order_items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>Sản phẩm</Text>
                          <Text style={styles.itemQty}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>{(item.unit_price * item.quantity).toLocaleString()}đ</Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={styles.section}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Tổng cộng:</Text>
                      <Text style={styles.totalValue}>{(selectedOrder.total_price || 0).toLocaleString()}đ</Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  filterSection: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterTabActive: { backgroundColor: '#3B82F6' },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  orderRow: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  orderLeft: { flex: 1 },
  orderRight: { alignItems: 'flex-end' },
  orderTable: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  orderTime: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  orderItems: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  orderTotal: { fontSize: 15, fontWeight: '700', color: '#3B82F6', marginBottom: 6 },
  orderStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusLabel: { fontSize: 11, color: '#fff', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalScroll: { paddingHorizontal: 16, paddingVertical: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 12, color: '#9CA3AF' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  itemQty: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, backgroundColor: '#F3F4F6', paddingHorizontal: 12, borderRadius: 8 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
});