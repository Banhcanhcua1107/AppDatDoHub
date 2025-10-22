// screens/Cashier/CashierReportScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  getSalesReport,
  getInventoryReport,
  getPurchaseReport,
  getCashFlowReport,
  getProfitReport,
  getMenuItemsStatus, // Import hàm mới
} from '../../services/reportService';

const { width } = Dimensions.get('window');

export default function CashierReportScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Initialize dates to today
  const { startDate, endDate } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }, []);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const [reportData, setReportData] = useState<any>({
    sales: { totalRevenue: 0, totalOrders: 0 },
    purchases: { totalCost: 0, suppliers: [] },
    inventory: { totalItems: 0, outOfStock: 0, lowStockCount: 0 },
    cashFlow: { totalFund: 0 },
    profit: { netProfit: 0, profitMargin: 0 },
  });
  
  const loadReportData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Gọi tất cả các API song song để tối ưu tốc độ
      const [sales, inventoryRpc, purchase, cashFlow, profit, menuItems] = await Promise.all([
        getSalesReport(startDate, endDate),
        getInventoryReport(),
        getPurchaseReport(startDate, endDate),
        getCashFlowReport(startDate, endDate),
        getProfitReport(startDate, endDate),
        getMenuItemsStatus(), // Lấy tổng số món thực tế từ menu_items
      ]);

      setReportData({
        sales: {
          totalRevenue: sales?.total_revenue || 0,
          totalOrders: sales?.total_orders || 0,
        },
        purchases: {
          totalCost: purchase?.total_cost || 0,
          suppliers: purchase?.suppliers || [],
        },
        inventory: {
          // Lấy tổng số món từ getMenuItemsStatus để đảm bảo đồng bộ
          totalItems: menuItems.length, 
          // Lấy số liệu cảnh báo từ RPC vì nó chứa logic "low stock"
          outOfStock: inventoryRpc?.out_of_stock || 0,
          lowStockCount: inventoryRpc?.low_stock_details?.length || 0,
        },
        cashFlow: {
          totalFund: cashFlow?.total_fund || 0,
        },
        profit: {
          netProfit: profit?.net_profit || 0,
          profitMargin: profit?.profit_margin || 0,
        },
      });
    } catch (error) {
      console.error('❌ Error loading report:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
        loadReportData();
    }, [loadReportData])
  );


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRefresh = () => {
    loadReportData(true);
  };
  
  const stockAlertCount = reportData.inventory.outOfStock + reportData.inventory.lowStockCount;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Báo Cáo Tổng Quan</Text>
          <Text style={styles.headerSubtitle}>
            {startDate.toLocaleDateString('vi-VN')} - {endDate.toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={22} color={refreshing ? '#9CA3AF' : '#3B82F6'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />}
      >
        <View style={styles.metricsGrid}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('ProfitDetail')} style={{ flex: 1 }}>
            <Animated.View style={[styles.metricCard, styles.profitCard]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><Ionicons name="trending-up" size={20} color="#F59E0B" /></View>
              <View>
                <Text style={styles.metricLabel}>Lợi nhuận</Text>
                <Text style={styles.metricValue}>{reportData.profit.netProfit.toLocaleString('vi-VN')} ₫</Text>
              </View>
              <Text style={styles.metricTrend}>{(reportData.profit.profitMargin || 0).toFixed(1)}%</Text>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SalesDetail')} style={{ flex: 1 }}>
            <Animated.View style={[styles.metricCard, styles.salesCard]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}><Ionicons name="receipt" size={20} color="#22C55E" /></View>
              <View>
                <Text style={styles.metricLabel}>Doanh thu</Text>
                <Text style={styles.metricValue}>{reportData.sales.totalRevenue.toLocaleString('vi-VN')} ₫</Text>
              </View>
              <Text style={styles.metricSubtitle}>{reportData.sales.totalOrders} đơn</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('InventoryDetail')} style={{ flex: 1 }}>
            <Animated.View style={[styles.metricCard, styles.inventoryCard]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}><Ionicons name="cube" size={20} color="#3B82F6" /></View>
              <View>
                <Text style={styles.metricLabel}>Tồn kho</Text>
                <Text style={styles.metricValue}>{reportData.inventory.totalItems}</Text>
              </View>
              {stockAlertCount > 0 && (
                <View style={styles.stockAlert}>
                  <Text style={styles.stockAlertText}>{stockAlertCount}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('CashFund')} style={{ flex: 1 }}>
            <Animated.View style={[styles.metricCard, styles.cashFlowCard]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}><Ionicons name="wallet" size={20} color="#8B5CF6" /></View>
              <View>
                <Text style={styles.metricLabel}>Quỹ tiền</Text>
                <Text style={styles.metricValue}>{reportData.cashFlow.totalFund.toLocaleString('vi-VN')} ₫</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}><View style={[styles.actionIcon, { backgroundColor: '#EBF5FF' }]}><Ionicons name="download" size={24} color="#3B82F6" /></View><Text style={styles.actionText}>Xuất báo cáo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}><View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}><Ionicons name="print" size={24} color="#0EA5E9" /></View><Text style={styles.actionText}>In báo cáo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}><View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}><Ionicons name="share-social" size={24} color="#22C55E" /></View><Text style={styles.actionText}>Chia sẻ</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}><View style={[styles.actionIcon, { backgroundColor: '#FEF7FF' }]}><Ionicons name="settings" size={24} color="#A855F7" /></View><Text style={styles.actionText}>Cài đặt</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals remain unchanged */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  refreshButton: { padding: 6, borderRadius: 10, backgroundColor: '#F1F5F9' },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  periodButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, gap: 6 },
  periodButtonText: { fontSize: 13, fontWeight: '600', color: '#1E293B', flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8 },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  profitCard: { borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  salesCard: { borderLeftWidth: 4, borderLeftColor: '#22C55E' },
  inventoryCard: { borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  cashFlowCard: { borderLeftWidth: 4, borderLeftColor: '#8B5CF6' },
  metricIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  metricLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  metricTrend: { position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: '700', color: '#16A34A', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  metricSubtitle: { position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  stockAlert: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FEF2F2', minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  stockAlertText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  actionsSection: { marginTop: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: { flex: 1, minWidth: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' },
  // Modal styles remain unchanged
});

// CompactDatePicker component remains unchanged