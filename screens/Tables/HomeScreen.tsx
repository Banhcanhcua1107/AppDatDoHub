// screens/Home/HomeScreen.tsx

import React, { useState, useCallback } from 'react'; // [SỬA LỖI] Thêm useCallback
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabParamList, AppStackParamList, ROUTES } from '../../constants/routes';
import { supabase } from '../../services/supabase';
import OrderInfoBox from '../Menu/OrderInfoBox';
import EmptyTableActionBox from '../Menu/EmptyTableActionBox';
import ConfirmModal from '../../components/ConfirmModal';
import ActionSheetModal from '../../components/ActionSheetModal';

type TableStatus = 'Trống' | 'Đang phục vụ' | 'Đặt trước';

type TableItemData = {
  id: string;
  name: string;
  status: TableStatus;
  seats?: number;
  has_out_of_stock_alert?: boolean;
  orderId?: string; // [MỚI] Thêm orderId để truyền khi mở thông báo
};

// --- Component StatusLegend và TableGridItem không thay đổi ---
const StatusLegend: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <View className="flex-row items-center mr-5">
    <View style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm mr-2" />
    <Text className="text-gray-600">{text}</Text>
  </View>
);

const TableGridItem: React.FC<{
  item: TableItemData;
  onPress: () => void;
  onLongPress: () => void;
  onAlertPress?: () => void; // [MỚI] Callback khi bấm icon cảnh báo
}> = ({ item, onPress, onLongPress, onAlertPress }) => {
  const getStatusTheme = () => {
    switch (item.status) {
      case 'Trống':
        return { color: '#3B82F6', textColor: 'text-blue-500' };
      case 'Đang phục vụ':
        return { color: '#4B5563', textColor: 'text-slate-600' };
      case 'Đặt trước':
        return { color: '#4338CA', textColor: 'text-indigo-600' };
      default:
        return { color: '#A1A1AA', textColor: 'text-zinc-400' };
    }
  };
  const theme = getStatusTheme();
  const handlePress = () => {
    console.log('[TableGridItem] handlePress called for item:', item.id, item.name);
    onPress();
  };
  
  return (
    <View className="w-1/2 p-2">
      <Pressable
        onPress={handlePress}
        onLongPress={() => {
          console.log('[TableGridItem] onLongPress called for item:', item.id, item.name);
          onLongPress();
        }}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <View className="bg-white rounded-2xl p-4" style={styleSheet.shadow}>
          {/* Header với tên bàn và icon cảnh báo */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <Icon name="reader-outline" size={30} color={theme.color} />
              <Text className="text-base font-bold text-gray-800 ml-2">{item.name}</Text>
            </View>
            {item.has_out_of_stock_alert && (
              <TouchableOpacity onPress={onAlertPress} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Icon name="alert-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row items-center justify-between">
            <Text className={`text-sm font-semibold ${theme.textColor}`}>{item.status}</Text>
            {item.seats && (
              <View className="flex-row items-center">
                <Icon name="people-outline" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">{item.seats} chỗ</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};


type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, typeof ROUTES.HOME_TAB>,
  NativeStackScreenProps<AppStackParamList>
>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [tables, setTables] = useState<TableItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBoxVisible, setBoxVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{ id: string; name: string } | null>(null);
  const [emptyTableBoxVisible, setEmptyTableBoxVisible] = useState(false);
  const [selectedEmptyTable, setSelectedEmptyTable] = useState<{ id: string; name: string } | null>(null);
  
  const [cancelReservationModal, setCancelReservationModal] = useState<{
    visible: boolean;
    table: TableItemData | null;
  }>({ visible: false, table: null });
  
  const [actionSheetVisible, setActionSheetVisible] = useState<{
    visible: boolean;
    table: TableItemData | null;
  }>({ visible: false, table: null });

  // [SỬA LỖI] Tách hàm fetchTables ra và không cho nó phụ thuộc vào state `loading`
  const fetchTables = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true); // Chỉ set loading true khi là lần load đầu

    try {
        console.log('[fetchTables] Starting to fetch tables...');
        const { data, error } = await supabase.rpc('get_tables_with_notifications');

        if (error) {
            console.error('[fetchTables] RPC Error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách bàn: ' + error.message);
            return;
        }

        if (!data || !Array.isArray(data)) {
            console.warn('[fetchTables] No data returned or data is not array:', data);
            setTables([]);
            return;
        }

        console.log('[fetchTables] Fetched', data.length, 'tables');
        
        // [MỚI] Lấy orderId cho mỗi bàn
        const tablesWithOrders = await Promise.all(
          data.map(async (item: any) => {
            try {
              const { data: orderData } = await supabase
                .from('order_tables')
                .select('orders(id)')
                .eq('table_id', item.id)
                .in('orders.status', ['pending', 'paid'])
                .limit(1)
                .maybeSingle(); // [FIX] Dùng maybeSingle thay single để tránh error khi không có data
              
              return {
                ...item,
                id: String(item.id),
                orderId: orderData?.orders?.id || undefined,
              };
            } catch (err) {
              console.warn('[fetchTables] Error fetching order for table', item.id, ':', err);
              return {
                ...item,
                id: String(item.id),
              };
            }
          })
        );
        
        console.log('[fetchTables] Successfully processed', tablesWithOrders.length, 'tables');
        setTables(tablesWithOrders);
    } catch (error: any) {
        console.error('[fetchTables] Exception:', error.message);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải danh sách bàn');
    } finally {
        if (isInitialLoad) setLoading(false); // Đảm bảo luôn set loading false sau khi load xong
    }
  }, []); // Dependency array rỗng để hàm không bị tạo lại

  // [SỬA LỖI] Cấu trúc lại useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // Gọi fetchTables cho lần load đầu tiên
      fetchTables(true);

      const tablesChannel = supabase
        .channel('public:tables_home')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, 
        () => fetchTables(false) // Gọi refresh nền, không set loading
        )
        .subscribe();
      
      const notificationsChannel = supabase
        .channel('public:return_notifications_home')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'return_notifications' }, (payload) => {
            if(payload.new?.notification_type === 'out_of_stock' || payload.old?.notification_type === 'out_of_stock') {
                 fetchTables(false); // Gọi refresh nền, không set loading
            }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(tablesChannel);
        supabase.removeChannel(notificationsChannel);
      };
    }, [fetchTables]) // Chỉ phụ thuộc vào fetchTables (hàm này giờ đã ổn định)
  );


  const handlePressTable = (table: TableItemData) => {
    console.log('[handlePressTable] Table pressed:', { id: table.id, name: table.name, has_alert: table.has_out_of_stock_alert });
    if (table.has_out_of_stock_alert) {
        console.log('[handlePressTable] Has out of stock alert, showing modal');
        setSelectedTable({ id: table.id, name: table.name });
        setBoxVisible(true); 
        return;
    }

    if (table.status === 'Trống') {
      setSelectedEmptyTable({ id: table.id, name: table.name });
      setEmptyTableBoxVisible(true);
    } else if (table.status === 'Đang phục vụ') {
      setSelectedTable({ id: table.id, name: table.name });
      setBoxVisible(true);
    } else if (table.status === 'Đặt trước') {
      setActionSheetVisible({ visible: true, table });
    }
  };

  const handleLongPressTable = (table: TableItemData) => {
    if (table.status === 'Trống') {
      setActionSheetVisible({ visible: true, table });
    }
  };

  const updateTableStatus = async (tableId: string, status: TableStatus) => {
    const { error } = await supabase.from('tables').update({ status: status }).eq('id', tableId);
    if (error) Alert.alert('Lỗi', `Không thể cập nhật trạng thái bàn thành "${status}".`);
  };

  // Các hàm còn lại giữ nguyên, không thay đổi
  // ... (handleEmptyTableAction, handleOrderAction, return JSX...)
    const handleEmptyTableAction = (action: string, data?: any) => {
    setEmptyTableBoxVisible(false);
    if (!data?.tableId) {
      return;
    }

    switch (action) {
      case 'enter_table':
        navigation.navigate(ROUTES.MENU, {
          tableId: data.tableId,
          tableName: data.tableName,
        });
        break;

      case 'group_tables':
        navigation.navigate(ROUTES.TABLE_SELECTION, {
          mode: 'multiple',
          action: 'group',
          sourceRoute: ROUTES.HOME_TAB,
          sourceTable: { id: data.tableId, name: data.tableName },
        });
        break;

      case 'reserve_table':
        updateTableStatus(data.tableId, 'Đặt trước');
        break;

      default:
        break;
    }
  };

  const handleOrderAction = (action: string, data?: any) => {
    setBoxVisible(false);
    if (!data?.tableId) {
      return;
    }
    
    switch (action) {
      case 'go_to_order_details':
      case 'go_to_payment':
        navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
          tableId: data.tableId,
          tableName: data.tableName,
          orderId: data.orderId,
        });
        break;
        
      case 'add_new_order':
      case 'add_items':
        navigation.navigate(ROUTES.MENU, {
          tableId: data.tableId,
          tableName: data.tableName,
          orderId: data.orderId,
        });
        break;
        
      case 'check_served_status':
        navigation.navigate(ROUTES.SERVE_STATUS, {
          orderId: data.orderId,
          tableName: data.tableName,
        });
        break;
        
      case 'transfer_table':
        navigation.navigate(ROUTES.TABLE_SELECTION, {
          mode: 'single',
          action: 'transfer',
          sourceRoute: ROUTES.HOME_TAB,
          sourceTable: { id: data.tableId, name: data.tableName, orderId: data.orderId },
        });
        break;
        
      case 'merge_order':
        navigation.navigate(ROUTES.TABLE_SELECTION, {
          mode: 'multiple',
          action: 'merge',
          sourceRoute: ROUTES.HOME_TAB,
          sourceTable: { id: data.tableId, name: data.tableName, orderId: data.orderId },
        });
        break;
        
      case 'group_tables':
        navigation.navigate(ROUTES.TABLE_SELECTION, {
          mode: 'multiple',
          action: 'group',
          sourceRoute: ROUTES.HOME_TAB,
          sourceTable: { id: data.tableId, name: data.tableName, orderId: data.orderId },
        });
        break;
        
      case 'split_order':
        navigation.navigate(ROUTES.TABLE_SELECTION, {
          mode: 'single',
          action: 'split',
          sourceRoute: ROUTES.HOME_TAB,
          sourceTable: { id: data.tableId, name: data.tableName, orderId: data.orderId },
        });
        break;
        
      case 'print_check':
        Alert.alert('Thông báo', 'Chức năng in phiếu kiểm đồ đang được phát triển.');
        break;
        
      default:
        break;
    }
  };
  
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8F9FA',
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  console.log('[HomeScreen] Render with tables:', { count: tables.length, tables: tables.map(t => ({ id: t.id, name: t.name, status: t.status })) });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: insets.top + 20 }} className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Quản lý bàn</Text>
            <Text className="text-base text-gray-500">Nhấn để order, nhấn giữ để đặt bàn</Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={styleSheet.menuButtonShadow}
          >
            <Icon name="menu" size={26} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row justify-start px-5 py-3">
        <StatusLegend color="#3B82F6" text="Trống" />
        <StatusLegend color="#4B5563" text="Phục vụ" />
        <StatusLegend color="#4338CA" text="Đặt trước" />
      </View>
      <FlatList
        data={tables}
        renderItem={({ item }) => (
          <TableGridItem
            item={item}
            onPress={() => handlePressTable(item)}
            onLongPress={() => handleLongPressTable(item)}
            onAlertPress={() => {
              // [MỚI] Điều hướng đến trang thông báo chỉ cho order của bàn này
              if (item.orderId) {
                navigation.navigate(ROUTES.RETURN_NOTIFICATIONS, {
                  orderId: item.orderId,
                });
              } else {
                Alert.alert('Thông báo', 'Bàn này không có order nào đang phục vụ.');
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100, paddingTop: 16 }}
      />
      {selectedTable?.id && (
        <OrderInfoBox
          isVisible={isBoxVisible && !!selectedTable?.id}
          onClose={() => {
            setBoxVisible(false);
            setSelectedTable(null);
          }}
          tableId={selectedTable.id}
          tableName={selectedTable.name}
          onActionPress={handleOrderAction}
        />
      )}
      {selectedEmptyTable?.id && (
        <EmptyTableActionBox
          isVisible={emptyTableBoxVisible && !!selectedEmptyTable?.id}
          onClose={() => {
            setEmptyTableBoxVisible(false);
            setSelectedEmptyTable(null);
          }}
          tableId={selectedEmptyTable.id}
          tableName={selectedEmptyTable.name}
          onAction={handleEmptyTableAction}
        />
      )}
      <ActionSheetModal
        visible={actionSheetVisible.visible && actionSheetVisible.table?.status === 'Đặt trước'}
        onClose={() => setActionSheetVisible({ visible: false, table: null })}
        title={`Bàn ${actionSheetVisible.table?.name} đã được đặt`}
        actions={[
          {
            id: 'cancel_reservation',
            icon: 'close-circle-outline',
            text: 'Hủy đặt',
            color: '#EF4444',
            onPress: () => {
              if (actionSheetVisible.table) {
                setCancelReservationModal({ visible: true, table: actionSheetVisible.table });
              }
              setActionSheetVisible({ visible: false, table: null });
            },
          },
          {
            id: 'start_service',
            icon: 'play-circle-outline',
            text: 'Bắt đầu phục vụ',
            color: '#10B981',
            onPress: () => {
              if (actionSheetVisible.table) {
                navigation.navigate(ROUTES.MENU, {
                  tableId: actionSheetVisible.table.id,
                  tableName: actionSheetVisible.table.name,
                });
              }
              setActionSheetVisible({ visible: false, table: null });
            },
          },
        ]}
      />
      <ActionSheetModal
        visible={actionSheetVisible.visible && actionSheetVisible.table?.status === 'Trống'}
        onClose={() => setActionSheetVisible({ visible: false, table: null })}
        title={`Tùy chọn cho ${actionSheetVisible.table?.name}`}
        actions={[
          {
            id: 'create_order',
            icon: 'restaurant-outline',
            text: 'Tạo Order',
            color: '#10B981',
            onPress: () => {
              if (actionSheetVisible.table) {
                navigation.navigate(ROUTES.MENU, {
                  tableId: actionSheetVisible.table.id,
                  tableName: actionSheetVisible.table.name,
                });
              }
              setActionSheetVisible({ visible: false, table: null });
            },
          },
          {
            id: 'reserve_table',
            icon: 'bookmark-outline',
            text: 'Đặt trước',
            color: '#3B82F6',
            onPress: () => {
              if (actionSheetVisible.table) {
                updateTableStatus(actionSheetVisible.table.id, 'Đặt trước');
              }
              setActionSheetVisible({ visible: false, table: null });
            },
          },
        ]}
      />
      <ConfirmModal
        isVisible={cancelReservationModal.visible}
        title="Xác nhận Hủy Đặt"
        message={`Bạn có chắc muốn hủy đặt ${cancelReservationModal.table?.name}?`}
        onClose={() => setCancelReservationModal({ visible: false, table: null })}
        onConfirm={() => {
          if (cancelReservationModal.table) {
            updateTableStatus(cancelReservationModal.table.id, 'Trống');
          }
          setCancelReservationModal({ visible: false, table: null });
        }}
        confirmText="Hủy đặt"
        cancelText="Không"
        variant="warning"
      />
    </View>
  );
};

const styleSheet = StyleSheet.create({
  shadow: {
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  menuButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  alertIconContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
    zIndex: 1,
  },
});

export default HomeScreen;