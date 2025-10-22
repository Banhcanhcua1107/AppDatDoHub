// screens/Cashier/InventoryDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

interface MenuItem {
  id: number;
  name: string;
  is_available: boolean;
}

type InventoryStatus = 'out' | 'normal';

interface InventoryData {
  totalItems: number;
  outOfStock: number;
  normalStock: number;
}

interface InventoryProduct {
  id: number;
  name: string;
  status: InventoryStatus;
}

const InventoryDetailScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    totalItems: 0,
    outOfStock: 0,
    normalStock: 0,
  });
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'out' | 'normal'>('all');

  const loadInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, is_available')
        .order('name', { ascending: true });

      if (error) throw error;

      const items = (data as MenuItem[]) || [];
      const outOfStockItems = items.filter(item => !item.is_available);
      const normalItems = items.filter(item => item.is_available);
      
      const inventoryProducts: InventoryProduct[] = items.map(item => ({
        id: item.id,
        name: item.name,
        status: item.is_available ? 'normal' : 'out',
      }));

      const stats: InventoryData = {
        totalItems: items.length,
        outOfStock: outOfStockItems.length,
        normalStock: normalItems.length,
      };

      setInventoryData(stats);
      setProducts(inventoryProducts);
    } catch (error: any) {
      console.error('❌ Error loading inventory data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tồn kho: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadInventoryData();
    }, [loadInventoryData])
  );

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || product.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'out':
        return { bg: '#FEF2F2', text: '#DC2626', icon: 'close-circle' };
      case 'normal':
        return { bg: '#F0FDF4', text: '#16A34A', icon: 'checkmark-circle' };
    }
  };

  const getStatusLabel = (status: InventoryStatus) => {
    switch (status) {
      case 'out':
        return 'Hết hàng';
      case 'normal':
        return 'Còn hàng';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý tồn kho</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statTotal]}>
              <Ionicons name="fast-food-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{inventoryData.totalItems}</Text>
            <Text style={styles.statLabel}>Tổng món</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statOut]}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, styles.statNumberOut]}>
              {inventoryData.outOfStock}
            </Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statNormal]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
            </View>
            <Text style={[styles.statNumber, styles.statNumberNormal]}>
              {inventoryData.normalStock}
            </Text>
            <Text style={styles.statLabel}>Còn hàng</Text>
          </View>
        </View>

        {/* Search & Tabs */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm món..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'all' && styles.tabActive
              ]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'all' && styles.tabTextActive
              ]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'out' && styles.tabActive
              ]}
              onPress={() => setActiveTab('out')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'out' && styles.tabTextActive
              ]}>
                Hết hàng
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'normal' && styles.tabActive
              ]}
              onPress={() => setActiveTab('normal')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'normal' && styles.tabTextActive
              ]}>
                Còn hàng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'all' ? 'Tất cả món' : 
             activeTab === 'out' ? 'Món hết hàng' : 'Món còn hàng'} 
            ({filteredProducts.length})
          </Text>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Không tìm thấy món phù hợp' : 'Không có món nào'}
              </Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {filteredProducts.map((product: any) => {
                const colors = getStatusColor(product.status);
                return (
                  <View key={product.id.toString()} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <View style={[styles.statusIndicator, { backgroundColor: colors.bg }]}>
                        <Ionicons
                          name={colors.icon as any}
                          size={16}
                          color={colors.text}
                        />
                      </View>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.statusText, { color: colors.text }]}>
                        {getStatusLabel(product.status)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTotal: {
    backgroundColor: '#E0E7FF',
  },
  statOut: {
    backgroundColor: '#FEE2E2',
  },
  statNormal: {
    backgroundColor: '#DCFCE7',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statNumberOut: {
    color: '#DC2626',
  },
  statNumberNormal: {
    color: '#16A34A',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  productsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InventoryDetailScreen;