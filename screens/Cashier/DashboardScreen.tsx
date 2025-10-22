// screens/Cashier/DashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardData } from '../../services/supabaseService';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: any; color: string; }) => (
  <View style={[styles.statCardSmall, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.statCardSmallValue}>{value}</Text>
    <Text style={styles.statCardSmallLabel}>{title}</Text>
  </View>
);

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const formatMoney = (amount: number) => amount.toLocaleString('vi-VN');

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('❌ Dashboard Error:', error);
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải tổng quan...</Text>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tổng quan hôm nay</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        
        <View style={styles.mainStatCard}>
          <Text style={styles.mainStatLabel}>Doanh thu</Text>
          <Text style={styles.mainStatValue}>{formatMoney(data.stats.todayRevenue)} ₫</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Đơn hàng" value={data.stats.todayOrders.toString()} icon="receipt-outline" color="#3B82F6" />
          <StatCard title="Lợi nhuận" value={`${formatMoney(data.stats.todayProfit)} ₫`} icon="cash-outline" color="#10B981" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Món bán chạy</Text>
          {data.topItems.length > 0 ? (
            data.topItems.map((item: any, index: number) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.itemName}>{index + 1}. {item.name}</Text>
                <Text style={styles.itemValue}>{item.quantity} món</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có dữ liệu.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {data.activities.length > 0 ? (
            data.activities.map((act: any) => (
              <View key={act.id} style={styles.listItem}>
                <View style={{flex: 1}}>
                    <Text style={styles.itemName}>{act.title}</Text>
                    <Text style={styles.itemSubText}>{new Date(act.timestamp).toLocaleTimeString('vi-VN')}</Text>
                </View>
                <Text style={[styles.itemValue, {color: '#10B981'}]}>+{formatMoney(act.amount)} ₫</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có hoạt động nào.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cảnh báo</Text>
          {data.alerts.length > 0 ? (
            data.alerts.map((alert: any) => (
              <View key={alert.id} style={styles.alertCard}>
                <Ionicons name="warning-outline" size={24} color="#F59E0B" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Không có cảnh báo.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
    errorText: { marginTop: 12, fontSize: 16, color: '#EF4444', textAlign: 'center' },
    retryButton: { marginTop: 20, backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryButtonText: { color: '#fff', fontWeight: '600' },
    scrollContent: { padding: 16 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
    headerDate: { fontSize: 14, color: '#64748B' },
    mainStatCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    mainStatLabel: { fontSize: 14, color: '#64748B' },
    mainStatValue: { fontSize: 32, fontWeight: '700', color: '#10B981', marginTop: 4 },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCardSmall: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    statCardSmallValue: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginTop: 8 },
    statCardSmallLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
    section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 12 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    itemName: { fontSize: 14, color: '#334155' },
    itemSubText: { fontSize: 12, color: '#9CA3AF' },
    itemValue: { fontSize: 14, fontWeight: '500', color: '#334155' },
    emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 10 },
    alertCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 8, padding: 12, alignItems: 'center', gap: 10 },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: '600', color: '#D97706' },
    alertMessage: { fontSize: 12, color: '#B45309' },
});