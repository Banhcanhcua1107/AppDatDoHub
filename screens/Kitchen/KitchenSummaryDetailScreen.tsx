// screens/Kitchen/KitchenSummaryDetailScreen.tsx

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
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';

type SummaryDetailNavProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenSummaryDetail'>;
type SummaryDetailRouteProp = RouteProp<KitchenStackParamList, 'KitchenSummaryDetail'>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

type StatusType = typeof STATUS[keyof typeof STATUS];

interface SummaryDetailItem {
  id: number;
  quantity: number;
  status: StatusType;
  customizations: any;
  table_name: string;
}

// ---- [CẬP NHẬT] COMPONENT CON VỚI CÁC NÚT HÀNH ĐỘNG RIÊNG LẺ ----
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
        return { text: 'Đang làm', color: '#F97316', icon: 'flame-outline' };
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
        <View style={styles.footerActionsContainer}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
        </View>
      );
    }
    
    return (
      <View style={styles.footerActionsContainer}>
        <TouchableOpacity
          style={styles.footerActionButton}
          onPress={() => onProcess(item.id)}
          disabled={status !== STATUS.PENDING}
        >
          <FontAwesome5 
            name="utensils" 
            size={22} 
            color={status === STATUS.PENDING ? '#F97316' : '#D1D5DB'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.footerActionButton}
          onPress={() => onComplete(item.id)}
          disabled={status !== STATUS.IN_PROGRESS}
        >
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color="#10B981"
          />
        </TouchableOpacity>
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
      const { data, error } = await supabase
        .from('order_items')
        .select(`id, quantity, status, customizations, orders ( order_tables ( tables ( name ) ) )`)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS])
        .eq('customizations->>name', itemName)
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;
      
      const mappedItems = data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        status: item.status as StatusType,
        customizations: item.customizations,
        table_name: item.orders?.order_tables[0]?.tables?.name || 'Mang về',
      }));

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
      return () => { supabase.removeChannel(channel); };
    }, [fetchDetails, itemName])
  );

  // --- [THÊM] LOGIC CHO CÁC NÚT HÀNH ĐỘNG RIÊNG LẺ ---
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
    // Cập nhật trạng thái tạm thời, sau đó sẽ lọc bỏ khỏi list
    setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.COMPLETED } : item));
    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).eq('id', itemId).throwOnError();
      // Sau khi thành công, lọc bỏ món đã hoàn thành ra khỏi danh sách
      setDetailItems(current => current.filter(item => item.id !== itemId));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
      setDetailItems(current => current.map(item => item.id === itemId ? { ...item, status: STATUS.IN_PROGRESS } : item));
    }
  };

  // --- LOGIC CHO CÁC NÚT HÀNH ĐỘNG TỔNG ---
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
    const itemsToUpdate = detailItems.filter(item => item.status === STATUS.IN_PROGRESS);
    if (itemsToUpdate.length === 0) return;
    const itemIdsToUpdate = itemsToUpdate.map(item => item.id);

    setIsCompleting(true);
    setDetailItems(current => current.map(item => itemIdsToUpdate.includes(item.id) ? { ...item, status: STATUS.COMPLETED } : item));

    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).in('id', itemIdsToUpdate).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
      setDetailItems(current => current.map(item => itemIdsToUpdate.includes(item.id) ? { ...item, status: STATUS.IN_PROGRESS } : item));
    } finally {
      setIsCompleting(false);
      setDetailItems(current => current.filter(item => item.status !== STATUS.COMPLETED));
    }
  };

  const hasPendingItems = useMemo(() => detailItems.some(item => item.status === STATUS.PENDING), [detailItems]);
  const hasInProgressItems = useMemo(() => detailItems.some(item => item.status === STATUS.IN_PROGRESS), [detailItems]);

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
              icon="flame-outline"
              label="Chế biến hết"
              onPress={handleProcessAllPending}
              color="#F97316"
              backgroundColor="#FFF7ED"
              disabled={!hasPendingItems}
              loading={isProcessing}
          />
          <FooterActionButton
              icon="notifications-outline"
              label="Báo xong hết"
              onPress={handleCompleteAllInProgress}
              color="#10B981"
              backgroundColor="#ECFDF5"
              disabled={!hasInProgressItems}
              loading={isCompleting}
          />
      </View>
    </SafeAreaView>
  );
};

// ---- [CẬP NHẬT] STYLESHEET ----
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
  // [CẬP NHẬT] cardFooter để chứa cả status và nút
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
  // [THÊM] Styles cho các nút hành động riêng lẻ
  footerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerActionButton: {
    padding: 6,
    marginLeft: 12,
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