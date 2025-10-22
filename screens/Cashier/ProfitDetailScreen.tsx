// screens/Cashier/ProfitDetailScreen.tsx

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
import { getProfitReport } from '../../services/reportService';

type ProfitDetailNavigationProp = any;

interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

// Quick period options
const PERIOD_OPTIONS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
];

export default function ProfitDetailScreen() {
  const navigation = useNavigation<ProfitDetailNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [profitData, setProfitData] = useState<ProfitData>({
    totalRevenue: 0,
    totalCost: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
  });

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const dateRange = getDateRangeForPeriod('today');
        setStartDate(dateRange.start);
        setEndDate(dateRange.end);

        const report = await getProfitReport(dateRange.start, dateRange.end);
        console.log('📊 Profit report data:', {
          total_revenue: report.total_revenue,
          total_cogs: report.total_cogs,
          operating_cost: report.operating_cost,
          net_profit: report.net_profit,
        });
        
        setProfitData({
          totalRevenue: report.total_revenue || 0,
          totalCost: report.total_cogs || 0,
          totalExpenses: report.operating_cost || 0,
          grossProfit: report.gross_profit || 0,
          netProfit: report.net_profit || 0,
          profitMargin: report.profit_margin || 0,
        });
      } catch (error) {
        console.error('❌ Error loading profit data:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu lợi nhuận');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadProfitData = async (period: string = selectedPeriod) => {
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

      const report = await getProfitReport(dateRange.start, dateRange.end);
      console.log('📊 Profit report data:', {
        total_revenue: report.total_revenue,
        total_cogs: report.total_cogs,
        operating_cost: report.operating_cost,
        net_profit: report.net_profit,
      });
      
      setProfitData({
        totalRevenue: report.total_revenue || 0,
        totalCost: report.total_cogs || 0,
        totalExpenses: report.operating_cost || 0,
        grossProfit: report.gross_profit || 0,
        netProfit: report.net_profit || 0,
        profitMargin: report.profit_margin || 0,
      });
    } catch (error) {
      console.error('❌ Error loading profit data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu lợi nhuận');
    } finally {
      setLoading(false);
    }
  }

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
        <Text style={styles.headerTitle}>Lợi nhuận</Text>
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
                loadProfitData(option.value);
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

        {/* Main Profit Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Lợi nhuận ròng</Text>
          <Text style={styles.mainCardValue}>
            {formatCurrency(profitData.netProfit)} ₫
          </Text>
          <View style={styles.marginInfo}>
            <Text style={styles.marginPercent}>{profitData.profitMargin.toFixed(1)}%</Text>
            <Text style={styles.marginLabel}>tỷ suất</Text>
          </View>
        </View>

        {/* Breakdown Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chi tiết</Text>
          </View>
          
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Doanh thu</Text>
                <Text style={styles.itemDesc}>Thu từ bán hàng</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#475569' }]}>+{formatCurrency(profitData.totalRevenue)} ₫</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="cart" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Chi phí hàng hóa (COGS)</Text>
                <Text style={styles.itemDesc}>Giá vốn hàng bán</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#475569' }]}>-{formatCurrency(profitData.totalCost)} ₫</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="wallet" size={18} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Chi phí hoạt động</Text>
                <Text style={styles.itemDesc}>Lương, điện, nước, v.v.</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#475569' }]}>-{formatCurrency(profitData.totalExpenses)} ₫</Text>
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark" size={18} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Lợi nhuận ròng</Text>
                <Text style={styles.itemDesc}>TR - COGS - Hoạt động</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#2E7D32', fontWeight: '600' }]}>
              {formatCurrency(profitData.netProfit)} ₫
            </Text>
          </View>
        </View>

        {/* Analysis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phân tích</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lợi nhuận gộp</Text>
              <Text style={styles.statValue}>
                {formatCurrency(profitData.grossProfit)} ₫
              </Text>
              <Text style={styles.statDesc}>Trước chi phí hoạt động</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tỷ suất lợi nhuận</Text>
              <Text style={styles.statValue}>
                {profitData.profitMargin.toFixed(1)}%
              </Text>
              <Text style={styles.statDesc}>Trên doanh thu</Text>
            </View>
          </View>
        </View>
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
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mainCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  marginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marginPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  marginLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  itemDivider: {
    height: 6,
    backgroundColor: '#F9FAFB',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statDesc: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
