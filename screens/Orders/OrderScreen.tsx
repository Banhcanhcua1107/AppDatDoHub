// --- START OF FILE OrderScreen.tsx ---

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { AppTabParamList, AppStackParamList, ROUTES } from '../../constants/routes';
import Toast from 'react-native-toast-message';
import { useNetwork } from '../../context/NetworkContext';
import ConfirmModal from '../../components/ConfirmModal';
// --- [SỬA LỖI] Định nghĩa kiểu dữ liệu rõ ràng ---
type TableInfo = { id: string; name: string };
type ActiveOrder = {
  orderId: string;
  representativeTableId: string;
  tables: TableInfo[];
  totalPrice: number;
  createdAt: string;
  totalItemCount: number;
  is_provisional: boolean;
};
interface MenuItemProps {
  icon: string;
  text: string;
  action: string;
  color?: string;
}
// interface ItemToReturn {
//   id: number;
//   name: string;
//   quantity: number;
//   unit_price: number;
//   image_url: string | null;
// }

const MenuActionItem: React.FC<{ item: MenuItemProps; onPress: (action: string) => void }> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity onPress={() => onPress(item.action)} style={styles.menuItem}>
    <Ionicons
      name={item.icon as any}
      size={24}
      color={item.color || '#4B5563'}
      style={styles.menuIcon}
    />
    <Text style={[styles.menuText, { color: item.color || '#1F2937' }]}>{item.text}</Text>
  </TouchableOpacity>
);

