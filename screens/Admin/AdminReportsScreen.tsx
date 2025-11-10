// screens/Admin/AdminReportsScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

// --- Helper Functions ---

// Giữ nguyên hàm format tiền tệ của bạn, nó đã rất tốt
const formatCurrency = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' đ';
};

// Hàm tính toán giá trị tối đa "đẹp" cho trục Y, giống trang thu ngân
const calculateChartMax = (data: any[], key: string, defaultMax = 100) => {
  if (!data || data.length === 0) return defaultMax;
  const maxValue = Math.max(...data.map(item => item[key] || 0));
  if (maxValue <= 0) return defaultMax; // Nếu toàn giá trị âm hoặc 0
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  return Math.ceil(maxValue / magnitude) * magnitude;
};

// Hàm lấy ngày tháng (giữ nguyên)
const getDates = (period: 'week' | 'month') => {
  const now = new Date();
  let start, end;
  if (period === 'week') {
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};


export default function AdminReportsScreen({ onClose }: { onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [reportType, setReportType] = useState<'week' | 'month'>('week');
  const [reportData, setReportData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]); // Dữ liệu gốc từ Supabase
  const [isLoading, setIsLoading] = useState(true);

  // Hàm load dữ liệu (giữ nguyên)
  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    setReportData(null);
    try {
      const { startDate, endDate } = getDates(reportType);
      
      const { data: sales, error: salesError } = await supabase.rpc('get_sales_report', { p_start_date: startDate, p_end_date: endDate });
      if (salesError) throw new Error(`Lỗi báo cáo doanh số: ${salesError.message}`);
      setReportData(sales);

      const { data: trend, error: trendError } = await supabase.rpc('get_profit_trend', { p_start_date: startDate, p_end_date: endDate });
      if (trendError) throw new Error(`Lỗi xu hướng lợi nhuận: ${trendError.message}`);
      setChartData(trend || []);

    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportType]);

  useEffect(() => { loadReportData(); }, [loadReportData]);

  // [CẢI TIẾN] Sử dụng useMemo để chuyển đổi dữ liệu cho biểu đồ một cách hiệu quả
  const giftedChartData = useMemo(() => {
    return chartData.map((d: any) => {
      const date = new Date(d.report_date);
      const dateLabel = `${date.getDate()}`; // Chỉ hiển thị ngày cho gọn
      const rawValue = d.net_profit || 0;
      
      return {
        label: dateLabel,
        value: rawValue, // gifted-charts có thể xử lý giá trị âm
        topLabelComponent: () => (
          <Text style={styles.topLabelText}>{`${Math.round(rawValue / 1000)}k`}</Text>
        ),
        frontColor: rawValue >= 0 ? '#3B82F6' : '#EF4444',
      };
    });
  }, [chartData]);
  
  // [CẢI TIẾN] Tính toán giá trị Y-axis động
  const yAxisMax = useMemo(() => calculateChartMax(chartData, 'net_profit', 100000), [chartData]);

  const renderContent = () => {
    // ... (Phần loading và empty state giữ nguyên)
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (!reportData || reportData.total_revenue === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Không có dữ liệu cho khoảng thời gian này</Text>
        </View>
      );
    }
    
    // [CẢI TIẾN] Tính toán chiều rộng cho biểu đồ để cuộn
    const barWidth = reportType === 'week' ? 35 : 22;
    const spacing = reportType === 'week' ? 20 : 18;
    const chartWidth = giftedChartData.length * (barWidth + spacing);
    const screenWidth = Dimensions.get('window').width;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* KPI Grid (giữ nguyên giao diện đẹp của bạn) */}
        <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.kpiLabel}>Tổng Doanh Thu</Text>
                <Text style={styles.kpiValue}>{formatCurrency(reportData.total_revenue)}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.kpiLabel}>Tổng Đơn Hàng</Text>
                <Text style={styles.kpiValue}>{reportData.total_orders}</Text>
            </View>
        </View>

        {/* [THAY THẾ] Profit Chart sử dụng gifted BarChart với style đồng bộ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lợi nhuận Ròng Hàng Ngày</Text>
          <View style={styles.chartWrapper}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={giftedChartData}
                    width={chartWidth < screenWidth - 50 ? screenWidth - 50 : chartWidth}
                    isAnimated
                    animationDuration={600}
                    barWidth={barWidth}
                    spacing={spacing}
                    barBorderRadius={4}
                    xAxisLabelTextStyle={styles.axisLabel}
                    yAxisTextStyle={styles.axisLabel}
                    yAxisLabelSuffix={'đ'}
                    yAxisColor="#E2E8F0"
                    xAxisColor="#E2E8F0"
                    noOfSections={5}
                    // [CẢI TIẾN] Sử dụng giá trị tối đa động
                    maxValue={yAxisMax} 
                    // [CẢI TIẾN] Hiển thị giá trị 0
                    mostNegativeValue={-yAxisMax / 2}
                    // [CẢI TIẾN] Cho phép giá trị âm
                    yAxisOffset={0}
                    hideRules
                    initialSpacing={10}
                />
             </ScrollView>
          </View>
        </View>

        {/* Top Products (giữ nguyên) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Sản phẩm Bán chạy</Text>
          {reportData.top_products?.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <Text style={styles.productRank}>#{index + 1}</Text>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productDetails}>Đã bán: {item.quantity}</Text>
              </View>
              <View style={styles.productRevenueContainer}>
                <Text style={styles.productRevenue}>{formatCurrency(item.revenue)}</Text>
                <Text style={styles.productPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header và Period Selector giữ nguyên */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
            <Text style={styles.headerTitle}>Báo cáo Hiệu suất</Text>
            <Text style={styles.headerSubtitle}>Tổng quan theo tuần và tháng</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={loadReportData} style={styles.iconButton}>
              <Ionicons name="refresh-outline" size={24} color="#111827" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={[styles.iconButton, {backgroundColor: '#FEF2F2'}]}>
              <Ionicons name="close-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodBtn, reportType === 'week' && styles.periodBtnActive]} 
            onPress={() => setReportType('week')}
          >
            <Text style={[styles.periodBtnText, reportType === 'week' && styles.periodBtnTextActive]}>Tuần này</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodBtn, reportType === 'month' && styles.periodBtnActive]} 
            onPress={() => setReportType('month')}
          >
            <Text style={[styles.periodBtnText, reportType === 'month' && styles.periodBtnTextActive]}>Tháng này</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// [CẬP NHẬT] Styles để đồng bộ với trang thu ngân
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' }, // Nền xám nhạt hơn
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 15, color: '#6B7280', marginTop: 2 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: { flex: 1 },
  periodSelector: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: 'white' },
  periodBtn: { flex: 1, paddingVertical: 12, borderRadius: 24, backgroundColor: '#F3F4F6' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodBtnText: { fontSize: 14, fontWeight: '600', color: '#4B5563', textAlign: 'center' },
  periodBtnTextActive: { color: '#fff', fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 3,
  },
  kpiLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  section: { 
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16, paddingHorizontal: 16 },
  chartWrapper: {
    paddingTop: 20, // Thêm không gian cho top label
  },
  axisLabel: { color: '#6B7280', fontSize: 10 },
  topLabelText: { color: '#334155', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  productRow: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal:16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  productRank: { fontSize: 14, fontWeight: 'bold', color: '#9CA3AF', width: 30 },
  productInfo: { flex: 1, marginRight: 10 },
  productName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  productDetails: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  productRevenueContainer: { alignItems: 'flex-end' },
  productRevenue: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  productPercentage: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});