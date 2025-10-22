// screens/Cashier/SalesDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
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

  const loadSalesData = useCallback(async (period: string) => {
    try {
      setLoading(true);
      
      const getDateRange = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        switch (period) {
          case 'today':
            return { start: today, end: endOfDay };
          case 'yesterday':
            const yesterdayStart = new Date(today);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            const yesterdayEnd = new Date(yesterdayStart);
            yesterdayEnd.setHours(23, 59, 59, 999);
            return { start: yesterdayStart, end: yesterdayEnd };
          case 'this_week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return { start: weekStart, end: endOfDay };
          case 'this_month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: monthStart, end: endOfDay };
          default:
            return { start: today, end: endOfDay };
        }
      };
      
      const dateRange = getDateRange();
      setStartDate(dateRange.start);
      setEndDate(dateRange.end);
      
      const [report, realTransactions] = await Promise.all([
          getSalesReport(dateRange.start, dateRange.end),
          getTransactions(dateRange.start, dateRange.end, 20)
      ]);
      
      setSalesData({
        totalRevenue: report.total_revenue || 0,
        totalOrders: report.total_orders || 0,
        topProducts: report.top_products || [],
      });
      setTransactions(realTransactions);

    } catch (error) {
      console.error('❌ Error loading sales data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesData('today');
  }, [loadSalesData]);

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN');
  const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });

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
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Doanh thu</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.periodButton, selectedPeriod === option.value && styles.periodButtonActive]}
              onPress={() => {
                setSelectedPeriod(option.value);
                loadSalesData(option.value);
              }}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === option.value && styles.periodButtonTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateRangeInfo}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.dateRangeText}>{formatDate(startDate)} - {formatDate(endDate)}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ECFDF5' }]}><Ionicons name="trending-up" size={20} color="#10B981" /></View>
            <Text style={styles.summaryLabel}>Doanh thu</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{formatCurrency(salesData.totalRevenue)} ₫</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="receipt" size={20} color="#F59E0B" /></View>
            <Text style={styles.summaryLabel}>Đơn hàng</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{salesData.totalOrders}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          {transactions.length > 0 ? (
            <View style={styles.transactionList}>
              {transactions.map((item) => (
                <View key={item.id.toString()} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Ionicons name={item.status === 'completed' ? 'checkmark-circle' : 'close-circle'} size={18} color={item.status === 'completed' ? '#059669' : '#DC2626'} />
                    <View>
                      <Text style={styles.transactionTime}>{item.time}</Text>
                      <Text style={styles.transactionStaff}>{item.staff}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>+{formatCurrency(item.amount)} ₫</Text>
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

        {salesData.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
            <View style={styles.productList}>
              {salesData.topProducts.slice(0, 5).map((product: any, index: number) => (
                <View key={product.id.toString()} style={styles.productCard}>
                  <View style={styles.productRank}><Text style={styles.productRankText}>{index + 1}</Text></View>
                  <View style={styles.productDetails}>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.productMetric}>{product.quantity} × {formatCurrency(product.revenue / product.quantity)} ₫</Text>
                  </View>
                  <Text style={styles.productTotalRevenue}>{formatCurrency(product.revenue)} ₫</Text>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8EBF0' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 20 },
  periodSelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  periodButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  periodButtonActive: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  periodButtonText: { fontSize: 11, fontWeight: '500', color: '#6B7280', textAlign: 'center' },
  periodButtonTextActive: { color: '#fff', fontWeight: '600' },
  dateRangeInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 14, gap: 8 },
  dateRangeText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  summaryIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 10 },
  transactionList: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  transactionTime: { fontSize: 12, fontWeight: '500', color: '#1F2937', marginBottom: 2 },
  transactionStaff: { fontSize: 11, color: '#9CA3AF' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 2 },
  transactionItems: { fontSize: 11, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#9CA3AF' },
  // Styles for product list
  productList: { gap: 8 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  productRank: { backgroundColor: '#6B7280', width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productRankText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  productDetails: { flex: 1, marginRight: 8 },
  productName: { fontSize: 14, fontWeight: '500', color: '#1F2937', marginBottom: 4 },
  productMetric: { fontSize: 12, color: '#6B7280' },
  productTotalRevenue: { fontSize: 14, fontWeight: '600', color: '#10B981' }
});