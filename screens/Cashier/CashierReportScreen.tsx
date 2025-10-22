// screens/Cashier/CashierReportScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import {
  getSalesReport,
  getInventoryReport,
  getPurchaseReport,
  getProfitReport,
} from '../../services/reportService';

const { width } = Dimensions.get('window');

export default function CashierReportScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [startDate] = useState(new Date());
  const [endDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const [reportData, setReportData] = useState<any>({
    sales: { totalRevenue: 0, totalOrders: 0, topProducts: [] },
    purchases: { totalCost: 0, suppliers: [] },
    inventory: { totalItems: 0, totalValue: 0, outOfStock: [], lowStock: [] },
    profit: { grossProfit: 0, netProfit: 0, profitMargin: 0 },
  });

  const loadReportData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sales, inventory, purchase, profit] = await Promise.all([
        getSalesReport(startDate, endDate),
        getInventoryReport(),
        getPurchaseReport(startDate, endDate),
        getProfitReport(startDate, endDate),
      ]);

      setReportData({
        sales: {
          totalRevenue: sales?.total_revenue || 0,
          totalOrders: sales?.total_orders || 0,
          topProducts: sales?.top_products || [],
        },
        purchases: {
          totalCost: purchase?.total_cost || 0,
          suppliers: purchase?.suppliers || [],
        },
        inventory: {
          totalItems: inventory?.total_items || 0,
          outOfStock: inventory?.out_of_stock || 0,
          lowStock: inventory?.low_stock_details || [],
        },
        profit: {
          grossProfit: profit?.gross_profit || 0,
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate, loadReportData]);

  const handleRefresh = () => {
    loadReportData(true);
  };

  if (loading) {
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
            <Animated.View pointerEvents="box-none" style={[styles.metricCard, styles.profitCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="trending-up" size={20} color="#F59E0B" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Lợi nhuận</Text>
                <Text style={styles.metricValue}>{reportData.profit.netProfit.toLocaleString('vi-VN')} ₫</Text>
              </View>
              <Text style={styles.metricTrend}>{(reportData.profit.profitMargin || 0).toFixed(1)}%</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SalesDetail')} style={{ flex: 1 }}>
            <Animated.View pointerEvents="box-none" style={[styles.metricCard, styles.salesCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Ionicons name="receipt" size={20} color="#22C55E" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Doanh thu</Text>
                <Text style={styles.metricValue}>{reportData.sales.totalRevenue.toLocaleString('vi-VN')} ₫</Text>
              </View>
              <Text style={styles.metricSubtitle}>{reportData.sales.totalOrders} đơn</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('InventoryDetail')} style={{ flex: 1 }}>
            <Animated.View pointerEvents="box-none" style={[styles.metricCard, styles.inventoryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="cube" size={20} color="#3B82F6" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Tồn kho</Text>
                <Text style={styles.metricValue}>{reportData.inventory.totalItems}</Text>
              </View>
              {(reportData.inventory.outOfStock > 0 || reportData.inventory.lowStock.length > 0) && (
                <View style={styles.stockAlert}>
                  <Text style={styles.stockAlertText}>{reportData.inventory.lowStock.length + reportData.inventory.outOfStock}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="download" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Xuất báo cáo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="print" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>In báo cáo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="share-social" size={24} color="#22C55E" />
              </View>
              <Text style={styles.actionText}>Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEF7FF' }]}>
                <Ionicons name="settings" size={24} color="#A855F7" />
              </View>
              <Text style={styles.actionText}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
  refreshButton: { padding: 6, borderRadius: 10, backgroundColor: '#F8FAFC' },
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
  metricIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  metricContent: {},
  metricLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  metricValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  metricTrend: { position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: '700', color: '#16A34A', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  metricSubtitle: { position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  stockAlert: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FEF2F2', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stockAlertText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  actionsSection: { marginTop: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: { flex: 1, minWidth: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 16, width: '100%', maxWidth: 380, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: 10, marginBottom: 3, gap: 10 },
  modalOptionSelected: { backgroundColor: '#F0F9FF' },
  modalOptionText: { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 },
  modalOptionTextSelected: { color: '#3B82F6', fontWeight: '600' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  pickerWrapper: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  pickerHeaderTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  dateInputRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center', alignItems: 'flex-end', gap: 8 },
  dateInputGroup: { alignItems: 'center', flex: 1, minWidth: 60 },
  modalDateInputLabel: { fontSize: 11, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
  dateInputControls: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  dateInputArrow: { paddingVertical: 3, paddingHorizontal: 6 },
  dateInputButton: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, minWidth: 70, alignItems: 'center', backgroundColor: '#F9FAFB' },
  dateInputValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  dateInputSeparator: { fontSize: 18, fontWeight: '600', color: '#D1D5DB', marginBottom: 8 },
  datePreview: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F0F9FF', borderRadius: 8, marginHorizontal: 16, marginVertical: 10 },
  datePreviewLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  datePreviewValue: { fontSize: 15, fontWeight: '600', color: '#3B82F6' },
  pickerFooter: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  pickerBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pickerBtnCancel: { backgroundColor: '#E5E7EB' },
  pickerBtnConfirm: { backgroundColor: '#3B82F6' },
  pickerBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
});