import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { KitchenStackParamList } from '../../navigation/AppNavigator';
// [THÊM] Import service để gửi thông báo
import { 
  sendCancellationApprovedNotification, 
  sendCancellationRejectedNotification 
} from '../../services/notificationService';

type CancellationRequestsDetailScreenRouteProp = RouteProp<KitchenStackParamList, 'CancellationRequestsDetail'>;
type CancellationRequestsDetailScreenNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

interface CancellationRequest {
  id: string;
  order_id: string;
  table_name: string;
  reason: string;
  created_at: string;
  requested_items: { name: string; quantity: number; order_item_id: number }[];
}

const RequestCard = ({ item, onApprove, onReject }: { item: CancellationRequest; onApprove: () => void; onReject: () => void; }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.table_name}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString('vi-VN')}</Text>
    </View>
    <Text style={styles.reason}><Text style={{fontWeight: 'bold'}}>Lý do:</Text> {item.reason}</Text>
    <View style={styles.divider} />
    <Text style={styles.itemsHeader}>Các món yêu cầu hủy/trả:</Text>
    {item.requested_items.map(reqItem => (
      <Text key={reqItem.order_item_id} style={styles.itemText}>
        - {reqItem.name} (SL: {reqItem.quantity})
      </Text>
    ))}
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={onReject}>
        <Icon name="close-circle-outline" size={20} color="#DC2626" />
        <Text style={[styles.buttonText, { color: '#DC2626' }]}>Từ chối</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={onApprove}>
        <Icon name="checkmark-circle-outline" size={20} color="#16A34A" />
        <Text style={[styles.buttonText, { color: '#16A34A' }]}>Đồng ý</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CancellationRequestsDetailScreen = () => {
  const route = useRoute<CancellationRequestsDetailScreenRouteProp>();
  const navigation = useNavigation<CancellationRequestsDetailScreenNavigationProp>();
  const { orderId, tableName } = route.params;

  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu hủy/trả món.');
    } else {
      setRequests(data as CancellationRequest[]);
    }
    setLoading(false);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
      // [LƯU Ý] Âm thanh được phát bởi NotificationContext, đây chỉ để cập nhật UI
      const channel = supabase
        .channel(`cancellation_requests_detail_screen:${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellation_requests', filter: `order_id=eq.${orderId}` }, () => {
          fetchRequests();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [fetchRequests, orderId])
  );
  
  const handleApprove = async (requestId: string) => {
    // Bước 1: Tìm yêu cầu cụ thể trong state
    const request = requests.find(r => r.id === requestId);
    if (!request) {
        // Trường hợp hiếm gặp, nhưng để đảm bảo an toàn
        Toast.show({ type: 'error', text1: 'Không tìm thấy yêu cầu!' });
        return;
    }

    // Bước 2: Cập nhật giao diện ngay lập tức (Optimistic Update)
    setRequests(prev => prev.filter(r => r.id !== requestId));

    try {
        // --- BẮT ĐẦU CHUỖI TƯƠNG TÁC DATABASE ---

        // Bước 3: Tạo một 'return_slip' (phiếu trả hàng) để ghi lại sự kiện này
        const { data: returnSlipData, error: slipError } = await supabase
            .from('return_slips')
            .insert({
                order_id: request.order_id, // Sử dụng order_id từ request
                reason: `Duyệt yêu cầu: ${request.reason}`,
                type: 'approved_cancellation',
            })
            .select('id')
            .single();

        if (slipError) throw slipError;

        // Chuẩn bị dữ liệu để insert hàng loạt và tạo nội dung thông báo
        const returnSlipItemsToInsert = [];
        const approvedItemNames: string[] = [];

        // Bước 4: Lặp qua từng món trong yêu cầu để cập nhật 'order_items'
        for (const item of request.requested_items) {
            // Lấy trạng thái hiện tại của order_item để có unit_price và returned_quantity
            const { data: currentItem, error: fetchError } = await supabase
                .from('order_items')
                .select('returned_quantity, unit_price')
                .eq('id', item.order_item_id)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Tính toán số lượng trả mới
            const newReturnedQuantity = (currentItem.returned_quantity || 0) + item.quantity;
            
            // Cập nhật lại order_item với số lượng đã trả mới
            const { error: updateError } = await supabase
                .from('order_items')
                .update({ returned_quantity: newReturnedQuantity })
                .eq('id', item.order_item_id);
            
            if (updateError) throw updateError;
            
            // Thêm dữ liệu vào mảng để chuẩn bị insert vào 'return_slip_items'
            returnSlipItemsToInsert.push({
                return_slip_id: returnSlipData.id,
                order_item_id: item.order_item_id,
                quantity: item.quantity,
                unit_price: currentItem.unit_price // Lưu lại giá tại thời điểm trả
            });

            // Thêm tên món vào mảng để tạo nội dung thông báo
            approvedItemNames.push(`${item.name} (SL: ${item.quantity})`);
        }
        
        // Bước 5: Insert tất cả các chi tiết phiếu trả hàng (return_slip_items)
        const { error: itemsError } = await supabase
            .from('return_slip_items')
            .insert(returnSlipItemsToInsert);
        if (itemsError) throw itemsError;

        // Bước 6: Cập nhật trạng thái của yêu cầu hủy ban đầu thành 'approved'
        const { error: requestError } = await supabase
            .from('cancellation_requests')
            .update({ status: 'approved' })
            .eq('id', requestId);
        if (requestError) throw requestError;

        // --- HOÀN TẤT TƯƠNG TÁC DATABASE ---

        // Bước 7: Gửi thông báo cho nhân viên rằng yêu cầu đã được DUYỆT
        // [QUAN TRỌNG] Khi gửi notification, bếp sẽ không nghe âm thanh vì:
        // - NotificationContext chỉ phát âm thanh cho staff khi notification_type là từ bếp
        // - Bếp tự gửi notification (self-trigger) → NotificationContext sẽ bỏ qua
        // - Chỉ nhân viên khác (ở OrderScreen) mới nghe tiếng "ting-ting"
        await sendCancellationApprovedNotification(
            request.order_id,
            request.table_name,
            approvedItemNames.join(', ')
        );

        // Bước 8: Hiển thị thông báo thành công cho người dùng (bếp)
        Toast.show({ type: 'success', text1: 'Đã duyệt yêu cầu thành công.' });
        
        // Bước 9 (Cải thiện UX): Nếu đây là yêu cầu cuối cùng, tự động quay lại
        if (requests.length === 1 && navigation.canGoBack()) {
            navigation.goBack();
        }

    } catch (error: any) {
        // XỬ LÝ LỖI: Nếu có bất kỳ bước nào ở trên thất bại
        Alert.alert('Lỗi Thao Tác', 'Không thể duyệt yêu cầu: ' + error.message);
        
        // Rollback UI: Tải lại danh sách yêu cầu từ database để giao diện khớp với thực tế
        fetchRequests();
    }
};
  
  const handleReject = async (requestId: string) => {
  const request = requests.find(r => r.id === requestId);
  if (!request) return;

  setRequests(prev => prev.filter(r => r.id !== requestId));
  
  try {
    const { error } = await supabase.from('cancellation_requests').update({ status: 'rejected' }).eq('id', requestId);
    if (error) throw error;
    
    // Gửi thông báo từ chối
    // [QUAN TRỌNG] Khi gửi notification, bếp sẽ không nghe âm thanh vì:
    // - NotificationContext chỉ phát âm thanh cho staff khi notification_type là từ bếp
    // - Bếp tự gửi notification (self-trigger) → NotificationContext sẽ bỏ qua
    // - Chỉ nhân viên khác (ở OrderScreen) mới nghe tiếng "ting-ting"
    const rejectedItemNames = request.requested_items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    await sendCancellationRejectedNotification(
      request.order_id,
      request.table_name,
      rejectedItemNames
    );
    
    Toast.show({ type: 'info', text1: 'Đã từ chối yêu cầu.' });
    if (requests.length === 1) navigation.goBack();

  } catch (error: any) {
     Alert.alert('Lỗi', 'Không thể từ chối yêu cầu: ' + error.message);
     fetchRequests(); // Rollback UI
  }
};

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6"/>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{tableName}</Text>
            <View style={styles.backButton} />
        </View>
        <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <RequestCard 
                item={item} 
                onApprove={() => handleApprove(item.id)}
                onReject={() => handleReject(item.id)}
            />
        )}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
            <View style={styles.center}>
                <Icon name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
                <Text style={styles.emptyText}>Không có yêu cầu nào đang chờ.</Text>
            </View>
        }
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
    container: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    backButton: { width: 30 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E40AF' },
    timestamp: { fontSize: 12, color: '#6B7280' },
    reason: { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
    itemsHeader: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
    itemText: { fontSize: 14, color: '#4B5563', marginLeft: 8 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
    button: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
    rejectButton: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
    approveButton: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
    buttonText: { marginLeft: 6, fontWeight: '600', fontSize: 14 },
    emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280' },
});

export default CancellationRequestsDetailScreen;