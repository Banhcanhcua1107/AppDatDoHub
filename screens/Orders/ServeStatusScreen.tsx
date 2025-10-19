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
  returned_quantity: number;
  image_url: string | null;
  is_available?: boolean; // [MỚI] Trạng thái còn hàng của món
  isReturnedItem?: boolean; // [MỚI] Cờ để đánh dấu là món đã trả
}

type Props = NativeStackScreenProps<AppStackParamList, 'ServeStatus'>;

const ServeItemRow: React.FC<{
  item: ServeItem;
  onMarkAsServed: () => void;
}> = ({ item, onMarkAsServed }) => {
  const isOutOfStock = item.is_available === false;
  const isReturnedItem = item.isReturnedItem ?? false;
  const isDisabled = isOutOfStock || isReturnedItem;

  const getStatusInfo = () => {
    switch (item.status) {
      case 'waiting':
        return { text: 'Chờ bếp', color: '#6B7280', icon: 'time-outline' };
      case 'in_progress':
        return { text: 'Đang làm', color: '#F97316', icon: 'flame' };
      case 'completed':
        return { text: 'Sẵn sàng', color: '#10B981', icon: 'restaurant-outline' };
      case 'served':
        return { text: 'Đã phục vụ', color: '#3B82F6', icon: 'checkmark-done-outline' };
      default:
        return { text: 'Không rõ', color: 'gray', icon: 'help-circle-outline' };
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.itemContainer, isDisabled && styles.disabledItem]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, isDisabled && styles.servedItemText]}>
          {item.name}
        </Text>
        
        {/* [MỚI] Dòng chữ đỏ cho hết/trả lại */}
        {isDisabled ? (
          <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 13, marginTop: 6 }}>
            {isReturnedItem ? 'Đã trả lại' : 'Đã hết'}
          </Text>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Icon name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
        )}
      </View>
      
      {!isDisabled && item.status === 'completed' ? (
        <TouchableOpacity onPress={onMarkAsServed} style={styles.serveButton}>
          <Text style={styles.serveButtonText}>Phục vụ</Text>
        </TouchableOpacity>
      ) : (
         <View style={{width: 80, alignItems: 'center'}}>
            {!isDisabled && <Icon name={statusInfo.icon as any} size={28} color={statusInfo.color} />}
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
      // [CẬP NHẬT] Lấy thêm returned_quantity và menu_items để có is_available
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, status, customizations, returned_quantity, menu_items(image_url, is_available)')
        .eq('order_id', orderId);

      if (error) throw error;

      const formattedItems = data.map((item: any) => {
        const remaining_quantity = item.quantity - item.returned_quantity;
        const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
        const is_available = menuItem?.is_available ?? true;
        
        // [MỚI] Nếu quantity đã trả == quantity gốc, đây là món đã trả
        const isReturnedItem = remaining_quantity <= 0;
        
        return {
          id: item.id,
          name: item.customizations?.name || 'Món không xác định',
          quantity: remaining_quantity > 0 ? remaining_quantity : item.returned_quantity,
          status: item.status,
          returned_quantity: item.returned_quantity,
          image_url: menuItem?.image_url || null,
          is_available,
          isReturnedItem,
        };
      });

      // [MỚI] Sắp xếp items: bình thường trước, hết/trả cuối
      const sortedItems = [
        ...formattedItems.filter(item => !item.isReturnedItem && item.is_available !== false),
        ...formattedItems.filter(item => item.isReturnedItem || item.is_available === false),
      ];
      
      const allServed = sortedItems.every(item => item.status === 'served');
      if (allServed && sortedItems.length > 0) {
        setCompleteModalVisible(true);
      }
      
      setItems(sortedItems);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
    
    // [MỚI] Listener cho order_items
    const channel = supabase.channel(`public:order_items:serve_status:${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}`},
      (payload) => { 
        console.log('Real-time update received! Payload:', payload);
        fetchItems(); 
      }
    ).subscribe();

    // [MỚI] Listener cho menu_items (khi bếp báo hết)
    const menuItemsChannel = supabase
      .channel('public:menu_items_availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items' },
        (payload) => {
          console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
          fetchItems(); // Refresh lại dữ liệu
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel);
      supabase.removeChannel(menuItemsChannel);
    };
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
        variant="success"
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
  disabledItem: { backgroundColor: '#F9FAFB', opacity: 0.8 }, // [MỚI]
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  servedItemText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 6, alignSelf: 'flex-start' },
  statusText: { marginLeft: 6, fontWeight: '600', fontSize: 12 },
  serveButton: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  serveButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ServeStatusScreen;