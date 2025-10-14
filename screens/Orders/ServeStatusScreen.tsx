// --- START OF FILE ServeStatusScreen.tsx (ĐÃ NÂNG CẤP VỚI LOGGING) ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import ConfirmModal from '../../components/ConfirmModal';

type ItemStatus = 'waiting' | 'in_progress' | 'completed' | 'served';

interface ServeItem {
  id: number;
  name: string;
  quantity: number;
  status: ItemStatus;
}

type Props = NativeStackScreenProps<AppStackParamList, 'ServeStatus'>;

const ServeItemRow: React.FC<{
  item: ServeItem;
  onMarkAsServed: () => void;
}> = ({ item, onMarkAsServed }) => {
  const getStatusInfo = () => {
    switch (item.status) {
      case 'waiting':
        return { text: 'Chờ bếp', color: '#6B7280', icon: 'time-outline' };
      case 'in_progress':
        return { text: 'Đang làm', color: '#F97316', icon: 'flame-outline' };
      case 'completed':
        return { text: 'Sẵn sàng', color: '#10B981', icon: 'restaurant-outline' };
      case 'served':
        return { text: 'Đã phục vụ', color: '#3B82F6', icon: 'checkmark-done-outline' };
      default:
        return { text: 'Không rõ', color: 'gray', icon: 'help-circle-outline' };
    }
  };
  const statusInfo = getStatusInfo();
  const isServed = item.status === 'served';

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, isServed && styles.servedItemText]}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Icon name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </View>
      {item.status === 'completed' ? (
        <TouchableOpacity onPress={onMarkAsServed} style={styles.serveButton}>
          <Text style={styles.serveButtonText}>Phục vụ</Text>
        </TouchableOpacity>
      ) : (
         <View style={{width: 80, alignItems: 'center'}}>
            <Icon name={statusInfo.icon as any} size={28} color={statusInfo.color} />
         </View>
      )}
    </View>
  );
};

const ServeStatusScreen = ({ route, navigation }: Props) => {
  const { orderId, tableName } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServeItem[]>([]);
  const [isCompleteModalVisible, setCompleteModalVisible] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, status, customizations')
        .eq('order_id', orderId);

      if (error) throw error;

      const formattedItems = data.map((item) => ({
        id: item.id,
        name: item.customizations?.name || 'Món không xác định',
        quantity: item.quantity,
        status: item.status,
      }));
      
      const allServed = formattedItems.every(item => item.status === 'served');
      if (allServed && formattedItems.length > 0) {
        setCompleteModalVisible(true);
      }
      
      setItems(formattedItems);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
    const channel = supabase.channel(`public:order_items:serve_status:${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}`},
      (payload) => { 
        // [THÊM LOGGING] Dòng này sẽ giúp bạn kiểm tra xem client có nhận được event không
        console.log('Real-time update received! Payload:', payload);
        fetchItems(); 
      }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchItems, orderId]);

  const handleMarkAsServed = async (itemToUpdate: ServeItem) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: 'served' })
        .eq('id', itemToUpdate.id);

      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái món: ' + err.message);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra món cho {tableName}</Text>
        <TouchableOpacity onPress={fetchItems} style={styles.backButton}>
          <Icon name="refresh-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ServeItemRow item={item} onMarkAsServed={() => handleMarkAsServed(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: 'gray' }}>Chưa có món nào trong order này.</Text>
          </View>
        }
      />
      
      {/* Modal thông báo hoàn thành */}
      <ConfirmModal
        isVisible={isCompleteModalVisible}
        title="Hoàn thành phục vụ"
        message="Tất cả món đã được phục vụ xong! Bạn có muốn quay lại không?"
        confirmText="Quay lại"
        cancelText="Ở lại"
        onClose={() => setCompleteModalVisible(false)}
        onConfirm={() => {
          setCompleteModalVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#3B82F6' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  servedItemText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 6, alignSelf: 'flex-start' },
  statusText: { marginLeft: 6, fontWeight: '600', fontSize: 12 },
  serveButton: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  serveButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ServeStatusScreen;