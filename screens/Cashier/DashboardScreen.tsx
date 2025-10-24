// screens/Cashier/DashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { supabase } from '../../services/supabase';

const screenWidth = Dimensions.get('window').width;

// Helper functions
const formatMoney = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN') + ' ₫';
const formatNumber = (num: number = 0) => (num || 0).toLocaleString('vi-VN');

// Component thẻ KPI (dọc)
const KpiCard = ({ title, value, icon, color }: any) => (
  <View style={styles.kpiCard}>
    <Ionicons name={icon} size={24} color={color} />
    <View style={styles.kpiTextContainer}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  </View>
);

// Component cho các dòng trong box thống kê (dạng bảng)
const StatRow = ({ label, count, amount, isHeader = false }: { label: string, count?: string | number, amount?: string | number, isHeader?: boolean }) => (
  <View style={styles.statRow}>
    <Text style={[styles.statCell, styles.statLabel, isHeader && styles.statHeader]}>{label}</Text>
    <Text style={[styles.statCell, styles.statCount, isHeader && styles.statHeader]}>{count}</Text>
    <Text style={[styles.statCell, styles.statAmount, isHeader && styles.statHeader]}>{amount}</Text>
  </View>
);

// Component ChartSection được cải thiện
const ChartSection = ({ title, chartData, isMoney = true }: { title: string, chartData: any, isMoney?: boolean }) => {
  const chartContainerWidth = screenWidth - 32;
  const minBarWidth = 60; // GIẢM chiều rộng để các cột gần nhau hơn
  const dataPointCount = chartData?.labels?.length || 1;
  const calculatedChartWidth = dataPointCount * minBarWidth;
  const chartWidth = Math.max(chartContainerWidth, calculatedChartWidth);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {chartData && chartData.datasets && chartData.datasets[0].data.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.chartScrollContainer}
        >
          <BarChart
            data={chartData}
            width={chartWidth}
            height={260} // Tăng chiều cao để có không gian cho trục Y
            yAxisLabel={isMoney ? "₫ " : ""} // HIỂN THỊ KÝ HIỆU TIỀN BÊN TRÁI
            yAxisSuffix={isMoney ? "k" : ""} // HIỂN THỊ "k" bên phải
            fromZero={true}
            chartConfig={chartConfig}
            style={styles.chart}
            showBarTops={true}
            showValuesOnTopOfBars={true}
            verticalLabelRotation={-30} // Giảm góc xoay để tiết kiệm không gian
            withInnerLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            segments={4}
            yLabelsOffset={10} // [THÊM] Thêm khoảng cách cho yAxis
            // ĐÃ XOÁ barPercentage ở đây vì nó phải nằm trong chartConfig
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyChartContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
        </View>
      )}
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

  // Chuẩn bị dữ liệu cho các biểu đồ
  const financeChartData = {
    labels: data.finance_chart?.labels || [],
    datasets: [{ 
      data: data.finance_chart?.data?.map((d: number) => (d || 0) / 1000) || [],
    }],
  };
  const dailyRevenueChartData = {
    labels: data.daily_revenue_chart?.map((d: any) => d.label) || [],
    datasets: [{ 
      data: data.daily_revenue_chart?.map((d: any) => (d.revenue || 0) / 1000) || [],
    }],
  };
  const revenueByItemChartData = {
    labels: data.top_items_by_revenue?.map((d: any) => d.name.substring(0, 12)) || [], // Giảm độ dài label
    datasets: [{ 
      data: data.top_items_by_revenue?.map((d: any) => (d.value || 0) / 1000) || [],
    }],
  };
  const topSellingItemsChartData = {
    labels: data.top_items_by_quantity?.map((d: any) => d.name.substring(0, 12)) || [], // Giảm độ dài label
    datasets: [{ 
      data: data.top_items_by_quantity?.map((d: any) => d.value || 0) || [],
    }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Tổng quan trong ngày</Text>

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
        
        {/* --- Biểu đồ --- */}
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
          title="Doanh thu theo mặt hàng (x1000 ₫)" 
          chartData={revenueByItemChartData} 
          isMoney={true}
        />
        <ChartSection 
          title="Mặt hàng bán chạy (Số lượng)" 
          chartData={topSellingItemsChartData} 
          isMoney={false} // KHÔNG hiển thị ký hiệu tiền cho biểu đồ số lượng
        />

      </ScrollView>
    </SafeAreaView>
  );
}

// Chart config được cải thiện - barPercentage phải nằm trong đây
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  style: { 
    borderRadius: 12,
  },
  barPercentage: 0.8, // TĂNG lên để cột rộng hơn - ĐÃ CHUYỂN VÀO ĐÂY
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#E2E8F0',
    strokeDasharray: '0',
  },
  propsForLabels: {
    fontSize: 10, // Giảm font size để tiết kiệm không gian
    fontWeight: '500',
  },
  propsForVerticalLabels: {
    fontSize: 10,
    fontWeight: '500',
  },
  propsForHorizontalLabels: {
    fontSize: 9, // [CẬP NHẬT] Giảm từ 10 xuống 9
    fontWeight: '500',
  },
  fillShadowGradient: `rgba(59, 130, 246, 1)`,
  fillShadowGradientOpacity: 1,
};

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
    paddingTop: 16,
    overflow: 'hidden',
  },
  sectionTitle: { 
    fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 12,
    paddingHorizontal: 16,
  },
  chartScrollContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
    paddingRight: 16,
    paddingLeft: 25, // [CẬP NHẬT] Tăng từ 8 lên 25 để cột Y không bị che
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
});