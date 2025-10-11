import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Vibration,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';

interface ReturnNotification {
  id: number;
  order_id: string;
  table_name: string;
  item_names: string[];
  status: 'pending' | 'acknowledged';
  created_at: string;
}

const ReturnNotificationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ReturnNotification[]>([]);
  const previousCountRef = useRef(0);

  // Phát rung khi có thông báo mới
  const playNotificationAlert = () => {
    // Rung 3 lần: 500ms rung, 200ms dừng, 500ms rung, 200ms dừng, 500ms rung
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('return_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const newCount = data?.filter(n => n.status === 'pending').length || 0;
      const previousCount = previousCountRef.current;

      // Phát rung nếu có thông báo mới
      if (newCount > previousCount) {
        playNotificationAlert();
      }

      previousCountRef.current = newCount;
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Error fetching return notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDelete = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('return_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      Toast.show({
        type: 'info',
        text1: 'Đã xóa thông báo',
      });
    } catch (err: any) {
      console.error('Error deleting notification:', err.message);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xóa thông báo',
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

  const renderNotification = ({ item }: { item: ReturnNotification }) => {
    const isPending = item.status === 'pending';

    return (
      <View style={[styles.notificationCard, isPending && styles.pendingCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons
              name={isPending ? 'alert-circle' : 'checkmark-circle'}
              size={24}
              color={isPending ? '#EF4444' : '#10B981'}
            />
            <Text style={styles.tableName}>{item.table_name}</Text>
          </View>
          <Text style={styles.timeText}>{getTimeAgo(item.created_at)}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.itemsLabel}>Món cần trả:</Text>
          {item.item_names.map((itemName, index) => (
            <Text key={index} style={styles.itemText}>
              • {itemName}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          {isPending ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acknowledgeButton]}
                onPress={() => handleAcknowledge(item)}
              >
                <Ionicons name="checkmark-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Đã xử lý</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.acknowledgedBadge}>
                <Ionicons name="checkmark-done-outline" size={16} color="#10B981" />
                <Text style={styles.acknowledgedText}>Đã xử lý</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông báo trả món</Text>
          {pendingCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={fetchNotifications} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
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
    backgroundColor: '#F8F9FA',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerBadge: {
    marginLeft: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardBody: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acknowledgeButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  acknowledgedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ReturnNotificationScreen;
