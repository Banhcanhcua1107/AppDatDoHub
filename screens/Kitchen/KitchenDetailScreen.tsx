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
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // Đảm bảo đường dẫn này đúng

type KitchenDetailScreenNavigationProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenDetail'>;
type KitchenDetailScreenRouteProp = RouteProp<KitchenStackParamList, 'KitchenDetail'>;

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

// ---- COMPONENT CON (Không thay đổi) ----
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

  const renderFooterContent = () => {
    if (status === STATUS.COMPLETED || status === STATUS.SERVED) {
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

// ---- COMPONENT NÚT HÀNH ĐỘNG Ở FOOTER (Không thay đổi) ----
const FooterActionButton: React.FC<{
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  backgroundColor: string;
  disabled?: boolean;
}> = ({ onPress, icon, label, color, backgroundColor, disabled = false }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.actionButtonContainer, disabled && styles.disabledButton]}>
    <View style={[styles.actionButtonCircle, { backgroundColor }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.actionButtonLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);


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
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, status: STATUS.IN_PROGRESS } : item
      )
    );
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, status: STATUS.PENDING } : item
        )
      );
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, status: STATUS.COMPLETED } : item
      )
    );
    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể hoàn thành món: ' + err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, status: STATUS.IN_PROGRESS } : item
        )
      );
    }
  };

  const handleProcessAll = async () => {
    const itemsToProcess = items.filter(item => item.status === STATUS.PENDING);
    if (itemsToProcess.length === 0) {
      Alert.alert('Thông báo', 'Không có món mới nào để chế biến.');
      return;
    }
    const itemIdsToProcess = itemsToProcess.map(item => item.id);
    setItems(currentItems =>
      currentItems.map(item =>
        itemIdsToProcess.includes(item.id) ? { ...item, status: STATUS.IN_PROGRESS } : item
      )
    );
    try {
      await supabase.from('order_items').update({ status: STATUS.IN_PROGRESS }).in('id', itemIdsToProcess).throwOnError();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể chế biến tất cả món: ' + err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          itemIdsToProcess.includes(item.id) ? { ...item, status: STATUS.PENDING } : item
        )
      );
    }
  };
  
  const handleReturnItems = () => {
      Alert.alert(
          "Xác nhận trả món",
          "Bạn có chắc chắn muốn trả lại các món trong đơn này không?",
          [
              { text: "Hủy", style: "cancel" },
              { 
                  text: "Xác nhận", 
                  onPress: () => {
                      Alert.alert("Thông báo", "Chức năng đang được phát triển.");
                  },
                  style: "destructive"
              }
          ]
      );
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
        ListEmptyComponent={<View style={styles.centerContainer}><Text style={{color: '#6B7280'}}>Order này không có món nào.</Text></View>}
      />
      {/* Footer với các nút hành động */}
      <View style={styles.footer}>
          <FooterActionButton
              icon="flame-outline"
              label="Chế biến tất cả"
              onPress={handleProcessAll}
              color="#F97316"
              backgroundColor="#FFF7ED"
              disabled={!hasPendingItems}
          />
          <FooterActionButton
              icon="notifications-outline"
              label="Báo xong hết"
              onPress={handleReturnItems}
              color="#10B981"
              backgroundColor="#ECFDF5"
          />
      </View>
    </SafeAreaView>
  );
};

// ---- STYLESHEET (CẬP NHẬT) ----
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
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  itemCustomization: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  itemNote: {
    fontSize: 13,
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
    marginVertical: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
  },
  itemQuantityText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  footerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerActionButton: {
    padding: 6,
    marginLeft: 12,
  },
  
  // [CẬP NHẬT] Styles cho footer
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    // [CẬP NHẬT] Đẩy các nút sang bên phải
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginLeft: 10, 
    marginRight: 20, 
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

export default KitchenDetailScreen;