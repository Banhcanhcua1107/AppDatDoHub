// screens/Kitchen/KitchenDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // Đảm bảo đường dẫn này đúng

type KitchenDetailScreenNavigationProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenDetail'>;
type KitchenDetailScreenRouteProp = RouteProp<KitchenStackParamList, 'KitchenDetail'>;

// Hằng số trạng thái
const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served',
};
type KitchenItemStatus = typeof STATUS[keyof typeof STATUS];

interface KitchenDetailItem {
  id: number;
  name: string;
  quantity: number;
  note: string | null;
  status: KitchenItemStatus;
  customizations: any;
}

// ---- COMPONENT CON: HIỂN THỊ MỘT MÓN ĂN ----
const KitchenDetailItemCard: React.FC<{
  item: KitchenDetailItem;
  onProcess: (itemId: number) => void;
  onComplete: (itemId: number) => void;
}> = ({ item, onProcess, onComplete }) => {
  const { customizations, status } = item;
  const sizeText = customizations.size?.name || 'Mặc định';
  const sugarText = customizations.sugar?.name || 'Mặc định';
  const toppingsText = (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;

  // HÀM QUAN TRỌNG: QUYẾT ĐỊNH HIỂN THỊ ICON NÀO
  const renderFooterContent = () => {
    // ---- TRƯỜNG HỢP 1: Món đã xong (completed) hoặc đã phục vụ (served) ----
    // Chỉ hiển thị MỘT icon dấu tick duy nhất. Đây là trường hợp trong ảnh của bạn.
    if (status === STATUS.COMPLETED || status === STATUS.SERVED) {
      return (
        <View style={styles.footerActionsContainer}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
        </View>
      );
    }
    
    // ---- TRƯỜNG HỢP 2: Món đang chờ (pending) hoặc đang làm (in_progress) ----
    // Sẽ hiển thị HAI icon (cái nồi và cái chuông)
    return (
      <View style={styles.footerActionsContainer}>
        {/* Icon "Vào bếp" (cái nồi) */}
        <TouchableOpacity
          style={styles.footerActionButton}
          onPress={() => onProcess(item.id)}
          // Nút này chỉ có thể bấm khi trạng thái là "chờ" (pending)
          disabled={status !== STATUS.PENDING}
        >
          <Ionicons 
            name="restaurant" // Tên icon cái nồi
            size={26} 
            // Nếu là "chờ" thì icon màu xám, ngược lại thì màu rất nhạt (bị vô hiệu hóa)
            color={status === STATUS.PENDING ? '#6B7280' : '#D1D5DB'} 
          />
        </TouchableOpacity>
        
        {/* Icon "Báo đã xong" (cái chuông) */}
        <TouchableOpacity
          style={styles.footerActionButton}
          onPress={() => onComplete(item.id)}
          // Nút này chỉ có thể bấm khi trạng thái là "đang làm" (in_progress)
          disabled={status !== STATUS.IN_PROGRESS}
        >
          <Ionicons 
            name="notifications" // Tên icon cái chuông
            size={26} 
            // Nếu là "đang làm" thì icon màu xanh, ngược lại thì màu rất nhạt (bị vô hiệu hóa)
            color={status === STATUS.IN_PROGRESS ? '#10B981' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View style={styles.cardShadow}>
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCustomization}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
        <Text style={styles.itemCustomization}>{`Topping: ${toppingsText}`}</Text>
        {noteText && <Text style={styles.itemNote}>Ghi chú: {noteText}</Text>}
      </View>

      <View style={styles.divider} />

      <View style={styles.itemFooter}>
        <Text style={styles.itemQuantityText}>Số lượng: {item.quantity}</Text>
        {renderFooterContent()}
      </View>
    </View>
  );
};


// ---- COMPONENT CHÍNH: MÀN HÌNH CHI TIẾT BẾP (Logic giữ nguyên) ----
const KitchenDetailScreen = () => {
  const navigation = useNavigation<KitchenDetailScreenNavigationProp>();
  const route = useRoute<KitchenDetailScreenRouteProp>();
  const { orderId, tableName } = route.params;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<KitchenDetailItem[]>([]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, customizations, status')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedItems = data.map((item: any) => ({
        ...item,
        name: item.customizations.name || 'Món không tên',
        note: item.customizations.note || null,
      }));
      setItems(mappedItems);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết order: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrderDetails();
      const channel = supabase
        .channel(`public:order_items:detail:${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}` },
          () => fetchOrderDetails()
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchOrderDetails, orderId])
  );

  const handleProcessItem = async (itemId: number) => {
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + err.message);
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
    }
  };

  const handleProcessAll = async () => {
    const itemsToProcess = items.filter(item => item.status === STATUS.PENDING).map(item => item.id);
    if (itemsToProcess.length === 0) {
      Alert.alert('Thông báo', 'Không có món mới nào để chế biến.');
      return;
    }
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).in('id', itemsToProcess).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể chế biến tất cả món: ' + err.message);
    }
  };

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  const hasPendingItems = items.some(item => item.status === STATUS.PENDING);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tableName}</Text>
        <View style={styles.backButton} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <KitchenDetailItemCard
            item={item}
            onProcess={handleProcessItem}
            onComplete={handleCompleteItem}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={{color: '#6B7280'}}>Order này không có món nào.</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
            style={[styles.processAllButton, !hasPendingItems && styles.disabledButton]}
            onPress={handleProcessAll}
            disabled={!hasPendingItems}
        >
          <Ionicons name="restaurant" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.processAllButtonText}>Vào bếp tất cả món mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ---- STYLESHEET (Không thay đổi) ----
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: -10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listContainer: { padding: 16 },
  
  cardShadow: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  itemCustomization: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  itemNote: {
    fontSize: 14,
    color: '#D97706',
    fontStyle: 'italic',
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },
  itemQuantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  footerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerActionButton: {
    padding: 6,
    marginLeft: 8,
  },
  
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  processAllButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  processAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default KitchenDetailScreen;