// screens/Admin/AdminReportsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
}

interface ReportData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct?: string;
  topProductRevenue?: number;
  dailyData: DailyData[];
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReports'>;

const { width } = Dimensions.get('window');

export default function AdminReportsScreen({ navigation }: Props) {
  const [reportType, setReportType] = useState<'week' | 'month'>('week');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [reportType]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // TODO: Gọi API để lấy dữ liệu báo cáo
      if (reportType === 'week') {
        const mockWeekData: ReportData = {
          period: 'Tuần này (04-10 Nov 2025)',
          totalRevenue: 15500000,
          totalOrders: 450,
          averageOrderValue: 34444,
          topProduct: 'Phở Bò',
          topProductRevenue: 3200000,
          dailyData: [
            { date: 'Mon', revenue: 2000000, orders: 60 },
            { date: 'Tue', revenue: 2100000, orders: 62 },
            { date: 'Wed', revenue: 2200000, orders: 65 },
            { date: 'Thu', revenue: 2300000, orders: 68 },
            { date: 'Fri', revenue: 2500000, orders: 75 },
            { date: 'Sat', revenue: 2200000, orders: 70 },
            { date: 'Sun', revenue: 2200000, orders: 65 },
          ],
        };
        setReportData(mockWeekData);
      } else {
        const mockMonthData: ReportData = {
          period: 'Tháng 11 năm 2025',
          totalRevenue: 68000000,
          totalOrders: 1980,
          averageOrderValue: 34343,
          topProduct: 'Cơm Tấm',
          topProductRevenue: 14000000,
          dailyData: [
            { date: '1-4', revenue: 7200000, orders: 210 },
            { date: '5-8', revenue: 7800000, orders: 227 },
            { date: '9-12', revenue: 8100000, orders: 235 },
            { date: '13-16', revenue: 8500000, orders: 247 },
            { date: '17-20', revenue: 8900000, orders: 259 },
            { date: '21-24', revenue: 9200000, orders: 267 },
            { date: '25-30', revenue: 18300000, orders: 535 },
          ],
        };
        setReportData(mockMonthData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxRevenue = reportData
    ? Math.max(...reportData.dailyData.map((d) => d.revenue))
    : 1;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo Doanh thu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Report Type Selector */}
      <View style={styles.reportTypeContainer}>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            reportType === 'week' && styles.reportTypeButtonActive,
          ]}
          onPress={() => setReportType('week')}
        >
          <Text
            style={[
              styles.reportTypeButtonText,
              reportType === 'week' && styles.reportTypeButtonTextActive,
            ]}
          >
            Theo Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            reportType === 'month' && styles.reportTypeButtonActive,
          ]}
          onPress={() => setReportType('month')}
        >
          <Text
            style={[
              styles.reportTypeButtonText,
              reportType === 'month' && styles.reportTypeButtonTextActive,
            ]}
          >
            Theo Tháng
          </Text>
        </TouchableOpacity>
      </View>

      {reportData && !isLoading && (
        <>
          {/* Period Title */}
          <View style={styles.periodContainer}>
            <Text style={styles.periodText}>{reportData.period}</Text>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Tổng Doanh Thu"
              value={`${(reportData.totalRevenue / 1000000).toFixed(1)}M`}
              subtitle="đ"
              color={COLORS.primary}
            />
            <MetricCard
              title="Tổng Đơn Hàng"
              value={reportData.totalOrders.toString()}
              subtitle="đơn"
              color={COLORS.success}
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="Giá trị Trung bình"
              value={`${(reportData.averageOrderValue / 1000).toFixed(0)}k`}
              subtitle="đ/đơn"
              color={COLORS.warning}
            />
            <MetricCard
              title="Sản phẩm Top"
              value={reportData.topProduct || '-'}
              subtitle={`${(reportData.topProductRevenue ? reportData.topProductRevenue / 1000000 : 0).toFixed(1)}M`}
              color={COLORS.info}
            />
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Doanh Thu Hàng Ngày</Text>
            <View style={styles.chart}>
              {reportData.dailyData.map((data, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(
                            100,
                            (data.revenue / maxRevenue) * 200
                          ),
                          backgroundColor: COLORS.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.date}</Text>
                  <Text style={styles.barValue}>
                    {(data.revenue / 1000000).toFixed(1)}M
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Daily Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Chi tiết từng ngày</Text>
            <FlatList
              scrollEnabled={false}
              data={reportData.dailyData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.detailDate}>{item.date}</Text>
                  </View>
                  <View style={styles.detailRight}>
                    <Text style={styles.detailOrders}>
                      {item.orders} đơn
                    </Text>
                    <Text style={styles.detailRevenue}>
                      {(item.revenue / 1000000).toFixed(1)}M đ
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Tóm tắt</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Doanh thu cao nhất:</Text>
              <Text style={styles.summaryValue}>
                {(
                  Math.max(...reportData.dailyData.map((d) => d.revenue)) /
                  1000000
                ).toFixed(1)}
                M đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Doanh thu thấp nhất:</Text>
              <Text style={styles.summaryValue}>
                {(
                  Math.min(...reportData.dailyData.map((d) => d.revenue)) /
                  1000000
                ).toFixed(1)}
                M đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Doanh thu trung bình:</Text>
              <Text style={styles.summaryValue}>
                {(
                  reportData.totalRevenue /
                  reportData.dailyData.length /
                  1000000
                ).toFixed(1)}
                M đ
              </Text>
            </View>
          </View>
        </>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}
    </ScrollView>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

function MetricCard({ title, value, subtitle, color }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 28,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  reportTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  reportTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  reportTypeButtonTextActive: {
    color: '#fff',
  },
  periodContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  chartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 280,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLeft: {
    flex: 0.2,
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  detailRight: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailOrders: {
    fontSize: 12,
    color: '#666',
  },
  detailRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
});
