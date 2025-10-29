// screens/Menu/OrderInfoBox.tsx

import React, { useState, useEffect, useCallback } from 'react'; // <-- [SỬA LỖI] ĐÂY LÀ DÒNG BỊ THIẾU
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';
import ConfirmModal from '../../components/ConfirmModal';

// --- Interfaces (Giữ nguyên) ---
interface OrderInfoBoxProps {
  isVisible: boolean;
  onClose: () => void;
  tableId: string | null;
  tableName: string | null;
  onActionPress: (action: string, data?: any) => void;
}
interface MenuItemProps {
  icon: string;
  text: string;
  action: string;
  color?: string;
}
interface OrderDetails {
  orderId: string | null;
  orderTime: string;
  totalItems: number;
  totalPrice: number;
  is_provisional?: boolean;
}

// --- Components (Giữ nguyên) ---
const MenuActionItem: React.FC<{ item: MenuItemProps; onPress: (action: string) => void }> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity onPress={() => onPress(item.action)} style={styles.menuItem}>
    <Icon
      name={item.icon as any}
      size={24}
      color={item.color || '#4B5563'}
      style={styles.menuIcon}
    />
    <Text style={[styles.menuText, { color: item.color || '#1F2937' }]}>{item.text}</Text>
  </TouchableOpacity>
);

