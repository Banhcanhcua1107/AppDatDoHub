// screens/Kitchen/ReturnHistoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import { formatDate } from '../../utils/formatDate';

type ReturnHistoryNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

interface ReturnHistoryItem {
  id: number;
  order_id: string;
  table_name: string;
  item_names: string[];
  status: 'pending' | 'acknowledged';
  created_at: string;
  acknowledged_at: string | null;
}

const ReturnHistoryCard: React.FC<{
  item: ReturnHistoryItem;
}> = ({ item }) => {
  const timeAgo = formatDate(item.created_at);
  const isAcknowledged = item.status === 'acknowledged';
  
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name="restaurant" 
            size={20} 
            color={isAcknowledged ? '#6B7280' : '#DC2626'} 
          />
          <Text style={[styles.tableName, isAcknowledged && styles.acknowledgedText]}>
            {item.table_name}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          isAcknowledged ? styles.acknowledgedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.statusText,
            isAcknowledged ? styles.acknowledgedStatusText : styles.pendingStatusText
          ]}>
            {isAcknowledged ? 'Đã xử lý' : 'Chờ xử lý'}
          </Text>
        </View>
      </View>

      {/* Body - Danh sách món trả */}
      <View style={styles.cardBody}>
        <Text style={styles.sectionTitle}>Món bị trả:</Text>
        {item.item_names.map((itemName, index) => (
          <View key={index} style={styles.itemRow}>
            <Ionicons name="remove-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.itemName}>{itemName}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        {isAcknowledged && item.acknowledged_at && (
          <View style={styles.acknowledgedTimeRow}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.acknowledgedTimeText}>
              Xử lý: {formatDate(item.acknowledged_at)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ReturnHistoryScreen = () => {
  const navigation = useNavigation<ReturnHistoryNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [returnHistory, setReturnHistory] = useState<ReturnHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'acknowledged'>('all');

  const fetchReturnHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('return_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturnHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching return history:', err.message);
      Alert.alert('Lỗi', 'Không thể tải lịch sử trả món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReturnHistory();

      // Realtime subscription để cập nhật khi có món mới bị trả
      const channel = supabase
        .channel('public:return_notifications:history')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'return_notifications' },
          () => {
            fetchReturnHistory();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchReturnHistory])
  );

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const filteredData = returnHistory.filter(item => {
    // Lọc theo trạng thái
    if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }

    // Lọc theo tìm kiếm (tên bàn hoặc tên món)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTable = item.table_name.toLowerCase().includes(query);
      const matchItems = item.item_names.some(name => 
        name.toLowerCase().includes(query)
      );
      return matchTable || matchItems;
    }

    return true;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử trả món</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo số order, số bàn hoặc tên món"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
            Tất cả ({returnHistory.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'pending' && styles.filterButtonTextActive]}>
            Chờ xử lý ({returnHistory.filter(i => i.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'acknowledged' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('acknowledged')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'acknowledged' && styles.filterButtonTextActive]}>
            Đã xử lý ({returnHistory.filter(i => i.status === 'acknowledged').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ReturnHistoryCard item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Không tìm thấy kết quả nào' 
                : 'Chưa có món nào bị trả'}
            </Text>
          </View>
        }
      />
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
    backgroundColor: '#1E3A8A',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },

  searchBarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    marginLeft: 8,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  acknowledgedText: {
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEE2E2',
  },
  acknowledgedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingStatusText: {
    color: '#DC2626',
  },
  acknowledgedStatusText: {
    color: '#059669',
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
  },

  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  acknowledgedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acknowledgedTimeText: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ReturnHistoryScreen;
