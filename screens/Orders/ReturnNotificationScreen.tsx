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
  Animated,
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

// Status colors for different states
const StatusColors = {
  pending: {
    indicator: '#FB923C',
    background: '#FFF7ED',
    icon: '#FB923C',
  },
  acknowledged: {
    indicator: '#10B981',
    background: '#ECFDF5',
    icon: '#10B981',
  },
} as const;

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
      <View style={[styles.card, isPending && styles.cardPending]}>
        {/* Status indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: isPending ? '#F97316' : '#10B981' }]} />
        
        {/* Header với icon và thông tin */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isPending ? '#FFF7ED' : '#ECFDF5' }]}>
              <Ionicons
                name={isPending ? 'notifications' : 'checkmark-circle'}
                size={20}
                color={isPending ? '#F97316' : '#10B981'}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.tableName}>{item.table_name}</Text>
              <Text style={styles.timeText}>{getTimeAgo(item.created_at)}</Text>
            </View>
          </View>
          
          {isPending && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI</Text>
            </View>
          )}
        </View>

        {/* Items list - compact design */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsLabel}>Các món cần trả:</Text>
          <View style={styles.itemsList}>
            {item.item_names.map((itemName, index) => (
              <View key={index} style={styles.itemChip}>
                <Text style={styles.itemChipText}>{itemName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          {isPending ? (
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => handleAcknowledge(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.primaryActionText}>Đã trả món</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedAction}>
              <Ionicons name="checkmark-done" size={16} color="#10B981" />
              <Text style={styles.completedActionText}>Đã xử lý</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    color: '#1E293B',
  },
  headerBadge: {
    marginLeft: 8,
    backgroundColor: '#EF4444',
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
  listContainer: {
    padding: 16,
  },
  
  // Card styles - Modern design
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardPending: {
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statusIndicator: {
    height: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#64748B',
  },
  newBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Items section
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  
  // Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completedAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  completedActionText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ReturnNotificationScreen;
