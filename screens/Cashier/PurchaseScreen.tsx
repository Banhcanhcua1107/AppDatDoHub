// screens/Cashier/PurchaseScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';

// Types
interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

interface PurchaseStats {
  totalCost: number;
  totalOrders: number;
  ingredientsNeedReorder: number;
}

interface ActivityItem {
  id: string;
  type: 'completed' | 'low_stock';
  title: string;
  description: string;
  timestamp: string;
}

// Dashboard Component
const DashboardTab = ({ stats, navigation, recentActivities }: { stats: PurchaseStats; navigation: any; recentActivities: ActivityItem[] }) => (
  <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
    {/* Stats Cards */}
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="cash-outline" size={24} color="#3B82F6" />
        </View>
        <Text style={styles.statLabel}>Chi phí mua hàng</Text>
        <Text style={styles.statValue}>{(stats.totalCost / 1000000).toFixed(1)}M ₫</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="document-outline" size={24} color="#10B981" />
        </View>
        <Text style={styles.statLabel}>Phiếu nhập</Text>
        <Text style={styles.statValue}>{stats.totalOrders}</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconBox, { backgroundColor: '#FEF9C3' }]}>
          <Ionicons name="alert-circle-outline" size={24} color="#D97706" />
        </View>
        <Text style={styles.statLabel}>Cần nhập</Text>
        <Text style={styles.statValue}>{stats.ingredientsNeedReorder}</Text>
      </View>
    </View>

    {/* Quick Actions */}
    <Text style={styles.sectionTitle}>Hành động nhanh</Text>
    <View style={styles.actionsGrid}>
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => navigation.navigate('CreatePurchaseOrder')}
      >
        <Ionicons name="add-circle-outline" size={28} color="#3B82F6" />
        <Text style={styles.actionLabel}>Tạo phiếu</Text>
        <Text style={styles.actionDesc}>nhập mới</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => navigation.navigate('Inventory')}
      >
        <Ionicons name="list-outline" size={28} color="#10B981" />
        <Text style={styles.actionLabel}>Xem phiếu</Text>
        <Text style={styles.actionDesc}>nhập kho</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => {}}
      >
        <Ionicons name="cube-outline" size={28} color="#8B5CF6" />
        <Text style={styles.actionLabel}>Nguyên liệu</Text>
        <Text style={styles.actionDesc}>cần nhập</Text>
      </TouchableOpacity>
    </View>

    {/* Recent Activity */}
    <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
    <View style={styles.activityCard}>
      {recentActivities.length > 0 ? (
        recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View 
              style={[
                styles.activityIcon, 
                { 
                  backgroundColor: activity.type === 'completed' ? '#EFF6FF' : '#FEF9C3' 
                }
              ]}
            >
              <Ionicons 
                name={activity.type === 'completed' ? 'checkmark-circle-outline' : 'alert-circle-outline'} 
                size={20} 
                color={activity.type === 'completed' ? '#3B82F6' : '#D97706'} 
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyActivityContainer}>
          <Text style={styles.emptyActivityText}>Chưa có hoạt động gần đây</Text>
        </View>
      )}
    </View>
  </ScrollView>
);

// Ingredients Tab Component
const IngredientsTab = () => {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const loadIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      
      // Chỉ lấy những nguyên liệu cần nhập (hết hoặc sắp hết)
      const needsReorder = data?.filter(ing => ing.stock_quantity <= ing.low_stock_threshold) || [];
      setIngredients(needsReorder);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadIngredients();
  }, [loadIngredients]));

  const getStockStatus = (current: number, threshold: number) => {
    if (current <= 0) return { color: '#EF4444', label: 'Hết', icon: '🔴', recommendation: 'Cần nhập ngay' };
    if (current <= threshold) return { color: '#D97706', label: 'Sắp hết', icon: '🟠', recommendation: 'Nên nhập hôm nay' };
    return { color: '#10B981', label: 'Đủ', icon: '🟢', recommendation: 'Tồn kho ổn định' };
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#3B82F6" />;
  }

  return (
    <FlatList
      data={ingredients}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.tabContent}
      renderItem={({ item }) => {
        const status = getStockStatus(item.stock_quantity, item.low_stock_threshold);
        
        return (
          <TouchableOpacity style={styles.ingredientCard} activeOpacity={0.7}>
            {/* Header: Name + Status */}
            <View style={styles.ingredientCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.ingredientUnit}>{item.unit}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.icon}
                </Text>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>

            {/* Tồn kho hiện tại */}
            <View style={styles.stockRow}>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Còn lại</Text>
                <Text style={styles.stockValue}>{item.stock_quantity.toFixed(1)} {item.unit}</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Cần tối thiểu</Text>
                <Text style={styles.stockValue}>{item.low_stock_threshold.toFixed(1)} {item.unit}</Text>
              </View>
            </View>

            {/* Nút Nhập */}
            <TouchableOpacity style={styles.importButton}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.importButtonText}>Nhập nguyên liệu</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
          <Text style={styles.emptyTitle}>Tất cả nguyên liệu đều đủ</Text>
          <Text style={styles.emptyDesc}>Không có nguyên liệu nào cần nhập</Text>
        </View>
      }
    />
  );
};

