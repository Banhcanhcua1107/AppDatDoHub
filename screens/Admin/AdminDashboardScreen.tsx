// screens/Admin/AdminDashboardScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen({ navigation }: Props) {
  console.log("✅ [AdminDashboardScreen] Rendering admin dashboard...");
  
  const { userProfile } = useAuth();
  console.log("🔍 [AdminDashboardScreen] userProfile:", userProfile);
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalMenuItems: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // TODO: Gọi API để lấy thống kê
      setStats({
        totalOrders: 1250,
        totalRevenue: 125000000,
        totalUsers: 45,
        totalMenuItems: 80,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const menuItems = [
    {
      id: 'menu',
      title: 'Quản lý Menu & Sản phẩm',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: '🍽️',
      onPress: () => navigation.navigate('AdminMenu'),
    },
    {
      id: 'orders',
      title: 'Quản lý Đơn hàng',
      description: 'Xem và quản lý tất cả đơn hàng',
      icon: '📋',
      onPress: () => navigation.navigate('AdminOrders'),
    },
    {
      id: 'users',
      title: 'Quản lý Nhân viên & Phân quyền',
      description: 'Quản lý tài khoản nhân viên',
      icon: '👥',
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      id: 'reports',
      title: 'Báo cáo Doanh thu',
      description: 'Doanh thu theo tuần/tháng',
      icon: '📊',
      onPress: () => navigation.navigate('AdminReports'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Xin chào, {userProfile?.full_name || 'Admin'}!</Text>
        <Text style={styles.subtitle}>Trang quản lý hệ thống</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders.toString()}
          color={COLORS.primary}
        />
        <StatCard
          title="Doanh Thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          color={COLORS.success}
        />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Nhân Viên"
          value={stats.totalUsers.toString()}
          color={COLORS.warning}
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalMenuItems.toString()}
          color={COLORS.info}
        />
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Chức Năng Quản Lý</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.primary,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#999',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#999',
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '300',
  },
});
