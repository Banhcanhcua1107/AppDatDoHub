// screens/Kitchen/KitchenSummaryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

// Trạng thái của món ăn cần tổng hợp
const STATUS_TO_AGGREGATE = ['waiting', 'in_progress'];

// Định nghĩa kiểu dữ liệu cho một món ăn đã được tổng hợp
interface SummarizedItem {
  name: string;
  total_quantity: number;
}

const KitchenSummaryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [summaryItems, setSummaryItems] = useState<SummarizedItem[]>([]);

  // Hàm để lấy và tổng hợp dữ liệu các món ăn
  const fetchSummaryData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, customizations')
        .in('status', STATUS_TO_AGGREGATE);

      if (error) throw error;

      // Sử dụng reduce để nhóm các món ăn theo tên và tính tổng số lượng
      const itemMap = data.reduce((acc, item) => {
        const itemName = item.customizations.name;
        if (!acc[itemName]) {
          acc[itemName] = 0;
        }
        acc[itemName] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      // Chuyển đổi đối tượng map thành mảng để render
      const aggregatedList: SummarizedItem[] = Object.keys(itemMap).map(name => ({
        name: name,
        total_quantity: itemMap[name],
      })).sort((a, b) => b.total_quantity - a.total_quantity); // Sắp xếp theo số lượng giảm dần

      setSummaryItems(aggregatedList);

    } catch (err: any) {
      console.error('Error fetching summary data:', err.message);
      // Có thể thêm Alert ở đây nếu cần
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động tải lại dữ liệu khi màn hình được focus hoặc có thay đổi trong DB
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSummaryData();
      const channel = supabase
        .channel('public:order_items:summary')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
          (payload) => {
            fetchSummaryData();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchSummaryData])
  );
  
  // Component để render từng món ăn trong danh sách
  const renderSummaryItem = ({ item }: { item: SummarizedItem }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemQuantity}>{item.total_quantity}x</Text>
      <Text style={styles.itemName}>{item.name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Đang tổng hợp món...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color="white" />
        <Text style={styles.headerTitle}>Tổng hợp chế biến</Text>
      </View>
      <FlatList
        data={summaryItems}
        keyExtractor={(item) => item.name}
        renderItem={renderSummaryItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không có món nào cần chế biến.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280', fontWeight: '500' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E3A8A', 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 12 
  },
  listContainer: { 
    paddingVertical: 8 
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginRight: 16,
    width: 40, 
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
});

export default KitchenSummaryScreen;