// Expense Tab Component
const ExpenseTab = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filterRange, setFilterRange] = useState<'today' | 'week' | 'month'>('today');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      // Tính ngày bắt đầu dựa trên filter
      const today = new Date();
      const startDate = new Date();
      
      if (filterRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (filterRange === 'week') {
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách chi phí');
    } finally {
      setLoading(false);
    }
  }, [filterRange]);

  useFocusEffect(useCallback(() => {
    loadExpenses();
  }, [loadExpenses]));

  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Tính chi phí trung bình 7 ngày
  const calculateAverage = () => {
    if (filterRange === 'week') {
      return (totalExpenses / 7).toFixed(0);
    }
    return null;
  };

  const filterLabel = {
    today: 'Hôm nay',
    week: '7 ngày qua',
    month: 'Tháng này',
  }[filterRange];

  const avgExpense = calculateAverage();

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#3B82F6" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['today', 'week', 'month'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.filterButton,
              filterRange === range && styles.filterButtonActive,
            ]}
            onPress={() => setFilterRange(range)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterRange === range && styles.filterButtonTextActive,
              ]}
            >
              {range === 'today' ? 'Hôm nay' : range === 'week' ? 'Tuần' : 'Tháng'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total Expense Card */}
      <View style={styles.expenseSummary}>
        <View style={styles.expenseSummaryHeader}>
          <View>
            <Text style={styles.expenseSummaryLabel}>Tổng chi phí {filterLabel}</Text>
            <Text style={styles.expenseSummaryValue}>{(totalExpenses / 1000).toFixed(0)}K ₫</Text>
          </View>
          <View style={styles.expenseStats}>
            <Text style={styles.expenseStatsLabel}>{expenses.length} khoản</Text>
            {avgExpense && (
              <Text style={styles.expenseStatsAvg}>Trung bình: {avgExpense}K/ngày</Text>
            )}
          </View>
        </View>
      </View>

      {/* Category Summary */}
      {expenses.length > 0 && (
        <View style={styles.categorySummary}>
          {Array.from(
            new Map(
              expenses.map(exp => [
                exp.category || 'Khác',
                expenses.filter(e => (e.category || 'Khác') === (exp.category || 'Khác')).reduce((sum, e) => sum + e.amount, 0),
              ])
            ).entries()
          ).map(([category, total], index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>{(total / 1000).toFixed(0)}K</Text>
            </View>
          ))}
        </View>
      )}

      {/* Expense List */}
      <Text style={styles.expenseListTitle}>Chi tiết từng khoản</Text>
      {expenses.map((item, index) => (
        <View key={index} style={styles.expenseItem}>
          <View style={styles.expenseIcon}>
            <Ionicons name="document-text-outline" size={20} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.expenseDesc}>{item.description}</Text>
            <View style={styles.expenseMetadata}>
              {item.category && (
                <Text style={styles.expenseMeta}>📁 {item.category}</Text>
              )}
              <Text style={styles.expenseMeta}>
                {item.payment_method === 'cash' ? '💵' : item.payment_method === 'momo' ? '📱' : '🏦'} {item.payment_method}
              </Text>
            </View>
          </View>
          <View style={styles.expenseAmountBox}>
            <Text style={styles.expenseAmount}>{(item.amount / 1000).toFixed(0)}K</Text>
            <Text style={styles.expenseDate}>{new Date(item.expense_date).toLocaleDateString('vi-VN')}</Text>
          </View>
        </View>
      ))}

      {expenses.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Chưa có chi phí {filterLabel.toLowerCase()}</Text>
        </View>
      )}
    </ScrollView>
  );
};

