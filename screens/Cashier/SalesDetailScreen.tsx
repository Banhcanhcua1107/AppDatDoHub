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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getSalesReport, getTransactions, Transaction } from '../../services/reportService';

// Quick period options
const PERIOD_OPTIONS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
];

export default function SalesDetailScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
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

  const getDateRangeForPeriod = (period: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case 'today':
        return { start: new Date(today), end: new Date(today) };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date(today) };
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: new Date(today) };
      default:
        return { start: new Date(today), end: new Date(today) };
    }
  };

  const loadSalesData = async (period: string = selectedPeriod) => {
    try {
      setLoading(true);
      const dateRange = getDateRangeForPeriod(period);

      // Validate: startDate <= endDate
      if (dateRange.start > dateRange.end) {
        Alert.alert('Lỗi', 'Ngày bắt đầu không thể lớn hơn ngày kết thúc');
        setLoading(false);
        return;
      }

      setStartDate(dateRange.start);
      setEndDate(dateRange.end);
      
      const report = await getSalesReport(dateRange.start, dateRange.end);
      
      setSalesData({
        totalRevenue: report.total_revenue || 0,
        totalOrders: report.total_orders || 0,
        topProducts: report.top_products || [],
      });

      // Fetch real transaction data from database
      const realTransactions = await getTransactions(dateRange.start, dateRange.end, 20);
      setTransactions(realTransactions);
    } catch (error) {
      console.error('❌ Error loading sales data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
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
          <Ionicons name="chevron-back" size={28} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doanh thu</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                selectedPeriod === option.value && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod(option.value);
                loadSalesData(option.value);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === option.value && styles.periodButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range Info */}
        <View style={styles.dateRangeInfo}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.dateRangeText}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <Text style={styles.summaryLabel}>Doanh thu</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(salesData.totalRevenue)} ₫
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="receipt" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.summaryLabel}>Đơn hàng</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{salesData.totalOrders}</Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          </View>
          
          {transactions.length > 0 ? (
            <View style={styles.transactionList}>
              {transactions.map((item: Transaction) => (
                <View key={item.id.toString()} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Ionicons 
                      name={item.status === 'completed' ? 'checkmark-circle' : 'close-circle'} 
                      size={18} 
                      color={item.status === 'completed' ? '#059669' : '#DC2626'} 
                    />
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
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có giao dịch</Text>
            </View>
          )}
        </View>

        {/* Top Products Section */}
        {salesData.topProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
            </View>
            
            <View style={styles.productsGrid}>
              {salesData.topProducts.slice(0, 4).map((product: any, index: number) => (
                <View key={product.id.toString()} style={styles.productCard}>
                  <View style={styles.productRank}>
                    <Text style={styles.productRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productMetric}>
                    {product.quantity} × {formatCurrency(product.revenue)} ₫
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBF0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  periodButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dateRangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionList: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
    borderBottomColor: '#F3F4F6',
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
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionStaff: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
  },
  transactionItems: {
    fontSize: 11,
    color: '#9CA3AF',
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
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  productRank: {
    backgroundColor: '#475569',
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRankText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 6,
  },
  productMetric: {
    fontSize: 11,
    color: '#6B7280',
  },
});
