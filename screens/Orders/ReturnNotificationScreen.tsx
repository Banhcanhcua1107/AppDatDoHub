import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';
import { AppStackParamList } from '../../constants/routes';

interface ReturnNotification {
  id: number;
  order_id: string;
  table_name: string;
  item_name: string; // Thay từ item_names (mảng) sang item_name (singular)
  status: 'pending' | 'acknowledged';
  created_at: string;
  notification_type?: 'return_item' | 'item_ready' | 'out_of_stock'; // [MỚI] Loại thông báo
}

type ReturnNotificationScreenRouteProp = RouteProp<AppStackParamList, 'ReturnNotifications'>;

const ReturnNotificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ReturnNotificationScreenRouteProp>();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ReturnNotification[]>([]);
  
  // [THÊM MỚI] Lấy orderId từ route params
  const filteredOrderId = route.params?.orderId;

  // [CẬP NHẬT] Xóa playNotificationAlert() - NotificationContext đã xử lý âm thanh và rung
  // Màn hình này chỉ dùng để hiển thị danh sách thông báo, không phát âm thanh

  const fetchNotifications = useCallback(async () => {
    try {
      let query = supabase
        .from('return_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // [THÊM MỚI] Filter theo orderId nếu có
      if (filteredOrderId) {
        query = query.eq('order_id', filteredOrderId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // [FIX] Lọc bỏ notification_type = 'return_item' (đó là nhân viên gửi cho bếp, không phải cho nhân viên)
      // Chỉ giữ: 'item_ready', 'out_of_stock', 'cancellation_approved', 'cancellation_rejected'
      const filteredData = (data || []).filter(
        (notification: ReturnNotification) => notification.notification_type !== 'return_item'
      );

      setNotifications(filteredData);
    } catch (err: any) {
      console.error('Error fetching return notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filteredOrderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();

      // Realtime subscription
      const channel = supabase
        .channel('public:return_notifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'return_notifications' },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchNotifications])
  );

  const handleAcknowledge = async (notification: ReturnNotification) => {
    try {
      const { error } = await supabase
        .from('return_notifications')
        .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
        .eq('id', notification.id);

      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Đã xác nhận',
        text2: `Đã xác nhận trả món cho ${notification.table_name}`,
      });
    } catch (err: any) {
      console.error('Error acknowledging notification:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xác nhận thông báo',
      });
    }
  };

  const handleAcknowledgeAll = async () => {
    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    
    if (pendingNotifications.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Không có thông báo nào cần xác nhận',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('return_notifications')
        .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
        .eq('status', 'pending');

      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Đã xác nhận tất cả',
        text2: `Đã xác nhận ${pendingNotifications.length} thông báo`,
      });
    } catch (err: any) {
      console.error('Error acknowledging all notifications:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xác nhận tất cả thông báo',
      });
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  // [MỚI] Hàm lấy thông tin loại thông báo
  const getNotificationTypeInfo = (type?: string) => {
    switch (type) {
      case 'item_ready':
        return { label: 'Sẵn sàng phục vụ', color: '#10B981', icon: 'checkmark-circle' };
      case 'return_item':
        return { label: 'Trả lại món', color: '#F97316', icon: 'arrow-undo' };
      case 'out_of_stock':
        return { label: 'Hết hàng', color: '#DC2626', icon: 'alert-circle' };
      default:
        return { label: 'Thông báo', color: '#3B82F6', icon: 'notifications' };
    }
  };

  const renderNotification = ({ item }: { item: ReturnNotification }) => {
    const timeAgo = getTimeAgo(item.created_at);
    const typeInfo = getNotificationTypeInfo(item.notification_type);
    const isPending = item.status === 'pending';

    return (
      <TouchableOpacity 
        style={[styles.card, isPending && styles.cardPending]}
        onPress={() => isPending && handleAcknowledge(item)}
      >
        <View style={styles.cardContainer}>
          {/* Icon badge bên trái */}
          <View style={[styles.iconBadge, { backgroundColor: `${typeInfo.color}20` }]}>
            <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
          </View>

          {/* Nội dung chính giữa */}
          <View style={styles.contentWrapper}>
            <View>
              <Text style={styles.typeLabel}>{typeInfo.label}</Text>
              <Text style={styles.itemText}>{item.item_name}</Text>
              <Text style={styles.tableText}>{item.table_name}</Text>
            </View>
          </View>

          {/* Thời gian + icon trạng thái bên phải */}
          <View style={styles.rightWrapper}>
            <Text style={styles.timeText}>{timeAgo}</Text>
            {isPending ? (
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginTop: 6 }} />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginTop: 6 }} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Topbar gọn gàn */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Thông báo</Text>
        
        <TouchableOpacity onPress={fetchNotifications} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Nút Xác nhận hết */}
      {pendingCount > 0 && (
        <View style={styles.acknowledgeAllContainer}>
          <TouchableOpacity 
            style={styles.acknowledgeAllButton}
            onPress={handleAcknowledgeAll}
          >
            <Ionicons name="checkmark-done" size={18} color="white" />
            <Text style={styles.acknowledgeAllText}>
              Xác nhận hết
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  // Header - gọn gàn
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Acknowledge All Button - gọn gàn
  acknowledgeAllContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  acknowledgeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  acknowledgeAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  listContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  
  // Card - với shadow
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPending: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  tableText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  rightWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  rightSection: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bodyContent: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textContent: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ReturnNotificationScreen;
