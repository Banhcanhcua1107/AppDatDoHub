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

// ============================================================================
// HELPER FUNCTION: Format date
// ============================================================================

const formatDateForSQL = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// ============================================================================
// GET TRANSACTIONS (Real data from database)
// ============================================================================

export const getTransactions = async (
  startDate: Date = new Date(),
  endDate: Date = new Date(),
  limit: number = 20
): Promise<Transaction[]> => {
  try {
    console.log('📋 Fetching transactions...');
    
    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);
    console.log(`📅 Date range: ${startDateStr} to ${endDateStr}`);

    // First, try to get one record to see what columns exist
    console.log('🔍 Checking orders table structure...');
    const { data: sampleOrder, error: schemaError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (!schemaError && sampleOrder && sampleOrder.length > 0) {
      console.log('📦 Orders table columns:', Object.keys(sampleOrder[0]));
      console.log('📦 Sample order:', sampleOrder[0]);
    }

    // Query orders table directly - try flexible select
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      console.error('📝 Error details:', {
        message: error.message,
        hint: (error as any).hint,
        details: (error as any).details,
        code: (error as any).code,
      });
      // Return empty array on error instead of throwing
      return [];
    }

    console.log(`📦 Raw orders data (${orders?.length || 0} items):`, orders);

    // Transform to Transaction interface - handle different field names
    const transactions: Transaction[] = (orders || []).map((order: any) => {
      // Try different column names for amount
      const amount = order.total_amount || order.amount || order.total || 0;
      const itemCount = order.items_count || order.item_count || order.quantity || 0;
      const userName = order.user_name || order.username || order.staff || order.cashier || 'Unknown';
      
      return {
        id: order.id || '',
        time: formatTime(order.created_at),
        amount: Number(amount),
        items: Number(itemCount),
        staff: userName,
        table_name: order.table_name || order.table_id,
        status: order.status || 'completed',
      };
    });

    console.log(`✅ Fetched ${transactions.length} transactions:`, transactions);
    return transactions;
  } catch (error) {
    console.error('❌ getTransactions error:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
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
// 1. GET SALES REPORT
// ============================================================================

export const getSalesReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<SalesReport> => {
  try {
    console.log('📊 Fetching sales report...');
    
    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);

    const { data, error } = await supabase.rpc('get_sales_report', {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error('❌ Error fetching sales report:', error);
      throw error;
    }

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
    console.log('📦 Fetching inventory report...');

    const { data, error } = await supabase.rpc('get_inventory_report');

    if (error) {
      console.error('❌ Error fetching inventory report:', error);
      throw error;
    }

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

// ============================================================================
// 3. GET PURCHASE REPORT
// ============================================================================

export const getPurchaseReport = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
): Promise<PurchaseReport> => {
  try {
    console.log('🛒 Fetching purchase report...');

    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);

    const { data, error } = await supabase.rpc('get_purchase_report', {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error('❌ Error fetching purchase report:', error);
      throw error;
    }

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
    console.log('💳 Fetching receivables report...');

    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);

    const { data, error } = await supabase.rpc('get_receivables_report', {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error('❌ Error fetching receivables report:', error);
      throw error;
    }

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
    console.log('💰 Fetching cash flow report...');

    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);

    const { data, error } = await supabase.rpc('get_cash_flow_report', {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error('❌ Error fetching cash flow report:', error);
      throw error;
    }

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
    console.log('📈 Fetching profit report...');

    const startDateStr = formatDateForSQL(startDate);
    const endDateStr = formatDateForSQL(endDate);

    const { data, error } = await supabase.rpc('get_profit_report', {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error('❌ Error fetching profit report:', error);
      throw error;
    }

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

// ============================================================================
// COMBINED: Get all reports at once
// ============================================================================

export const getAllReports = async (
  startDate: Date = new Date(),
  endDate: Date = new Date()
) => {
  try {
    console.log('🔄 Fetching all reports...');

    const [sales, inventory, purchase, receivables, cashFlow, profit] =
      await Promise.all([
        getSalesReport(startDate, endDate),
        getInventoryReport(),
        getPurchaseReport(startDate, endDate),
        getReceivablesReport(startDate, endDate),
        getCashFlowReport(startDate, endDate),
        getProfitReport(startDate, endDate),
      ]);

    return {
      sales,
      inventory,
      purchase,
      receivables,
      cashFlow,
      profit,
    };
  } catch (error) {
    console.error('❌ getAllReports error:', error);
    throw error;
  }
};
