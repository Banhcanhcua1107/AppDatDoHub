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
    const timeAgo = getTimeAgo(item.created_at);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.tableName}>{item.table_name}</Text>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          {item.status === 'acknowledged' && (
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          )}
        </View>

        <Text style={styles.itemsText}>
          {item.item_names.join(', ')}
        </Text>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acknowledgeButton}
              onPress={() => handleAcknowledge(item)}
            >
              <Text style={styles.acknowledgeText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
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
      <View style={[styles.header, { paddingTop: insets.top}]}>
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

      {/* Nút Xác nhận hết - chỉ hiện khi có thông báo pending */}
      {pendingCount > 0 && (
        <View style={styles.acknowledgeAllContainer}>
          <TouchableOpacity 
            style={styles.acknowledgeAllButton}
            onPress={handleAcknowledgeAll}
          >
            <Ionicons name="checkmark-done" size={20} color="white" />
            <Text style={styles.acknowledgeAllText}>
              Xác nhận hết ({pendingCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerBadge: {
    marginLeft: 8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  
  // Acknowledge All Button
  acknowledgeAllContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#f5f5f5',
  },
  acknowledgeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
  },
  acknowledgeAllText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  
  listContainer: {
    padding: 16,
  },
  
  // Basic card design
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acknowledgeButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  acknowledgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ReturnNotificationScreen;
