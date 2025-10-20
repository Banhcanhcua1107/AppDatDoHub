// screens/Kitchen/KitchenDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';
import ConfirmModal from '../../components/ConfirmModal';

type KitchenDetailScreenNavigationProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenDetail'>;
type KitchenDetailScreenRouteProp = RouteProp<KitchenStackParamList, 'KitchenDetail'>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SERVED: 'served',
  RETURNED: 'returned' // [MỚI] Trạng thái đã trả món
};
type KitchenItemStatus = typeof STATUS[keyof typeof STATUS];

interface KitchenDetailItem {
  id: number;
  name: string;
  quantity: number;
  returned_quantity?: number; // [MỚI]
  note: string | null;
  status: KitchenItemStatus;
  customizations: any;
  is_available?: boolean; // [MỚI] Trạng thái còn hàng
  isReturnedItem?: boolean; // [MỚI] Cờ để đánh dấu món đã trả lại
}

// ---- COMPONENT CON (CẬP NHẬT UI ĐỂ KHỚP VỚI HÌNH ẢNH) ----
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

  // [MỚI] Kiểm tra món có còn hàng không
  const isOutOfStock = item.is_available === false;
  // [MỚI] Kiểm tra món đang được làm
  const isInProgress = status === STATUS.IN_PROGRESS;
  // [MỚI] Kiểm tra món đã hoàn thành
  const isCompleted = status === STATUS.COMPLETED || status === STATUS.SERVED;

  const getStatusInfo = () => {
    if (isOutOfStock) {
      return { text: 'Hết món', color: '#DC2626', icon: 'alert-circle' };
    }
    if (isInProgress) {
      return { text: 'Đang làm', color: '#F97316', icon: 'flame' };
    }
    if (isCompleted) {
      return { text: 'Hoàn thành', color: '#10B981', icon: 'checkmark-circle' };
    }
    return { text: 'Chờ bếp', color: '#F97316', icon: 'time-outline' };
  };

  const statusInfo = getStatusInfo();

  const renderFooterContent = () => {
    // [MỚI] Nếu đã trả lại, chỉ hiển thị badge - không có nút nào
    if (item.isReturnedItem) {
      return null;
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
      style={[styles.cardShadow, (item.isReturnedItem || isOutOfStock) && styles.disabledItem]}
      className="bg-white rounded-2xl mb-3"
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {/* [CẬP NHẬT] Gạch ngang tên khi đã trả lại */}
          <Text 
            style={[
              styles.itemName, 
              item.isReturnedItem && { textDecorationLine: 'line-through', color: '#9CA3AF' }
            ]} 
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
        <Text style={styles.itemCustomization}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
        <Text style={styles.itemCustomization}>{`Topping: ${toppingsText}`}</Text>
        {noteText && <Text style={styles.itemNote}>Ghi chú: {noteText}</Text>}
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <Text style={styles.itemQuantityText}>SL: {item.quantity}</Text>
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
  const [isReturnModalVisible, setReturnModalVisible] = useState(false);
  const [isCompleteModalVisible, setCompleteModalVisible] = useState(false); // [THÊM] Modal xác nhận hoàn thành
  const [pendingCancellationsCount, setPendingCancellationsCount] = useState(0); // [MỚI]

  const fetchOrderDetails = useCallback(async () => {
    try {
      // [CẬP NHẬT] Thêm returned_quantity để lọc món đã trả hết
      // [CẬP NHẬT] Lấy tất cả món (kể cả đã trả)
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, returned_quantity, customizations, status, created_at, menu_items ( is_available )')
        .eq('order_id', orderId)
        .neq('status', STATUS.SERVED) // Loại bỏ các món đã served (đã trả cho khách)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // [CẬP NHẬT] Tạo item riêng cho các món đã trả (giống OrderConfirmationScreen)
      const allItems: KitchenDetailItem[] = [];
      
      data.forEach((item: any) => {
        const returnedQty = item.returned_quantity || 0;
        const remainingQty = item.quantity - returnedQty;
        const name = item.customizations.name || 'Món không tên';
        
        // [MỚI] Nếu có số lượng đã trả, tạo item riêng
        if (returnedQty > 0) {
          allItems.push({
            id: item.id,
            name,
            quantity: returnedQty,
            returned_quantity: returnedQty,
            note: item.customizations.note || null,
            status: STATUS.SERVED, // Đánh dấu là đã trả
            customizations: item.customizations,
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
            ...item,
            quantity: remainingQty,
            returned_quantity: returnedQty,
            name,
            note: item.customizations.note || null,
            is_available: item.menu_items?.is_available ?? true,
          });
        }
      });
      
      setItems(allItems);
    } catch (err: any) {
      console.error('Lỗi tải chi tiết order:', err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // [MỚI] Fetch pending cancellations cho order này
  const fetchPendingCancellationsCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('cancellation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId)
        .eq('status', 'pending');
      
      if (!error) {
        setPendingCancellationsCount(count || 0);
      }
    } catch (err: any) {
      console.error('Error fetching cancellations count:', err.message);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrderDetails();
      fetchPendingCancellationsCount(); // [MỚI]
      
      const channel = supabase
        .channel(`public:order_items:detail:${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}` },
          () => fetchOrderDetails()
        )
        .subscribe();
      
      // [MỚI] Lắng nghe thay đổi menu_items
      const menuItemsChannel = supabase
        .channel('public:menu_items:kitchen_detail')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => {
          console.log('[KitchenDetail] Món ăn thay đổi trạng thái');
          fetchOrderDetails();
        })
        .subscribe();
      
      // [MỚI] Lắng nghe khi nhân viên trả món
      const returnSlipsChannel = supabase
        .channel('public:return_slips:kitchen_detail')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_slips' }, () => {
          console.log('[KitchenDetail] Có món được trả');
          fetchOrderDetails();
        })
        .subscribe();
      
      // [MỚI] Lắng nghe cancellation requests thay đổi
      const cancellationChannel = supabase
        .channel(`public:cancellation_requests:detail:${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellation_requests' }, () => {
          console.log('[KitchenDetail] Có thay đổi cancellation requests');
          fetchPendingCancellationsCount();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
        supabase.removeChannel(returnSlipsChannel);
        supabase.removeChannel(cancellationChannel); // [MỚI]
      };
    }, [fetchOrderDetails, fetchPendingCancellationsCount, orderId])
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
      console.error('Lỗi cập nhật trạng thái:', err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, status: STATUS.PENDING } : item
        )
      );
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    // [CẬP NHẬT] Chỉ chuyển IN_PROGRESS → COMPLETED
    const currentItem = items.find(item => item.id === itemId);
    if (!currentItem) return;

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, status: STATUS.COMPLETED } : item
      )
    );
    try {
      await supabase.from('order_items').update({ status: STATUS.COMPLETED }).eq('id', itemId).throwOnError();
    } catch (err: any) {
      console.error('Lỗi hoàn thành món:', err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, status: currentItem.status } : item
        )
      );
    }
  };

  const handleProcessAll = async () => {
    const itemsToProcess = items.filter(item => item.status === STATUS.PENDING);
    if (itemsToProcess.length === 0) {
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
      // [OPTIMIZED] Không gọi fetchOrderDetails() để giữ UI đã update
    } catch (err: any) {
      console.error('Lỗi chế biến tất cả món:', err.message);
      setItems(currentItems =>
        currentItems.map(item =>
          itemIdsToProcess.includes(item.id) ? { ...item, status: STATUS.PENDING } : item
        )
      );
    }
  };
  
  const handleConfirmReturnItems = async () => {
    setReturnModalVisible(false);
    
    try {
      // [UPDATED] Lấy TẤT CẢ items hiện tại (ngoại trừ PENDING) để trả về
      const { data: itemsToReturn, error: fetchError } = await supabase
        .from('order_items')
        .select('id, quantity, customizations')
        .eq('order_id', orderId)
        .neq('status', STATUS.PENDING) // Lấy tất cả ngoài PENDING
        .neq('status', STATUS.SERVED); // Và ngoài đã SERVED

      if (fetchError) throw fetchError;

      if (!itemsToReturn || itemsToReturn.length === 0) {
        console.log('[KitchenDetail] Không có món nào để trả');
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        return;
      }

      const itemIds = itemsToReturn.map(item => item.id);

      // [UPDATED] Chuyển TẤT CẢ sang 'served' (đã trả cho khách/phục vụ)
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ status: STATUS.SERVED }) 
        .in('id', itemIds);

      if (updateError) throw updateError;

      // [XÓA] Không tạo return_notifications ở đây
      // return_notifications chỉ được tạo khi NHÂN VIÊN gửi yêu cầu trả món
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err: any) {
      console.error("Error returning items to customer:", err.message);
    }
  };

  // [MỚI] Hàm xử lý khi bấm "Hoàn thành tất cả"
  const handleCompleteAllClicked = async () => {
    // [CẬP NHẬT] Chỉ mở modal, không execute trực tiếp
    setCompleteModalVisible(true);
  };

  // [THÊM] Hàm xử lý xác nhận hoàn thành
  const handleConfirmCompleteAll = async () => {
    setCompleteModalVisible(false);

    const inProgressItems = items.filter(item => item.status === STATUS.IN_PROGRESS);
    
    if (inProgressItems.length === 0) {
      console.log('[KitchenDetail] Không có món nào đang làm để hoàn thành');
      return;
    }

    const itemIds = inProgressItems.map(item => item.id);

    // [CẬP NHẬT] Cập nhật UI trước: chuyển IN_PROGRESS → SERVED
    setItems(currentItems =>
      currentItems.map(item =>
        itemIds.includes(item.id) ? { ...item, status: STATUS.SERVED } : item
      )
    );

    try {
      // [CẬP NHẬT] Cập nhật database trực tiếp sang SERVED
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ status: STATUS.SERVED })
        .in('id', itemIds);

      if (updateError) throw updateError;

      // [MỚI] Gửi thông báo cho nhân viên cho TẤT CẢ items
      for (const item of inProgressItems) {
        await supabase
          .from('return_notifications')
          .insert({
            order_id: orderId,
            table_name: tableName,
            item_name: item.name,
            status: 'pending',
            created_at: new Date().toISOString(),
          });
      }

      // Hiển thị toast thành công
      console.log('[KitchenDetail] Đã gửi thông báo phục vụ cho tất cả món');
    } catch (err: any) {
      console.error('Lỗi hoàn thành tất cả:', err.message);
      // [MỚI] Revert UI khi lỗi
      setItems(currentItems =>
        currentItems.map(item =>
          itemIds.includes(item.id)
            ? { ...item, status: STATUS.IN_PROGRESS }
            : item
        )
      );
    }
  };

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  const hasPendingItems = items.some(item => item.status === STATUS.PENDING);
  // [UPDATED] Nút "Hoàn thành" enable khi:
  // 1. Không có item PENDING
  // 2. Có ít nhất 1 item ở IN_PROGRESS (để chuyển sang COMPLETED)
  const hasInProgressItems = items.some(item => item.status === STATUS.IN_PROGRESS);
  const allItemsCompleted = items.length > 0 && !hasPendingItems && hasInProgressItems;

  // [MỚI] Phân chia items thành các section
  const groupedItems = (() => {
    const returnedItems = items.filter(item => item.isReturnedItem);
    const normalItems = items.filter(item => !item.isReturnedItem);
    
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
        <Text style={styles.headerTitle}>{tableName}</Text>
        {/* [CẬP NHẬT] Luôn hiển thị nút thông báo, có badge nếu có thông báo */}
        <TouchableOpacity 
          style={styles.headerNotificationButton}
          onPress={() => navigation.navigate('CancellationRequestsDetail', { orderId, tableName })}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={25} color="#1E40AF" />
          {pendingCancellationsCount > 0 && (
            <View style={styles.headerBadgeContainer}>
              <Text style={styles.headerBadgeText}>{pendingCancellationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <SectionList
        sections={groupedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <KitchenDetailItemCard
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
        ListEmptyComponent={<View style={styles.centerContainer}><Text style={{color: '#6B7280'}}>Order này không có món nào.</Text></View>}
      />
      <View style={styles.footer}>
          <FooterActionButton
              icon="flame"
              label="Chế biến tất cả"
              onPress={handleProcessAll}
              color="#F97316"
              backgroundColor="#FFF7ED"
              disabled={!hasPendingItems}
          />
          <FooterActionButton
              icon="checkmark-done-outline"
              label="Hoàn thành"
              onPress={handleCompleteAllClicked}
              color="#10B981"
              backgroundColor="#ECFDF5"
              disabled={!allItemsCompleted}
          />
      </View>

      <ConfirmModal
        isVisible={isReturnModalVisible}
        title="Xác nhận trả món"
        message={`Bạn có chắc chắn muốn trả món cho ${tableName}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onClose={() => setReturnModalVisible(false)}
        onConfirm={handleConfirmReturnItems}
      />

      {/* [THÊM] Modal xác nhận hoàn thành */}
      <ConfirmModal
        isVisible={isCompleteModalVisible}
        title="Xác nhận hoàn thành"
        message="Bạn có chắc chắn muốn gửi thông báo phục vụ cho tất cả các món đang làm?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="success"
        onClose={() => setCompleteModalVisible(false)}
        onConfirm={handleConfirmCompleteAll}
      />
    </SafeAreaView>
  );
};

// ---- STYLESHEET ----
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
  headerNotificationButton: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listContainer: { padding: 16 },
  
  // [CẬP NHẬT] Card styling giống OrderConfirmationScreen - GỌN HƠN
  cardShadow: {
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

  // [MỚI] Card header với item name và status badge
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },

  // [MỚI] Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 11,
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
  itemCustomization: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 2,
  },
  itemNote: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  itemQuantityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
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