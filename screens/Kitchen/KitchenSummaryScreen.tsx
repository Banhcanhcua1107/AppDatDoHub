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
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
// [SỬA LỖI] Import các type cần thiết
import { useFocusEffect, useNavigation, CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { supabase } from '../../services/supabase';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// [SỬA LỖI] Import cả hai ParamList
import { KitchenStackParamList } from '../../navigation/AppNavigator';
import { KitchenTabParamList } from '../../navigation/KitchenTabs';


const STATUS_TO_AGGREGATE = ['waiting', 'in_progress'];

interface SummarizedItem {
  name: string;
  total_quantity: number;
}

type SortOption = 'quantity_desc' | 'name_asc' | 'name_desc';

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
  
  // [SỬA LỖI] Lấy navigation từ prop type đã kết hợp
  const navigation = useNavigation<KitchenSummaryScreenProps['navigation']>();

  const fetchSummaryData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, customizations')
        .in('status', STATUS_TO_AGGREGATE);

      if (error) throw error;

      const itemMap = data.reduce((acc, item) => {
        const itemName = item.customizations.name;
        if (!acc[itemName]) {
          acc[itemName] = 0;
        }
        acc[itemName] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const aggregatedList: SummarizedItem[] = Object.keys(itemMap).map(name => ({
        name: name,
        total_quantity: itemMap[name],
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
      return () => {
        supabase.removeChannel(channel);
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
      case 'quantity_desc':
      default:
        filteredItems.sort((a, b) => b.total_quantity - a.total_quantity);
        break;
    }

    return filteredItems;
  }, [summaryItems, searchQuery, sortOption]);
  
  const renderSummaryItem = ({ item }: { item: SummarizedItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('KitchenSummaryDetail', { itemName: item.name })}
    >
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{item.total_quantity}</Text>
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.itemNameText} numberOfLines={2}>{item.name}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert("Thông báo", `Chức năng ưu tiên cho món: ${item.name}.`);
          }}
        >
          <FontAwesome5 name="concierge-bell" size={20} color="#F97316" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert("Thông báo", `Chức năng báo hết món: ${item.name}.`);
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
              <View style={styles.sortOptionDisabled}>
                 <Text style={styles.sortOptionDisabledText}>Sắp xếp theo thời gian (đang phát triển)</Text>
              </View>
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
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      {renderSortModal()}
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color="white" />
        <Text style={styles.headerTitle}>Tổng hợp chế biến</Text>
      </View>

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

// Styles không thay đổi
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', 
    paddingHorizontal: 16, paddingVertical: 12 
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  
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
    backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 16, marginBottom: 12, shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 5, elevation: 3, flexDirection: 'row', alignItems: 'center',
  },
  quantityContainer: { minWidth: 40, marginRight: 12, alignItems: 'center' },
  quantityText: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
  nameContainer: { flex: 1, marginRight: 12 },
  itemNameText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginLeft: 4 },
});

export default KitchenSummaryScreen;