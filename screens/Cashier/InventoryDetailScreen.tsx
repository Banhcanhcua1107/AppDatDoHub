// screens/Cashier/InventoryDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getInventoryReport } from '../../services/reportService';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  status: 'normal' | 'low' | 'out';
}

export default function InventoryDetailScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    totalItems: 0,
    outOfStock: 0,
    lowStock: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadInventoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const report = await getInventoryReport();
      
      setInventoryData({
        totalItems: report.total_items || 0,
        outOfStock: report.out_of_stock || 0,
        lowStock: report.low_stock || 0,
      });

      // Generate mock product data for demo
      const mockProducts = generateMockProducts(report.total_items || 0);
      setProducts(mockProducts);
    } catch (error) {
      console.error('❌ Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockProducts = (count: number): Product[] => {
    const productNames = [
      'Bạch tuộc', 'Bột mỳ', 'Bơ', 'Cà chua', 'Cạnh hình',
      'Cà hủi', 'Cà ngữ', 'Coca Cola', 'Mực ống', 'Pepsi',
      ' 7up', 'Thịt bò', 'Thịt gà', 'Thịt lợn', 'Tôm sú',
    ];

    const products: Product[] = [];
    for (let i = 0; i < Math.min(count, 15); i++) {
      const quantity = Math.floor(Math.random() * 100);
      let status: 'normal' | 'low' | 'out' = 'normal';
      
      if (quantity === 0) status = 'out';
      else if (quantity < 20) status = 'low';
      
      products.push({
        id: `prod_${i}`,
        name: productNames[i % productNames.length],
        quantity,
        unit: i % 2 === 0 ? 'Kg' : 'Lần',
        minStock: 20,
        status,
      });
    }
    return products;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'low':
        return 'Sắp hết';
      case 'out':
        return 'Hết hàng';
      default:
        return 'Không xác định';
    }
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

  const lowStockProducts = products.filter(p => p.status === 'low');
  const outOfStockProducts = products.filter(p => p.status === 'out');
  const normalProducts = products.filter(p => p.status === 'normal');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Tồn kho</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inventoryData.totalItems}</Text>
            <Text style={styles.statLabel}>Tổng sản phẩm</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {inventoryData.lowStock}
            </Text>
            <Text style={styles.statLabel}>Sắp hết hàng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {inventoryData.outOfStock}
            </Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>
        </View>

        {/* Out of Stock Section */}
        {outOfStockProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Hết hàng ({outOfStockProducts.length})</Text>
            </View>
            
            <View style={styles.productList}>
              {outOfStockProducts.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSubtext}>Đơn vị: {product.unit}</Text>
                  </View>
                  <View style={styles.productStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.statusText, { color: '#EF4444' }]}>
                        {getStatusLabel(product.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Low Stock Section */}
        {lowStockProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Sắp hết hàng ({lowStockProducts.length})</Text>
            </View>
            
            <View style={styles.productList}>
              {lowStockProducts.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSubtext}>
                      Tồn: {product.quantity} {product.unit} (tối thiểu: {product.minStock})
                    </Text>
                  </View>
                  <View style={styles.productStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                        {getStatusLabel(product.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Normal Stock Section */}
        {normalProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Bình thường ({normalProducts.length})</Text>
            </View>
            
            <View style={styles.productList}>
              {normalProducts.slice(0, 5).map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSubtext}>
                      Tồn: {product.quantity} {product.unit}
                    </Text>
                  </View>
                  <View style={styles.productStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.statusText, { color: '#10B981' }]}>
                        OK
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {normalProducts.length > 5 && (
                <View style={styles.moreItem}>
                  <Text style={styles.moreText}>
                    +{normalProducts.length - 5} sản phẩm khác
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  productList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  productSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  productStatus: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
