// screens/Cashier/DashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { supabase } from '../../services/supabase';

// Helper functions
const formatMoney = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN') + ' ₫';
const formatNumber = (num: number = 0) => (num || 0).toLocaleString('vi-VN');

// [MỚI] Helper function để tính toán giá trị tối đa "đẹp" cho trục Y của biểu đồ
const calculateChartMax = (data: any[], defaultMax = 100) => {
  if (!data || data.length === 0) {
    return defaultMax;
  }
  const maxValue = Math.max(...data.map(item => item.value || 0));
  if (maxValue === 0) {
    return defaultMax;
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const nextMilestone = Math.ceil(maxValue / magnitude) * magnitude;
  return nextMilestone;
};


// Component thẻ KPI (dọc) - Không thay đổi
const KpiCard = ({ title, value, icon, color }: any) => (
  <View style={styles.kpiCard}>
    <Ionicons name={icon} size={24} color={color} />
    <View style={styles.kpiTextContainer}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  </View>
);

// Component cho các dòng trong box thống kê (dạng bảng) - Không thay đổi
const StatRow = ({ label, count, amount, isHeader = false }: { label: string, count?: string | number, amount?: string | number, isHeader?: boolean }) => (
  <View style={styles.statRow}>
    <Text style={[styles.statCell, styles.statLabel, isHeader && styles.statHeader]}>{label}</Text>
    <Text style={[styles.statCell, styles.statCount, isHeader && styles.statHeader]}>{count}</Text>
    <Text style={[styles.statCell, styles.statAmount, isHeader && styles.statHeader]}>{amount}</Text>
  </View>
);

// [CẢI TIẾN] Component ChartSection với trục Y động và giá trị trên cột
const ChartSection = ({ title, chartData, isMoney = true }: { title: string, chartData: any[], isMoney?: boolean }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptyChartContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
        </View>
      </View>
    );
  }

  // [CẢI TIẾN] Tự động tính toán giá trị tối đa cho trục Y
  const yAxisMax = calculateChartMax(chartData, isMoney ? 100 : 10);

  // Hàm render tooltip khi người dùng nhấn vào một cột
  const renderTooltip = (item: any) => (
    <View style={styles.tooltipContainer}>
      <Text style={styles.tooltipText}>
        {isMoney ? formatMoney(item.value * 1000) : formatNumber(item.value)}
      </Text>
    </View>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          // --- Animation & Giao diện cột ---
          isAnimated
          animationDuration={800}
          barWidth={40}
          spacing={20}
          barBorderRadius={4}
          frontColor={'#3B82F6'}
          gradientColor={'#60A5FA'}
          
          // --- Trục X ---
          xAxisLabelTextStyle={styles.axisLabel}
          xAxisIndicesColor="#94A3B8"
          xAxisColor="#E2E8F0"
          
          // --- Trục Y ---
          yAxisTextStyle={styles.axisLabel}
          yAxisLabelSuffix={isMoney ? 'k' : ''}
          yAxisColor="#E2E8F0"
          yAxisIndicesColor="#94A3B8"
          noOfSections={5}
          // [CẢI TIẾN] Sử dụng giá trị tối đa đã tính toán
          maxValue={yAxisMax}
          
          // --- Tương tác ---
          renderTooltip={renderTooltip}
          
          // --- Các cài đặt khác ---
          initialSpacing={10}
          hideRules
          yAxisThickness={1}
          xAxisThickness={1}
        />
      </View>
    </View>
  );
};