const OrderInfoBox: React.FC<OrderInfoBoxProps> = ({
  isVisible,
  onClose,
  tableId,
  tableName,
  onActionPress: handleParentAction,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [isTogglingProvisional, setIsTogglingProvisional] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      // [FIXED] Ưu tiên order pending trước (để tránh lấy order paid cũ), sau đó sắp xếp theo created_at DESC
      const { data, error } = await supabase
        .from('orders')
        .select(`id, created_at, is_provisional, order_items(quantity, unit_price, returned_quantity, menu_items(is_available)), order_tables!inner(table_id)`)
        .eq('order_tables.table_id', tableId)
        .in('status', ['pending', 'paid'])
        .order('status', { ascending: true }) // pending (P) < paid (p), nên pending sẽ được lấy trước
        .order('created_at', { ascending: false }) // Trong cùng status, lấy cái mới nhất
        .limit(1);

      if (data && data.length > 0) {
        const orderData = data[0];
        const billableItems = orderData.order_items.filter(
          (item: any) => item.menu_items?.is_available !== false
        );

        const totalItems = billableItems.reduce(
          (sum, item) => sum + (item.quantity - (item.returned_quantity || 0)),
          0
        );
        const totalPrice = billableItems.reduce(
          (sum, item) => sum + (item.quantity - (item.returned_quantity || 0)) * item.unit_price,
          0
        );
        const orderTime = new Date(orderData.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setOrderDetails({
          orderId: orderData.id,
          totalItems,
          totalPrice,
          orderTime,
          is_provisional: orderData.is_provisional,
        });
      } else if (error && error.code === 'PGRST116') {
        const { data: cartData, error: cartError } = await supabase
          .from('cart_items')
          .select('quantity, total_price')
          .eq('table_id', tableId);
        if (cartError) throw cartError;
        if (cartData && cartData.length > 0) {
          const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = cartData.reduce((sum, item) => sum + item.total_price, 0);
          setOrderDetails({
            orderId: null,
            totalItems: totalItems,
            totalPrice: totalPrice,
            orderTime: 'Trong giỏ',
          });
        } else {
          setOrderDetails(null);
        }
      } else if (!data || data.length === 0) {
        // Không tìm thấy order, kiểm tra cart_items
        const { data: cartData, error: cartError } = await supabase
          .from('cart_items')
          .select('quantity, total_price')
          .eq('table_id', tableId);
        if (cartError) throw cartError;
        if (cartData && cartData.length > 0) {
          const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = cartData.reduce((sum, item) => sum + item.total_price, 0);
          setOrderDetails({
            orderId: null,
            totalItems: totalItems,
            totalPrice: totalPrice,
            orderTime: 'Trong giỏ',
          });
        } else {
          setOrderDetails(null);
        }
      } else {
        throw error;
      }
    } catch (err: any) {
      Alert.alert('Lỗi', `Không thể tải chi tiết bàn: ${err.message}`);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [tableId, onClose]);
  
  useEffect(() => {
    if (isVisible) {
      fetchOrderDetails();
    }
  }, [isVisible, fetchOrderDetails]);

  useEffect(() => {
      if (!tableId) return;
      const channel = supabase
          .channel(`order_info_box_${tableId}`)
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
              fetchOrderDetails();
          })
          .subscribe();
      return () => {
          supabase.removeChannel(channel);
      };
  }, [tableId, fetchOrderDetails]);

  const menuActions: MenuItemProps[] = [
    { icon: 'notifications-outline', text: 'Kiểm tra lên món', action: 'check_served_status' },
    { icon: 'cash-outline', text: 'Thanh toán', action: 'go_to_payment' },
    { icon: 'swap-horizontal-outline', text: 'Chuyển bàn', action: 'transfer_table', color: '#3B82F6' },
    { icon: 'layers-outline', text: 'Ghép Order (Thêm món)', action: 'merge_order' },
    { icon: 'apps-outline', text: 'Gộp Bàn (Chung bill)', action: 'group_tables', color: '#10B981' },
    { icon: 'git-compare-outline', text: 'Tách order', action: 'split_order' },
    { icon: 'close-circle-outline', text: 'Hủy order', action: 'cancel_order', color: '#EF4444' },
  ];

  const handleActionPress = (action: string) => {
    setMenuVisible(false);
    if (action === 'cancel_order') {
      setTimeout(() => setCancelModalVisible(true), 200);
      return;
    }
    setTimeout(() => handleParentAction(action, { tableId, tableName, orderId: orderDetails?.orderId }), 200);
  };

  const handleQuickAction = (action: string) => {
    onClose();
    setTimeout(() => handleParentAction(action, { tableId, tableName, orderId: orderDetails?.orderId }), 200);
  };

  const handleConfirmCancelOrder = async () => {
    setCancelModalVisible(false);
    if (!orderDetails?.orderId) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy thông tin order để hủy' });
      return;
    }
    try {
      const { error } = await supabase.rpc('cancel_order_and_reset_tables', { p_order_id: orderDetails.orderId });
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Đã hủy order', text2: `Order cho ${tableName} đã được hủy thành công.` });
      onClose();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi hủy order', text2: err.message });
    }
  };

  const handleToggleProvisionalBill = async () => {
    if (!orderDetails?.orderId) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy thông tin order' });
      return;
    }
    if (orderDetails.is_provisional) {
      setIsTogglingProvisional(true);
      try {
        await fetchOrderDetails();
        Toast.show({ type: 'success', text1: 'Đã cập nhật', text2: `Dữ liệu bàn ${tableName} đã được làm mới.` });
      } catch (err: any) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật: ' + err.message });
      } finally {
        setIsTogglingProvisional(false);
      }
      return;
    }
    setIsTogglingProvisional(true);
    try {
      const { error } = await supabase.from('orders').update({ is_provisional: true }).eq('id', orderDetails.orderId);
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Đã thêm vào Tạm tính', text2: `Bàn ${tableName} đã được thêm vào tab Tạm tính` });
      setOrderDetails(prev => prev ? { ...prev, is_provisional: true } : null);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thêm vào tạm tính: ' + err.message });
    } finally {
      setIsTogglingProvisional(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#3B82F6" style={{ paddingVertical: 60 }} />;
    }
    if (!orderDetails) {
      return (
        <View style={styles.noOrderContainer}>
          <Text style={styles.noOrderText}>Bàn chưa có order.</Text>
          <TouchableOpacity style={styles.newOrderButton} onPress={() => handleQuickAction('add_new_order')}>
            <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.newOrderButtonText}>Tạo Order Mới</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.orderTimeText}>Order: {orderDetails.orderTime}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statusText}>Đang phục vụ</Text>
              {orderDetails.is_provisional && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                  <Icon name="restaurant" size={16} color="#10B981" />
                  <Text style={{ color: '#E0E0E0', fontSize: 12, marginLeft: 4 }}>Tạm tính</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.priceContainer}>
            <View style={styles.itemCountContainer}>
              <Icon name="file-tray-stacked-outline" size={14} color="white" />
              <Text style={styles.itemCountText}>{orderDetails.totalItems} món</Text>
            </View>
            <Text style={styles.priceText}>{orderDetails.totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('go_to_payment')}>
            <Icon name="cash-outline" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('add_items')}>
            <Icon name="restaurant-outline" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleToggleProvisionalBill} disabled={isTogglingProvisional}>
            {isTogglingProvisional ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Icon name={orderDetails.is_provisional ? "checkmark-done-outline" : "receipt-outline"} size={24} color={orderDetails.is_provisional ? '#2E8540' : '#555'} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setMenuVisible(true)}>
            <Icon name="ellipsis-horizontal" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.infoBoxWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Thông tin {tableName}</Text>
          </View>
          {renderContent()}
          {orderDetails && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>ĐÓNG</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Modal transparent={true} visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            {menuActions.map((item) => (
              <MenuActionItem key={item.action} item={item} onPress={handleActionPress} />
            ))}
          </View>
        </Pressable>
      </Modal>
      <ConfirmModal
        isVisible={isCancelModalVisible}
        title="Xác nhận Hủy Order"
        message={`Toàn bộ order cho bàn "${tableName}" sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?`}
        confirmText="Hủy Order"
        cancelText="Không"
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleConfirmCancelOrder}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  container: { position: 'absolute', bottom: 350, left: 10, right: 10 },
  infoBoxWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  header: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 16 },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
  },
  orderTimeText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  statusText: { color: '#E0E0E0', fontSize: 14, marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  itemCountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemCountText: { color: 'white', marginLeft: 6, fontWeight: 'bold' },
  priceText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  actionsContainer: { flexDirection: 'row', backgroundColor: 'white' },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  noOrderContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  noOrderText: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 16 },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  newOrderButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  closeButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButtonText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 16 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    width: '85%',
    maxWidth: 350,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  menuIcon: { width: 40, textAlign: 'center' },
  menuText: { fontSize: 16, marginLeft: 10 },
});

export default OrderInfoBox;