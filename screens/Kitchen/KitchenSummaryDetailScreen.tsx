import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';

type SummaryDetailNavProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenSummaryDetail'>;
type SummaryDetailRouteProp = RouteProp<KitchenStackParamList, 'KitchenSummaryDetail'>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served',  // [THÊM]
  RETURNED: 'returned' // [MỚI] Trạng thái đã trả món
} as const;

type StatusType = typeof STATUS[keyof typeof STATUS];

interface SummaryDetailItem {
  id: number;
  quantity: number;
  returned_quantity?: number; // [MỚI]
  status: StatusType;
  customizations: any;
  table_name: string;
  is_available?: boolean; // [MỚI] Trạng thái còn hàng
}

// ---- COMPONENT CON (ĐÃ CẬP NHẬT NÚT "TRẢ MÓN") ----
const DetailItemCard: React.FC<{
  item: SummaryDetailItem;
  onProcess: (itemId: number) => void;
  onComplete: (itemId: number) => void;
}> = ({ item, onProcess, onComplete }) => {
  const { customizations, status } = item;
  const sizeText = customizations.size?.name || 'Mặc định';
  const sugarText = customizations.sugar?.name || 'Mặc định';
  const toppingsText = (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;

  const getStatusInfo = () => {
    switch (status) {
      case STATUS.IN_PROGRESS:
        return { text: 'Đang làm', color: '#F97316', icon: 'flame' };
      case STATUS.PENDING:
        return { text: 'Chờ bếp', color: '#F97316', icon: 'time-outline' };
      default:
        return { text: 'Hoàn thành', color: '#10B981', icon: 'checkmark-circle-outline' };
    }
  };
  const statusInfo = getStatusInfo();

  const renderFooterActions = () => {
    if (status === STATUS.COMPLETED) {
      return (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.completedText}>Hoàn thành</Text>
        </View>
      );
    }
    
    // [MỚI] Hiển thị badge cảnh báo nếu món hết
    const isOutOfStock = item.is_available === false;
    
    return (
      <View style={styles.footerActionsContainer}>
        {isOutOfStock && status === STATUS.IN_PROGRESS && (
          <View style={styles.outOfStockBadge}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.outOfStockText}>Hết món</Text>
          </View>
        )}
        
        {status === STATUS.PENDING && (
          <TouchableOpacity
            style={styles.processButton}
            onPress={() => onProcess(item.id)}
          >
            <FontAwesome5 name="utensils" size={16} color="white" />
            <Text style={styles.buttonText}>Chế biến</Text>
          </TouchableOpacity>
        )}
        
        {status === STATUS.IN_PROGRESS && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(item.id)}
          >
            <Ionicons name="notifications-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Trả món</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="receipt-outline" size={20} color="#1F2937" />
        <Text style={styles.tableName}>{item.table_name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.customizationText}>{`Số lượng: ${item.quantity}`}</Text>
        <Text style={styles.customizationText}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
        <Text style={styles.customizationText}>{`Topping: ${toppingsText}`}</Text>
        {noteText && <Text style={styles.noteText}>Ghi chú: {noteText}</Text>}
      </View>
      <View style={styles.cardFooter}>
         <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
        {renderFooterActions()}
      </View>
    </View>
  );
};


