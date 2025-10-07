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
    setIsToggling(true);
    try {
        const { error } = await supabase.rpc('toggle_provisional_bill_status', {
            p_order_id: item.orderId
        });
        if (error) throw error;
        // Giao diện sẽ tự cập nhật nhờ real-time
        Toast.show({
            type: 'info',
            text1: `Đã ${item.is_provisional ? 'hủy' : 'gửi'} tạm tính`,
            text2: `Bàn ${displayTableName} đã được cập nhật.`
        });
    } catch (error: any) {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái tạm tính: " + error.message);
    } finally {
        setIsToggling(false);
    }
  };

  // const handleNavigateToReturnOrBill = async () => {
  //   setIsToggling(true);
  //   try {
  //     // Lấy danh sách các món trong order để truyền sang màn hình trả món
  //     const { data: orderItems, error } = await supabase
  //       .from('order_items')
  //       .select(
  //         `
  //               id,
  //               quantity,
  //               unit_price,
  //               menu_items (
  //                   name,
  //                   image_url
  //               )
  //           `
  //       )
  //       .eq('order_id', item.orderId)
  //       .gt('quantity', 0); // Chỉ lấy những món có số lượng > 0

  //     if (error) throw error;

  //     // Định dạng lại dữ liệu cho đúng với kiểu ItemToReturn
  //     const formattedItems: ItemToReturn[] = orderItems.map((oi: any) => ({
  //       id: oi.id,
  //       name: oi.menu_items?.name || 'Món không xác định',
  //       quantity: oi.quantity,
  //       unit_price: oi.unit_price,
  //       image_url: oi.menu_items?.image_url,
  //     }));

  //     // Điều hướng đến màn hình chọn món trả, với "source" để phân biệt luồng
  //     navigation.navigate(ROUTES.RETURN_SELECTION, {
  //       orderId: item.orderId,
  //       items: formattedItems,
  //       source: 'OrderScreen', // Đánh dấu là đi từ màn hình Order
  //     });
  //   } catch (error: any) {
  //     Alert.alert('Lỗi', 'Không thể lấy thông tin món ăn: ' + error.message);
  //   } finally {
  //     setIsToggling(false);
  //   }
  // };
  return (
    // [SỬA LỖI] Cấu trúc JSX được thay đổi ở đây
    <View style={styles.cardShadow} className="bg-white rounded-lg mb-4 mx-4">
      {/* TouchableOpacity này CHỈ bao bọc phần thông tin trên */}
      <TouchableOpacity onPress={handlePressCard}>
        <View
          style={{ backgroundColor: '#3B82F6' }}
          className="flex-row justify-between items-center p-3 rounded-t-lg"
        >
          <View />
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
            <View className="flex-row items-center justify-between w-full mt-1">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={15} color="gray" />
                <Text className="text-gray-600 text-sm ml-1">
                  {formatTimeElapsed(item.createdAt)}
                </Text>
              </View>
              {item.is_provisional && <Ionicons name="restaurant" size={22} color="#2E8540" />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {/* TouchableOpacity trên kết thúc tại đây */}

      {/* View chứa các icon nằm ở ngoài, là sibling, không còn bị lồng vào trong */}
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
        {/* [CẬP NHẬT] Nút này sẽ điều hướng đến màn hình trả món */}
        <TouchableOpacity
          onPress={handleToggleProvisionalBill} // <--- GỌI HÀM MỚI
          disabled={isToggling}
          className="py-3 items-center justify-center flex-1"
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Ionicons
              name="receipt-outline"
              size={24}
              color={item.is_provisional ? '#2E8540' : 'gray'} // <-- Màu thay đổi theo trạng thái
            />
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
          order_items(quantity, unit_price, returned_quantity), 
          order_tables(tables(id, name))
        `
        )
        .in('status', ['pending', 'paid']);

      if (error) throw error;

      const formattedOrders: ActiveOrder[] = data
        .map((order) => {
          // [SỬA LỖI TẠI ĐÂY] Tính lại tổng tiền và số lượng sau khi trừ món trả
          const totalPrice = order.order_items.reduce(
            (sum, item) => sum + (item.quantity - item.returned_quantity) * item.unit_price,
            0
          );
          const totalItemCount = order.order_items.reduce(
              (sum, item) => sum + (item.quantity - item.returned_quantity),
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
          Alert.alert(
            'Xác nhận Hủy Order', 
            `Toàn bộ order cho nhóm bàn "${displayTableName}" sẽ bị xóa vĩnh viễn và các bàn sẽ trở về trạng thái 'Trống'. Bạn có chắc chắn không?`, 
            [
              { text: 'Không' },
              { 
                text: 'Hủy Order', 
                style: 'destructive',
                onPress: async () => {
                  try {
                    // Gọi hàm RPC trên Supabase để hủy order
                    const { error } = await supabase.rpc('cancel_order_and_reset_tables', {
                      p_order_id: selectedOrder.orderId
                    });
                    if (error) throw error;

                    Toast.show({
                      type: 'success',
                      text1: 'Đã hủy order',
                      text2: `Order cho ${displayTableName} đã được hủy thành công.`
                    });
                    // Real-time sẽ tự động cập nhật lại danh sách, không cần gọi fetch lại
                  } catch (err: any) {
                    Toast.show({
                      type: 'error',
                      text1: 'Lỗi hủy order',
                      text2: err.message
                    });
                  }
                }
              },
            ]
          );
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
          <TouchableOpacity
            onPress={() => fetchActiveOrders(true)}
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={styles.menuButtonShadow}
          >
            <Ionicons name="refresh" size={24} color="#111827" />
          </TouchableOpacity>
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
