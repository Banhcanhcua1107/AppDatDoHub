// --- START OF FILE screens/Kitchen/CancellationRequestsScreen.tsx (MÀN HÌNH MỚI) ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

interface CancellationRequest {
  id: string;
  table_name: string;
  reason: string;
  created_at: string;
  requested_items: { name: string; quantity: number; order_item_id: number }[];
}

const RequestCard = ({ item, onApprove, onReject }: { item: CancellationRequest; onApprove: () => void; onReject: () => void; }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Bàn {item.table_name}</Text>
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

const CancellationRequestsScreen = () => {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu hủy/trả món.');
    else setRequests(data as CancellationRequest[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
      const channel = supabase
        .channel('public:cancellation_requests:kitchen_requests_screen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellation_requests' }, () => {
          fetchRequests();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [fetchRequests])
  );
  
  const handleApprove = async (requestId: string) => {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      try {
        // Tạo return slip trước
        const { data: returnSlipData, error: slipError } = await supabase
          .from('return_slips')
          .insert({
            order_id: request.id,
            reason: request.reason,
            type: 'approved_cancellation',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (slipError) throw slipError;

        // Tạo return_slip_items cho mỗi món
        const returnSlipItems = request.requested_items.map(item => ({
          return_slip_id: returnSlipData.id,
          order_item_id: item.order_item_id,
          quantity: item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('return_slip_items')
          .insert(returnSlipItems);
        if (itemsError) throw itemsError;

        // Update quantity về 0
        const itemIds = request.requested_items.map(item => item.order_item_id);
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ quantity: 0 })
          .in('id', itemIds);
        if (updateError) throw updateError;

        // Cập nhật status của cancellation_request
        const { error: requestError } = await supabase
          .from('cancellation_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);
        if (requestError) throw requestError;

        Toast.show({type: 'success', text1: 'Đã duyệt yêu cầu thành công.'});
      } catch (error: any) {
        Alert.alert('Lỗi', 'Không thể duyệt yêu cầu: ' + error.message);
      }
  };
  
  const handleReject = async (requestId: string) => {
      const { error } = await supabase.from('cancellation_requests').update({ status: 'rejected' }).eq('id', requestId);
      if (error) Alert.alert('Lỗi', 'Không thể từ chối yêu cầu.');
      else Toast.show({type: 'info', text1: 'Đã từ chối yêu cầu.'})
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6"/>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yêu cầu hủy/trả món</Text>
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

export default CancellationRequestsScreen;