const FooterActionButton: React.FC<{
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  backgroundColor: string;
  disabled?: boolean;
  loading?: boolean;
}> = ({ onPress, icon, label, color, backgroundColor, disabled = false, loading = false }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.actionButtonContainer, (disabled || loading) && styles.disabledButton]}>
    <View style={[styles.actionButtonCircle, { backgroundColor }]}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Ionicons name={icon} size={24} color={color} />}
    </View>
    <Text style={[styles.actionButtonLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const KitchenSummaryDetailScreen = () => {
  const navigation = useNavigation<SummaryDetailNavProp>();
  const route = useRoute<SummaryDetailRouteProp>();
  const { itemName } = route.params;

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [detailItems, setDetailItems] = useState<SummaryDetailItem[]>([]);

  const fetchDetails = useCallback(async () => {
    try {
      // [CẬP NHẬT] Thêm returned_quantity để lọc món đã trả hết
      const { data, error } = await supabase
        .from('order_items')
        .select(`id, quantity, returned_quantity, status, customizations, created_at, menu_items ( is_available ), orders ( order_tables ( tables ( name ) ) )`)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED])
        .eq('customizations->>name', itemName)
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;
      
      // [FIX] Chỉ hiển thị món còn cần làm
      const mappedItems = data
        .map((item: any) => {
          const returnedQty = item.returned_quantity || 0;
          const remainingQty = item.quantity - returnedQty;
          
          return {
            id: item.id,
            quantity: remainingQty, // Số lượng còn lại
            returned_quantity: returnedQty,
            status: item.status as StatusType,
            customizations: item.customizations,
            table_name: item.orders?.order_tables[0]?.tables?.name || 'Mang về',
            is_available: item.menu_items?.is_available ?? true,
          };
        })
        .filter((item: any) => {
          // [FIX] Bỏ qua món đã trả hết
          if (item.quantity <= 0) {
            return false;
          }
          // Bỏ qua món hết hàng VÀ đang chờ
          if (!item.is_available && item.status === STATUS.PENDING) {
            return false;
          }
          return true;
        });

      setDetailItems(mappedItems);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [itemName]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDetails();
      const channel = supabase
        .channel(`public:order_items:summary_detail_v3:${itemName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchDetails())
        .subscribe();
      
      // [MỚI] Lắng nghe thay đổi menu_items
      const menuItemsChannel = supabase
        .channel('public:menu_items:kitchen_summary_detail')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => {
          console.log('[KitchenSummaryDetail] Món ăn thay đổi trạng thái');
          fetchDetails();
        })
        .subscribe();
      
      // [MỚI] Lắng nghe khi nhân viên trả món
      const returnSlipsChannel = supabase
        .channel('public:return_slips:kitchen_summary_detail')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_slips' }, () => {
          console.log('[KitchenSummaryDetail] Có món được trả');
          fetchDetails();
        })
        .subscribe();
      
      return () => { 
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
        supabase.removeChannel(returnSlipsChannel);
      };
    }, [fetchDetails, itemName])
  );

  const handleProcessItem = async (itemId: number) => {
    setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.IN_PROGRESS } : item));
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + err.message);
      setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.PENDING } : item));
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.COMPLETED } : item));
    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).eq('id', itemId).throwOnError();
      // [XÓA] Không filter ra nữa, để món vẫn hiển thị với status completed
      // setDetailItems(current => current.filter(item => item.id !== itemId));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
      setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.IN_PROGRESS } : item));
    }
  };

  const handleProcessAllPending = async () => {
    const itemsToUpdate = detailItems.filter(item => item.status === STATUS.PENDING);
    if (itemsToUpdate.length === 0) return;
    const itemIdsToUpdate = itemsToUpdate.map(item => item.id);

    setIsProcessing(true);
    setDetailItems(current => current.map(item => itemIdsToUpdate.includes(item.id) ? { ...item, status: STATUS.IN_PROGRESS } : item));
    
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).in('id', itemIdsToUpdate).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + err.message);
      setDetailItems(current => current.map(item => itemIdsToUpdate.includes(item.id) ? { ...item, status: STATUS.PENDING } : item));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteAllInProgress = async () => {
    setIsCompleting(true);
    try {
      // [*** SỬA LỖI ***]
      // Chỉ query những món có tên này VÀ có status là waiting, in_progress, hoặc completed.
      // Điều này ngăn chặn việc "hồi sinh" các món đã được 'served'.
      const { data: allItemsWithName, error: fetchError } = await supabase
        .from('order_items')
        .select(`id, quantity, status, customizations, orders ( order_tables ( tables ( name ) ) )`)
        .eq('customizations->>name', itemName)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED]); // <-- THÊM DÒNG NÀY

      if (fetchError) throw fetchError;

      if (!allItemsWithName || allItemsWithName.length === 0) {
        Alert.alert('Thông báo', 'Không có món nào để hoàn thành.');
        setIsCompleting(false);
        return;
      }

      const mappedAllItems = allItemsWithName.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        status: item.status,
        customizations: item.customizations,
        table_name: item.orders?.order_tables?.[0]?.tables?.name || 'Mang về',
      }));

      // Cập nhật tất cả các món tìm được (chỉ những món đang hoạt động) sang 'completed'
      const allItemIds = mappedAllItems.map(item => item.id);
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ status: STATUS.COMPLETED }) 
        .in('id', allItemIds);

      if (updateError) throw updateError;
      
      // Tự động quay về màn hình trước
      if (navigation.canGoBack()) {
        navigation.goBack();
      }

    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const hasPendingItems = useMemo(() => detailItems.some(item => item.status === STATUS.PENDING), [detailItems]);
  const hasItemsToReturn = useMemo(() => 
    detailItems.some(item => item.status === STATUS.IN_PROGRESS || item.status === STATUS.COMPLETED), 
    [detailItems]
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{itemName}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={detailItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DetailItemCard 
            item={item}
            onProcess={handleProcessItem}
            onComplete={handleCompleteItem}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
            <Text style={{color: '#6B7280', marginTop: 16, fontSize: 18}}>Tất cả yêu cầu cho món này đã hoàn tất!</Text>
          </View>
        }
      />
      <View style={styles.footer}>
          <FooterActionButton
              icon="flame"
              label="Chế biến hết"
              onPress={handleProcessAllPending}
              color="#F97316"
              backgroundColor="#FFF7ED"
              disabled={!hasPendingItems}
              loading={isProcessing}
          />
          <FooterActionButton
              icon="notifications-outline"
              label="Xong"
              onPress={handleCompleteAllInProgress}
              color="#10B981"
              backgroundColor="#ECFDF5"
              disabled={!hasItemsToReturn}
              loading={isCompleting}
          />
      </View>
    </SafeAreaView>
  );
};

// ---- STYLESHEET ----
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  cardBody: {
      paddingHorizontal: 16,
      paddingVertical: 12,
  },
  customizationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noteText: {
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
  cardFooter: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      paddingTop: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  statusText: { 
      marginLeft: 6, 
      fontWeight: '600', 
      fontSize: 12 
  },
  footerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerActionButton: {
    padding: 6,
    marginLeft: 12,
  },
  
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  returnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  returnedText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  outOfStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    marginRight: 8,
  },
  outOfStockText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginLeft: 20, 
  },
  actionButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default KitchenSummaryDetailScreen;