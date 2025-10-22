// screens/Cashier/CashierReportScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
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
  getCashFlowReport,
  getProfitReport,
} from '../../services/reportService';

const { width } = Dimensions.get('window');

// Period options for the new dropdown
const periodOptions = [
  { label: 'Hôm nay', value: 'today', icon: 'today' },
  { label: 'Hôm qua', value: 'yesterday', icon: 'calendar' },
  { label: 'Tuần này', value: 'this_week', icon: 'calendar-clear' },
  { label: 'Tuần trước', value: 'last_week', icon: 'calendar-clear' },
  { label: 'Tháng này', value: 'this_month', icon: 'calendar' },
  { label: 'Tháng trước', value: 'last_month', icon: 'calendar' },
  { label: 'Tùy chỉnh', value: 'custom', icon: 'options' },
];

export default function CashierReportScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');
  const [periodLabel, setPeriodLabel] = useState('Hôm nay');
  const [isPeriodModalVisible, setPeriodModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const [reportData, setReportData] = useState<any>({
    sales: { totalRevenue: 0, totalOrders: 0, topProducts: [] },
    purchases: { totalCost: 0, suppliers: [] },
    inventory: { totalItems: 0, totalValue: 0, outOfStock: [], lowStock: [] },
    cashFlow: { cashOnHand: 0, bankDeposit: 0, totalFund: 0 },
    profit: { grossProfit: 0, netProfit: 0, profitMargin: 0 },
  });

  // Animation on load
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data on first mount and when dates change
  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handlePeriodSelect = (periodValue: string, label: string) => {
    const today = new Date();
    let newStartDate = new Date();
    let newEndDate = new Date();

    switch (periodValue) {
      case 'today':
        newStartDate = today;
        newEndDate = today;
        break;
      case 'yesterday':
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - 1);
        newEndDate = newStartDate;
        break;
      case 'this_week':
        const firstDayOfWeek = today.getDate() - today.getDay();
        newStartDate = new Date(today.setDate(firstDayOfWeek));
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        break;
      case 'last_week':
        const lastWeekStartDate = new Date();
        lastWeekStartDate.setDate(today.getDate() - today.getDay() - 7);
        newStartDate = lastWeekStartDate;
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        break;
      case 'this_month':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last_month':
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Do nothing, user will pick dates manually
        break;
    }
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setPeriodLabel(label);
    setPeriodModalVisible(false);
  };

  const loadReportData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [sales, inventory, purchase, cashFlow, profit] =
        await Promise.all([
          getSalesReport(startDate, endDate),
          getInventoryReport(),
          getPurchaseReport(startDate, endDate),
          getCashFlowReport(startDate, endDate),
          getProfitReport(startDate, endDate),
        ]);

      setReportData({
        sales: {
          totalRevenue: sales?.total_revenue || 0,
          totalOrders: sales?.total_orders || 0,
          topProducts: sales?.top_products || [],
        },
        purchases: { totalCost: purchase?.total_cost || 0, suppliers: purchase?.suppliers || [] },
        inventory: {
          totalItems: inventory?.total_items || 0,
          totalValue: (inventory?.total_items || 0) * 50000,
          outOfStock: inventory?.out_of_stock || 0,
          lowStock: inventory?.low_stock_details || [],
        },
        cashFlow: {
          cashOnHand: cashFlow?.cash_on_hand || 0,
          bankDeposit: cashFlow?.bank_deposit || 0,
          totalFund: cashFlow?.total_fund || 0,
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
  };

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Báo Cáo Tổng Quan</Text>
          <Text style={styles.headerSubtitle}>
            {startDate.toLocaleDateString('vi-VN')} - {endDate.toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={22} 
            color={refreshing ? "#9CA3AF" : "#3B82F6"} 
          />
        </TouchableOpacity>
      </View>

      {/* Modern Filter Bar */}
      <Animated.View 
        style={[
          styles.filterContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Period Selector */}
        <TouchableOpacity 
          style={styles.periodButton}
          onPress={() => setPeriodModalVisible(true)}
        >
          <Ionicons name="calendar" size={18} color="#3B82F6" />
          <Text style={styles.periodButtonText}>{periodLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>

        {/* Date Range Display */}
        <View style={styles.dateRangeSection}>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateLabel}>Từ</Text>
            <TouchableOpacity 
              style={styles.dateDisplayButton}
              onPress={() => {
                setDatePickerType('start');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateDisplayText}>
                {startDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateArrow}>
            <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
          </View>

          <View style={styles.dateDisplay}>
            <Text style={styles.dateLabel}>Đến</Text>
            <TouchableOpacity 
              style={styles.dateDisplayButton}
              onPress={() => {
                setDatePickerType('end');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateDisplayText}>
                {endDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* 🎯 MAIN METRICS GRID - HORIZONTAL LAYOUT */}
        <View style={styles.metricsGrid}>
          {/* Profit Card */}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProfitDetail')}
            style={{ flex: 1 }}
          >
            <Animated.View 
              pointerEvents="box-none"
              style={[
                styles.metricCard,
                styles.profitCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="trending-up" size={20} color="#F59E0B" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Lợi nhuận</Text>
              <Text style={styles.metricValue}>
                {reportData.profit.netProfit.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            {reportData.profit.profitMargin > 0 && (
              <Text style={styles.metricTrend}>
                +{reportData.profit.profitMargin}%
              </Text>
            )}
            </Animated.View>
          </TouchableOpacity>

          {/* Sales Card */}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SalesDetail')}
            style={{ flex: 1 }}
          >
            <Animated.View 
              pointerEvents="box-none"
              style={[
                styles.metricCard,
                styles.salesCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Ionicons name="receipt" size={20} color="#22C55E" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Doanh thu</Text>
              <Text style={styles.metricValue}>
                {reportData.sales.totalRevenue.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            <Text style={styles.metricSubtitle}>{reportData.sales.totalOrders} đơn</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Inventory Card */}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('InventoryDetail')}
            style={{ flex: 1 }}
          >
            <Animated.View 
            pointerEvents="box-none"
            style={[
              styles.metricCard,
              styles.inventoryCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="cube" size={20} color="#3B82F6" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Tồn kho</Text>
              <Text style={styles.metricValue}>{reportData.inventory.totalItems}</Text>
            </View>
            {(reportData.inventory.outOfStock > 0 || reportData.inventory.lowStock.length > 0) && (
              <View style={styles.stockAlert}>
                <Text style={styles.stockAlertText}>
                  {reportData.inventory.lowStock.length + reportData.inventory.outOfStock}
                </Text>
              </View>
            )}
            </Animated.View>
          </TouchableOpacity>

          {/* Cash Flow Card */}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CashFlowDetail')}
            style={{ flex: 1 }}
          >
            <Animated.View 
            pointerEvents="box-none"
            style={[
              styles.metricCard,
              styles.cashFlowCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="wallet" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Quỹ tiền</Text>
              <Text style={styles.metricValue}>
                {reportData.cashFlow.totalFund.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Additional Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Thống kê chi tiết</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cart" size={20} color="#10B981" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {reportData.purchases.totalCost.toLocaleString('vi-VN')} ₫
                </Text>
                <Text style={styles.statLabel}>Chi phí mua hàng</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="business" size={20} color="#EF4444" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {reportData.purchases.suppliers.length}
                </Text>
                <Text style={styles.statLabel}>Nhà cung cấp</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {reportData.inventory.outOfStock.length}
                </Text>
                <Text style={styles.statLabel}>Hết hàng</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {reportData.inventory.lowStock.length}
                </Text>
                <Text style={styles.statLabel}>Sắp hết hàng</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <CompactDatePicker
          selectedDate={datePickerType === 'start' ? startDate : endDate}
          onDateSelect={(date: Date) => {
            if (datePickerType === 'start') setStartDate(date);
            else setEndDate(date);
            setPeriodLabel('Tùy chỉnh');
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Period Selector Modal */}
      <Modal
        visible={isPeriodModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setPeriodModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn khoảng thời gian</Text>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  periodLabel === option.label && styles.modalOptionSelected
                ]}
                onPress={() => handlePeriodSelect(option.value, option.label)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={periodLabel === option.label ? "#3B82F6" : "#6B7280"} 
                />
                <Text style={[
                  styles.modalOptionText,
                  periodLabel === option.label && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {periodLabel === option.label && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
    flex: 1,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  dateRangeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 2,
    gap: 6,
    paddingTop: 2,
  },
  dateDisplay: {
    flex: 1,
    gap: 3,
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    height: 14,
    lineHeight: 14,
  },
  dateDisplayButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 32,
    justifyContent: 'center',
  },
  dateDisplayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  dateArrow: {
    paddingHorizontal: 2,
    paddingTop: 18,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  // Metrics Grid - Horizontal Layout
  metricsGrid: {
    padding: 10,
    gap: 8,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profitCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  salesCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  inventoryCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  cashFlowCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  metricContent: {
    flex: 1,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  metricTrend: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    flexShrink: 0,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    flexShrink: 0,
  },
  stockAlert: {
    backgroundColor: '#FEF3C7',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stockAlertText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  statsGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  // Actions Section
  actionsSection: {
    paddingHorizontal: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 3,
    gap: 10,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Date Picker Styles (keep your existing date picker styles)
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateInputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  dateInputGroup: {
    alignItems: 'center',
    flex: 1,
    minWidth: 60,
  },
  modalDateInputLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  dateInputControls: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputArrow: {
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  dateInputButton: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dateInputValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateInputSeparator: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  datePreview: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  datePreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  datePreviewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  pickerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBtnCancel: {
    backgroundColor: '#E5E7EB',
  },
  pickerBtnConfirm: {
    backgroundColor: '#3B82F6',
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

// Keep your existing CompactDatePicker component
interface CompactDatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const CompactDatePicker: React.FC<CompactDatePickerProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [tempDate, setTempDate] = useState(new Date(selectedDate));

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setTempDate(newDate);
  };

  const handleDayChange = (increment: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + increment);
    setTempDate(newDate);
  };

  const handleYearChange = (increment: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(newDate.getFullYear() + increment);
    setTempDate(newDate);
  };

  const currentMonth = tempDate.getMonth() + 1;
  const currentDay = tempDate.getDate();
  const currentYear = tempDate.getFullYear();

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerHeaderTitle}>Chọn ngày</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateInputRow}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.modalDateInputLabel}>Tháng</Text>
              <View style={styles.dateInputControls}>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleMonthChange(-1)}
                >
                  <Ionicons name="chevron-up" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <View style={styles.dateInputButton}>
                  <Text style={styles.dateInputValue}>
                    {currentMonth.toString().padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleMonthChange(1)}
                >
                  <Ionicons name="chevron-down" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.dateInputSeparator}>/</Text>
            <View style={styles.dateInputGroup}>
              <Text style={styles.modalDateInputLabel}>Ngày</Text>
              <View style={styles.dateInputControls}>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleDayChange(-1)}
                >
                  <Ionicons name="chevron-up" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <View style={styles.dateInputButton}>
                  <Text style={styles.dateInputValue}>
                    {currentDay.toString().padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleDayChange(1)}
                >
                  <Ionicons name="chevron-down" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.dateInputSeparator}>/</Text>
            <View style={styles.dateInputGroup}>
              <Text style={styles.modalDateInputLabel}>Năm</Text>
              <View style={styles.dateInputControls}>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleYearChange(-1)}
                >
                  <Ionicons name="chevron-up" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <View style={styles.dateInputButton}>
                  <Text style={styles.dateInputValue}>
                    {currentYear.toString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.dateInputArrow}
                  onPress={() => handleYearChange(1)}
                >
                  <Ionicons name="chevron-down" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.datePreview}>
            <Text style={styles.datePreviewLabel}>Ngày được chọn:</Text>
            <Text style={styles.datePreviewValue}>
              {tempDate.toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.pickerFooter}>
            <TouchableOpacity
              style={[styles.pickerBtn, styles.pickerBtnCancel]}
              onPress={onClose}
            >
              <Text style={styles.pickerBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerBtn, styles.pickerBtnConfirm]}
              onPress={() => onDateSelect(tempDate)}
            >
              <Text style={[styles.pickerBtnText, { color: '#fff' }]}>Chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};