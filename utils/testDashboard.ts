// utils/testDashboard.ts

import { supabase } from '../services/supabase';
import { 
  getDashboardData,
  DashboardStats,
  TopSellingItem,
  RecentActivity,
  Alert
} from '../services/dashboardService';

/**
 * Test 1: Kiểm tra kết nối cơ bản đến Supabase
 */
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('menu_items') // Thử lấy dữ liệu từ một bảng bất kỳ
      .select('id')
      .limit(1);
      
    if (error) throw error;
    return { success: true, message: 'Connection successful!', data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Test 2: Lấy dữ liệu thô từ bảng 'orders' để kiểm tra
 */
export const testOrdersData = async (limit = 5) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

/**
 * Test 3: Lấy dữ liệu thô từ bảng 'order_items' để kiểm tra
 */
export const testOrderItemsData = async (limit = 5) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, menu_items(name)') // Join với menu_items để lấy tên món
    .limit(limit);
    
  if (error) throw error;
  return data;
};

/**
 * Test 4: Chạy tất cả các hàm dashboard (giờ chỉ còn getDashboardData)
 */
export const testAllDashboardFunctions = async () => {
  console.log('--- Running getDashboardData ---');
  const dashboardData = await getDashboardData();
  console.log('Result:', dashboardData);
  return dashboardData;
};

/**
 * Hàm tiện ích: Tạo dữ liệu giả (mock data) để test UI
 */
export const getMockDashboardData = (): {
  stats: DashboardStats;
  topItems: TopSellingItem[];
  activities: RecentActivity[];
  alerts: Alert[];
} => {
  return {
    stats: {
      todayRevenue: 1250000,
      todayOrders: 15,
      todayCustomers: 8,
      todayProfit: 375000,
      serviceRate: 93,
    },
    topItems: [
      { id: '1', name: 'Trà Sữa Trân Châu', quantity: 25, revenue: 625000, percentage: 100 },
      { id: '2', name: 'Cà Phê Sữa Đá', quantity: 18, revenue: 450000, percentage: 72 },
      { id: '3', name: 'Bạc Xỉu', quantity: 12, revenue: 360000, percentage: 48 },
    ],
    activities: [
      { id: 'act1', type: 'payment', title: 'Bàn 5 đã thanh toán', timestamp: new Date(), amount: 150000 },
      { id: 'act2', type: 'order', title: 'Bàn 2 đã đặt món', timestamp: new Date(Date.now() - 300000) },
      { id: 'act3', type: 'payment', title: 'Bàn 8 đã thanh toán', timestamp: new Date(Date.now() - 600000), amount: 95000 },
    ],
    alerts: [
      { id: 'alert1', type: 'warning', title: 'Trà đang sắp hết', message: 'Cần bổ sung nguyên liệu' },
    ],
  };
};