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

// Giả sử bạn có một KitchenStackParamList được định nghĩa ở đâu đó
type KitchenStackParamList = {
  KitchenRoot: undefined;
  KitchenDetail: { orderId: string; tableName: string };
};

type KitchenDetailScreenNavigationProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenDetail'>;
type KitchenDetailScreenRouteProp = RouteProp<KitchenStackParamList, 'KitchenDetail'>;

// Sử dụng lại các hằng số trạng thái
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
  onReturn: (itemId: number, itemName: string) => void;
}> = ({ item, onProcess, onReturn }) => {
  const { customizations, status } = item;
  const isActionable = status === STATUS.PENDING || status === STATUS.IN_PROGRESS;
  const sizeText = customizations.size?.name || 'N/A';
  const sugarText = customizations.sugar?.name || 'N/A';
  const toppingsText = (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;

  const getStatusIcon = (): { icon: React.ComponentProps<typeof Ionicons>['name']; color: string } => {
    switch (status) {
      case STATUS.IN_PROGRESS: return { icon: 'flame-outline', color: '#F97316' };
      case STATUS.COMPLETED:
      case STATUS.SERVED: return { icon: 'checkmark-circle-outline', color: '#10B981' };
      case STATUS.PENDING:
      default: return { icon: 'ellipse-outline', color: '#6B7280' };
    }
  };
  const statusInfo = getStatusIcon();

  return (
    <View style={styles.cardShadow}>
      <View style={styles.itemMainInfo}>
        <View style={styles.itemDetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name={statusInfo.icon} size={22} color={statusInfo.color} style={{ marginRight: 8 }} />
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
          <Text style={styles.itemCustomization}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
          <Text style={styles.itemCustomization}>{`Topping: ${toppingsText}`}</Text>
          {noteText && <Text style={styles.itemNote}>Ghi chú: {noteText}</Text>}
        </View>
        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
      </View>
      {isActionable && (
        <View style={styles.itemActions}>
          <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={() => onReturn(item.id, item.name)}>
            <Ionicons name="arrow-undo-outline" size={20} color="#F97316" />
            <Text style={[styles.actionButtonText, styles.returnButtonText]}>Trả món</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.processButton]} onPress={() => onProcess(item.id)}>
            <Ionicons name="flame-outline" size={20} color="white" />
            <Text style={[styles.actionButtonText, styles.processButtonText]}>Chế biến</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ---- COMPONENT CHÍNH: MÀN HÌNH CHI TIẾT BẾP ----
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

  const handleReturnItem = (itemId: number, itemName: string) => {
    Alert.alert(
      'Xác nhận Trả Món',
      `Bạn có chắc chắn muốn trả lại món "${itemName}" không? Món này sẽ bị xóa khỏi order.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('order_items').delete().eq('id', itemId).throwOnError();
            } catch (err: any) {
              Alert.alert('Lỗi', 'Không thể trả món: ' + err.message);
            }
          },
        },
      ]
    );
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
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
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
            onReturn={handleReturnItem}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text>Order này không có món nào.</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.processAllButton, !hasPendingItems && styles.disabledButton]}
            onPress={handleProcessAll}
            disabled={!hasPendingItems}
        >
          <Ionicons name="flame" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.processAllButtonText}>Chế biến hết các món mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listContainer: { padding: 16 },
  cardShadow: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  itemMainInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  itemCustomization: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  itemNote: { fontSize: 14, color: '#D97706', fontStyle: 'italic', marginTop: 4 },
  itemQuantity: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginLeft: 16 },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  returnButton: { backgroundColor: '#FEF3C7' },
  processButton: { backgroundColor: '#1E3A8A' },
  actionButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  returnButtonText: { color: '#D97706' },
  processButtonText: { color: 'white' },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  processAllButton: {
    backgroundColor: '#2E8540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  processAllButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#9CA3AF' },
});

export default KitchenDetailScreen;