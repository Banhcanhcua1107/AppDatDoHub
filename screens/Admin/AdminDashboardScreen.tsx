import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

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
  <View className="w-1/2 p-2">
    <View className="bg-white rounded-xl p-4 items-center" style={{ elevation: 2 }}>
      <Ionicons name={icon} size={28} color={color} />
      <Text className="text-lg font-bold text-gray-800 mt-2">{value}</Text>
      <Text className="text-xs text-gray-500 mt-1 text-center">{label}</Text>
    </View>
  </View>
);

const MenuButton: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <View className="bg-white rounded-2xl p-4 mb-3" style={{ elevation: 2 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name={icon} size={32} color={color} />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-gray-800">{title}</Text>
            <Text className="text-xs text-gray-500 mt-1">{description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </View>
    </View>
  </TouchableOpacity>
);

type Props = { navigation: any };

export default function AdminDashboardScreen({ navigation }: Props) {
  const { userProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const menuItems = [
    {
      id: 'menu',
      title: 'Quản lý Menu',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: 'restaurant' as const,
      color: '#FF6B6B',
      onPress: () => navigation.navigate('AdminMenu'),
    },
    {
      id: 'orders',
      title: 'Quản lý Đơn hàng',
      description: 'Xem tất cả đơn hàng',
      icon: 'list-circle' as const,
      color: '#4ECDC4',
      onPress: () => navigation.navigate('AdminOrders'),
    },
    {
      id: 'users',
      title: 'Quản lý Nhân viên',
      description: 'Quản lý tài khoản nhân viên',
      icon: 'people' as const,
      color: '#FFD93D',
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      id: 'reports',
      title: 'Báo cáo Doanh thu',
      description: 'Doanh thu theo tuần/tháng',
      icon: 'stats-chart' as const,
      color: '#6BCB77',
      onPress: () => navigation.navigate('AdminReports'),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="bg-blue-500 px-6 py-6">
          <Text className="text-white text-sm font-medium opacity-80">Xin chào 👋</Text>
          <Text className="text-white text-3xl font-bold mt-1">{userProfile?.full_name || 'Admin'}</Text>
        </View>

        <View className="px-4 py-6">
          <Text className="text-gray-800 text-base font-bold mb-4">Tổng Quan Hôm Nay</Text>
          <View className="flex-row flex-wrap justify-between">
            <StatCard label="Doanh Thu" value={`${((data?.kpis?.total_revenue || 0) / 1000000).toFixed(1)}M`} icon="trending-up" color="#10B981" />
            <StatCard label="Đơn Hàng" value={data?.kpis?.total_orders?.toString() || '0'} icon="receipt" color="#3B82F6" />
            <StatCard label="Nhân Viên" value={data?.totalUsers?.toString() || '0'} icon="people" color="#F59E0B" />
            <StatCard label="Sản Phẩm" value={data?.totalMenuItems?.toString() || '0'} icon="restaurant" color="#8B5CF6" />
          </View>
        </View>

        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 text-base font-bold">Chức Năng Chính</Text>
            <TouchableOpacity onPress={loadDashboardData} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {menuItems.map((item) => (
            <MenuButton key={item.id} title={item.title} description={item.description} icon={item.icon} color={item.color} onPress={item.onPress} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
