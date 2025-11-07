// screens/Admin/AdminDashboardScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase'; // Import Supabase client

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

// Kiểu dữ liệu khớp với kết quả trả về từ RPC
interface DashboardData {
  kpis: {
    total_revenue: number;
    total_orders: number;
  };
  totalUsers: number;
  totalMenuItems: number;
}

export default function AdminDashboardScreen({ navigation }: Props) {
  const { userProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Gọi RPC function để lấy dữ liệu tổng quan
      const { data: overviewData, error: overviewError } = await supabase.rpc('get_dashboard_overview');
      if (overviewError) throw new Error("Không thể lấy dữ liệu tổng quan.");

      // Lấy tổng số nhân viên
      const { count: userCount, error: userError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (userError) throw new Error("Không thể đếm số nhân viên.");
      
      // Lấy tổng số sản phẩm
      const { count: menuCount, error: menuError } = await supabase.from('menu_items').select('*', { count: 'exact', head: true });
      if (menuError) throw new Error("Không thể đếm số sản phẩm.");

      setData({
        kpis: overviewData.kpis,
        totalUsers: userCount || 0,
        totalMenuItems: menuCount || 0,
      });

    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'menu', title: 'Quản lý Menu', description: 'Thêm, sửa, xóa sản phẩm', icon: '🍽️', onPress: () => navigation.navigate('AdminMenu'), color: '#FF6B6B' },
    { id: 'orders', title: 'Quản lý Đơn hàng', description: 'Xem và quản lý tất cả đơn hàng', icon: '📋', onPress: () => navigation.navigate('AdminOrders'), color: '#4ECDC4' },
    { id: 'users', title: 'Quản lý Nhân viên', description: 'Quản lý tài khoản nhân viên', icon: '👥', onPress: () => navigation.navigate('AdminUsers'), color: '#FFD93D' },
    { id: 'reports', title: 'Báo cáo Doanh thu', description: 'Doanh thu theo tuần/tháng', icon: '📊', onPress: () => navigation.navigate('AdminReports'), color: '#6BCB77' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Xin chào 👋</Text>
            <Text style={styles.userName}>{userProfile?.full_name || 'Admin'}</Text>
          </View>
        </View>

        {/* KPI Stats - Horizontal Scroll */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionLabel}>Tổng Quan Hôm Nay</Text>
          <View style={styles.kpiGrid}>
            <KPICard 
              label="Doanh Thu"
              value={`${((data?.kpis?.total_revenue || 0) / 1000000).toFixed(1)}M`}
              icon="trending-up"
            />
            <KPICard 
              label="Đơn Hàng"
              value={data?.kpis?.total_orders?.toString() || '0'}
              icon="receipt"
            />
            <KPICard 
              label="Nhân Viên"
              value={data?.totalUsers?.toString() || '0'}
              icon="people"
            />
            <KPICard 
              label="Sản Phẩm"
              value={data?.totalMenuItems?.toString() || '0'}
              icon="restaurant"
            />
          </View>
        </View>

        {/* Main Functions */}
        <View style={styles.functionsSection}>
          <Text style={styles.sectionLabel}>Chức Năng Chính</Text>
          {menuItems.map((item, index) => (
            <FunctionButton 
              key={item.id}
              item={item}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>Tác Vụ Nhanh</Text>
          <TouchableOpacity style={styles.actionRow} onPress={loadDashboardData} activeOpacity={0.6}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.actionLabel}>Cập nhật dữ liệu</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')} activeOpacity={0.6}>
            <Ionicons name="download" size={20} color={COLORS.primary} />
            <Text style={styles.actionLabel}>Xuất báo cáo</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Component KPICard =====
const KPICard = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) => (
  <View style={styles.kpiCard}>
    <Ionicons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

// ===== Component FunctionButton =====
const FunctionButton = ({ 
  item,
  isLast
}: { 
  item: { 
    id: string;
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  };
  isLast: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.functionRow, !isLast && { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }]}
    onPress={item.onPress}
    activeOpacity={0.6}
  >
    <View style={styles.functionIcon}>
      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
    </View>
    <View style={styles.functionContent}>
      <Text style={styles.functionTitle}>{item.title}</Text>
      <Text style={styles.functionDesc}>{item.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#ddd" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ===== Header =====
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },

  // ===== KPI Section =====
  kpiSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },

  // ===== Functions Section =====
  functionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fafafa',
  },
  functionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  functionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  functionContent: {
    flex: 1,
  },
  functionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  functionDesc: {
    fontSize: 12,
    color: '#999',
  },

  // ===== Actions Section =====
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
});