export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const { data: dashboardData, error } = await supabase.rpc('get_dashboard_overview');
      if (error) throw error;
      setData(dashboardData);
    } catch (error) {
      console.error('❌ Cashier Dashboard Error:', error);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#3B82F6" /></View>;
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Không thể tải dữ liệu.</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // [CẢI TIẾN] Thêm `topLabelComponent` để hiển thị giá trị trên mỗi cột
  const financeChartData = data.finance_chart?.labels.map((label: string, index: number) => {
    const value = (data.finance_chart.data[index] || 0) / 1000;
    return {
      label,
      value: value,
      topLabelComponent: () => <Text style={styles.topLabelText}>{formatNumber(value)}k</Text>,
    };
  }) || [];

  const dailyRevenueChartData = data.daily_revenue_chart?.map((d: any) => {
    const value = (d.revenue || 0) / 1000;
    return {
      label: d.label,
      value: value,
      topLabelComponent: () => <Text style={styles.topLabelText}>{formatNumber(value)}k</Text>,
    };
  }) || [];
  
  const revenueByItemChartData = data.top_items_by_revenue?.map((d: any) => {
    const value = (d.value || 0) / 1000;
    return {
      label: d.name.substring(0, 12),
      value: value,
      topLabelComponent: () => <Text style={styles.topLabelText}>{formatNumber(value)}k</Text>,
    };
  }) || [];

  const topSellingItemsChartData = data.top_items_by_quantity?.map((d: any) => {
    const value = d.value || 0;
    return {
      label: d.name.substring(0, 12),
      value: value,
      topLabelComponent: () => <Text style={styles.topLabelText}>{formatNumber(value)}</Text>,
    };
  }) || [];


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Tổng quan trong ngày</Text>
        
        {/* Phần KPI và thống kê không thay đổi */}
        <View style={styles.mainInfoContainer}>
          <View style={styles.kpiColumn}>
            <KpiCard title="Tiền thu" value={formatMoney(data.kpis?.total_revenue)} icon="cash-outline" color="#10B981" />
            <KpiCard title="Tổng đơn" value={formatNumber(data.kpis?.total_orders)} icon="receipt-outline" color="#3B82F6" />
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>Đơn hàng</Text>
              <StatRow isHeader label="Trạng thái" count="SL" amount="Số tiền" />
              <StatRow label="Đã thanh toán" count={formatNumber(data.order_stats?.paid.count)} amount={formatMoney(data.order_stats?.paid.amount)} />
              <StatRow label="Đang phục vụ" count={formatNumber(data.order_stats?.serving.count)} amount={formatMoney(data.order_stats?.serving.amount)} />
              <StatRow label="Đã huỷ" count={formatNumber(data.order_stats?.cancelled.count)} amount={formatMoney(data.order_stats?.cancelled.amount)} />
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>Doanh thu ước tính</Text>
               <StatRow isHeader label="Trạng thái" count="" amount="Số tiền" />
               <StatRow label="Đã thanh toán" amount={formatMoney(data.order_stats?.paid.amount)} />
               <StatRow label="Đang phục vụ" amount={formatMoney(data.order_stats?.serving.amount)} />
            </View>
          </View>
        </View>
        
        {/* --- Biểu đồ đã được nâng cấp --- */}
        <ChartSection 
          title="Doanh thu, Chi phí, Lợi nhuận (x1000 ₫)" 
          chartData={financeChartData} 
          isMoney={true}
        />
        <ChartSection 
          title="Doanh thu 7 ngày qua (x1000 ₫)" 
          chartData={dailyRevenueChartData} 
          isMoney={true}
        />
        <ChartSection 
          title="Doanh thu theo mặt hàng (7 ngày, x1000 ₫)" 
          chartData={revenueByItemChartData} 
          isMoney={true}
        />
        <ChartSection 
          title="Mặt hàng bán chạy (7 ngày, Số lượng)" 
          chartData={topSellingItemsChartData} 
          isMoney={false}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  errorText: { marginTop: 12, color: '#EF4444', fontSize: 16 },
  retryButton: { marginTop: 20, backgroundColor: '#3B82F6', padding: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  scrollContent: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  
  mainInfoContainer: { gap: 16, marginBottom: 16 },
  kpiColumn: { gap: 16 },
  statsContainer: { gap: 16 },
  
  kpiCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 3,
  },
  kpiTextContainer: {},
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  kpiTitle: { fontSize: 14, color: '#64748B' },

  statBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 3,
  },
  statBoxTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 8 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statCell: { fontSize: 14 },
  statLabel: { flex: 2, color: '#475569' },
  statCount: { flex: 1, textAlign: 'right', color: '#475569', fontWeight: '500' },
  statAmount: { flex: 2, textAlign: 'right', color: '#1E293B', fontWeight: '600' },
  statHeader: { color: '#64748B', fontWeight: '600', fontSize: 12 },

  section: { 
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 3,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  sectionTitle: { 
    fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 16,
    paddingHorizontal: 16,
  },
  chartContainer: {
    paddingHorizontal: 8,
    paddingTop: 20, // [MỚI] Thêm khoảng trống ở trên để giá trị không bị cắt
  },
  axisLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  tooltipContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: { 
    color: '#94A3B8', 
    textAlign: 'center', 
    marginTop: 8,
    fontSize: 14,
  },
  // [MỚI] Style cho giá trị hiển thị trên đỉnh cột
  topLabelText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
});