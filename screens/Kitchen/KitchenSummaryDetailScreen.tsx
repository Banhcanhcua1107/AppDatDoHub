import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
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
  isReturnedItem?: boolean; // [MỚI] Cờ để đánh dấu món đã trả lại
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

  // [MỚI] Kiểm tra món đã hoàn thành
  const isCompleted = status === STATUS.COMPLETED;

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
    // [MỚI] Nếu đã trả lại, không hiển thị gì - chỉ có badge ở trên
    if (item.isReturnedItem) {
      return null;
    }
    
    if (isCompleted) {
      return (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.completedText}>Hoàn thành</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.footerActionsContainer}>
        {status === STATUS.PENDING && (
          <TouchableOpacity
            style={styles.processButton}
            onPress={() => onProcess(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="flame" size={16} color="white" />
            <Text style={styles.buttonText}>Chế biến</Text>
          </TouchableOpacity>
        )}
        
        {status === STATUS.IN_PROGRESS && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Xong</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      style={[styles.card, isCompleted && styles.disabledItem]}
      className="rounded-2xl"
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="receipt-outline" size={20} color="#1F2937" />
          <Text style={styles.tableName}>{item.table_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, position: 'absolute', right: 14 }}>
          {/* [MỚI] Badge "Đã trả lại" */}
          {item.isReturnedItem && (
            <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statusText, { color: '#DC2626', fontWeight: '600' }]}>Đã trả lại</Text>
            </View>
          )}
          {/* Status badge thông thường */}
          {!item.isReturnedItem && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardDivider} />
      
      <View style={styles.cardBody}>
        <Text 
          style={[
            styles.customizationText, 
            { fontWeight: '600', fontSize: 14, marginBottom: 8 },
            item.isReturnedItem && { textDecorationLine: 'line-through', color: '#9CA3AF' }
          ]}
        >
          {item.quantity} x {customizations.name}
        </Text>
        <Text style={styles.customizationText}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
        <Text style={styles.customizationText}>{`Topping: ${toppingsText}`}</Text>
        {noteText && <Text style={styles.noteText}>Ghi chú: {noteText}</Text>}
      </View>
      
      <View style={styles.cardDivider} />
      
      <View style={styles.cardFooter}>
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
      // [CẬP NHẬT] Lấy tất cả món (kể cả đã trả)
      const { data, error } = await supabase
        .from('order_items')
        .select(`id, quantity, returned_quantity, status, customizations, created_at, menu_items ( is_available ), orders ( order_tables ( tables ( name ) ) )`)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.COMPLETED])
        .eq('customizations->>name', itemName)
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;
      
      // [CẬP NHẬT] Tạo item riêng cho các món đã trả (giống OrderConfirmationScreen)
      const allItems: SummaryDetailItem[] = [];
      
      data.forEach((item: any) => {
        const returnedQty = item.returned_quantity || 0;
        const remainingQty = item.quantity - returnedQty;
        const tableName = item.orders?.order_tables[0]?.tables?.name || 'Mang về';
        
        // [MỚI] Nếu có số lượng đã trả, tạo item riêng
        if (returnedQty > 0) {
          allItems.push({
            id: item.id,
            quantity: returnedQty,
            returned_quantity: returnedQty,
            status: STATUS.COMPLETED,
            customizations: item.customizations,
            table_name: tableName,
            is_available: item.menu_items?.is_available ?? true,
            isReturnedItem: true, // [MỚI] Cờ để đánh dấu món đã trả lại
          });
        }
        
        // [MỚI] Nếu còn số lượng chưa trả, tạo item chính
        if (remainingQty > 0) {
          // Bỏ qua món hết hàng VÀ đang chờ
          if (item.is_available === false && item.status === STATUS.PENDING) {
            return; // Skip
          }
          
          allItems.push({
            id: item.id,
            quantity: remainingQty,
            returned_quantity: returnedQty,
            status: item.status as StatusType,
            customizations: item.customizations,
            table_name: tableName,
            is_available: item.menu_items?.is_available ?? true,
          });
        }
      });
      
      setDetailItems(allItems);
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
      // [MỚI] Lấy TẤT CẢ items ở IN_PROGRESS để chuyển sang COMPLETED
      const inProgressItems = detailItems.filter(item => item.status === STATUS.IN_PROGRESS);
      
      if (inProgressItems.length === 0) {
        console.log('[KitchenSummaryDetail] Không có món nào đang làm để hoàn thành');
        setIsCompleting(false);
        return;
      }

      const itemIds = inProgressItems.map(item => item.id);

      // [MỚI] Cập nhật UI trước (optimistic update)
      setDetailItems(currentItems =>
        currentItems.map(item =>
          itemIds.includes(item.id) ? { ...item, status: STATUS.COMPLETED } : item
        )
      );

      // [MỚI] Cập nhật database
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ status: STATUS.COMPLETED })
        .in('id', itemIds);

      if (updateError) throw updateError;

      // [MỚI] Hiển thị modal xác nhận trả món
      // Note: Bạn có thể thêm state isReturnModalVisible nếu cần
      // setIsReturnModalVisible(true);
      
      // Hoặc tự động trả về màn hình trước
      // if (navigation.canGoBack()) {
      //   navigation.goBack();
      // }
      
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
      // [MỚI] Revert UI khi lỗi
      setDetailItems(current => current.map(item => 
        item.status === STATUS.COMPLETED ? { ...item, status: STATUS.IN_PROGRESS } : item
      ));
    } finally {
      setIsCompleting(false);
    }
  };

  const hasPendingItems = useMemo(() => detailItems.some(item => item.status === STATUS.PENDING), [detailItems]);
  // [UPDATED] Nút "Hoàn thành" enable khi:
  // 1. Không có item PENDING
  // 2. Có ít nhất 1 item ở IN_PROGRESS (để chuyển sang COMPLETED)
  const hasInProgressItems = useMemo(() => detailItems.some(item => item.status === STATUS.IN_PROGRESS), [detailItems]);
  const allItemsCompleted = useMemo(() => 
    detailItems.length > 0 && 
    !hasPendingItems && 
    hasInProgressItems, 
    [detailItems, hasPendingItems, hasInProgressItems]
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  // [MỚI] Phân chia items thành các section
  const groupedItems = (() => {
    const returnedItems = detailItems.filter(item => item.isReturnedItem);
    const normalItems = detailItems.filter(item => !item.isReturnedItem);
    
    const sections = [];
    
    if (normalItems.length > 0) {
      sections.push({
        title: 'Đợt chế biến',
        data: normalItems,
        isReturnedSection: false
      });
    }
    
    if (returnedItems.length > 0) {
      sections.push({
        title: 'Món đã trả lại',
        data: returnedItems,
        isReturnedSection: true
      });
    }
    
    return sections;
  })();

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
      <SectionList
        sections={groupedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DetailItemCard 
            item={item}
            onProcess={handleProcessItem}
            onComplete={handleCompleteItem}
          />
        )}
        renderSectionHeader={({ section: { title, isReturnedSection } }) => (
          <View style={[styles.sectionHeader, isReturnedSection && styles.returnedSectionHeader]}>
            <Text style={[styles.sectionTitle, isReturnedSection && styles.returnedSectionTitle]}>
              {title}
            </Text>
          </View>
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
              icon="checkmark-done-outline"
              label="Hoàn thành"
              onPress={handleCompleteAllInProgress}
              color="#10B981"
              backgroundColor="#ECFDF5"
              disabled={!allItemsCompleted}
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
  
  // [CẬP NHẬT] Card styling giống OrderConfirmationScreen - GỌN HƠN
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  disabledItem: {
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
  },

  // [MỚI] Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },

  // [MỚI] Status badge
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10, 
    alignSelf: 'flex-start' 
  },
  statusText: { 
    marginLeft: 4, 
    fontWeight: '600', 
    fontSize: 11 
  },

  // [MỚI] Card body
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  customizationText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    color: '#D97706',
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  // [MỚI] Card footer
  cardFooter: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  
  // [MỚI] Section header styles
  sectionHeader: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  returnedSectionHeader: {
    // Không thay đổi nền, giữ như bình thường
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  returnedSectionTitle: {
    color: '#4B5563',
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