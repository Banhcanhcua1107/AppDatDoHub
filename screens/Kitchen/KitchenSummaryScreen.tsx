// screens/Kitchen/KitchenSummaryScreen.tsx

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
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

import { KitchenStackParamList } from '../../navigation/AppNavigator';
import { KitchenTabParamList } from '../../navigation/KitchenTabs';


// [SỬA] Thêm 'completed' để hiển thị món đã hoàn thành trong tổng hợp
// Chỉ khi nào chuyển sang 'served' thì món mới biến mất (đã trả cho khách)
const STATUS_TO_AGGREGATE = ['waiting', 'in_progress', 'completed'];

interface SummarizedItem {
  name: string;
  total_quantity: number;
  waiting_quantity: number;
  in_progress_quantity: number;
  completed_quantity: number;  // [THÊM] Số lượng món đã hoàn thành
  table_count: number;
  tables: string[];
  oldest_time: string | null;
}

type SortOption = 'quantity_desc' | 'name_asc' | 'name_desc' | 'time_asc';

type KitchenSummaryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<KitchenTabParamList, 'KitchenSummary'>,
  NativeStackScreenProps<KitchenStackParamList>
>;


const KitchenSummaryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [summaryItems, setSummaryItems] = useState<SummarizedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('quantity_desc');
  
  const navigation = useNavigation<KitchenSummaryScreenProps['navigation']>();

  const fetchSummaryData = useCallback(async () => {
    try {
      // [CẬP NHẬT] Thêm returned_quantity để tính số lượng còn lại
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, returned_quantity, customizations, status, created_at, menu_items ( is_available ), orders(order_tables(tables(name)))')
        .in('status', STATUS_TO_AGGREGATE);

      if (error) throw error;

      if (!data || !Array.isArray(data)) {
        console.warn('No data returned from query');
        setSummaryItems([]);
        return;
      }

      interface ItemData {
        total_quantity: number;
        waiting_quantity: number;
        in_progress_quantity: number;
        completed_quantity: number;
        tables: Set<string>;
        oldest_time: string | null;
      }

      const itemMap = data.reduce((acc, item) => {
        // [FIX] Tính số lượng còn lại
        const returnedQty = item.returned_quantity || 0;
        const remainingQty = item.quantity - returnedQty;
        
        // [FIX] Bỏ qua món đã trả hết
        if (remainingQty <= 0) {
          return acc;
        }
        
        const itemName = item.customizations.name;
        const orders = item.orders as any;
        const tableName = orders?.order_tables?.[0]?.tables?.name || 'Mang về';
        
        // [CẬP NHẬT] Bỏ qua những món hết hàng (is_available = false)
        // Nếu báo hết, sẽ không hiển thị bất kể trạng thái
        const menuItems = item.menu_items as any;
        const isAvailable = menuItems?.is_available ?? true;
        if (!isAvailable) {
          return acc;
        }
        
        if (!acc[itemName]) {
          acc[itemName] = {
            total_quantity: 0,
            waiting_quantity: 0,
            in_progress_quantity: 0,
            completed_quantity: 0,
            tables: new Set<string>(),
            oldest_time: null,
          };
        }
        
        // [FIX] Cộng số lượng còn lại
        acc[itemName].total_quantity += remainingQty;
        
        if (item.status === 'waiting') {
          acc[itemName].waiting_quantity += remainingQty;
        } else if (item.status === 'in_progress') {
          acc[itemName].in_progress_quantity += remainingQty;
        } else if (item.status === 'completed') {
          acc[itemName].completed_quantity += remainingQty;
        }
        
        acc[itemName].tables.add(tableName);
        
        if (!acc[itemName].oldest_time || item.created_at < acc[itemName].oldest_time) {
          acc[itemName].oldest_time = item.created_at;
        }
        
        return acc;
      }, {} as Record<string, ItemData>);

      const aggregatedList: SummarizedItem[] = Object.keys(itemMap).map(name => ({
        name: name,
        total_quantity: itemMap[name].total_quantity,
        waiting_quantity: itemMap[name].waiting_quantity,
        in_progress_quantity: itemMap[name].in_progress_quantity,
        completed_quantity: itemMap[name].completed_quantity,  // [THÊM]
        table_count: itemMap[name].tables.size,
        tables: Array.from(itemMap[name].tables),
        oldest_time: itemMap[name].oldest_time,
      }));
      
      setSummaryItems(aggregatedList);

    } catch (err: any) {
      console.error('Error fetching summary data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSummaryData();
      const channel = supabase
        .channel('public:order_items:summary_v4')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
          () => fetchSummaryData()
        )
        .subscribe();
      
      // [MỚI] Lắng nghe thay đổi menu_items
      const menuItemsChannel = supabase
        .channel('public:menu_items:kitchen_summary')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => {
          console.log('[KitchenSummary] Món ăn thay đổi trạng thái');
          fetchSummaryData();
        })
        .subscribe();
      
      // [MỚI] Lắng nghe khi nhân viên trả món
      const returnSlipsChannel = supabase
        .channel('public:return_slips:kitchen_summary')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_slips' }, () => {
          console.log('[KitchenSummary] Có món được trả');
          fetchSummaryData();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(menuItemsChannel);
        supabase.removeChannel(returnSlipsChannel);
      };
    }, [fetchSummaryData])
  );

  const displayedItems = useMemo(() => {
    let filteredItems = summaryItems;

    if (searchQuery.trim() !== '') {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    switch (sortOption) {
      case 'name_asc':
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filteredItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'time_asc':
        filteredItems.sort((a, b) => {
          if (!a.oldest_time) return 1;
          if (!b.oldest_time) return -1;
          return new Date(a.oldest_time).getTime() - new Date(b.oldest_time).getTime();
        });
        break;
      case 'quantity_desc':
      default:
        filteredItems.sort((a, b) => b.total_quantity - a.total_quantity);
        break;
    }

    return filteredItems;
  }, [summaryItems, searchQuery, sortOption]);
  
  const renderSummaryItem = ({ item }: { item: SummarizedItem }) => {
    const getWaitingTime = () => {
      if (!item.oldest_time) return '';
      const now = new Date();
      const oldestTime = new Date(item.oldest_time);
      const diffMinutes = Math.floor((now.getTime() - oldestTime.getTime()) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes}p`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hours}h${mins}p`;
      }
    };

    const waitingTime = getWaitingTime();
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('KitchenSummaryDetail', { itemName: item.name })}
      >
        <View style={styles.topRow}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{item.total_quantity}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Chờ</Text>
            <Text style={styles.statusValue}>{item.waiting_quantity}</Text>
          </View>
          
          <View style={styles.dividerVertical} />
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Đang làm</Text>
            <Text style={styles.statusValue}>{item.in_progress_quantity}</Text>
          </View>
          
          <View style={styles.dividerVertical} />
          
          {/* [THÊM] Hiển thị số lượng đã hoàn thành */}
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Xong</Text>
            <Text style={[styles.statusValue, { color: '#10B981' }]}>{item.completed_quantity}</Text>
          </View>
          
          <View style={styles.dividerVertical} />
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Bàn</Text>
            <Text style={styles.statusValue}>{item.table_count}</Text>
          </View>
          
          {waitingTime && (
            <>
              <View style={styles.dividerVertical} />
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Thời gian</Text>
                <Text style={styles.timeValue}>{waitingTime}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.tablesRow}>
          <Ionicons name="restaurant-outline" size={14} color="#9CA3AF" />
          <Text style={styles.tablesText} numberOfLines={1}>{item.tables.join(', ')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortModal = () => (
    <Modal
      transparent={true}
      visible={isSortMenuVisible}
      onRequestClose={() => setSortMenuVisible(false)}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setSortMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => { setSortOption('name_asc'); setSortMenuVisible(false); }}
              >
                <Text style={styles.sortOptionText}>Sắp xếp theo món từ A-Z</Text>
                {sortOption === 'name_asc' && <Ionicons name="checkmark" size={24} color="#3B82F6" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => { setSortOption('quantity_desc'); setSortMenuVisible(false); }}
              >
                <Text style={styles.sortOptionText}>Sắp xếp theo số lượng</Text>
                {sortOption === 'quantity_desc' && <Ionicons name="checkmark" size={24} color="#3B82F6" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => { setSortOption('time_asc'); setSortMenuVisible(false); }}
              >
                <Text style={styles.sortOptionText}>Sắp xếp theo thời gian chờ</Text>
                {sortOption === 'time_asc' && <Ionicons name="checkmark" size={24} color="#3B82F6" />}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>Tổng hợp</Text>
            <Text style={styles.headerSubtitle}>Chế biến đơn hàng</Text>
          </View>
        </View>
      </View>

      {renderSortModal()}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={{marginLeft: 12}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tên món..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortMenuVisible(true)}
        >
          <Ionicons name="menu-outline" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.name}
        renderItem={renderSummaryItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="search-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy món nào.' : 'Không có món nào cần chế biến.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  
  // [CẬP NHẬT] Header giống OrderScreen
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  listContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 16,
    paddingTop: 4,
  },

  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    height: 44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginTop: 105,
    marginRight: 16,
    width: 250,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sortOptionText: { fontSize: 16, color: '#1F2937' },
  sortOptionDisabled: { paddingVertical: 12, paddingHorizontal: 8 },
  sortOptionDisabledText: { fontSize: 16, color: '#9CA3AF', fontStyle: 'italic' },

  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  totalBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  statusRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  
  tablesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tablesText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
});

export default KitchenSummaryScreen;