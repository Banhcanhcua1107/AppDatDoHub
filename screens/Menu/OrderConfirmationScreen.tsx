// --- START OF FILE OrderConfirmationScreen.tsx ---
import React, { useState, useCallback, useEffect,  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';
import ReturnedItemsIndicatorCard from '../../components/ReturnedItemsIndicatorCard';
import ActionSheetModal, { ActionSheetItem } from '../../components/ActionSheetModal';
import Toast from 'react-native-toast-message';
import { useNetwork } from '../../context/NetworkContext';
import { offlineManager } from '../../services/OfflineManager';
import PaymentMethodBox from '../../components/PaymentMethodBox';
import BillContent from '../../components/BillContent';
import { BillItem } from '../Orders/ProvisionalBillScreen';
import ConfirmModal from '../../components/ConfirmModal';

// ... (Các interface DisplayItem, OrderSection, NoteInputModal, OrderListItem, ActionButton giữ nguyên như file của bạn)
// --- START OF FILE OrderConfirmationScreen.tsx ---
interface OrderSection {
  title: string;
  data: DisplayItem[];
}
interface DisplayItem {
  id: number;
  uniqueKey: string;
  name: string;
  quantity: number;
  unit_price: number;
  totalPrice: number;
  menuItemId?: number;
  customizations: any;
  isNew: boolean;
  isPaid: boolean;
  created_at?: string;
  status: string; 
  returned_quantity: number;
  image_url: string | null;
  isReturnedItem?: boolean;
  is_available?: boolean;
}

const NoteInputModal: React.FC<{
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (note: string) => void;
}> = ({ visible, initialValue, onClose, onSave }) => {
  const [note, setNote] = useState(initialValue);
  useEffect(() => {
    setNote(initialValue);
  }, [initialValue]);
  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Thêm ghi chú</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ví dụ: ít cay, không hành..."
            value={note}
            onChangeText={setNote}
            multiline
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={[styles.modalButtonText, styles.saveButtonText]}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};




const OrderListItem: React.FC<{
  item: DisplayItem;
  isExpanded: boolean;
  onPress: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
  onOpenMenu: () => void;
}> = ({ item, isExpanded, onPress, onUpdateQuantity, onOpenMenu }) => {
  const { customizations, isNew, isPaid, isReturnedItem, is_available, status } = item;
  const sizeText = customizations.size?.name || 'N/A';
  const sugarText = customizations.sugar?.name || 'N/A';
  const toppingsText =
    (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;
  
  const isOutOfStock = is_available === false;
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'served' || status === 'completed';

  const ExpandedView = () => (
    <View className="mt-4 pt-4 border-t border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-4">Số lượng:</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.quantity - 1)}
            disabled={!isNew || isOutOfStock}
            className={`w-8 h-8 items-center justify-center rounded-full ${(!isNew || isOutOfStock) ? 'bg-gray-100' : 'bg-gray-200'}`}
          >
            <Icon name="remove" size={18} color={(!isNew || isOutOfStock) ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text className="text-lg font-bold mx-4">{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.quantity + 1)}
            disabled={!isNew || isOutOfStock}
            className={`w-8 h-8 items-center justify-center rounded-full ${(!isNew || isOutOfStock) ? 'bg-gray-100' : 'bg-blue-500'}`}
          >
            <Icon name="add" size={18} color={(!isNew || isOutOfStock) ? '#ccc' : 'white'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onOpenMenu}
          disabled={isCompleted || isPaid || isReturnedItem || isOutOfStock}
          className="p-2"
          style={{ opacity: (isCompleted || isPaid || isReturnedItem || isOutOfStock) ? 0.5 : 1 }}
        >
          <Icon name="ellipsis-horizontal" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.shadow, (isPaid || isReturnedItem || isOutOfStock || isCompleted) && styles.paidItem]}
      className="bg-white rounded-2xl p-4 mb-4"
    >
      <TouchableOpacity onPress={onPress} disabled={isPaid || isReturnedItem || isOutOfStock || isCompleted}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            {(isCompleted) && !isReturnedItem && !isOutOfStock && (
              <Icon name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 6 }} />
            )}
            {isInProgress && !isOutOfStock && (
              <Icon name="flame" size={20} color="#F97316" style={{ marginRight: 6 }} />
            )}
            <Text
              className={`text-lg font-bold ${(isPaid || isReturnedItem || isOutOfStock || isCompleted) ? 'text-gray-500' : 'text-gray-800'} ${(isReturnedItem || isOutOfStock) ? 'line-through' : ''}`}
            >
              {item.name}
            </Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
            <Text className="text-sm text-gray-500">{`Topping: ${toppingsText}`}</Text>
            {noteText && (
                <View className="bg-yellow-50 p-2 rounded-md mt-2">
                  <Text className="text-sm text-yellow-800 italic">Ghi chú: {noteText}</Text>
                </View>
            )}
            </View>
            <View className="items-end">
            {isNew && (
                <View className="bg-blue-100 px-2 py-1 rounded-full mb-1">
                  <Text className="text-blue-800 text-xs font-bold">Mới</Text>
                </View>
            )}
            {isPaid && (
              <View className="bg-gray-200 px-2 py-1 rounded-full mb-1">
                <Text className="text-gray-600 text-xs font-bold">Đã trả bill</Text>
              </View>
            )}
            {isReturnedItem && (
              <View className="bg-red-100 px-2 py-1 rounded-full mb-1">
                <Text className="text-red-800 text-xs font-bold">Đã trả lại</Text>
              </View>
            )}
            {isOutOfStock && !isPaid && !isReturnedItem && (
              <View className="bg-red-100 px-2 py-1 rounded-full mb-1">
                <Text className="text-red-800 text-xs font-bold">Hết món</Text>
              </View>
            )}
            <Text
              className={`text-lg font-semibold ${(isPaid || isReturnedItem || isOutOfStock) ? 'text-gray-500 line-through' : 'text-gray-900'}`}
            >
              {item.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
        <View className="border-t border-dashed border-gray-200 mt-3 pt-2 flex-row justify-between items-center">
          <Text
            className={`text-base ${(isPaid || isReturnedItem || isOutOfStock) ? 'text-gray-500' : 'text-gray-600'}`}
          >
            {item.quantity} x {item.unit_price.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </TouchableOpacity>
      {isExpanded && <ExpandedView />}
    </View>
  );
};