// Main Component
export default function PurchaseScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingredients' | 'expenses'>('dashboard');
  const [stats, setStats] = useState<PurchaseStats>({ totalCost: 0, totalOrders: 0, ingredientsNeedReorder: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Lấy dữ liệu thống kê
  const loadStats = useCallback(async () => {
    try {
      // Lấy số lượng phiếu
      const { count: orderCount } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true });

      // Lấy tổng chi phí từ tất cả purchase orders (dựa trên số lượng đã mua)
      const { data: allOrders } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          purchase_order_items (
            quantity,
            ingredients (
              id
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Tính toán chi phí ước tính dựa trên tần suất mua
      let totalCost = 0;
      if (allOrders) {
        // Lấy thống kê tần suất
        const itemCounts: { [key: string]: number } = {};
        allOrders.forEach((order: any) => {
          order.purchase_order_items?.forEach((item: any) => {
            const ingId = item.ingredients?.id;
            if (ingId) {
              itemCounts[ingId] = (itemCounts[ingId] || 0) + item.quantity;
            }
          });
        });

        // Lấy danh sách nguyên liệu để lấy giá (nếu có)
        const ingredientIds = Object.keys(itemCounts);
        if (ingredientIds.length > 0) {
          // Ước tính chi phí (có thể điều chỉnh sau)
          totalCost = ingredientIds.length * 500000; // Mock estimation
        }
      }

      // Lấy số nguyên liệu cần nhập
      const { data: ingredientData } = await supabase
        .from('ingredients')
        .select('stock_quantity, low_stock_threshold');

      const needReorder = ingredientData?.filter(i => i.stock_quantity <= i.low_stock_threshold).length || 0;

      setStats({
        totalCost,
        totalOrders: orderCount || 0,
        ingredientsNeedReorder: needReorder,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  // Lấy hoạt động gần đây từ purchase_orders và ingredients
  const loadRecentActivities = useCallback(async () => {
    try {
      const activities: ActivityItem[] = [];

      // Lấy phiếu nhập gần đây (hoàn thành)
      const { data: recentOrders } = await supabase
        .from('purchase_orders')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentOrders) {
        recentOrders.forEach((order, index) => {
          activities.push({
            id: `order-${order.id}`,
            type: 'completed',
            title: `Phiếu #${order.id.substring(0, 6)} đã hoàn thành`,
            description: 'Phiếu nhập kho',
            timestamp: format(new Date(order.created_at), "HH:mm 'ngày' dd/MM"),
          });
        });
      }

      // Lấy nguyên liệu sắp hết hoặc hết
      const { data: allIngredients } = await supabase
        .from('ingredients')
        .select('id, name, stock_quantity, low_stock_threshold')
        .order('stock_quantity', { ascending: true })
        .limit(10);

      const lowStockIngredients = allIngredients?.filter(ing => 
        ing.stock_quantity <= ing.low_stock_threshold
      ).slice(0, 2) || [];

      if (lowStockIngredients && lowStockIngredients.length > 0) {
        lowStockIngredients.forEach((ingredient: any) => {
          activities.push({
            id: `stock-${ingredient.id}`,
            type: 'low_stock',
            title: `${ingredient.name} ${ingredient.stock_quantity <= 0 ? 'hết' : 'sắp hết'}`,
            description: `Còn ${ingredient.stock_quantity} - Ngưỡng ${ingredient.low_stock_threshold}`,
            timestamp: 'Hôm nay',
          });
        });
      }

      setRecentActivities(activities.slice(0, 5)); // Lấy tối đa 5 hoạt động
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }, []);

  // Load dữ liệu khi vào màn hình
  useFocusEffect(useCallback(() => {
    setLoadingStats(true);
    Promise.all([loadStats(), loadRecentActivities()]).finally(() => {
      setLoadingStats(false);
    });
  }, [loadStats, loadRecentActivities]));

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'bar-chart-outline' },
    { id: 'ingredients', label: 'Nguyên liệu', icon: 'cube-outline' },
    { id: 'expenses', label: 'Chi phí', icon: 'cash-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Mua hàng</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? '#3B82F6' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.id && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {loadingStats && activeTab === 'dashboard' ? (
        <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#3B82F6" />
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} navigation={navigation} recentActivities={recentActivities} />}
          {activeTab === 'ingredients' && <IngredientsTab />}
          {activeTab === 'expenses' && <ExpenseTab />}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // Tab Navigation
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  // Dashboard Tab
  tabContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // Actions
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Activity
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Ingredients Tab
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ingredientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  ingredientUnit: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  stockItem: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  importButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // Expense Tab
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  expenseSummary: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  expenseSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseSummaryLabel: {
    fontSize: 13,
    color: '#7F1D1D',
    fontWeight: '500',
  },
  expenseSummaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC2626',
    marginVertical: 4,
  },
  expenseStats: {
    alignItems: 'flex-end',
  },
  expenseStatsLabel: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  expenseStatsAvg: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 4,
  },
  categorySummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  expenseListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  expenseSummaryCount: {
    fontSize: 12,
    color: '#991B1B',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  expenseMetadata: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  expenseMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  expenseCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  expenseAmountBox: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  expenseDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  
  // Recommendation Box
  recommendationBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  
  // Empty Activity
  emptyActivityContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});