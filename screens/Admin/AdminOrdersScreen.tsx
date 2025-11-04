// screens/Admin/AdminOrdersScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';

interface OrderItem {
  id: string;
  item_id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  table_number: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled' | 'served';
  total: number;
  items: OrderItem[];
  created_at: string;
  served_at?: string;
  payment_method?: string;
  customer_name?: string;
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrders'>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA500',
  preparing: '#FF6B6B',
  completed: '#51CF66',
  served: '#4ECDC4',
  cancelled: '#999',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  preparing: 'Đang chuẩn bị',
  completed: 'Hoàn thành',
  served: 'Đã phục vụ',
  cancelled: 'Đã hủy',
};

export default function AdminOrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [selectedStatus, orders]);

  const loadOrders = async () => {
    try {
      // TODO: Gọi API để lấy danh sách đơn hàng
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: '#001',
          table_number: 'Bàn 5',
          status: 'completed',
          total: 250000,
          items: [
            {
              id: '1-1',
              item_id: '1',
              name: 'Phở Bò',
              quantity: 2,
              price: 45000,
            },
            {
              id: '1-2',
              item_id: '3',
              name: 'Cà Phê Đen',
              quantity: 2,
              price: 15000,
            },
          ],
          created_at: new Date().toISOString(),
          served_at: new Date().toISOString(),
        },
        {
          id: '2',
          order_number: '#002',
          table_number: 'Bàn 3',
          status: 'preparing',
          total: 180000,
          items: [
            {
              id: '2-1',
              item_id: '2',
              name: 'Cơm Tấm',
              quantity: 3,
              price: 40000,
            },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          order_number: '#003',
          table_number: 'Bàn 7',
          status: 'pending',
          total: 95000,
          items: [
            {
              id: '3-1',
              item_id: '3',
              name: 'Cà Phê Đen',
              quantity: 1,
              price: 15000,
            },
          ],
          created_at: new Date().toISOString(),
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const filterOrders = () => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
    }
  };

  const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'preparing', label: 'Đang chuẩn bị' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'served', label: 'Đã phục vụ' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedStatus === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item: order }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => openOrderDetail(order)}
            activeOpacity={0.7}
          >
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.orderTable}>{order.table_number}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[order.status] },
                ]}
              >
                <Text style={styles.statusText}>{STATUS_LABELS[order.status]}</Text>
              </View>
            </View>

            <View style={styles.orderBody}>
              <Text style={styles.orderItems}>
                {order.items.length} sản phẩm
              </Text>
              <Text style={styles.orderTime}>{formatDate(order.created_at)}</Text>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>
                {order.total.toLocaleString()}đ
              </Text>
              <Text style={styles.viewDetail}>Xem chi tiết →</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Không có đơn hàng nào</Text>
          </View>
        }
      />

      {/* Order Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                  <Pressable onPress={() => setDetailModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Order Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Mã đơn:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.order_number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Bàn:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.table_number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Thời gian:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(selectedOrder.created_at)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Trạng thái:</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: STATUS_COLORS[selectedOrder.status],
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {STATUS_LABELS[selectedOrder.status]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Items */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm</Text>
                    {selectedOrder.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemTotal}>
                          {(item.quantity * item.price).toLocaleString()}đ
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={styles.section}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Tổng cộng:</Text>
                      <Text style={styles.totalValue}>
                        {selectedOrder.total.toLocaleString()}đ
                      </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 28,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderTable: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItems: {
    fontSize: 12,
    color: '#666',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewDetail: {
    fontSize: 12,
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