const ActionButton: React.FC<{
  icon: string;
  text: string;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}> = ({ icon, text, color, disabled = false, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`items-center justify-center flex-1 ${disabled ? 'opacity-40' : 'opacity-100'}`}
  >
    <View
      style={{ backgroundColor: `${color}20` }}
      className="w-14 h-14 rounded-full items-center justify-center"
    >
      <Icon name={icon} size={28} color={color} />
    </View>
    <Text style={{ color }} className="mt-2 font-semibold text-xs text-center">
      {text}
    </Text>
  </TouchableOpacity>
);

type Props = NativeStackScreenProps<AppStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = ({ route, navigation }: Props) => {
  const {
    tableId: initialTableId,
    tableName: initialTableName,
    orderId: routeOrderId,
  } = route.params || {};
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const [loading, setLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(routeOrderId || null);

  const [displayedSections, setDisplayedSections] = useState<OrderSection[]>([]);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DisplayItem | null>(null);
  const [currentTables, setCurrentTables] = useState<{ id: string; name: string }[]>(
    initialTableId ? [{ id: initialTableId, name: initialTableName }] : []
  );
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ orderId: string; amount: number } | null>(null);
  const [isPaymentMethodBoxVisible, setPaymentMethodBoxVisible] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState<'keep' | 'end' | null>(null);
  const [isBillModalVisible, setBillModalVisible] = useState(false);
  const [cancelItemModal, setCancelItemModal] = useState<{
    visible: boolean;
    item: DisplayItem | null;
  }>({ visible: false, item: null });
  const [closeSessionModal, setCloseSessionModal] = useState(false);

  // ... (Toàn bộ các hàm khác như fetchAllData, handleUpdateQuantity, sendNewItemsToKitchen, v.v. giữ nguyên)
  // ... (Chúng không cần thay đổi vì lỗi nằm ở hàm thanh toán)
  const fetchAllData = useCallback(
    async (isInitialLoad = true) => {
      if (isInitialLoad) setLoading(true);
      try {
        let orderIdToFetch = activeOrderId;
        if (!orderIdToFetch && initialTableId) {
          const { data: orderLink } = await supabase
            .from('order_tables')
            .select('orders!inner(id)')
            .eq('table_id', initialTableId)
            .eq('orders.status', 'pending')
            .limit(1)
            .single();
          if (orderLink?.orders) {
            const foundOrder = Array.isArray(orderLink.orders)
              ? orderLink.orders[0]
              : orderLink.orders;
            if (foundOrder?.id) {
              orderIdToFetch = foundOrder.id;
              if (!activeOrderId) setActiveOrderId(orderIdToFetch);
            }
          }
        }

        let newItems: DisplayItem[] = [];
        let pendingItems: DisplayItem[] = [];
        let paidItemsData: DisplayItem[] = [];
        let freshTables: { id: string; name: string }[] = [];
        let returnedItemsSectionData: DisplayItem[] = [];

        if (orderIdToFetch) {
          const { data: orderDetails, error: orderError } = await supabase
            .from('orders')
            .select(
              `
                id,
                status,
                order_items(
                    id, quantity, unit_price, customizations, created_at, returned_quantity,
                    status, menu_items(name, image_url, is_available)
                ),
                order_tables(tables(id, name))
              `
            )
            .eq('id', orderIdToFetch)
            .single();

          if (orderError) throw orderError;
          if (orderDetails) {
            freshTables = orderDetails.order_tables.map((ot: any) => ot.tables).filter(Boolean);
            if (freshTables.length > 0) setCurrentTables(freshTables);

            (orderDetails.order_items || []).forEach((item: any) => {
              const name = item.menu_items?.name || item.customizations?.name || 'Món đã xóa';
              const image_url = item.menu_items?.image_url || null;
              const is_available = item.menu_items?.is_available ?? true;

              if (item.returned_quantity > 0) {
                returnedItemsSectionData.push({
                  id: item.id,
                  uniqueKey: `returned-${item.id}`,
                  name,
                  quantity: item.returned_quantity,
                  unit_price: item.unit_price,
                  totalPrice: item.returned_quantity * item.unit_price,
                  customizations: item.customizations,
                  isNew: false,
                  isPaid: false,
                  status: 'served',
                  returned_quantity: item.returned_quantity,
                  image_url,
                  isReturnedItem: true,
                  is_available,
                });
              }

              const remaining_quantity = item.quantity - item.returned_quantity;
              if (remaining_quantity > 0) {
                const displayItem: DisplayItem = {
                  id: item.id,
                  uniqueKey: `${orderDetails.status}-${item.id}`,
                  name,
                  quantity: remaining_quantity,
                  unit_price: item.unit_price,
                  totalPrice: remaining_quantity * item.unit_price,
                  customizations: item.customizations,
                  created_at: item.created_at,
                  isNew: false,
                  isPaid: orderDetails.status === 'paid' || orderDetails.status === 'closed',
                  status: item.status,
                  returned_quantity: item.returned_quantity,
                  image_url,
                  is_available,
                };
                if (displayItem.isPaid) paidItemsData.push(displayItem);
                else pendingItems.push(displayItem);
              }
            });

            // [SỬA LỖI] Logic lấy tất cả các order đã thanh toán trong cùng 1 phiên
            if (orderDetails.status === 'pending') {
              const representativeTableId = freshTables[0]?.id || initialTableId;
              if (representativeTableId) {
                const { data: linkedOrders, error: linkError } = await supabase
                  .from('order_tables')
                  .select('order_id')
                  .eq('table_id', representativeTableId);

                if (!linkError && linkedOrders && linkedOrders.length > 0) {
                  const orderIds = linkedOrders.map(link => link.order_id);

                  // Lấy TẤT CẢ các order 'paid' liên quan, KHÔNG GIỚI HẠN
                  const { data: allPaidOrders, error: paidError } = await supabase
                    .from('orders')
                    .select(
                      `
                        id, status, created_at,
                        order_items(
                          id, quantity, unit_price, customizations, created_at, returned_quantity,
                          status, menu_items(name, image_url, is_available)
                        )
                      `
                    )
                    .in('id', orderIds)
                    .eq('status', 'paid')
                    .order('created_at', { ascending: true }); // Sắp xếp từ cũ đến mới

                  if (!paidError && allPaidOrders && allPaidOrders.length > 0) {
                    allPaidOrders.forEach((order: any) => {
                      (order.order_items || []).forEach((item: any) => {
                         const name = item.menu_items?.name || item.customizations?.name || 'Món đã xóa';
                         const image_url = item.menu_items?.image_url || null;
                         const is_available = item.menu_items?.is_available ?? true;

                        const remaining_quantity = item.quantity - item.returned_quantity;
                        if (remaining_quantity > 0) {
                          paidItemsData.push({
                            id: item.id,
                            uniqueKey: `paid-${item.id}`,
                            name,
                            quantity: remaining_quantity,
                            unit_price: item.unit_price,
                            totalPrice: remaining_quantity * item.unit_price,
                            customizations: item.customizations,
                            created_at: item.created_at,
                            isNew: false,
                            isPaid: true,
                            status: item.status,
                            returned_quantity: item.returned_quantity,
                            image_url,
                            is_available,
                          });
                        }
                      });
                    });
                  }
                }
              }
            }
          }
        }

        const representativeTableId = freshTables[0]?.id || initialTableId;
        if (representativeTableId) {
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select('*, menu_items(image_url, is_available)')
            .eq('table_id', representativeTableId);

          if (cartError) throw cartError;

          newItems = (cartData || []).map((item) => ({
            id: item.id,
            uniqueKey: `new-${item.id}`,
            name: item.customizations.name || 'Món mới',
            quantity: item.quantity,
            unit_price: item.unit_price,
            totalPrice: item.total_price,
            menuItemId: item.menu_item_id,
            customizations: item.customizations,
            isNew: true,
            isPaid: false,
            status: 'new',
            returned_quantity: 0,
            image_url: item.menu_items?.image_url || null,
            is_available: item.menu_items?.is_available ?? true,
          }));
        }
        
        const availableNewItems = newItems.filter(item => item.is_available !== false);
        const outOfStockNewItems = newItems.filter(item => item.is_available === false);
        
        const availablePendingItems = pendingItems.filter(item => item.is_available !== false);
        const outOfStockPendingItems = pendingItems.filter(item => item.is_available === false);
        
        const availablePaidItems = paidItemsData.filter(item => item.is_available !== false);
        const outOfStockPaidItems = paidItemsData.filter(item => item.is_available === false);
        
        const availableReturnedItems = returnedItemsSectionData.filter(item => item.is_available !== false);
        const outOfStockReturnedItems = returnedItemsSectionData.filter(item => item.is_available === false);

        const sections: OrderSection[] = [];
        if (availableNewItems.length > 0) sections.push({ title: 'Món mới chờ gửi bếp', data: availableNewItems });

        const groupedPendingItems = availablePendingItems.reduce(
          (acc, item) => {
            const timestamp = item.created_at || new Date().toISOString();
            if (!acc[timestamp]) acc[timestamp] = [];
            acc[timestamp].push(item);
            return acc;
          },
          {} as Record<string, DisplayItem[]>
        );

        const pendingSections = Object.keys(groupedPendingItems)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((timestamp, index) => ({
            title: `Đợt ${index + 1} - ${new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
            data: groupedPendingItems[timestamp],
          }));

        sections.push(...pendingSections);

        if (availableReturnedItems.length > 0) {
          sections.push({ title: 'Món đã trả lại', data: availableReturnedItems });
        }
        if (availablePaidItems.length > 0)
          sections.push({ title: 'Món đã thanh toán', data: availablePaidItems });
        
        if (outOfStockNewItems.length > 0 || outOfStockPendingItems.length > 0 || outOfStockReturnedItems.length > 0 || outOfStockPaidItems.length > 0) {
          const outOfStockItems = [...outOfStockNewItems, ...outOfStockPendingItems, ...outOfStockReturnedItems, ...outOfStockPaidItems];
          sections.push({ title: 'Món đã hết', data: outOfStockItems });
        }

        setDisplayedSections(sections);
      } catch (error: any) {
        if (error.code !== 'PGRST116')
          Alert.alert('Lỗi', `Không thể tải dữ liệu: ${error.message}`);
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    },
    [activeOrderId, initialTableId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchAllData(true);

      const channelId = routeOrderId || initialTableId;

      if (!channelId) {
        console.warn("Không thể đăng ký Realtime vì không có orderId hoặc tableId.");
        return;
      }
      const channel = supabase
        .channel(`orders_channel:${channelId}`)
        .on(
          'postgres_changes',
          { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${activeOrderId}`
          },
          (payload) => {
            console.log('[Realtime] Cập nhật orders:', payload);

            fetchAllData(false);
          }
        )
        .subscribe();
      
      const menuItemsChannel = supabase
        .channel('public:menu_items_availability')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'menu_items' },
          (payload) => {
            console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
            fetchAllData(false);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
      };
    }, [fetchAllData, activeOrderId, initialTableId, routeOrderId])
  );

  const handleUpdateQuantity = async (item: DisplayItem, newQuantity: number) => {
  if (!item.isNew) return;

  if (isOnline) {
    try {

      if (newQuantity < 1) {
        await supabase.from('cart_items').delete().eq('id', item.id).throwOnError();
      } else {
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, total_price: item.unit_price * newQuantity })
          .eq('id', item.id)
          .throwOnError();
      }
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể cập nhật số lượng: ${error.message}`);
    } finally {
      await fetchAllData(false);
    }
  } else {
    Toast.show({
      type: 'info',
      text1: 'Đang offline',
      text2: 'Thay đổi đã được lưu tạm.',
    });
    if (newQuantity < 1) {
      offlineManager.addActionToQueue({
        type: 'DELETE',
        tableName: 'cart_items',
        where: { column: 'id', value: item.id },
        payload: {},
      });
    } else {
      offlineManager.addActionToQueue({
        type: 'UPDATE',
        tableName: 'cart_items',
        where: { column: 'id', value: item.id },
        payload: { quantity: newQuantity, total_price: item.unit_price * newQuantity },
      });
    }
    optimisticallyUpdateCartItem(item.id, newQuantity);
  }
};

  
  const optimisticallySendToKitchen = () => {
  setDisplayedSections(currentSections => {
    const newSections = JSON.parse(JSON.stringify(currentSections));

    const newItemsSectionIndex = newSections.findIndex((s: OrderSection) => s.title === 'Món mới chờ gửi bếp');
    if (newItemsSectionIndex === -1) {
      return currentSections;
    }
    const newItemsSection = newSections[newItemsSectionIndex];

    newSections.splice(newItemsSectionIndex, 1);

    const pendingSectionTitle = `Đợt mới (chờ gửi) - ${new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    
    const firstPendingSectionIndex = newSections.findIndex((s: OrderSection) => s.title.startsWith('Đợt '));
    if (firstPendingSectionIndex > -1) {
        newSections.splice(firstPendingSectionIndex, 0, { title: pendingSectionTitle, data: newItemsSection.data });
    } else {
        newSections.push({ title: pendingSectionTitle, data: newItemsSection.data });
    }

    return newSections;
  });
};

  const optimisticallyUpdateCartItem = (itemId: number, newQuantity: number) => {
  setDisplayedSections(currentSections => {
    const newSections = JSON.parse(JSON.stringify(currentSections));

    const newItemsSection = newSections.find((s: OrderSection) => s.title === 'Món mới chờ gửi bếp');
    if (!newItemsSection) return currentSections;

    if (newQuantity < 1) {
      newItemsSection.data = newItemsSection.data.filter((item: DisplayItem) => item.id !== itemId);
    } else {
      const itemIndex = newItemsSection.data.findIndex((item: DisplayItem) => item.id === itemId);
      if (itemIndex > -1) {
        newItemsSection.data[itemIndex].quantity = newQuantity;
        newItemsSection.data[itemIndex].totalPrice = newItemsSection.data[itemIndex].unit_price * newQuantity;
      }
    }

    return newSections;
  });
};


