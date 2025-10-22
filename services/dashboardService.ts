// services/dashboardService.ts

import { supabase } from './supabase';

// Giữ lại các interface
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

// Interface cho dữ liệu thô từ hàm RPC
interface RPCData {
    id: string;
    name?: string;
    quantity?: number;
    revenue?: number;
    price?: number;
    status?: string;
    created_at?: string;
    amount?: number;
    table_id?: string;
}


// Hàm getAlerts giữ lại vì logic khác biệt
export const getAlerts = async (): Promise<Alert[]> => {
  const alerts: Alert[] = [];
  try {
    // Logic lấy cảnh báo đơn giản, có thể mở rộng sau
    const { data: unavailableItems } = await supabase
      .from('menu_items').select('name').eq('available', false).limit(3);
    if (unavailableItems && unavailableItems.length > 0) {
      alerts.push({
        id: 'unavailable', type: 'warning', title: 'Món hết hàng',
        message: unavailableItems.map(i => i.name).join(', '),
      });
    }
  } catch (error) { console.error(error); }
  return alerts;
};

/**
 * Hàm DUY NHẤT để lấy tất cả dữ liệu dashboard
 */
export const getDashboardData = async () => {
  try {
    console.log('🚀 Calling RPC `get_dashboard_data`...');
    const { data, error } = await supabase.rpc('get_dashboard_data');

    if (error) throw error;
    
    // Nếu không có data, trả về object mặc định để tránh lỗi
    if (!data) throw new Error("No data returned from RPC");

    const statsRaw = data.stats || {};
    const topItemsRaw: RPCData[] = data.topItems || [];
    const activitiesRaw: RPCData[] = data.activities || [];

    // Xử lý Stats
    const todayRevenue = Number(statsRaw.todayRevenue || 0);
    const todayOrders = Number(statsRaw.todayOrders || 0);
    const paidOrdersCount = Number(statsRaw.paidOrdersCount || 0);

    const stats: DashboardStats = {
        todayRevenue,
        todayOrders,
        todayCustomers: Number(statsRaw.todayCustomers || 0),
        todayProfit: Math.round(todayRevenue * 0.3),
        serviceRate: todayOrders > 0 ? Math.round((paidOrdersCount / todayOrders) * 100) : 0,
    };

    // Xử lý Top Items (đã fix lỗi 'item' implicitly has an 'any' type)
    const maxQuantity = topItemsRaw[0]?.quantity || 1;
    const topItems: TopSellingItem[] = topItemsRaw.map((item) => ({
      id: item.id,
      name: item.name || 'Unknown',
      quantity: Number(item.quantity || 0),
      revenue: Number(item.revenue || 0),
      percentage: Math.round((Number(item.quantity || 0) / maxQuantity) * 100),
    }));

    // Xử lý Activities (đã fix lỗi 'a' implicitly has an 'any' type)
    const activities: RecentActivity[] = activitiesRaw.map((act) => {
        let type: RecentActivity['type'] = 'order';
        const status = act.status || '';
        // Lấy tên bàn từ trường name nếu có, hoặc từ table_id
        const tableName = act.name || `Bàn ${act.table_id || 'N/A'}`;
        let title = `${tableName} đã đặt món`;

        if (['completed', 'paid', 'closed'].includes(status)) {
            type = 'payment';
            title = `${tableName} đã thanh toán`;
        }
        return {
            id: act.id,
            type: type,
            title: title,
            timestamp: new Date(act.created_at || Date.now()),
            amount: type === 'payment' ? Math.round(Number(act.amount || 0)) : undefined,
        };
    });
    
    const alerts = await getAlerts();

    return { stats, topItems, activities, alerts };

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    // Trả về dữ liệu rỗng an toàn
    return {
      stats: { todayRevenue: 0, todayOrders: 0, todayCustomers: 0, todayProfit: 0, serviceRate: 0 },
      topItems: [], activities: [], alerts: [],
    };
  }
};