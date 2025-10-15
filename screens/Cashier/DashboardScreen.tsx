// screens/Cashier/DashboardScreen.tsx

import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getDashboardData,
  DashboardStats,
  TopSellingItem,
  RecentActivity,
  Alert as DashboardAlert
} from '../../services/dashboardService';

const { width } = Dimensions.get('window');

// Component cho card thống kê
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string; 
  subtitle?: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

// Component cho quick action button
const QuickActionButton = ({ 
  icon, 
  label, 
  color, 
  onPress 
}: { 
  icon: any; 
  label: string; 
  color: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    todayProfit: 0,
    serviceRate: 0,
  });
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  // Format currency
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  // Get time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setStats(data.stats);
      setTopItems(data.topItems);
      setActivities(data.activities);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with date */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tổng quan</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Stats Cards - Top Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Doanh thu hôm nay"
            value={`${formatMoney(stats.todayRevenue)} ₫`}
            icon="trending-up"
            color="#10B981"
            subtitle="Tiền thu"
          />
        </View>

        {/* Stats Grid - 2x2 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardSmall}>
            <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
            <Text style={styles.statCardSmallValue}>{stats.todayOrders}</Text>
            <Text style={styles.statCardSmallLabel}>Đơn hàng</Text>
          </View>
          
          <View style={styles.statCardSmall}>
            <Ionicons name="people-outline" size={20} color="#8B5CF6" />
            <Text style={styles.statCardSmallValue}>{stats.todayCustomers}</Text>
            <Text style={styles.statCardSmallLabel}>Khách hàng</Text>
          </View>
          
          <View style={styles.statCardSmall}>
            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
            <Text style={styles.statCardSmallValue}>{formatMoney(stats.todayProfit)} ₫</Text>
            <Text style={styles.statCardSmallLabel}>Lợi nhuận</Text>
          </View>
          
          <View style={styles.statCardSmall}>
            <Ionicons name="cart-outline" size={20} color="#EF4444" />
            <Text style={styles.statCardSmallValue}>{stats.serviceRate}%</Text>
            <Text style={styles.statCardSmallLabel}>Tỷ lệ phục vụ</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="bar-chart-outline"
              label="Báo cáo chi tiết"
              color="#3B82F6"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="cash-outline"
              label="Sổ quỹ"
              color="#10B981"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="cube-outline"
              label="Kiểm kho"
              color="#F59E0B"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="pricetag-outline"
              label="Khuyến mãi"
              color="#EF4444"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Top Selling Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Món bán chạy</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {topItems.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu món bán chạy hôm nay</Text>
          ) : (
            topItems.map((item, index) => (
              <View key={item.id} style={styles.topItemCard}>
                <View style={styles.topItemRank}>
                  <Text style={styles.topItemRankText}>{index + 1}</Text>
                </View>
                <View style={styles.topItemInfo}>
                  <Text style={styles.topItemName}>{item.name}</Text>
                  <Text style={styles.topItemQuantity}>
                    {item.quantity} món • {formatMoney(item.revenue)} ₫
                  </Text>
                </View>
                <View style={styles.topItemChart}>
                  <View style={[styles.topItemBar, { width: `${item.percentage}%` }]} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
          ) : (
            activities.map((activity) => {
              const getActivityIcon = () => {
                switch (activity.type) {
                  case 'payment':
                    return { icon: 'checkmark-circle', color: '#3B82F6', bg: '#DBEAFE' };
                  case 'table':
                    return { icon: 'restaurant', color: '#F59E0B', bg: '#FEF3C7' };
                  case 'inventory':
                    return { icon: 'cube', color: '#10B981', bg: '#DCFCE7' };
                  default:
                    return { icon: 'receipt', color: '#8B5CF6', bg: '#EDE9FE' };
                }
              };

              const iconConfig = getActivityIcon();
              const timeAgo = getTimeAgo(activity.timestamp);

              return (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={[styles.activityIcon, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon as any} size={20} color={iconConfig.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{timeAgo}</Text>
                  </View>
                  {activity.amount && (
                    <Text style={styles.activityAmount}>+{formatMoney(activity.amount)} ₫</Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Alert/Warning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cảnh báo</Text>
          
          {alerts.length === 0 ? (
            <Text style={styles.emptyText}>Không có cảnh báo</Text>
          ) : (
            alerts.map((alert) => {
              const iconName = alert.type === 'warning' ? 'warning' : alert.type === 'error' ? 'alert-circle' : 'information-circle';
              const iconColor = alert.type === 'warning' ? '#F59E0B' : alert.type === 'error' ? '#EF4444' : '#3B82F6';

              return (
                <View key={alert.id} style={styles.alertCard}>
                  <Ionicons name={iconName as any} size={20} color={iconColor} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertText}>{alert.message}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Padding bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    padding: 16,
    paddingTop: 8,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCardSmall: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardSmallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statCardSmallLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topItemRankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  topItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  topItemChart: {
    width: 60,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  topItemBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#92400E',
  },
});
