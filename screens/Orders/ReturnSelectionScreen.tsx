// --- START OF FILE screens/Orders/ReturnSelectionScreen.tsx (PHIÊN BẢN HOÀN CHỈNH) ---

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ActivityIndicator, // [THÊM MỚI]
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';
import { useNetwork } from '../../context/NetworkContext';
import ConfirmModal from '../../components/ConfirmModal';

// [THAY ĐỔI] Interface cần thêm status và created_at để xử lý logic
interface ItemToReturn {
  id: number; // Đây là order_item_id
  name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  status: 'waiting' | 'in_progress' | 'completed' | 'served';
  created_at: string;
}

type Props = NativeStackScreenProps<AppStackParamList, 'ReturnSelection'>;

// Component ReturnItemCard không thay đổi
const ReturnItemCard: React.FC<{
  item: ItemToReturn;
  returnQuantity: number;
  onUpdateQuantity: (amount: number) => void;
}> = ({ item, returnQuantity, onUpdateQuantity }) => {
  // ... code của component này giữ nguyên ...
  const placeholderImage = 'https://via.placeholder.com/150';

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url || placeholderImage }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Đã gọi: {item.quantity}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => onUpdateQuantity(-1)} style={styles.quantityButton}>
          <Icon name="remove" size={22} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{returnQuantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(1)} style={styles.quantityButton}>
          <Icon name="add" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const ReturnSelectionScreen = ({ route, navigation }: Props) => {
  // [THÊM MỚI] Giả sử `tableName` được truyền từ màn hình Order
  const { orderId, items: rawItems } = route.params; 
  const tableName = (route.params as any).tableName || 'Không rõ';
  
  // Chuyển đổi items thành ItemToReturn format
  const items = (rawItems as any[]).map(item => ({
    ...item,
    status: item.status || 'waiting',
    created_at: item.created_at || new Date().toISOString(),
  })) as ItemToReturn[];
  
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [itemsToReturn, setItemsToReturn] = useState<{ [itemId: number]: number }>({});
  const [isModalVisible, setModalVisible] = useState(false);

  const handleUpdateQuantity = (itemId: number, amount: number) => {
    // ... code của hàm này giữ nguyên ...
    const originalItem = items.find((i) => i.id === itemId);
    if (!originalItem) return;

    const currentQty = itemsToReturn[itemId] || 0;
    let newQty = currentQty + amount;

    if (newQty < 0) newQty = 0;
    if (newQty > originalItem.quantity) newQty = originalItem.quantity;

    setItemsToReturn((prev) => ({ ...prev, [itemId]: newQty }));
  };

  // [THAY ĐỔI LỚN] Viết lại hoàn toàn hàm xử lý logic hủy/trả món
  const handleConfirmReturn = async () => {
    if (!isOnline) {
      Toast.show({ type: 'error', text1: 'Không có kết nối mạng' });
      return;
    }
    setIsSubmitting(true);

    const itemsToProcess = Object.entries(itemsToReturn)
    .map(([itemId, quantity]) => {
      const originalItem = items.find((i) => i.id === Number(itemId));
      return {
        order_item_id: Number(itemId),
        quantity,
        name: originalItem?.name || 'Không rõ',
        status: originalItem?.status,
        created_at: originalItem?.created_at,
        unit_price: originalItem?.unit_price || 0, // <-- THÊM DÒNG NÀY
      };
    })
    .filter((i) => i.quantity > 0 && i.status && i.created_at);

    if (itemsToProcess.length === 0) {
      setIsSubmitting(false);
      return;
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const itemsToCancelDirectly = itemsToProcess.filter(
      (item) => item.status === 'waiting' && item.created_at && new Date(item.created_at) > fiveMinutesAgo
    );

    const itemsToRequestCancellation = itemsToProcess.filter(
      (item) => !itemsToCancelDirectly.some(directItem => directItem.order_item_id === item.order_item_id)
    );

    try {
      let successMessage = '';
      let requestMessage = '';

      // 1. Xử lý các món cần gửi yêu cầu
      if (itemsToRequestCancellation.length > 0) {
        if (!reason.trim()) {
          Alert.alert('Thiếu lý do', 'Vui lòng nhập lý do cho các món cần bếp xác nhận (món đã chế biến hoặc gọi quá 5 phút).');
          setIsSubmitting(false);
          return;
        }

        const requestPayload = {
          order_id: orderId,
          table_name: tableName || 'Không rõ',
          reason: reason.trim(),
          requested_items: itemsToRequestCancellation.map(item => ({
            order_item_id: item.order_item_id,
            name: item.name,
            quantity: item.quantity,
          })),
        };
        
        const { error } = await supabase.from('cancellation_requests').insert(requestPayload);
        if (error) throw new Error(`Gửi yêu cầu thất bại: ${error.message}`);
        
        requestMessage = `Đã gửi yêu cầu trả ${itemsToRequestCancellation.length} món tới bếp.`;
      }

      // 2. Xử lý các món được hủy trực tiếp
      if (itemsToCancelDirectly.length > 0) {
        const itemIdsToCancel = itemsToCancelDirectly.map(item => item.order_item_id);
        
        // Tạo return slip trước
        const { data: returnSlipData, error: slipError } = await supabase
          .from('return_slips')
          .insert({
            order_id: orderId,
            reason: 'Hủy trực tiếp',
            type: 'cancel',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (slipError) throw new Error(`Tạo phiếu trả thất bại: ${slipError.message}`);
        
        // Tạo return_slip_items cho mỗi món
        const returnSlipItems = itemsToCancelDirectly.map(item => ({
          return_slip_id: returnSlipData.id,
          order_item_id: item.order_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price, // <-- THÊM DÒNG NÀY
        }));
        
        const { error: itemsError } = await supabase
          .from('return_slip_items')
          .insert(returnSlipItems);

        if (itemsError) throw new Error(`Tạo chi tiết phiếu trả thất bại: ${itemsError.message}`);
        
        // Update quantity về 0 để món biến mất khỏi danh sách
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ quantity: 0 })
          .in('id', itemIdsToCancel);

        if (updateError) throw new Error(`Cập nhật quantity thất bại: ${updateError.message}`);
        
        successMessage = `Đã hủy thành công ${itemsToCancelDirectly.length} món.`;
      }

      Toast.show({
        type: 'success',
        text1: 'Hoàn tất xử lý',
        text2: [successMessage, requestMessage].filter(Boolean).join('\n'),
        visibilityTime: 4000
      });
      navigation.goBack();

    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    // Logic lấy danh sách các món cần xử lý (copy từ hàm cũ)
    const itemsToProcess = Object.entries(itemsToReturn)
      .map(([itemId, quantity]) => {
        const originalItem = items.find((i) => i.id === Number(itemId));
        return {
          order_item_id: Number(itemId),
          quantity,
          status: originalItem?.status,
          created_at: originalItem?.created_at,
        };
      })
      .filter((i) => i.quantity > 0 && i.status && i.created_at);

    if (itemsToProcess.length === 0) {
      return; // Không có món nào được chọn thì không làm gì
    }
    
    // Logic phân loại (copy từ hàm cũ)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const itemsToRequestCancellation = itemsToProcess.filter(
      (item) => !(item.status === 'waiting' && item.created_at && new Date(item.created_at) > fiveMinutesAgo)
    );

    // QUYẾT ĐỊNH HIỂN THỊ MODAL
    if (itemsToRequestCancellation.length > 0) {
      // Nếu có ít nhất 1 món cần GỬI YÊU CẦU -> Hiển thị Modal
      if (!reason.trim()) {
        Alert.alert('Thiếu lý do', 'Vui lòng nhập lý do cho các món cần bếp xác nhận (món đã chế biến hoặc gọi quá 5 phút).');
        return;
      }
      setModalVisible(true);
    } else {
      // Nếu tất cả các món đều được HỦY TRỰC TIẾP -> Chạy luôn không cần hỏi
      handleConfirmReturn();
    }
  };

  const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum, qty) => sum + qty, 0);
  const isReturnDisabled = totalReturnQuantity === 0 || isSubmitting;

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn món cần trả/hủy</Text>
        <View style={{width: 30}}/>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ReturnItemCard
            item={item}
            returnQuantity={itemsToReturn[item.id] || 0}
            onUpdateQuantity={(amount) => handleUpdateQuantity(item.id, amount)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 150 }}
        ListFooterComponent={
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Nhập lý do (bắt buộc nếu trả món đã chế biến/gọi quá 5 phút)"
              style={styles.reasonInput}
              multiline
            />
        }
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Tổng số món trả/hủy</Text>
          <Text style={styles.summaryQuantity}>{totalReturnQuantity}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, isReturnDisabled && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isReturnDisabled}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : 
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          }
        </TouchableOpacity>
      </View>
      <ConfirmModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false); // Đóng modal
          handleConfirmReturn(); // Rồi mới chạy hàm xử lý
        }}
        title="Gửi yêu cầu trả món?"
        message="Một hoặc nhiều món bạn chọn đã được gửi đến bếp hoặc gọi quá 5 phút. Hành động này sẽ gửi một yêu cầu để bếp xem xét. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Gửi yêu cầu"
        cancelText="Để sau"
        variant="warning" // Dùng màu cam để cảnh báo
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#F8F9FA' },
  headerContainer: { backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 16, elevation: 3 },
  itemImage: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  itemQuantity: { fontSize: 14, color: '#6B7280' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20 },
  quantityButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 18, fontWeight: 'bold', minWidth: 35, textAlign: 'center', color: '#111827' },
  reasonInput: { backgroundColor: 'white', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top', fontSize: 16, marginTop: 16, color: '#1F2937' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryText: { fontSize: 16, color: '#4B5563', fontWeight: '500' },
  summaryQuantity: { fontSize: 20, color: '#1F2937', fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#F43F5E', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#9CA3AF' },
});

export default ReturnSelectionScreen;