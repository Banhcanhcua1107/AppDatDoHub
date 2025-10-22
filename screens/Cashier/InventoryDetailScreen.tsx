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
import { getMenuItemsStatus, InventoryProduct } from '../../services/reportService';

interface InventoryData {
  totalItems: number;
  outOfStock: number;
  normalStock: number;
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
      const items = await getMenuItemsStatus();

      const outOfStockItems = items.filter(item => item.status === 'out');
      const normalItems = items.filter(item => item.status === 'normal');

      const stats: InventoryData = {
        totalItems: items.length,
        outOfStock: outOfStockItems.length,
        normalStock: normalItems.length,
      };

      setInventoryData(stats);
      setProducts(items);
    } catch (error: any) {
      console.error('❌ Error loading inventory data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tồn kho: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventoryData();
    }, [loadInventoryData])
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || product.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusStyle = (status: 'normal' | 'out') => {
    return status === 'out'
      ? { bg: '#FEF2F2', text: '#DC2626', icon: 'close-circle' as const }
      : { bg: '#F0FDF4', text: '#16A34A', icon: 'checkmark-circle' as const };
  };

  const getStatusLabel = (status: 'normal' | 'out') => {
    return status === 'out' ? 'Hết hàng' : 'Còn hàng';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý tồn kho</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statTotal]}><Ionicons name="apps-outline" size={22} color="#3B82F6" /></View>
            <Text style={styles.statNumber}>{inventoryData.totalItems}</Text>
            <Text style={styles.statLabel}>Tổng món</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statOut]}><Ionicons name="close-circle-outline" size={22} color="#EF4444" /></View>
            <Text style={[styles.statNumber, {color: '#EF4444'}]}>{inventoryData.outOfStock}</Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statNormal]}><Ionicons name="checkmark-done-outline" size={22} color="#22C55E" /></View>
            <Text style={[styles.statNumber, {color: '#22C55E'}]}>{inventoryData.normalStock}</Text>
            <Text style={styles.statLabel}>Còn hàng</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.tabContainer}>
            {(['all', 'out', 'normal'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'all' ? 'Tất cả' : tab === 'out' ? 'Hết hàng' : 'Còn hàng'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            Danh sách món ({filteredProducts.length})
          </Text>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fast-food-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>{searchQuery ? 'Không tìm thấy món phù hợp' : 'Chưa có món nào'}</Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {filteredProducts.map((product, index) => {
                const style = getStatusStyle(product.status);
                const isLastItem = index === filteredProducts.length - 1;
                return (
                  <View key={product.id.toString()} style={[styles.productItem, isLastItem && styles.lastProductItem]}>
                    <View style={styles.productInfo}>
                      <View style={[styles.statusIndicator, { backgroundColor: style.bg }]}>
                        <Ionicons name={style.icon} size={18} color={style.text} />
                      </View>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                      <Text style={[styles.statusText, { color: style.text }]}>{getStatusLabel(product.status)}</Text>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerRight: { width: 32 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },
  statCard: { flex: 1, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statTotal: { backgroundColor: '#E0E7FF' },
  statOut: { backgroundColor: '#FEE2E2' },
  statNormal: { backgroundColor: '#DCFCE7' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterSection: { paddingHorizontal: 16, marginVertical: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  searchInput: { flex: 1, height: 48, fontSize: 16, marginLeft: 10, color: '#111827' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#3B82F6', fontWeight: '600' },
  productsSection: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 12, textAlign: 'center' },
  productsList: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  productItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastProductItem: { borderBottomWidth: 0 },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  statusIndicator: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151', lineHeight: 20 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '600' },
});

export default InventoryDetailScreen;