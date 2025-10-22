// --- START OF FILE HomeScreen.tsx ---

import React, { useState } from 'react';
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
type TableItemData = { id: string; name: string; status: TableStatus; seats?: number };

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
}> = ({ item, onPress, onLongPress }) => {
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
  return (
    <View className="w-1/2 p-2">
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <View className="bg-white rounded-2xl p-4" style={styleSheet.shadow}>
          <View className="flex-row items-center mb-2">
            <Icon name="reader-outline" size={30} color={theme.color} />
            <Text className="text-base font-bold text-gray-800 ml-2">{item.name}</Text>
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
  const [tables, setTables] = React.useState<TableItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  // [PHỤC HỒI] State để quản lý OrderInfoBox
  const [isBoxVisible, setBoxVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{ id: string; name: string } | null>(null);
  const [emptyTableBoxVisible, setEmptyTableBoxVisible] = useState(false);
  const [selectedEmptyTable, setSelectedEmptyTable] = useState<{ id: string; name: string } | null>(null);
  
  // State cho modals
  const [cancelReservationModal, setCancelReservationModal] = useState<{
    visible: boolean;
    table: TableItemData | null;
  }>({ visible: false, table: null });
  
  const [actionSheetVisible, setActionSheetVisible] = useState<{
    visible: boolean;
    table: TableItemData | null;
  }>({ visible: false, table: null });

  const fetchTables = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tables')
      .select('id, name, status, seats')
      .order('id', { ascending: true });
    if (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bàn.');
    } else if (data) {
      setTables(data.map((item) => ({ ...item, id: String(item.id) })));
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTables();
      const channel = supabase
        .channel('public:tables_home')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload) => {
          console.log('Table change detected, refetching.');
          fetchTables();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchTables])
  );

  // Hàm tạo bàn đã ẩn - chỉ admin có thể tạo thông qua hệ thống quản lý
  // const handleAddTable = async () => { ... };

  // [SỬA LỖI TRIỆT ĐỂ] Thay đổi luồng xử lý khi nhấn vào bàn
  const handlePressTable = (table: TableItemData) => {
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
    
    // Xử lý từng action cụ thể
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
        
      // cancel_order sẽ được xử lý trực tiếp trong OrderInfoBox
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

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      {/* ... (Phần Header không đổi) ... */}
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
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100, paddingTop: 16 }}
      />
      {/* FAB ẩn - Chỉ admin mới có thể tạo bàn thông qua hệ thống quản lý */}

      {selectedTable && (
        <OrderInfoBox
          isVisible={isBoxVisible}
          onClose={() => setBoxVisible(false)}
          tableId={selectedTable.id}
          tableName={selectedTable.name}
          onActionPress={handleOrderAction}
        />
      )}

      {selectedEmptyTable && (
        <EmptyTableActionBox
          isVisible={emptyTableBoxVisible}
          onClose={() => setEmptyTableBoxVisible(false)}
          tableId={selectedEmptyTable.id}
          tableName={selectedEmptyTable.name}
          onAction={handleEmptyTableAction}
        />
      )}

      {/* Action Sheet cho bàn Đặt trước */}
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

      {/* Action Sheet cho bàn Trống (long press) */}
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

      {/* Confirm Modal cho Hủy đặt */}
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
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomeScreen;
