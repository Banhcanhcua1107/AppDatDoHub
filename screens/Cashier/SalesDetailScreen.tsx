// screens/Cashier/SalesDetailScreen.tsx

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
import { getSalesReport } from '../../services/reportService';

interface Transaction {
  id: string;
  time: string;
  amount: number;
  items: number;
  staff: string;
  status: 'completed' | 'cancelled';
}

export default function SalesDetailScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topProducts: [] as any[],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const report = await getSalesReport(today, today);
      
      setSalesData({
        totalRevenue: report.total_revenue || 0,
        totalOrders: report.total_orders || 0,
        topProducts: report.top_products || [],
      });

      // Generate mock transaction data for demo
      const mockTransactions = generateMockTransactions(report.total_orders);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('❌ Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = (count: number): Transaction[] => {
    const transactions: Transaction[] = [];
    const now = new Date();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const time = new Date(now.getTime() - i * 30 * 60000); // 30 min intervals
      const status: 'completed' | 'cancelled' = Math.random() > 0.1 ? 'completed' : 'cancelled';
      transactions.push({
        id: `tx_${i}`,
        time: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        amount: Math.floor(Math.random() * 500000) + 50000,
        items: Math.floor(Math.random() * 5) + 1,
        staff: ['Nguyễn Long Sơn', 'Hoàng Hiền', 'Cà Sắng'][Math.floor(Math.random() * 3)],
        status,
      });
    }
    return transactions;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Doanh thu</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="cash" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.summaryLabel}>Doanh thu</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(salesData.totalRevenue)} ₫
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="receipt" size={24} color="#10B981" />
            </View>
            <Text style={styles.summaryLabel}>Đơn hàng</Text>
            <Text style={styles.summaryValue}>{salesData.totalOrders}</Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          
          <View style={styles.transactionList}>
            {transactions.length > 0 ? (
              transactions.map((item) => (
                <View key={item.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: item.status === 'completed' ? '#DBEAFE' : '#FEE2E2' }
                    ]}>
                      <Ionicons 
                        name={item.status === 'completed' ? 'checkmark-circle' : 'close-circle'} 
                        size={20} 
                        color={item.status === 'completed' ? '#3B82F6' : '#EF4444'} 
                      />
                    </View>
                    <View>
                      <Text style={styles.transactionTime}>{item.time}</Text>
                      <Text style={styles.transactionStaff}>{item.staff}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      +{formatCurrency(item.amount)} ₫
                    </Text>
                    <Text style={styles.transactionItems}>{item.items} món</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>Chưa có giao dịch</Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Products Section */}
        {salesData.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
            
            <View style={styles.productsGrid}>
              {salesData.topProducts.slice(0, 4).map((product, index) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productRank}>
                    <Text style={styles.productRankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productMetric}>
                    {product.quantity} / {formatCurrency(product.revenue)} ₫
                  </Text>
                </View>
              ))}
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  transactionList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  transactionStaff: {
    fontSize: 11,
    color: '#94A3B8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  transactionItems: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productRank: {
    backgroundColor: '#3B82F6',
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  productMetric: {
    fontSize: 11,
    color: '#64748B',
  },
});
