// services/reportService.ts

import { supabase } from './supabase';

// ============================================================================
// 1. REPORT INTERFACES (Định nghĩa tất cả các kiểu dữ liệu trước)
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
  table_name?: string;
  status: 'completed' | 'cancelled' | 'pending' | 'paid';
  payment_method?: 'cash' | 'momo' | 'transfer';
}

export interface InventoryProduct {
  id: number;
  name: string;
  status: 'normal' | 'out';
}


// ============================================================================
// 2. HELPER FUNCTIONS (Định nghĩa các hàm phụ trợ)
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
// 3. SERVICE FUNCTIONS (Các hàm gọi API)
// ============================================================================

/**
 * Lấy danh sách giao dịch chi tiết bằng RPC function trên Supabase.
 */
export const getTransactions = async (
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase.rpc('get_transactions_with_details', {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) {
      console.error('❌ Error fetching transactions via RPC:', error);
      throw error;
    }

    const transactions: Transaction[] = (data || []).map((order: any) => ({
      id: order.id,
      time: formatTime(order.created_at),
      amount: Number(order.amount || 0),
      items: Number(order.total_items || 0),
      table_name: order.table_name,
      status: order.status,
      payment_method: order.payment_method,
    }));

    return transactions;
  } catch { // Sửa lỗi 'err' is defined but never used
    return [];
  }
};

/**
 * Lấy báo cáo doanh thu tổng quan.
 */
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

/**
 * Lấy báo cáo tồn kho.
 */
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

/**
 * Lấy trạng thái của các món trong menu.
 */
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


/**
 * Lấy báo cáo nhập hàng.
 */
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

/**
 * Lấy báo cáo công nợ.
 */
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

/**
 * Lấy báo cáo dòng tiền.
 */
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

/**
 * Lấy báo cáo lợi nhuận.
 */
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