const optimisticallyRemoveItem = (itemUniqueKey: string) => {
  setDisplayedSections(currentSections => {
    const newSections = JSON.parse(JSON.stringify(currentSections));

    for (const section of newSections) {
        const itemIndex = section.data.findIndex((item: DisplayItem) => item.uniqueKey === itemUniqueKey);
        if (itemIndex > -1) {
            section.data.splice(itemIndex, 1);
            break; 
        }
    }
    
    return newSections.filter((section: OrderSection) => section.data.length > 0);
  });
};

const optimisticallyUpdateNote = (itemUniqueKey: string, newNote: string) => {
  setDisplayedSections(currentSections => {
    const newSections = JSON.parse(JSON.stringify(currentSections));

    for (const section of newSections) {
      const itemIndex = section.data.findIndex((item: DisplayItem) => item.uniqueKey === itemUniqueKey);
      
      if (itemIndex > -1) {
        section.data[itemIndex].customizations.note = newNote;
        break; 
      }
    }
    
    return newSections;
  });
};


  const handleRemoveItem = (itemToRemove: DisplayItem) => {
  if (!itemToRemove.isNew) {
    Toast.show({
      type: 'error',
      text1: 'Không thể hủy',
      text2: 'Chỉ có thể hủy những món mới chưa gửi bếp.'
    });
    return;
  }

  const action = async () => {
    if (isOnline) {
      try {
        await supabase
          .from(itemToRemove.isNew ? 'cart_items' : 'order_items')
          .delete()
          .eq('id', itemToRemove.id)
          .throwOnError();
        
        Toast.show({ type: 'success', text1: 'Đã hủy món' });
        await fetchAllData(false);
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Lỗi hủy món', text2: error.message });
      }
    } else {
      const tableName = itemToRemove.isNew ? 'cart_items' : 'order_items';
      
      offlineManager.addActionToQueue({
        type: 'DELETE',
        tableName: tableName,
        where: { column: 'id', value: itemToRemove.id },
        payload: {}
      });

      optimisticallyRemoveItem(itemToRemove.uniqueKey);
      
      Toast.show({
        type: 'info',
        text1: 'Đang offline',
        text2: `Món "${itemToRemove.name}" sẽ được xóa khi có mạng.`,
      });
    }
  };

  action();
};

  const handleOpenItemMenu = (item: DisplayItem) => {
    setEditingItem(item);
    setActionSheetVisible(true);
  };

  const handleSaveNote = async (newNote: string) => {
  if (!editingItem) return;

  if (isOnline) {
    try {
      const updatedCustomizations = { ...editingItem.customizations, note: newNote };
      await supabase
        .from(editingItem.isNew ? 'cart_items' : 'order_items')
        .update({ customizations: updatedCustomizations })
        .eq('id', editingItem.id)
        .throwOnError();
      
      await fetchAllData(false); 
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể lưu ghi chú: ${error.message}`);
    } finally {
      setNoteModalVisible(false);
      setEditingItem(null);
    }
  } else {
    const tableName = editingItem.isNew ? 'cart_items' : 'order_items';
    const updatedCustomizations = { ...editingItem.customizations, note: newNote };
    
    offlineManager.addActionToQueue({
      type: 'UPDATE',
      tableName: tableName,
      where: { column: 'id', value: editingItem.id },
      payload: { customizations: updatedCustomizations },
    });

    optimisticallyUpdateNote(editingItem.uniqueKey, newNote);

    Toast.show({
      type: 'info',
      text1: 'Đang offline',
      text2: 'Ghi chú đã được lưu tạm.',
    });
    
    setNoteModalVisible(false);
    setEditingItem(null);
  }
};
  const itemActions: ActionSheetItem[] = [];
  if (editingItem && !editingItem.isPaid && !editingItem.isReturnedItem) {
    const canEditNote = editingItem.isNew;
    const canRemoveItem = editingItem.isNew;
    const isItemCompleted = editingItem.status === 'served' || editingItem.status === 'completed';
    const itemIsOutOfStock = editingItem.is_available === false;
    
    if (canEditNote && !isItemCompleted && !itemIsOutOfStock) {
      itemActions.push({
        id: 'note',
        text: 'Thêm/Sửa Ghi chú',
        icon: 'create-outline',
        onPress: () => {
          setActionSheetVisible(false);
          setTimeout(() => {
            setNoteModalVisible(true);
          }, 250); 
        },
      });
    }
    
    if (canRemoveItem && !isItemCompleted && !itemIsOutOfStock) {
      itemActions.push({
        id: 'remove',
        text: 'Hủy món',
        icon: 'trash-outline',
        color: '#EF4444',
        onPress: () => {
          const itemToRemove = editingItem;
          setActionSheetVisible(false);
          setEditingItem(null);
          setTimeout(() => {
            if (itemToRemove) {
              handleRemoveItem(itemToRemove);
            }
          }, 250);
        },
      });
    }
  }

  const allItems = displayedSections.flatMap((s) => s.data);
  const representativeTable = currentTables[0] || { id: initialTableId, name: initialTableName };
  const currentTableNameForDisplay = currentTables.map((t) => t.name).join(', ');
  const newItemsFromCart = allItems.filter((item) => item.isNew);
  const billableItems = allItems.filter((item) => 
    !item.isPaid && 
    !item.isReturnedItem && 
    item.is_available !== false
  );
  const paidItems = allItems.filter((item) => item.isPaid);
  const hasNewItems = newItemsFromCart.length > 0;
  const totalBill = billableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleNavigateToPrint = useCallback(async (orderId: string, paymentMethod: 'cash' | 'transfer') => {
  try {
    console.log('🔄 [handleNavigateToPrint] Starting, orderId:', orderId, 'method:', paymentMethod);
    setLoading(true);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, created_at, order_tables!inner(tables(id, name))')
      .eq('id', orderId)
      .single();
    
    console.log('🔄 [handleNavigateToPrint] Order data fetched:', orderData?.id);
    if (orderError) throw orderError;
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, unit_price, customizations, returned_quantity')
      .eq('order_id', orderId);
      
    console.log('🔄 [handleNavigateToPrint] Items data fetched:', itemsData?.length);
    if (itemsError) throw itemsError;

    const items: BillItem[] = itemsData
      .map((item: any) => {
        const remainingQuantity = item.quantity - (item.returned_quantity || 0);
        if (remainingQuantity <= 0) return null;
        
        return {
          name: item.customizations?.name || 'Món đã xóa',
          unit_price: item.unit_price,
          quantity: remainingQuantity,
          totalPrice: item.unit_price * remainingQuantity
        };
      })
      .filter((item): item is BillItem => item !== null);
    
    const finalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const order = {
      orderId: orderData.id,
      createdAt: orderData.created_at,
      tables: orderData.order_tables.map((ot: any) => ({
        id: ot.tables.id,
        name: ot.tables.name
      })),
      totalPrice: finalPrice,
      totalItemCount
    };

    console.log('🔄 [handleNavigateToPrint] About to navigate to PrintPreview');
    console.log('   - shouldNavigateToHome:', pendingPaymentAction === 'end');

    const shouldNavigateToHome = pendingPaymentAction === 'end';

    navigation.replace('PrintPreview', { 
      order, 
      items, 
      paymentMethod,
      shouldNavigateToHome
    });
    
    console.log('✅ [handleNavigateToPrint] Navigation initiated');
    console.log('   - shouldNavigateToHome value passed:', shouldNavigateToHome);

  } catch (error: any) {
    console.error('❌ [handleNavigateToPrint] Error:', error);
    Toast.show({ type: 'error', text1: 'Lỗi lấy thông tin in bill', text2: error.message });
  } finally {
    setLoading(false);
    console.log('🔄 [handleNavigateToPrint] Completed');
  }
}, [navigation, pendingPaymentAction]);





  const sendNewItemsToKitchen = async (): Promise<string | null> => {
    if (!hasNewItems) return activeOrderId;
    if (!isOnline) {
      if (!activeOrderId) {
        Toast.show({
          type: 'error',
          text1: 'Cần có mạng để tạo order mới',
          text2: 'Vui lòng kết nối mạng để gửi món cho bàn mới.',
        });
        return null;
      }

      const itemsToInsert = newItemsFromCart.map((item) => ({
        order_id: activeOrderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        customizations: item.customizations,
      }));

      offlineManager.addActionToQueue({
        type: 'INSERT',
        tableName: 'order_items',
        payload: itemsToInsert,
      });

      offlineManager.addActionToQueue({
          type: 'DELETE',
          tableName: 'cart_items',
          where: { column: 'id', value: newItemsFromCart.map((i) => i.id) },
          payload: {}
      });

      optimisticallySendToKitchen();

      Toast.show({
        type: 'info',
        text1: 'Đang offline',
        text2: 'Món đã được lưu và sẽ tự gửi bếp khi có mạng.',
      });

      return activeOrderId;
    }
    let orderIdToUse = activeOrderId;
    try {
      if (orderIdToUse) {
        const { data: currentOrder, error: checkError } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderIdToUse)
          .single();
        
        if (checkError) throw checkError;
        
        if (currentOrder?.status === 'paid' || currentOrder?.status === 'closed') {
          orderIdToUse = null; 
        }
      }

      if (!orderIdToUse) {
        const { data: newOrder } = await supabase
          .from('orders')
          .insert({ status: 'pending', total_price: 0 })
          .select('id')
          .single();
        if (!newOrder) throw new Error('Không thể tạo order mới.');
        orderIdToUse = newOrder.id;
        await supabase
          .from('order_tables')
          .insert({ order_id: orderIdToUse, table_id: representativeTable.id })
          .throwOnError();
        await supabase
          .from('tables')
          .update({ status: 'Đang phục vụ' })
          .eq('id', representativeTable.id)
          .throwOnError();
        setActiveOrderId(orderIdToUse);

        const orderCode = orderIdToUse!.slice(-6);
        await supabase.from("orders").update({ order_code: orderCode }).eq("id", orderIdToUse);
        console.log("✅ Đã tạo order_code:", orderCode);
      }
      const itemsToInsert = newItemsFromCart.map((item) => ({
        order_id: orderIdToUse,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        customizations: item.customizations,
      }));
      await supabase.from('order_items').insert(itemsToInsert).throwOnError();
      await supabase
        .from('cart_items')
        .delete()
        .in('id', newItemsFromCart.map((i) => i.id))
        .throwOnError();

      Toast.show({
        type: 'success',
        text1: 'Đã gửi bếp thành công!',
        text2: `${newItemsFromCart.length} món mới đã được gửi đi.`
      });

      return orderIdToUse;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi Gửi Bếp',
        text2: error.message
      });
      return null;
    }
  };

  const handleSendToKitchen = async () => {
    setLoading(true);
    await sendNewItemsToKitchen();
    if (isOnline) {
        await fetchAllData(false);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
  if (!isOnline) {
    Toast.show({
      type: 'error',
      text1: 'Không có kết nối mạng',
      text2: 'Chức năng thanh toán yêu cầu phải có mạng.',
    });
    return;
  }
  
  if (hasNewItems && billableItems.length === 0) {
    setLoading(true);
    const returnedOrderId = await sendNewItemsToKitchen();
    setLoading(false);
    if (returnedOrderId) {
      await fetchAllData(false);
      Toast.show({
        type: 'success',
        text1: 'Đã gửi bếp',
        text2: 'Các món mới đã được gửi đi.'
      });
    }
    return;
  }

  if (billableItems.length === 0 && !hasNewItems) {
    Alert.alert('Thông báo', 'Không có món nào cần thanh toán.');
    return;
  }

  const finalBillToPay = billableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  setPaymentInfo({ orderId: activeOrderId || '', amount: finalBillToPay });
  setPaymentModalVisible(true);
};
  
  // [SỬA LỖI] HÀM QUAN TRỌNG CẦN SỬA
  const handleKeepSessionAfterPayment = async (orderId: string, finalBill: number, paymentMethod: string) => {
    setLoading(true);
    try {
      // BƯỚC 1: Lấy thông tin bàn từ order cũ (TRƯỚC KHI CẬP NHẬT)
      const { data: oldOrder, error: fetchError } = await supabase
        .from('orders')
        .select('order_tables(table_id)')
        .eq('id', orderId)
        .single();
      
      if (fetchError) throw fetchError;
      const tableIds = oldOrder.order_tables.map((ot: any) => ot.table_id);
      if (tableIds.length === 0) throw new Error("Không tìm thấy bàn liên kết với order cũ.");
      
      // BƯỚC 2: Cập nhật order cũ thành 'paid'
      await supabase
        .from('orders')
        .update({ status: 'paid', total_price: finalBill, payment_method: paymentMethod })
        .eq('id', orderId)
        .throwOnError();

      // [SỬA LỖI] KHÔNG xóa liên kết trong order_tables để giữ lại lịch sử.

      // BƯỚC 3: Tạo một order pending MỚI
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert([{ status: 'pending' }])
        .select('id')
        .single();
      if (createError) throw createError;
      
      // BƯỚC 4: Liên kết order MỚI với các bàn cũ
      const orderTableInserts = tableIds.map((tableId: string) => ({
        order_id: newOrder.id,
        table_id: tableId,
      }));
      await supabase.from('order_tables').insert(orderTableInserts).throwOnError();

      // BƯỚC 5: Cập nhật State và UI
      setActiveOrderId(newOrder.id);
      Toast.show({ type: 'success', text1: 'Thanh toán thành công', text2: `Phiên mới đã sẵn sàng.` });

      await fetchAllData(false);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi khi giữ phiên', text2: error.message });
    } finally {
      setLoading(false);
    }
  };
  const handleEndSessionAfterPayment = useCallback(async (orderId: string, finalBill: number, paymentMethod: string, shouldNavigateHome: boolean = true) => {
    setLoading(true);
    try {
      // Cập nhật trạng thái order là 'closed'.
      // Trigger SQL mới sẽ tự động dọn dẹp bàn và xóa liên kết order_tables.
      await supabase
        .from('orders')
        .update({ 
          status: 'closed', 
          total_price: finalBill,
          payment_method: paymentMethod
        })
        .eq('id', orderId)
        .throwOnError();

      Toast.show({
        type: 'success',
        text1: 'Hoàn tất phiên',
        text2: `Đã thanh toán và dọn bàn.`,
      });

      setActiveOrderId(null);
      setDisplayedSections([]);

      if (shouldNavigateHome) {
        setTimeout(() => {
          navigation.navigate('Menu', {
            tableId: representativeTable.id,
            tableName: currentTableNameForDisplay,
            fromOrderConfirmation: true,
          });
          setTimeout(() => navigation.goBack(), 300);
        }, 500);
      }
      
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi kết thúc phiên',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [navigation, representativeTable.id, currentTableNameForDisplay]);

  const handlePaymentMethodSelect = (method: 'cash' | 'momo' | 'transfer') => {
    setPaymentMethodBoxVisible(false);
    if (!paymentInfo || !pendingPaymentAction) return;

    if (method === 'cash') {
      setBillModalVisible(true);
      return;
    }
    if (method === 'momo') {
      navigation.navigate(ROUTES.MOMO_QR_CODE, {
        orderId: paymentInfo.orderId,
        amount: paymentInfo.amount,
        pendingPaymentAction: pendingPaymentAction,
      });
      setPendingPaymentAction(null);
      return;
    }
    if (method === 'transfer') {
      navigation.navigate(ROUTES.VIET_QR_CODE, {
        orderId: paymentInfo.orderId,
        amount: paymentInfo.amount,
        pendingPaymentAction: pendingPaymentAction,
      });
      setPendingPaymentAction(null);
      return;
    }
  };

  const handleCompleteCashPayment = async () => {
    setBillModalVisible(false);
    if (!paymentInfo || !pendingPaymentAction) return;
    
    try {
      await handleNavigateToPrint(paymentInfo.orderId, 'cash');
      Toast.show({ type: 'success', text1: 'Thanh toán thành công', text2: 'Đang chuyển sang in hóa đơn...'});
      
      setTimeout(async () => {
        try {
          if (pendingPaymentAction === 'keep') {
            await handleKeepSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, 'cash');
          } else if (pendingPaymentAction === 'end') {
            await handleEndSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, 'cash', false);
          }
          setPendingPaymentAction(null);
        } catch (error: any) {
          console.error('[Background error]:', error);
          setPendingPaymentAction(null);
        }
      }, 300);
      
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
      setBillModalVisible(false);
      setPendingPaymentAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSessionAfterPayment = () => {
    if (!activeOrderId) return;
    setCloseSessionModal(true);
  };

  const confirmCloseSession = async () => {
    if (!activeOrderId) return;
    setLoading(true);
    setCloseSessionModal(false);
    try {
      // Cập nhật trạng thái order thành 'closed'
      await supabase
        .from('orders')
        .update({ status: 'closed' })
        .eq('id', activeOrderId)
        .throwOnError();
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã đóng bàn và kết thúc phiên.'
      });

      // [SỬA LỖI ĐIỀU HƯỚNG]
      // Đợi một chút, sau đó quay về màn hình gốc của stack (chính là màn hình AppTabs)
      setTimeout(() => {
        // Lệnh này sẽ quay về màn hình đầu tiên trong stack, đảm bảo không bị lỗi.
        navigation.popToTop(); 
      }, 500);

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Không thể đóng bàn: ${error.message}`
      });
    } finally {
      // Không cần setLoading(false) vì màn hình sắp được đóng lại
    }
  };

  
    const handleGoToReturnScreen = async () => {
    if (hasNewItems) {
      Alert.alert(
        'Món mới chưa gửi',
        "Bạn cần 'Gửi bếp' các món mới trước khi thực hiện trả món.",
        [
          { text: 'Để sau' },
          {
            text: 'Gửi bếp ngay',
            onPress: async () => {
              setLoading(true);
              const success = await sendNewItemsToKitchen();
              setLoading(false);
              if (success) {
                setTimeout(navigateToReturn, 500);
              }
            },
          },
        ]
      );
    } else {
      navigateToReturn();
    }
  };

  const navigateToReturn = () => {
    const itemsToReturn = returnableItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      image_url: item.image_url,
      status: item.status, 
      created_at: item.created_at,
    }));

    if (itemsToReturn.length === 0) {
      Alert.alert('Thông báo', 'Không có món nào đã gửi bếp để có thể trả.');
      return;
    }
    if (activeOrderId) {
      navigation.navigate(ROUTES.RETURN_SELECTION, {
        orderId: activeOrderId,
        tableName: currentTableNameForDisplay, 
        items: itemsToReturn,
      });
    }
  };

  const handleProvisionalBill = async () => {
    if (!isOnline) {
        Toast.show({ type: 'error', text1: 'Không có kết nối mạng', text2: 'Vui lòng thử lại sau.' });
        return;
    }
    if (!activeOrderId) {
      Alert.alert('Lỗi', 'Không tìm thấy order để tạm tính.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc('send_provisional_bill', {
        p_order_id: activeOrderId,
      });
      if (error) throw error;
      
      await fetchAllData(false);
      
      Toast.show({
          type: 'success',
          text1: 'Đã gửi tạm tính',
          text2: 'Bàn này đã được đánh dấu tạm tính.'
      });
    } catch (error: any) {
      Toast.show({
          type: 'error',
          text1: 'Lỗi tạm tính',
          text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const AddMoreItemsButton = () => (
    <TouchableOpacity
      style={styles.addMoreButton}
      onPress={() =>
        navigation.navigate(ROUTES.MENU, {
          tableId: representativeTable.id,
          tableName: currentTableNameForDisplay,
          orderId: activeOrderId || undefined,
          fromOrderConfirmation: true,
        })
      }
    >
      <Icon name="add-outline" size={22} color="#3B82F6" />
      <Text style={styles.addMoreButtonText}>Thêm món khác</Text>
    </TouchableOpacity>
  );

  const hasBillableItems = billableItems.length > 0;
  
  const returnableItems = allItems.filter((item) =>
    !item.isNew && 
    !item.isPaid &&
    !item.isReturnedItem &&
    item.is_available !== false &&
    item.status !== 'new' &&
    item.status !== 'served' &&
    item.status !== 'completed'
  );
  const canReturnItems = returnableItems.length > 0;
  
  const isSessionClosable = paidItems.length > 0 && billableItems.length === 0 && !hasNewItems;

  const handleGoBack = () => {
    navigation.goBack();
  };

  // ... (Phần return JSX và styles giữ nguyên, vì logic đã được sửa ở các hàm xử lý)
  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={{ paddingTop: (insets.top || 0) + 10 }} className="px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleGoBack} className="p-2 -ml-2">
            <Icon name="arrow-back-outline" size={26} color="#1F2937" />
          </TouchableOpacity>
          <Text
            className="text-xl font-bold text-gray-800 flex-1 text-center"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Order cho {currentTableNameForDisplay}
          </Text>
          <View className="w-8" />
        </View>
      </View>
      <SectionList
        sections={displayedSections}
        keyExtractor={(item) => item.uniqueKey}
        renderItem={({ item }) => (
          <OrderListItem
            item={item}
            isExpanded={expandedItemKey === item.uniqueKey}
            onPress={() =>
              setExpandedItemKey((prevKey) => (prevKey === item.uniqueKey ? null : item.uniqueKey))
            }
            onUpdateQuantity={(newQuantity) => handleUpdateQuantity(item, newQuantity)}
            onOpenMenu={() => handleOpenItemMenu(item)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, title === 'Món đã hết' && styles.outOfStockSectionHeader]}>
            {title}
          </Text>
        )}
        ListHeaderComponent={
          activeOrderId ? <ReturnedItemsIndicatorCard orderId={activeOrderId} /> : null
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Text className="text-gray-500 mb-6">Chưa có món nào được gọi.</Text>
            <AddMoreItemsButton />
          </View>
        }
        ListFooterComponent={allItems.length > 0 ? <AddMoreItemsButton /> : null}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <View className="flex-row items-center justify-between w-full mb-4 px-2">
          <Text className="text-gray-500 text-base font-medium">Cần thanh toán</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {totalBill.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <View className="flex-row justify-around w-full">
          <ActionButton
            icon="paper-plane-outline"
            text="Gửi bếp"
            color="#3B82F6"
            disabled={!hasNewItems || !isOnline}
            
            onPress={handleSendToKitchen}
          />
          <ActionButton
            icon="arrow-undo-outline"
            text="Trả Món"
            color="#F97316"
            disabled={!canReturnItems || !isOnline}
            onPress={handleGoToReturnScreen}
          />
          <ActionButton
            icon="receipt-outline"
            text="Tạm tính"
            color="#8B5CF6"
            disabled={(!hasBillableItems && !hasNewItems) || !isOnline}
            onPress={handleProvisionalBill}
          />
          {isSessionClosable ? (
            <ActionButton
              icon="close-circle-outline"
              text="Đóng bàn"
              color="#EF4444"
              onPress={handleCloseSessionAfterPayment}
              disabled={loading || !isOnline}
            />
          ) : (
            <ActionButton
              icon="cash-outline"
              text="Thanh toán"
              color="#10B981"
              onPress={handlePayment}
              disabled={!hasBillableItems || !isOnline}
            />
          )}
        </View>
      </View>
      {editingItem && (
        <NoteInputModal
          visible={isNoteModalVisible}
          onClose={() => setNoteModalVisible(false)}
          initialValue={editingItem.customizations?.note || ''}
          onSave={handleSaveNote}
        />
      )}
      {editingItem && (
        <ActionSheetModal
          visible={isActionSheetVisible}
          onClose={() => {
            setActionSheetVisible(false);
            setEditingItem(null);
          }}
          title={`Tùy chỉnh "${editingItem.name}"`}
          actions={itemActions}
        />
      )}
      
      {paymentInfo && (
        <Modal
          transparent={true}
          visible={isPaymentModalVisible}
          animationType="fade"
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <View style={styles.paymentModalOverlay}>
            <View style={styles.paymentModalContainer}>
              <View style={styles.paymentHeader}>
                <Icon name="cash-outline" size={32} color="#10B981" />
                <Text style={styles.paymentTitle}>Xác nhận thanh toán</Text>
              </View>
              
              <Text style={styles.paymentMessage}>
                Tổng hóa đơn là{' '}
                <Text style={styles.paymentAmount}>
                  {paymentInfo.amount.toLocaleString('vi-VN')}đ
                </Text>
              </Text>
              
              <Text style={styles.paymentQuestion}>
                Bạn muốn giữ phiên hay kết thúc phục vụ?
              </Text>
              
              <View style={styles.paymentButtonContainer}>
                <TouchableOpacity
                  style={[styles.paymentButton, styles.cancelButton]}
                  onPress={() => setPaymentModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.paymentButton, styles.keepSessionButton]}
                  onPress={() => {
                    setPaymentModalVisible(false);
                    setPendingPaymentAction('keep');
                    setTimeout(() => setPaymentMethodBoxVisible(true), 300);
                  }}
                >
                  <Icon name="time-outline" size={18} color="white" />
                  <Text style={styles.keepSessionButtonText}>Giữ phiên</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.paymentButton, styles.endSessionButton]}
                  onPress={() => {
                    setPaymentModalVisible(false);
                    setPendingPaymentAction('end');
                    setTimeout(() => setPaymentMethodBoxVisible(true), 300);
                  }}
                >
                  <Icon name="checkmark-done-outline" size={18} color="white" />
                  <Text style={styles.endSessionButtonText}>Kết thúc</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {paymentInfo && (
        <PaymentMethodBox
          isVisible={isPaymentMethodBoxVisible}
          onClose={() => {
            setPaymentMethodBoxVisible(false);
            setPendingPaymentAction(null);
          }}
          totalAmount={paymentInfo.amount}
          onSelectMethod={handlePaymentMethodSelect}
        />
      )}
      
      {paymentInfo && (
        <Modal
          transparent={true}
          visible={isBillModalVisible}
          animationType="slide"
          onRequestClose={() => setBillModalVisible(false)}
        >
          <View style={styles.billModalOverlay}>
            <View style={styles.billModalContainer}>
              <View style={styles.billModalHeader}>
                <Text style={styles.billModalTitle}>HÓA ĐƠN THANH TOÁN</Text>
                <TouchableOpacity onPress={() => setBillModalVisible(false)}>
                  <Icon name="close-outline" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.billScrollView}>
                <BillContent 
                  order={{
                    orderId: paymentInfo.orderId,
                    tables: currentTables,
                    totalPrice: paymentInfo.amount,
                    totalItemCount: allItems.length,
                    createdAt: new Date().toISOString()
                  }}
                  items={billableItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    totalPrice: item.totalPrice
                  }))}
                  title="HÓA ĐƠN THANH TOÁN"
                  showQRCode={false}
                />
              </ScrollView>
              
              <View style={styles.billModalFooter}>
                <TouchableOpacity
                  style={styles.billCancelButton}
                  onPress={() => setBillModalVisible(false)}
                >
                  <Text style={styles.billCancelButtonText}>Quay lại</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.billConfirmButton}
                  onPress={handleCompleteCashPayment}
                >
                  <Icon name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.billConfirmButtonText}>Xác nhận thanh toán</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal
        isVisible={cancelItemModal.visible}
        title="Xác nhận Hủy Món"
        message={`Bạn có chắc muốn hủy món "${cancelItemModal.item?.name}"?`}
        onClose={() => setCancelItemModal({ visible: false, item: null })}
        onConfirm={async () => {
          if (!cancelItemModal.item) return;
          const itemToRemove = cancelItemModal.item;
          setCancelItemModal({ visible: false, item: null });
          
          if (isOnline) {
            try {
              await supabase
                .from(itemToRemove.isNew ? 'cart_items' : 'order_items')
                .delete()
                .eq('id', itemToRemove.id)
                .throwOnError();
              
              Toast.show({ type: 'success', text1: 'Đã hủy món' });
              await fetchAllData(false);
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Lỗi hủy món', text2: error.message });
            }
          } else {
            const tableName = itemToRemove.isNew ? 'cart_items' : 'order_items';
            
            offlineManager.addActionToQueue({
              type: 'DELETE',
              tableName: tableName,
              where: { column: 'id', value: itemToRemove.id },
              payload: {}
            });

            optimisticallyRemoveItem(itemToRemove.uniqueKey);
            
            Toast.show({
              type: 'info',
              text1: 'Đang offline',
              text2: `Món "${itemToRemove.name}" sẽ được xóa khi có mạng.`,
            });
          }
        }}
        confirmText="Đồng ý"
        cancelText="Không"
        variant="danger"
      />

      <ConfirmModal
        isVisible={closeSessionModal}
        title="Xác nhận Đóng Bàn"
        message="Bạn có chắc muốn kết thúc phiên và dọn bàn này không?"
        onClose={() => setCloseSessionModal(false)}
        onConfirm={confirmCloseSession}
        confirmText="Đồng ý"
        cancelText="Hủy"
        variant="warning"
      />
    </View>
  );
};
const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#F8F9FA' },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shadow: {
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  paidItem: { backgroundColor: '#F9FAFB', opacity: 0.8 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    backgroundColor: '#F8F9FA',
    paddingTop: 20,
    paddingBottom: 8,
  },
  outOfStockSectionHeader: {},
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A5B4FC',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  addMoreButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
    color: '#1F2937',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#3B82F6', marginLeft: 12 },
  saveButtonText: { color: 'white' },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  paymentMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paymentQuestion: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  paymentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  keepSessionButton: {
    backgroundColor: '#3B82F6',
  },
  keepSessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  endSessionButton: {
    backgroundColor: '#10B981',
  },
  endSessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  billModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billModalContainer: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  billModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#10B981',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  billModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  billScrollView: {
    flex: 1,
  },
  billModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  billCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billCancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  billConfirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  billConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderConfirmationScreen;