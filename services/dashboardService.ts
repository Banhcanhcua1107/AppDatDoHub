// services/dashboardService.ts

import { supabase } from './supabase';

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  todayProfit: number;
  serviceRate: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'inventory' | 'table';
  title: string;
  timestamp: Date;
  amount?: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

/**
 * Lấy thống kê tổng quan cho dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Lấy tất cả orders hôm nay
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', todayISO);

    if (ordersError) throw ordersError;

    // Tính toán thống kê
    const todayOrders = orders?.length || 0;
    const todayRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    // Đếm số khách hàng unique (nếu có field table_id hoặc customer_id)
    const uniqueTables = new Set(orders?.map(o => o.table_id).filter(Boolean));
    const todayCustomers = uniqueTables.size;

    // Tính lợi nhuận ước tính (70% doanh thu - có thể điều chỉnh)
    const todayProfit = todayRevenue * 0.3;

    // Tính tỷ lệ phục vụ (đơn hoàn thành / tổng đơn)
    const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'paid').length || 0;
    const serviceRate = todayOrders > 0 ? (completedOrders / todayOrders) * 100 : 0;

    return {
      todayRevenue,
      todayOrders,
      todayCustomers,
      todayProfit,
      serviceRate: Math.round(serviceRate),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Trả về dữ liệu mặc định nếu lỗi
    return {
      todayRevenue: 0,
      todayOrders: 0,
      todayCustomers: 0,
      todayProfit: 0,
      serviceRate: 0,
    };
  }
};

/**
 * Lấy danh sách món bán chạy nhất
 */
export const getTopSellingItems = async (limit: number = 10): Promise<TopSellingItem[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Lấy order_items từ các orders hôm nay, join với menu_items để lấy tên món và giá
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        menu_item_id,
        menu_items(name, price),
        orders!inner(created_at)
      `)
      .gte('orders.created_at', todayISO);

    if (error) throw error;

    // Gom nhóm theo tên món và tính tổng
    const itemsMap = new Map<string, { quantity: number; revenue: number }>();
    
    orderItems?.forEach((item: any) => {
      const name = item.menu_items?.name || 'Không rõ';
      const price = item.menu_items?.price || 0;
      const existing = itemsMap.get(name) || { quantity: 0, revenue: 0 };
      itemsMap.set(name, {
        quantity: existing.quantity + (item.quantity || 0),
        revenue: existing.revenue + (item.quantity * price || 0),
      });
    });

    // Chuyển sang array và sắp xếp
    const itemsArray = Array.from(itemsMap.entries()).map(([name, data], index) => ({
      id: index.toString(),
      name,
      quantity: data.quantity,
      revenue: data.revenue,
      percentage: 0, // Sẽ tính sau
    }));

    // Sắp xếp theo quantity giảm dần
    itemsArray.sort((a, b) => b.quantity - a.quantity);

    // Lấy top items
    const topItems = itemsArray.slice(0, limit);

    // Tính percentage (so với món bán nhiều nhất)
    const maxQuantity = topItems[0]?.quantity || 1;
    topItems.forEach(item => {
      item.percentage = (item.quantity / maxQuantity) * 100;
    });

    return topItems;
  } catch (error) {
    console.error('Error fetching top selling items:', error);
    return [];
  }
};

/**
 * Lấy hoạt động gần đây
 */
export const getRecentActivities = async (limit: number = 5): Promise<RecentActivity[]> => {
  try {
    // Lấy các orders gần nhất
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const activities: RecentActivity[] = orders?.map((order: any) => {
      let type: 'order' | 'payment' | 'inventory' | 'table' = 'order';
      let title = `Đơn hàng #${order.id}`;

      if (order.status === 'completed' || order.status === 'paid') {
        type = 'payment';
        title = `Đơn hàng #${order.id} đã thanh toán`;
      } else if (order.status === 'pending') {
        type = 'table';
        title = `Bàn ${order.table_name || order.table_id} đang order`;
      }

      return {
        id: order.id,
        type,
        title,
        timestamp: new Date(order.created_at),
        amount: order.status === 'completed' || order.status === 'paid' ? order.total_amount : undefined,
      };
    }) || [];

    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

/**
 * Lấy cảnh báo
 */
export const getAlerts = async (): Promise<Alert[]> => {
  const alerts: Alert[] = [];

  try {
    // Kiểm tra món sắp hết hàng
    const { data: lowStockItems, error: stockError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', false)
      .limit(10);

    if (!stockError && lowStockItems && lowStockItems.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        title: `${lowStockItems.length} món sắp hết hàng`,
        message: 'Cần nhập kho nguyên liệu',
      });
    }

    // Kiểm tra đơn hàng chưa xử lý
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending');

    if (!ordersError && pendingOrders && pendingOrders.length > 0) {
      alerts.push({
        id: 'pending-orders',
        type: 'info',
        title: `${pendingOrders.length} đơn hàng chưa xử lý`,
        message: 'Đang chờ xác nhận',
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

/**
 * Lấy tất cả dữ liệu dashboard
 */
export const getDashboardData = async () => {
  try {
    const [stats, topItems, activities, alerts] = await Promise.all([
      getDashboardStats(),
      getTopSellingItems(3),
      getRecentActivities(3),
      getAlerts(),
    ]);

    return {
      stats,
      topItems,
      activities,
      alerts,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
