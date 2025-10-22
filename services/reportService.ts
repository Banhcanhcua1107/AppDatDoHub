// services/reportService.ts

import { supabase } from './supabase';

// ============================================================================
// REPORT INTERFACES
// ============================================================================

export interface SalesReport {
  total_revenue: number;
  total_orders: number;
  top_products: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    percentage: number;
  }[];
  table_revenue: {
    table_id: string;
    table_name: string;
    revenue: number;
  }[];
  hourly_revenue: {
    hour: string;
    revenue: number;
  }[];
}

export interface InventoryReport {
  total_items: number;
  out_of_stock: number;
  low_stock: number;
  low_stock_details: {
    item_id: string;
    item_name: string;
    current_stock: number;
    min_stock: number;
  }[];
}

export interface PurchaseReport {
  total_cost: number;
  cost_count: number;
  suppliers: {
    id: number;
    name: string;
    cost: number;
  }[];
}

export interface ReceivablesReport {
  customer_debt: number;
  supplier_debt: number;
  total_debt: number;
}

export interface CashFlowReport {
  cash_on_hand: number;
  bank_deposit: number;
  total_fund: number;
}

export interface ProfitReport {
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  total_revenue: number;
  total_cogs: number;
  operating_cost: number;
}

export interface Transaction {
  id: string;
  time: string;
  amount: number;
  items: number;
  staff?: string;
  table_name?: string;
  status: 'completed' | 'cancelled' | 'pending';
}

export interface InventoryProduct {
  id: number;
  name: string;
  status: 'normal' | 'out';
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDateForSQL = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '--:--';
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

// ============================================================================
// GET TRANSACTIONS (Real data from database) - FIXED
// ============================================================================

export const getTransactions = async (
  startDate: Date = new Date(),
  endDate: Date = new Date(),
  limit: number = 20
): Promise<Transaction[]> => {
  try {
    const startDateStr = `${formatDateForSQL(startDate)} 00:00:00`;
    const endDateStr = `${formatDateForSQL(endDate)} 23:59:59`;

    // Sử dụng select('*') để linh hoạt với các tên cột khác nhau
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*') 
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching transactions:', error.message);
      return [];
    }
    
    // Xử lý dữ liệu trả về để khớp với interface `Transaction`
    const transactions: Transaction[] = (orders || []).map((order: any) => {
        // Tìm giá trị tổng tiền từ các tên cột có thể có
        const amount = order.total_amount || order.amount || order.total || 0;
        // Tìm số lượng sản phẩm
        const itemCount = order.items_count || order.item_count || order.quantity || 0;
        // Tìm tên nhân viên
        const staffName = order.user_name || order.staff || order.cashier || 'Không rõ';

        return {
            id: order.id || '',
            time: formatTime(order.created_at),
            amount: Number(amount),
            items: Number(itemCount),
            staff: staffName,
            table_name: order.table_name || 'Mang về',
            status: order.status || 'completed',
        };
    });

    return transactions;
  } catch (err) {
    console.error('❌ Exception in getTransactions:', err);
    return [];
  }
};


// ============================================================================
// 1. GET SALES REPORT
// ============================================================================

export const getSalesReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<SalesReport> => {
  try {
    const { data, error } = await supabase.rpc('get_sales_report', {
      p_start_date: formatDateForSQL(startDate),
      p_end_date: formatDateForSQL(endDate),
    });

    if (error) throw error;

    return {
      total_revenue: Number(data?.total_revenue || 0),
      total_orders: Number(data?.total_orders || 0),
      top_products: data?.top_products || [],
      table_revenue: data?.table_revenue || [],
      hourly_revenue: data?.hourly_revenue || [],
    };
  } catch (error) {
    console.error('❌ getSalesReport error:', error);
    throw error;
  }
};

// ============================================================================
// 2. GET INVENTORY REPORT
// ============================================================================

export const getInventoryReport = async (): Promise<InventoryReport> => {
  try {
    const { data, error } = await supabase.rpc('get_inventory_report');
    if (error) throw error;
    return {
      total_items: Number(data?.total_items || 0),
      out_of_stock: Number(data?.out_of_stock || 0),
      low_stock: Number(data?.low_stock || 0),
      low_stock_details: data?.low_stock_details || [],
    };
  } catch (error) {
    console.error('❌ getInventoryReport error:', error);
    throw error;
  }
};

export const getMenuItemsStatus = async (): Promise<InventoryProduct[]> => {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('id, name, is_available')
            .order('name', { ascending: true });

        if (error) throw error;

        const inventoryProducts: InventoryProduct[] = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            status: item.is_available ? 'normal' : 'out',
        }));

        return inventoryProducts;
    } catch (error) {
        console.error('❌ getMenuItemsStatus error:', error);
        throw error;
    }
}


// ============================================================================
// 3. GET PURCHASE REPORT
// ============================================================================

export const getPurchaseReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<PurchaseReport> => {
  try {
    const { data, error } = await supabase.rpc('get_purchase_report', {
      p_start_date: formatDateForSQL(startDate),
      p_end_date: formatDateForSQL(endDate),
    });
    if (error) throw error;
    return {
      total_cost: Number(data?.total_cost || 0),
      cost_count: Number(data?.cost_count || 0),
      suppliers: data?.suppliers || [],
    };
  } catch (error) {
    console.error('❌ getPurchaseReport error:', error);
    throw error;
  }
};

// ============================================================================
// 4. GET RECEIVABLES REPORT
// ============================================================================

export const getReceivablesReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<ReceivablesReport> => {
  try {
    const { data, error } = await supabase.rpc('get_receivables_report', {
      p_start_date: formatDateForSQL(startDate),
      p_end_date: formatDateForSQL(endDate),
    });
    if (error) throw error;
    return {
      customer_debt: Number(data?.customer_debt || 0),
      supplier_debt: Number(data?.supplier_debt || 0),
      total_debt: Number(data?.total_debt || 0),
    };
  } catch (error) {
    console.error('❌ getReceivablesReport error:', error);
    throw error;
  }
};

// ============================================================================
// 5. GET CASH FLOW REPORT
// ============================================================================

export const getCashFlowReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<CashFlowReport> => {
  try {
    const { data, error } = await supabase.rpc('get_cash_flow_report', {
      p_start_date: formatDateForSQL(startDate),
      p_end_date: formatDateForSQL(endDate),
    });
    if (error) throw error;
    return {
      cash_on_hand: Number(data?.cash_on_hand || 0),
      bank_deposit: Number(data?.bank_deposit || 0),
      total_fund: Number(data?.total_fund || 0),
    };
  } catch (error) {
    console.error('❌ getCashFlowReport error:', error);
    throw error;
  }
};

// ============================================================================
// 6. GET PROFIT REPORT
// ============================================================================

export const getProfitReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<ProfitReport> => {
  try {
    const { data, error } = await supabase.rpc('get_profit_report', {
      p_start_date: formatDateForSQL(startDate),
      p_end_date: formatDateForSQL(endDate),
    });
    if (error) throw error;
    return {
      gross_profit: Number(data?.gross_profit || 0),
      net_profit: Number(data?.net_profit || 0),
      profit_margin: Number(data?.profit_margin || 0),
      total_revenue: Number(data?.total_revenue || 0),
      total_cogs: Number(data?.total_cogs || 0),
      operating_cost: Number(data?.operating_cost || 0),
    };
  } catch (error) {
    console.error('❌ getProfitReport error:', error);
    throw error;
  }
};