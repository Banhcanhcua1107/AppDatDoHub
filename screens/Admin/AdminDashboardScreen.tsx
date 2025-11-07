// screens/Admin/AdminDashboardScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminMenuScreen from './AdminMenuScreen';
import AdminOrdersScreen from './AdminOrdersScreen';
import AdminUsersScreen from './AdminUsersScreen';
import AdminReportsScreen from './AdminReportsScreen';

interface DashboardData {
  kpis: { total_revenue: number; total_orders: number };
  totalUsers: number;
  totalMenuItems: number;
}

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}> = ({ label, value, icon, color }) => (
  <View style={styles.statCardWrapper}>
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const FeatureButton: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.featureButtonWrapper}>
    <View style={styles.featureButton}>
      <View style={[styles.featureIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </View>
  </TouchableOpacity>
);

type Props = { navigation: any };

export default function AdminDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<'menu' | 'orders' | 'users' | 'reports' | null>(null);

  const loadDashboardData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const { data: overviewData, error: overviewError } = await supabase.rpc('get_dashboard_overview');
      if (overviewError) throw new Error('Không thể lấy dữ liệu tổng quan.');

      const { count: userCount, error: userError } = await supabase
        .from('profiles').select('*', { count: 'exact', head: true });
      if (userError) throw new Error('Không thể đếm số nhân viên.');

      const { count: menuCount, error: menuError } = await supabase
        .from('menu_items').select('*', { count: 'exact', head: true });
      if (menuError) throw new Error('Không thể đếm số sản phẩm.');

      setData({
        kpis: overviewData.kpis,
        totalUsers: userCount || 0,
        totalMenuItems: menuCount || 0,
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const features = [
    { id: 'menu', title: 'Quản lý Menu', description: 'Thêm, sửa, xóa sản phẩm', icon: 'restaurant' as const, color: '#FF6B6B', onPress: () => { setActiveModal('menu'); setModalVisible(true); } },
    { id: 'orders', title: 'Quản lý Đơn hàng', description: 'Xem tất cả đơn hàng', icon: 'list-circle' as const, color: '#4ECDC4', onPress: () => { setActiveModal('orders'); setModalVisible(true); } },
    { id: 'users', title: 'Quản lý Nhân viên', description: 'Quản lý tài khoản nhân viên', icon: 'people' as const, color: '#FFD93D', onPress: () => { setActiveModal('users'); setModalVisible(true); } },
    { id: 'reports', title: 'Báo cáo Doanh thu', description: 'Doanh thu theo tuần/tháng', icon: 'stats-chart' as const, color: '#6BCB77', onPress: () => { setActiveModal('reports'); setModalVisible(true); } },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.headerGreeting}>Xin chào 👋</Text>
          <Text style={styles.headerUser}>{userProfile?.full_name || 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={() => loadDashboardData(true)} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng Quan Hôm Nay</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Doanh Thu" value={`${((data?.kpis?.total_revenue || 0) / 1000000).toFixed(1)}M`} icon="trending-up" color="#10B981" />
            <StatCard label="Đơn Hàng" value={data?.kpis?.total_orders?.toString() || '0'} icon="receipt" color="#3B82F6" />
            <StatCard label="Nhân Viên" value={data?.totalUsers?.toString() || '0'} icon="people" color="#F59E0B" />
            <StatCard label="Sản Phẩm" value={data?.totalMenuItems?.toString() || '0'} icon="restaurant" color="#8B5CF6" />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức Năng Chính</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <FeatureButton key={feature.id} {...feature} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal cho Menu */}
      <Modal visible={modalVisible && activeModal === 'menu'} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <AdminMenuScreen onClose={() => setModalVisible(false)} />
      </Modal>

      {/* Modal cho Orders */}
      <Modal visible={modalVisible && activeModal === 'orders'} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <AdminOrdersScreen onClose={() => setModalVisible(false)} />
      </Modal>

      {/* Modal cho Users */}
      <Modal visible={modalVisible && activeModal === 'users'} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <AdminUsersScreen onClose={() => setModalVisible(false)} />
      </Modal>

      {/* Modal cho Reports */}
      <Modal visible={modalVisible && activeModal === 'reports'} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <AdminReportsScreen onClose={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
  loadingContainer: { flex: 1, backgroundColor: '#FAFBFC', justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  headerUser: { color: '#1F2937', fontSize: 26, fontWeight: '700', marginTop: 4 },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: '#1F2937', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, justifyContent: 'space-between', gap: 10 },
  statCardWrapper: {
    width: '48%',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  // Features Section
  featuresContainer: { gap: 8 },
  featureButtonWrapper: {
    marginBottom: 6,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  featureDescription: { fontSize: 12, color: '#9CA3AF', fontWeight: '400' },
});
