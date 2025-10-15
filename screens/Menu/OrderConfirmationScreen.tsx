// --- START OF FILE OrderConfirmationScreen.tsx ---
import React, { useState, useCallback, useEffect } from 'react';
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
  status: string; // <-- Đảm bảo chỉ có 'status', không có 'is_served'
  returned_quantity: number;
  image_url: string | null;
  isReturnedItem?: boolean; // Cờ để đánh dấu đây là dòng hiển thị món đã trả
  is_available?: boolean; // [MỚI] Trạng thái còn hàng của món từ menu_items
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
  const { customizations, isNew, isPaid, isReturnedItem, is_available } = item;
  const sizeText = customizations.size?.name || 'N/A';
  const sugarText = customizations.sugar?.name || 'N/A';
  const toppingsText =
    (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;
  
  // [MỚI] Kiểm tra món có còn hàng không
  const isOutOfStock = is_available === false;

  const ExpandedView = () => (
    <View className="mt-4 pt-4 border-t border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-4">Số lượng:</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.quantity - 1)}
            disabled={!isNew}
            className={`w-8 h-8 items-center justify-center rounded-full ${!isNew ? 'bg-gray-100' : 'bg-gray-200'}`}
          >
            <Icon name="remove" size={18} color={!isNew ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text className="text-lg font-bold mx-4">{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.quantity + 1)}
            disabled={!isNew}
            className={`w-8 h-8 items-center justify-center rounded-full ${!isNew ? 'bg-gray-100' : 'bg-blue-500'}`}
          >
            <Icon name="add" size={18} color={!isNew ? '#ccc' : 'white'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onOpenMenu} className="p-2">
          <Icon name="ellipsis-horizontal" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.shadow, (isPaid || isReturnedItem) && styles.paidItem]}
      className="bg-white rounded-2xl p-4 mb-4"
    >
      <TouchableOpacity onPress={onPress} disabled={isPaid || isReturnedItem}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              {item.status === 'served' && !isReturnedItem && (
              <Icon name="checkmark-circle" size={20} color="#3B82F6" style={{ marginRight: 6 }} />
              )}
              {item.status === 'in_progress' && (
                <Icon name="flame-outline" size={20} color="#F97316" style={{ marginRight: 6 }} />
              )}
              {item.status === 'completed' && (
                <Icon name="restaurant-outline" size={20} color="#10B981" style={{ marginRight: 6 }} />
              )}
              <Text
                className={`text-lg font-bold ${isPaid || isReturnedItem ? 'text-gray-500' : 'text-gray-800'} ${isReturnedItem ? 'line-through' : ''}`}
              >
                {item.name}
              </Text>
              {/* [MỚI] Badge cảnh báo món hết */}
              {isOutOfStock && !isPaid && !isReturnedItem && (
                <View className="bg-red-100 px-2 py-1 rounded-full ml-2">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="alert-circle" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                    <Text className="text-red-800 text-xs font-bold">Hết món</Text>
                  </View>
                </View>
              )}
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
              <View className="bg-green-100 px-2 py-1 rounded-full mb-1">
                <Text className="text-green-800 text-xs font-bold">Mới</Text>
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
            <Text
              className={`text-lg font-semibold ${isPaid || isReturnedItem ? 'text-gray-500 line-through' : 'text-gray-900'}`}
            >
              {item.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
        <View className="border-t border-dashed border-gray-200 mt-3 pt-2 flex-row justify-between items-center">
          <Text
            className={`text-base ${isPaid || isReturnedItem ? 'text-gray-500' : 'text-gray-600'}`}
          >
            {item.quantity} x {item.unit_price.toLocaleString('vi-VN')}đ
          </Text>
          {!isNew && !isPaid && !isReturnedItem && (
            <Icon name="flame-outline" size={20} color="#F97316" />
          )}
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
  } = route.params;
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
  
  // State cho Confirm Modals
  const [cancelItemModal, setCancelItemModal] = useState<{
    visible: boolean;
    item: DisplayItem | null;
  }>({ visible: false, item: null });
  
  const [closeSessionModal, setCloseSessionModal] = useState(false);
  
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
          // [CẬP NHẬT] Thêm is_available từ menu_items để biết món còn hay hết
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
              const is_available = item.menu_items?.is_available ?? true; // [MỚI] Lấy trạng thái còn hàng

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
                  status: 'served', // <--- SỬA THÀNH DÒNG NÀY
                  returned_quantity: item.returned_quantity,
                  image_url,
                  isReturnedItem: true,
                  is_available, // [MỚI]
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
                  status: item.status, // Chỗ này đã đúng từ trước
                  returned_quantity: item.returned_quantity,
                  image_url,
                  is_available, // [MỚI] Thêm trạng thái còn hàng
                };
                if (displayItem.isPaid) paidItemsData.push(displayItem);
                else pendingItems.push(displayItem);
              }
            });
          }
        }

        // Lấy dữ liệu từ giỏ hàng (cart_items), cần join với menu_items để có image_url và is_available
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
            image_url: item.menu_items?.image_url || null, // Lấy ảnh cho món mới
            is_available: item.menu_items?.is_available ?? true, // [MỚI] Lấy trạng thái còn hàng
          }));
        }

        const sections: OrderSection[] = [];
        if (newItems.length > 0) sections.push({ title: 'Món mới chờ gửi bếp', data: newItems });

        const groupedPendingItems = pendingItems.reduce(
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

        if (returnedItemsSectionData.length > 0) {
          sections.push({ title: 'Món đã trả lại', data: returnedItemsSectionData });
        }
        if (paidItemsData.length > 0)
          sections.push({ title: 'Món đã thanh toán', data: paidItemsData });

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
      const channel = supabase
        .channel(`public:order_confirmation_v2:${activeOrderId || initialTableId}`)
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchAllData(false);
        })
        .subscribe();
      
      // [MỚI] Lắng nghe thay đổi trên bảng menu_items (khi bếp báo hết món)
      const menuItemsChannel = supabase
        .channel('public:menu_items_availability')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'menu_items' },
          (payload) => {
            console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
            // Refresh lại dữ liệu để cập nhật is_available
            fetchAllData(false);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
      };
    }, [fetchAllData, activeOrderId, initialTableId])
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

    // Tìm và lấy ra section "Món mới"
    const newItemsSectionIndex = newSections.findIndex((s: OrderSection) => s.title === 'Món mới chờ gửi bếp');
    if (newItemsSectionIndex === -1) {
      return currentSections; // Không có món mới để gửi
    }
    const newItemsSection = newSections[newItemsSectionIndex];

    // Xóa section "Món mới" khỏi danh sách
    newSections.splice(newItemsSectionIndex, 1);

    // Tạo một section "Đang chờ gửi" mới
    const pendingSectionTitle = `Đợt mới (chờ gửi) - ${new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    
    // Thêm section mới này vào trước các section "Đợt" đã có
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
    // Tạo một bản sao sâu của mảng sections để tránh thay đổi trực tiếp state
    const newSections = JSON.parse(JSON.stringify(currentSections));

    // Tìm section "Món mới chờ gửi bếp"
    const newItemsSection = newSections.find((s: OrderSection) => s.title === 'Món mới chờ gửi bếp');
    if (!newItemsSection) return currentSections; // Trả về state cũ nếu không tìm thấy

    if (newQuantity < 1) {
      // Nếu số lượng mới < 1, xóa món đó khỏi danh sách
      newItemsSection.data = newItemsSection.data.filter((item: DisplayItem) => item.id !== itemId);
    } else {
      // Nếu không, tìm và cập nhật món đó
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

    // Lặp qua từng section để tìm và xóa item
    for (const section of newSections) {
        const itemIndex = section.data.findIndex((item: DisplayItem) => item.uniqueKey === itemUniqueKey);
        if (itemIndex > -1) {
            section.data.splice(itemIndex, 1);
            break; // Dừng lại khi đã tìm thấy và xóa
        }
    }
    
    // Lọc bỏ những section không còn data
    return newSections.filter((section: OrderSection) => section.data.length > 0);
  });
};

const optimisticallyUpdateNote = (itemUniqueKey: string, newNote: string) => {
  setDisplayedSections(currentSections => {
    const newSections = JSON.parse(JSON.stringify(currentSections));

    // Lặp qua tất cả các section để tìm item cần cập nhật
    for (const section of newSections) {
      const itemIndex = section.data.findIndex((item: DisplayItem) => item.uniqueKey === itemUniqueKey);
      
      if (itemIndex > -1) {
        // Tìm thấy item, cập nhật ghi chú trong customizations
        section.data[itemIndex].customizations.note = newNote;
        break; // Dừng tìm kiếm
      }
    }
    
    return newSections;
  });
};


  const handleRemoveItem = (itemToRemove: DisplayItem) => {
  const action = async () => {
    if (isOnline) {
      // --- LOGIC KHI ONLINE ---
      try {
        await supabase
          .from(itemToRemove.isNew ? 'cart_items' : 'order_items')
          .delete()
          .eq('id', itemToRemove.id)
          .throwOnError();
        
        Toast.show({ type: 'success', text1: 'Đã hủy món' });
        await fetchAllData(false); // Lấy lại dữ liệu mới nhất
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Lỗi hủy món', text2: error.message });
      }
    } else {
      // --- LOGIC KHI OFFLINE ---
      const tableName = itemToRemove.isNew ? 'cart_items' : 'order_items';
      
      offlineManager.addActionToQueue({
        type: 'DELETE',
        tableName: tableName,
        where: { column: 'id', value: itemToRemove.id },
        payload: {}
      });

      // Cập nhật giao diện ngay lập tức
      optimisticallyRemoveItem(itemToRemove.uniqueKey);
      
      Toast.show({
        type: 'info',
        text1: 'Đang offline',
        text2: `Món "${itemToRemove.name}" sẽ được xóa khi có mạng.`,
      });
    }
  };

  // Logic hiển thị Alert xác nhận không thay đổi
  if (itemToRemove.isNew) {
    action(); // Xóa món trong giỏ hàng thì không cần hỏi
  } else {
    // Hiển thị ConfirmModal thay vì Alert
    setCancelItemModal({ visible: true, item: itemToRemove });
  }
};

  const handleOpenItemMenu = (item: DisplayItem) => {
    setEditingItem(item);
    setActionSheetVisible(true);
  };

  const handleSaveNote = async (newNote: string) => {
  if (!editingItem) return;

  if (isOnline) {
    // --- LOGIC KHI CÓ MẠNG ---
    try {
      const updatedCustomizations = { ...editingItem.customizations, note: newNote };
      await supabase
        .from(editingItem.isNew ? 'cart_items' : 'order_items')
        .update({ customizations: updatedCustomizations })
        .eq('id', editingItem.id)
        .throwOnError();
      
      // Tải lại dữ liệu để đảm bảo đồng bộ 100%
      await fetchAllData(false); 
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể lưu ghi chú: ${error.message}`);
    } finally {
      // Đóng modal dù thành công hay thất bại
      setNoteModalVisible(false);
      setEditingItem(null);
    }
  } else {
    // --- LOGIC KHI MẤT MẠNG ---
    const tableName = editingItem.isNew ? 'cart_items' : 'order_items';
    const updatedCustomizations = { ...editingItem.customizations, note: newNote };
    
    // Thêm hành động UPDATE vào hàng đợi
    offlineManager.addActionToQueue({
      type: 'UPDATE',
      tableName: tableName,
      where: { column: 'id', value: editingItem.id },
      payload: { customizations: updatedCustomizations },
    });

    // Cập nhật giao diện ngay lập tức
    optimisticallyUpdateNote(editingItem.uniqueKey, newNote);

    Toast.show({
      type: 'info',
      text1: 'Đang offline',
      text2: 'Ghi chú đã được lưu tạm.',
    });
    
    // Đóng modal ngay lập tức
    setNoteModalVisible(false);
    setEditingItem(null);
  }
};
  const itemActions: ActionSheetItem[] = [];
  if (editingItem && !editingItem.isPaid && !editingItem.isReturnedItem) {
    itemActions.push({
      id: 'note',
      text: 'Thêm/Sửa Ghi chú',
      icon: 'create-outline',
      onPress: () => {
        // 1. Đóng ActionSheet
        setActionSheetVisible(false);
        // 2. Đợi một chút cho hiệu ứng đóng hoàn tất rồi mới mở modal ghi chú
        setTimeout(() => {
          setNoteModalVisible(true);
        }, 250); // 250ms là khoảng thời gian hợp lý
      },
    });
    itemActions.push({
      id: 'remove',
      text: 'Hủy món',
      icon: 'trash-outline',
      color: '#EF4444',
      onPress: () => {
        const itemToRemove = editingItem;
        // 1. Đóng ActionSheet và xóa item đang sửa khỏi state
        setActionSheetVisible(false);
        setEditingItem(null);
        // 2. Đợi một chút rồi mới thực hiện hành động hủy món để UI mượt mà
        setTimeout(() => {
          if (itemToRemove) {
            handleRemoveItem(itemToRemove);
          }
        }, 250);
      },
    });
  }

  const allItems = displayedSections.flatMap((s) => s.data);
  const representativeTable = currentTables[0] || { id: initialTableId, name: initialTableName };
  const currentTableNameForDisplay = currentTables.map((t) => t.name).join(', ');
  const newItemsFromCart = allItems.filter((item) => item.isNew);
  const billableItems = allItems.filter((item) => !item.isPaid && !item.isReturnedItem);
  const paidItems = allItems.filter((item) => item.isPaid);
  const hasNewItems = newItemsFromCart.length > 0;
  const totalBill = billableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const sendNewItemsToKitchen = async (): Promise<string | null> => {
    if (!hasNewItems) return activeOrderId;
    if (!isOnline) {
      // Khi offline, chúng ta chỉ cho phép thêm món vào order đã tồn tại.
      if (!activeOrderId) {
        Toast.show({
          type: 'error',
          text1: 'Cần có mạng để tạo order mới',
          text2: 'Vui lòng kết nối mạng để gửi món cho bàn mới.',
        });
        return null;
      }

      // Tạo các hành động và thêm vào hàng đợi
      const itemsToInsert = newItemsFromCart.map((item) => ({
        order_id: activeOrderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        customizations: item.customizations,
      }));

      // Hành động 1: Thêm order_items
      offlineManager.addActionToQueue({
        type: 'INSERT',
        tableName: 'order_items',
        payload: itemsToInsert,
      });

      // Hành động 2: Xóa cart_items sau khi đã thêm
      // Cần sửa OfflineManager để hỗ trợ delete với 'in'
      // Tạm thời ta sẽ giả định nó hoạt động với mảng ID
      offlineManager.addActionToQueue({
          type: 'DELETE',
          tableName: 'cart_items',
          // payload: newItemsFromCart.map((i) => i.id),
          // Giả định `where` có thể xử lý mảng
          where: { column: 'id', value: newItemsFromCart.map((i) => i.id) },
          payload: {}
      });

      // 2. Cập nhật giao diện ngay lập tức
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
    // Khi offline, ta không fetchAllData vì UI đã được cập nhật rồi
    // Khi online, ta cần fetch để đảm bảo đồng bộ 100%
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
      text2: 'Chức năng thanh toán yêu cầu phải có mạng để đảm bảo tính chính xác.',
    });
    return; // Dừng hàm ngay tại đây
  }
  
  if (billableItems.length === 0 && !hasNewItems) { // Sửa lại điều kiện một chút
    Alert.alert('Thông báo', 'Không có món nào cần thanh toán.');
    return;
  }

    setLoading(true);
    let finalOrderId = activeOrderId;
    if (hasNewItems) {
      const returnedOrderId = await sendNewItemsToKitchen();
      if (!returnedOrderId) {
        setLoading(false);
        return;
      }
      finalOrderId = returnedOrderId;
    }

    if (!finalOrderId) {
      Alert.alert('Lỗi', 'Không tìm thấy order để thanh toán.');
      setLoading(false);
      return;
    }

    const { data: finalItemsData } = await supabase
      .from('order_items')
      .select('quantity, unit_price, returned_quantity')
      .eq('order_id', finalOrderId);
    const finalBillToPay = (finalItemsData || []).reduce((sum, item) => {
      const remainingQty = item.quantity - item.returned_quantity;
      return sum + remainingQty * item.unit_price;
    }, 0);

    setLoading(false);
    
    // Lưu thông tin thanh toán và hiển thị modal
    setPaymentInfo({ orderId: finalOrderId, amount: finalBillToPay });
    setPaymentModalVisible(true);
  };

  const handleKeepSessionAfterPayment = async (orderId: string, finalBill: number, paymentMethod: string) => {
    setLoading(true);
    try {
      await supabase
        .from('orders')
        .update({ 
          status: 'paid', 
          total_price: finalBill,
          payment_method: paymentMethod // Lưu phương thức thanh toán
        })
        .eq('id', orderId)
        .throwOnError();
      
      Toast.show({
        type: 'success',
        text1: 'Thanh toán thành công',
        text2: `Đã thanh toán ${finalBill.toLocaleString('vi-VN')}đ qua ${paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'momo' ? 'Momo' : 'Chuyển khoản'}`
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi thanh toán',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSessionAfterPayment = async (orderId: string, finalBill: number, paymentMethod: string) => {
    setLoading(true);
    try {
      const { data: orderTables, error: tablesError } = await supabase
        .from('order_tables')
        .select('table_id')
        .eq('order_id', orderId);
      if (tablesError) throw tablesError;
      const tableIdsToUpdate = orderTables.map((t) => t.table_id);

      await supabase
        .from('orders')
        .update({ 
          status: 'closed', 
          total_price: finalBill,
          payment_method: paymentMethod // Lưu phương thức thanh toán
        })
        .eq('id', orderId)
        .throwOnError();
      await supabase
        .from('tables')
        .update({ status: 'Trống' })
        .in('id', tableIdsToUpdate)
        .throwOnError();

       Toast.show({
        type: 'success',
        text1: 'Hoàn tất phiên',
        text2: `Đã thanh toán ${finalBill.toLocaleString('vi-VN')}đ và dọn bàn.`
      });
      // Navigate về màn hình chính - hoạt động với cả nhân viên và thu ngân
      navigation.getParent()?.goBack();
      navigation.getParent()?.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi kết thúc phiên',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: 'cash' | 'momo' | 'transfer') => {
    setPaymentMethodBoxVisible(false);
    
    if (!paymentInfo || !pendingPaymentAction) return;
    
    const methodNames = {
      cash: 'Tiền mặt',
      momo: 'Momo',
      transfer: 'Chuyển khoản'
    };
    
    // Nếu thanh toán bằng tiền mặt, hiển thị Bill trước
    if (method === 'cash') {
      setBillModalVisible(true);
      // Sau khi xem bill, mới xử lý thanh toán
      return;
    }
    
    // Xử lý thanh toán cho Momo và Chuyển khoản
    if (pendingPaymentAction === 'keep') {
      handleKeepSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, methodNames[method]);
    } else if (pendingPaymentAction === 'end') {
      handleEndSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, methodNames[method]);
    }
    
    // Reset states
    setPendingPaymentAction(null);
  };

  const handleCompleteCashPayment = async () => {
    setBillModalVisible(false);
    
    if (!paymentInfo || !pendingPaymentAction) return;
    
    setLoading(true);
    
    try {
      // Lấy thông tin order và items để truyền vào PrintPreview
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          order_tables!inner(
            tables(id, name)
          )
        `)
        .eq('id', paymentInfo.orderId)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, unit_price, customizations, returned_quantity')
        .eq('order_id', paymentInfo.orderId);
      
      if (itemsError) throw itemsError;
      
      // Xử lý thanh toán tiền mặt
      if (pendingPaymentAction === 'keep') {
        await handleKeepSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, 'Tiền mặt');
      } else if (pendingPaymentAction === 'end') {
        await handleEndSessionAfterPayment(paymentInfo.orderId, paymentInfo.amount, 'Tiền mặt');
      }
      
      // Chuẩn bị dữ liệu cho PrintPreview
      const items = itemsData
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
        .filter((item: any): item is BillItem => item !== null);
      
      const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      
      const order = {
        orderId: orderData.id,
        createdAt: orderData.created_at,
        tables: orderData.order_tables.map((ot: any) => ({
          id: ot.tables.id,
          name: ot.tables.name
        })),
        totalPrice,
        totalItemCount
      };
      
      // Navigate đến màn hình in với thông tin phương thức thanh toán
      // Truyền shouldNavigateToHome = true để sau khi đóng sẽ quay về Home
      navigation.navigate('PrintPreview', { 
        order, 
        items, 
        paymentMethod: 'cash',
        shouldNavigateToHome: true 
      });
      
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message
      });
    } finally {
      setLoading(false);
      setPendingPaymentAction(null);
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
      const { data: orderTables, error: tablesError } = await supabase
        .from('order_tables')
        .select('table_id')
        .eq('order_id', activeOrderId);
      if (tablesError) throw tablesError;
      const tableIdsToUpdate = orderTables.map((t) => t.table_id);
      await supabase
        .from('orders')
        .update({ status: 'closed' })
        .eq('id', activeOrderId)
        .throwOnError();
      await supabase
        .from('tables')
        .update({ status: 'Trống' })
        .in('id', tableIdsToUpdate)
        .throwOnError();
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã đóng bàn và kết thúc phiên.'
      });
      // Navigate về màn hình chính
      navigation.getParent()?.goBack();
      navigation.getParent()?.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Không thể đóng bàn: ${error.message}`
      });
    } finally {
      setLoading(false);
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

  // [SỬA LỖI TẠI ĐÂY]
  const navigateToReturn = () => {
    const returnableItems = billableItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      image_url: item.image_url, // <-- LẤY TỪ `item.image_url` ĐÃ LƯU
    }));

    if (returnableItems.length === 0) {
      Alert.alert('Thông báo', 'Không có món nào đã gửi bếp để có thể trả.');
      return;
    }
    if (activeOrderId) {
      navigation.navigate(ROUTES.RETURN_SELECTION, {
        orderId: activeOrderId,
        items: returnableItems,
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
      // [SỬA] Dùng send_provisional_bill thay vì toggle
      const { error } = await supabase.rpc('send_provisional_bill', {
        p_order_id: activeOrderId,
      });
      if (error) throw error;
      
      // Fetch lại để cập nhật UI
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
          fromOrderConfirmation: true, // Đánh dấu đã qua OrderConfirmation
        })
      }
    >
      <Icon name="add-outline" size={22} color="#3B82F6" />
      <Text style={styles.addMoreButtonText}>Thêm món khác</Text>
    </TouchableOpacity>
  );

  const hasBillableItems = billableItems.length > 0;
  const isSessionClosable = paidItems.length > 0 && billableItems.length === 0 && !hasNewItems;


  
  const handleGoBack = () => {
    // Luôn quay về màn hình trước đó trong stack
    navigation.goBack();
  };

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
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListHeaderComponent={
          // Đảm bảo bạn truyền đúng activeOrderId
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
            disabled={!hasBillableItems || !isOnline}
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
              disabled={(!hasBillableItems && !hasNewItems) || !isOnline}
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
            setEditingItem(null); // Reset item đang sửa khi đóng bằng cách nhấn ra ngoài hoặc nút "Đóng"
          }}
          title={`Tùy chỉnh "${editingItem.name}"`}
          actions={itemActions}
        />
      )}
      
      {/* Modal thanh toán với 3 tùy chọn */}
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
                    // Hiển thị PaymentMethodBox sau khi đóng modal
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
                    // Hiển thị PaymentMethodBox sau khi đóng modal
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
      
      {/* Payment Method Box - Chọn phương thức thanh toán */}
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
      
      {/* Bill Modal - Hiển thị hóa đơn khi thanh toán tiền mặt */}
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

      {/* Confirm Modal cho Hủy Món */}
      <ConfirmModal
        isVisible={cancelItemModal.visible}
        title="Xác nhận Hủy Món"
        message={`Bạn có chắc muốn hủy món "${cancelItemModal.item?.name}"?`}
        onClose={() => setCancelItemModal({ visible: false, item: null })}
        onConfirm={async () => {
          if (!cancelItemModal.item) return;
          const itemToRemove = cancelItemModal.item;
          setCancelItemModal({ visible: false, item: null });
          
          // Action để thực hiện hủy món (logic giống action trong handleRemoveItem)
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

      {/* Confirm Modal cho Đóng Bàn */}
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
  
  // Payment Modal Styles
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
  
  // Bill Modal Styles
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
