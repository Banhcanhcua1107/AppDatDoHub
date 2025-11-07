// screens/Admin/AdminReportsScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

const getDates = (period: 'week' | 'month') => {
  const now = new Date();
  let start, end;
  if (period === 'week') {
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday is 0
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

export default function AdminReportsScreen() {
  const [reportType, setReportType] = useState<'week' | 'month'>('week');
  const [reportData, setReportData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDates(reportType);
      
      const { data: sales, error: salesError } = await supabase.rpc('get_sales_report', {
        p_start_date: startDate, p_end_date: endDate
      });
      if (salesError) throw new Error(`Lỗi báo cáo doanh số: ${salesError.message}`);
      setReportData(sales);

      const { data: trend, error: trendError } = await supabase.rpc('get_profit_trend', {
        p_start_date: startDate, p_end_date: endDate
      });
      if (trendError) throw new Error(`Lỗi xu hướng lợi nhuận: ${trendError.message}`);
      setChartData(trend);

    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportType]);

  useEffect(() => { loadReportData(); }, [loadReportData]);
  
  const maxProfit = chartData.length > 0 ? Math.max(1, ...chartData.map(d => d.net_profit)) : 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo Doanh thu</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[styles.periodBtn, reportType === 'week' && styles.periodBtnActive]} 
          onPress={() => setReportType('week')}
        >
          <Text style={[styles.periodBtnText, reportType === 'week' && styles.periodBtnTextActive]}>Tuần</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodBtn, reportType === 'month' && styles.periodBtnActive]} 
          onPress={() => setReportType('month')}
        >
          <Text style={[styles.periodBtnText, reportType === 'month' && styles.periodBtnTextActive]}>Tháng</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : reportData ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* KPI Cards */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Ionicons name="trending-up" size={24} color={COLORS.primary} style={styles.kpiIcon} />
              <Text style={styles.kpiLabel}>Tổng Doanh Thu</Text>
              <Text style={styles.kpiValue}>{(reportData.total_revenue / 1000000).toFixed(1)}M</Text>
            </View>
            <View style={styles.kpiCard}>
              <Ionicons name="receipt" size={24} color={COLORS.success} style={styles.kpiIcon} />
              <Text style={styles.kpiLabel}>Tổng Đơn Hàng</Text>
              <Text style={styles.kpiValue}>{reportData.total_orders}</Text>
            </View>
          </View>

          {/* Daily Profit Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lợi nhuận Ròng Hàng Ngày</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {chartData.map((data, index) => (
                  <View key={index} style={styles.barWrapper}>
                    <Text style={styles.barValue}>{(data.net_profit / 1000).toFixed(0)}k</Text>
                    <View style={[
                      styles.bar, 
                      { 
                        height: (Math.max(0, data.net_profit) / maxProfit) * 100 + 5,
                        backgroundColor: data.net_profit > 0 ? COLORS.primary : COLORS.danger 
                      }
                    ]} />
                    <Text style={styles.barDate}>{new Date(data.report_date).getDate()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Top Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 Sản phẩm Bán chạy</Text>
            {reportData.top_products && reportData.top_products.map((item: any, index: number) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productRank}>#{index + 1}</Text>
                </View>
                <Text style={styles.productRevenue}>{(item.revenue / 1000000).toFixed(2)}M</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Không có dữ liệu cho khoảng thời gian này</Text>
        </View>
      )}
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  periodSelector: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  periodBtnActive: { backgroundColor: '#3B82F6' },
  periodBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  periodBtnTextActive: { color: '#fff', fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  kpiIcon: { marginBottom: 8, color: '#3B82F6' },
  kpiLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 8, fontWeight: '500' },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  chartContainer: { backgroundColor: 'white', borderRadius: 12, padding: 16, height: 200, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%' },
  barWrapper: { alignItems: 'center', flex: 1 },
  bar: { width: '70%', borderRadius: 4 },
  barValue: { fontSize: 10, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  barDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  productRow: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  productRank: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  productRevenue: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
});