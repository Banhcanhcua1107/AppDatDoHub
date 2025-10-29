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
  const [isToggling, setIsToggling] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
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
    if (!representativeTable?.id) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không có thông tin bàn' });
      return;
    }
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

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
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

    const channel = supabase
      .channel(`return_notifications_for_order_${item.orderId}`)
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public', 
          table: 'return_notifications',
          filter: `order_id=eq.${item.orderId}`
        },
        (payload: any) => {
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
          onPress={() => {
            if (!representativeTable?.id) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không có thông tin bàn' });
              return;
            }
            navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
              tableId: representativeTable.id,
              tableName: displayTableName,
              orderId: item.orderId,
            });
          }}
          className="py-3 items-center justify-center flex-1"
        >
          <Ionicons name="calculator-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!representativeTable?.id) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không có thông tin bàn' });
              return;
            }
            navigation.navigate(ROUTES.MENU, {
              tableId: representativeTable.id,
              tableName: displayTableName,
              orderId: item.orderId,
            });
          }}
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
  // [THÊM] State để quản lý modal xác nhận đóng tất cả
  const [isCloseAllModalVisible, setCloseAllModalVisible] = useState(false);

  const fetchActiveOrders = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id, 
        created_at, 
        status,
        is_provisional,
        order_items(quantity, unit_price, returned_quantity, menu_items(is_available)), 
        order_tables(tables(id, name))
      `
      )
      .neq('status', 'completed'); // Fetch tất cả NGOẠI TRỪ completed (pending, paid, closed đều lấy)

      if (error) throw error;

      const formattedOrders: ActiveOrder[] = data
        .filter((order: any) => order.status !== 'closed') // Client-side filter: loại bỏ closed orders
        .map((order) => {
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
      .channel('public:orders_realtime_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' }, // Chỉ lắng nghe UPDATE trên orders table
        (payload) => {
          console.log('[Realtime] Order updated:', payload.new?.status);
          fetchActiveOrders(false); // Refetch ngay khi order thay đổi
        }
      )
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
    setCancelModalVisible(false);
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

  // [THÊM] Hàm gọi RPC để đóng tất cả order và reset bàn
  const handleConfirmCloseAll = async () => {
    setCloseAllModalVisible(false);
    setLoading(true);
    try {
        const { data, error } = await supabase.rpc('force_close_all_active_sessions');
        if (error) throw error;
        Toast.show({
            type: 'success',
            text1: 'Hoàn tất',
            text2: data 
        });
        await fetchActiveOrders(true);
    } catch (err: any) {
        Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: `Không thể dọn dẹp: ${err.message}`
        });
    } finally {
        setLoading(false);
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
          navigation.navigate(ROUTES.TABLE_SELECTION, {
            mode: 'single',
            action: 'split',
            sourceRoute: ROUTES.ORDER_TAB,
            sourceTable: {
              id: representativeTable.id,
              name: displayTableName,
              orderId: selectedOrder.orderId,
            },
          });
          break;
        case 'cancel_order':
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
            <TouchableOpacity
              onPress={() => fetchActiveOrders(true)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center"
              style={styles.menuButtonShadow}
            >
              <Ionicons name="refresh" size={24} color="#111827" />
            </TouchableOpacity>
            {/* [THÊM] Nút "Đóng tất cả" */}
            <TouchableOpacity
              onPress={() => setCloseAllModalVisible(true)}
              disabled={activeOrders.length === 0} // Vô hiệu hóa nếu không có order
              className="w-12 h-12 bg-white rounded-full items-center justify-center"
              style={[styles.menuButtonShadow, activeOrders.length === 0 && { opacity: 0.5 }]}
            >
              <Ionicons name="power-outline" size={28} color="#EF4444" />
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
      
      {selectedOrder && (
         <ConfirmModal
            isVisible={isCancelModalVisible}
            title="Xác nhận Hủy Order"
            message={`Toàn bộ order cho bàn "${selectedOrder.tables.map(t => t.name).join(', ')}" sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?`}
            confirmText="Hủy Order"
            cancelText="Không"
            onClose={() => setCancelModalVisible(false)}
            onConfirm={handleConfirmCancelOrder}
            variant="danger"
        />
      )}
      {/* [THÊM] Modal xác nhận hành động đóng tất cả */}
      <ConfirmModal
          isVisible={isCloseAllModalVisible}
          title="Xác nhận Dọn dẹp Hệ thống"
          message="Tất cả order đang phục vụ sẽ bị ĐÓNG và tất cả bàn sẽ được reset về 'Trống'. Bạn chắc chắn muốn tiếp tục?"
          confirmText="Đồng ý, Dọn dẹp"
          cancelText="Hủy"
          onClose={() => setCloseAllModalVisible(false)}
          onConfirm={handleConfirmCloseAll}
          variant="danger"
      />
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