type OrderItemCardProps = {
  item: ActiveOrder;
  navigation: CompositeScreenProps<
    BottomTabScreenProps<AppTabParamList, typeof ROUTES.ORDER_TAB>,
    NativeStackScreenProps<AppStackParamList>
  >['navigation'];
  onShowMenu: (item: ActiveOrder) => void;
};

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, navigation, onShowMenu }) => {
  // [SỬA LỖI] Thêm dòng này để khai báo state
  const [isToggling, setIsToggling] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // [MỚI] Notification count cho order này
  const { isOnline } = useNetwork();
  const formatTimeElapsed = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 1000);
    if (diff < 60) return `${diff}s`;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) return `${hours}h ${remainingMinutes}'`;
    return `${remainingMinutes}'`;
  };

  const displayTableName = item.tables.map((t) => t.name).join(', ');
  const representativeTable = item.tables[0];

  const handlePressCard = () => {
    navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
      tableId: representativeTable.id,
      tableName: displayTableName,
      orderId: item.orderId,
    });
  };

  const handleToggleProvisionalBill = async () => {
     if (!isOnline) {
      Toast.show({ type: 'error', text1: 'Không có kết nối mạng' });
      return;
    }

    // Nếu đã bật tạm tính rồi thì chỉ show thông báo đã cập nhật
    // (Realtime subscription sẽ tự động refresh)
    if (item.is_provisional) {
      Toast.show({
        type: 'success',
        text1: 'Đã cập nhật',
        text2: `Dữ liệu sẽ được cập nhật tự động qua realtime.`
      });
      return;
    }

    setIsToggling(true);
    try {
        const { error } = await supabase
            .from('orders')
            .update({ is_provisional: true })
            .eq('id', item.orderId);
        
        if (error) throw error;
        
        Toast.show({
            type: 'success',
            text1: 'Đã thêm vào Tạm tính',
            text2: `Bàn ${displayTableName} đã được thêm vào tab Tạm tính`
        });
    } catch (error: any) {
        Alert.alert("Lỗi", "Không thể thêm vào tạm tính: " + error.message);
    } finally {
        setIsToggling(false);
    }
  };

  // [MỚI] Fetch notification count cho order này
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // [FIX] Lọc bỏ 'return_item' (notification từ nhân viên gửi cho bếp, không phải cho nhân viên)
        // Chỉ lấy: item_ready, out_of_stock, cancellation_approved, cancellation_rejected
        const { count, error } = await supabase
          .from('return_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', item.orderId)
          .eq('status', 'pending')
          .neq('notification_type', 'return_item');
        
        if (error) throw error;
        setNotificationCount(count || 0);
      } catch (error: any) {
        console.error('Lỗi fetch notification:', error.message);
      }
    };

    fetchNotifications();

    // [MỚI] Subscribe realtime notification - Filter by order_id
    const channel = supabase
      .channel(`return_notifications_for_order_${item.orderId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', // Lắng nghe mọi thay đổi để cập nhật UI
          schema: 'public', 
          table: 'return_notifications',
          filter: `order_id=eq.${item.orderId}`
        },
        (payload: any) => {
          // [FIX] Chỉ fetch lại nếu notification_type KHÔNG phải 'return_item'
          // return_item là nhân viên gửi cho bếp, không cần update badge ở OrderScreen
          if (payload.new?.notification_type !== 'return_item') {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.orderId]);

  
  return (
    <View style={styles.cardShadow} className="bg-white rounded-lg mb-4 mx-4">
      <TouchableOpacity onPress={handlePressCard}>
        <View
          style={{ backgroundColor: '#3B82F6' }}
          className="flex-row justify-between items-center p-3 rounded-t-lg"
        >
          {/* [CẬP NHẬT] Thêm thời gian lên header */}
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="white" />
            <Text className="text-white font-bold text-sm ml-2">
              {formatTimeElapsed(item.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="copy-outline" size={16} color="white" />
            <Text className="text-white font-bold text-sm ml-1">{item.totalItemCount}</Text>
          </View>
        </View>
        <View className="flex-row p-4 items-start">
          <View className="w-1/2 items-start justify-center border-r border-gray-200 pr-4">
            <Text className="text-gray-800 font-bold text-xl">{displayTableName}</Text>
          </View>
          <View className="w-1/2 pl-4 items-end">
            {/* [CẬP NHẬT] Chỉ để lại số tiền, bỏ thời gian */}
            <Text className="text-gray-900 font-bold text-2xl">
              {item.totalPrice.toLocaleString('vi-VN')}
            </Text>
            <View className="flex-row items-center justify-end mt-1">
              {item.is_provisional && <Ionicons name="restaurant" size={22} color="#2E8540" />}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View className="flex-row justify-around items-center bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
              tableId: representativeTable.id,
              tableName: displayTableName,
              orderId: item.orderId,
            })
          }
          className="py-3 items-center justify-center flex-1"
        >
          <Ionicons name="calculator-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTES.MENU, {
              tableId: representativeTable.id,
              tableName: displayTableName,
              orderId: item.orderId,
            })
          }
          className="py-3 items-center justify-center flex-1"
        >
          <Ionicons name="restaurant-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleProvisionalBill}
          disabled={isToggling}
          className="py-3 items-center justify-center flex-1"
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Ionicons
              name={item.is_provisional ? "checkmark-done-outline" : "receipt-outline"}
              size={24}
              color={item.is_provisional ? '#2E8540' : 'gray'}
            />
          )}
        </TouchableOpacity>
        {/* [MỚI] Nút thông báo riêng cho bàn */}
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.RETURN_NOTIFICATIONS, { orderId: item.orderId })}
          className="py-3 items-center justify-center flex-1 relative"
          style={{ position: 'relative' }}
        >
          <Ionicons name="notifications-outline" size={24} color={notificationCount > 0 ? '#EF4444' : 'gray'} />
          {notificationCount > 0 && (
            <View style={{
              position: 'absolute',
              top: 2,
              right: 6,
              backgroundColor: '#EF4444',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 5,
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onShowMenu(item)}
          className="py-3 items-center justify-center flex-1"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

type OrderScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, typeof ROUTES.ORDER_TAB>,
  NativeStackScreenProps<AppStackParamList>
>;

const OrderScreen = ({ navigation }: OrderScreenProps) => {
  const insets = useSafeAreaInsets();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ActiveOrder | null>(null);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);

  const fetchActiveOrders = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      // [CẬP NHẬT] Lấy thêm cột is_provisional
      const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id, 
        created_at, 
        is_provisional,
        order_items(quantity, unit_price, returned_quantity, menu_items(is_available)), 
        order_tables(tables(id, name))
      `
      )
      .in('status', ['pending', 'paid']);

      if (error) throw error;

      const formattedOrders: ActiveOrder[] = data
        .map((order) => {
          // [SỬA LỖI TẠI ĐÂY] Tính lại tổng tiền và số lượng sau khi trừ món trả
          const billableItems = order.order_items.filter(
            (item: any) => item.menu_items?.is_available !== false
          );

          const totalPrice = billableItems.reduce(
            (sum, item) => sum + (item.quantity - (item.returned_quantity || 0)) * item.unit_price,
            0
          );
          const totalItemCount = billableItems.reduce(
              (sum, item) => sum + (item.quantity - (item.returned_quantity || 0)),
              0
          );
          const tables = order.order_tables.map((ot: any) => ot.tables).filter(Boolean);

          return {
            orderId: order.id,
            representativeTableId: tables[0]?.id,
            tables: tables,
            totalPrice, 
            createdAt: order.created_at,
            totalItemCount, 
            is_provisional: order.is_provisional,
          };
        })
        .filter((order) => order.totalItemCount > 0);

      formattedOrders.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setActiveOrders(formattedOrders);
    } catch (error: any) {
      if (isInitialLoad) Alert.alert('Lỗi', `Không thể tải danh sách order: ${error.message}`);
      else console.log('Lỗi fetch nền:', error.message);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveOrders(true);
    }, [fetchActiveOrders])
  );

  useEffect(() => {
    const channel = supabase
      .channel('public:orders_and_tables_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        fetchActiveOrders(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveOrders]);

  const menuActions: MenuItemProps[] = [
    { icon: 'notifications-outline', text: 'Kiểm tra lên món', action: 'check_served_status' },
    {
      icon: 'swap-horizontal-outline',
      text: 'Chuyển bàn',
      action: 'transfer_table',
      color: '#3B82F6',
    },
    { icon: 'layers-outline', text: 'Ghép Order (Thêm món)', action: 'merge_order' },
    {
      icon: 'apps-outline',
      text: 'Gộp Bàn (Chung bill)',
      action: 'group_tables',
      color: '#10B981',
    },
    { icon: 'git-compare-outline', text: 'Tách order', action: 'split_order' },
    { icon: 'close-circle-outline', text: 'Hủy order', action: 'cancel_order', color: '#EF4444' },
  ];

  const handleShowMenu = (order: ActiveOrder) => {
    setSelectedOrder(order);
    setMenuVisible(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedOrder) return;
    
    // 1. Đóng modal
    setCancelModalVisible(false);

    // 2. Thực thi logic hủy
    try {
      const { error } = await supabase.rpc('cancel_order_and_reset_tables', {
        p_order_id: selectedOrder.orderId
      });
      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Đã hủy order',
        text2: `Order cho ${selectedOrder.tables.map(t => t.name).join(', ')} đã được hủy thành công.`
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi hủy order',
        text2: err.message
      });
    }
  };


  const handleMenuAction = (action: string) => {
    setMenuVisible(false);
    if (!selectedOrder) return;
    const isSingleTable = selectedOrder.tables.length === 1;
    const representativeTable = selectedOrder.tables[0];
    const displayTableName = selectedOrder.tables.map((t) => t.name).join(', ');

    setTimeout(() => {
      switch (action) {
        case 'check_served_status':
          navigation.navigate(ROUTES.SERVE_STATUS, {
            orderId: selectedOrder.orderId,
            tableName: displayTableName,
          });
          break;
        case 'transfer_table':
          if (isSingleTable) {
            navigation.navigate(ROUTES.TABLE_SELECTION, {
              mode: 'single',
              action: 'transfer',
              sourceRoute: ROUTES.ORDER_TAB,
              sourceTable: {
                id: representativeTable.id,
                name: representativeTable.name,
                orderId: selectedOrder.orderId,
              },
            });
          } else {
            Alert.alert('Thông báo', 'Chức năng chuyển cả nhóm bàn đang được phát triển.');
          }
          break;
        case 'merge_order':
          navigation.navigate(ROUTES.TABLE_SELECTION, {
            mode: 'multiple',
            action: 'merge',
            sourceRoute: ROUTES.ORDER_TAB,
            sourceTable: {
              id: representativeTable.id,
              name: displayTableName,
              orderId: selectedOrder.orderId,
            },
          });
          break;
        case 'group_tables':
          navigation.navigate(ROUTES.TABLE_SELECTION, {
            mode: 'multiple',
            action: 'group',
            sourceRoute: ROUTES.ORDER_TAB,
            sourceTable: {
              id: representativeTable.id,
              name: displayTableName,
              orderId: selectedOrder.orderId,
            },
          });
          break;
        case 'split_order':
          // Bước 1: Điều hướng đến màn hình chọn bàn TRỐNG
          navigation.navigate(ROUTES.TABLE_SELECTION, {
            mode: 'single',
            action: 'split', // Sử dụng action 'split' để lọc bàn trống
            sourceRoute: ROUTES.ORDER_TAB,
            // Truyền thông tin cần thiết để sau đó điều hướng đến SplitOrderScreen
            sourceTable: {
              id: representativeTable.id,
              name: displayTableName,
              orderId: selectedOrder.orderId,
            },
          });
          break;
        case 'cancel_order':
          // --- [THAY THẾ ALERT BẰNG VIỆC MỞ MODAL] ---
          setCancelModalVisible(true);
          break;
        default:
          break;
      }
    }, 200);
  };

  const renderMenuModal = () => (
    <Modal
      transparent={true}
      visible={isMenuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>
            Tùy chọn cho {selectedOrder?.tables.map((t) => t.name).join(', ')}
          </Text>
          {menuActions.map((item) => (
            <MenuActionItem key={item.action} item={item} onPress={handleMenuAction} />
          ))}
        </View>
      </Pressable>
    </Modal>
  );
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Đang tải danh sách order...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View
        style={{ paddingTop: insets.top + 20, backgroundColor: '#FFFFFF' }}
        className="px-5 pt-4 pb-3 border-b border-gray-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Order</Text>
            <TouchableOpacity className="flex-row items-center mt-1">
              <Text className="text-base text-gray-500">Đang phục vụ</Text>
              <Ionicons name="caret-down" size={16} color="#6B7280" className="ml-1" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {/* Nút refresh */}
            <TouchableOpacity
              onPress={() => fetchActiveOrders(true)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center"
              style={styles.menuButtonShadow}
            >
              <Ionicons name="refresh" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={activeOrders}
        renderItem={({ item }) => (
          <OrderItemCard item={item} navigation={navigation} onShowMenu={handleShowMenu} />
        )}
        keyExtractor={(item) => item.orderId.toString()}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Ionicons name="file-tray-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">Không có order nào đang phục vụ</Text>
          </View>
        }
      />
      {renderMenuModal()}

      {/* --- [PHẦN BỊ THIẾU ĐÃ ĐƯỢC THÊM LẠI] --- */}
      {selectedOrder && (
         <ConfirmModal
            isVisible={isCancelModalVisible}
            title="Xác nhận Hủy Order"
            message={`Toàn bộ order cho bàn "${selectedOrder.tables.map(t => t.name).join(', ')}" sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?`}
            confirmText="Hủy Order"
            cancelText="Không"
            onClose={() => setCancelModalVisible(false)}
            onConfirm={handleConfirmCancelOrder}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    width: '85%',
    maxWidth: 350,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon: { width: 40, textAlign: 'center' },
  menuText: { fontSize: 16, marginLeft: 10 },
});

export default OrderScreen;
