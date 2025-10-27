// services/supabaseService.ts

import { supabase } from './supabase';

/**
 * Hàm helper để chuyển đổi Date object sang chuỗi 'YYYY-MM-DD'
 * theo múi giờ local, tránh lỗi lệch ngày do toISOString() (luôn ra UTC).
 */
const formatDateToLocalYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy danh sách các giao dịch đã thanh toán trong một khoảng thời gian.
 */
export const getTransactions = async (startDate: Date, endDate: Date) => {
  // RPC `get_transactions_report` nhận timestamptz, nên toISOString() là đúng
  const { data, error } = await supabase.rpc('get_transactions_report', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    console.error('Lỗi khi lấy danh sách giao dịch:', error);
    throw error;
  }

  return data.map((item: any) => ({ ...item, time: item.transaction_time }));
};

/**
 * Lấy báo cáo lợi nhuận chi tiết (Doanh thu - Giá vốn - Chi phí).
 */
export const getProfitReport = async (startDate: Date, endDate: Date) => {
  // RPC `get_profit_report` nhận `date`, nên dùng helper để tránh lỗi timezone
  const { data, error } = await supabase.rpc('get_profit_report', {
    p_start_date: formatDateToLocalYYYYMMDD(startDate),
    p_end_date: formatDateToLocalYYYYMMDD(endDate),
  });

  if (error) throw error;
  return data;
};


/**
 * Lấy báo cáo quỹ tiền (dòng tiền mặt và điện tử).
 */
export const getCashFundReport = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_cash_fund_report', {
    p_start_date: formatDateToLocalYYYYMMDD(startDate),
    p_end_date: formatDateToLocalYYYYMMDD(endDate),
  });
  if (error) throw error;
  return data;
};

/**
 * [MỚI] Lấy báo cáo tổng kết tài chính (dòng tiền vào/ra, số dư đầu/cuối kỳ).
 */
export const getFinancialSummaryReport = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_financial_summary_report', {
    p_start_date: formatDateToLocalYYYYMMDD(startDate),
    p_end_date: formatDateToLocalYYYYMMDD(endDate),
  });
  if (error) throw error;
  return data;
};

/**
 * Lấy trạng thái tồn kho của tất cả các món trong menu.
 */
export const getInventoryStatus = async () => {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, is_available')
        .order('name');
    
    if (error) throw error;
    
    return data.map(item => ({
        id: item.id,
        name: item.name,
        status: item.is_available ? 'Còn hàng' : 'Hết hàng', 
    }));
};

export const getDailyCashReconciliation = async (targetDate: Date) => {
  const { data, error } = await supabase.rpc('get_daily_cash_reconciliation', {
    p_target_date: formatDateToLocalYYYYMMDD(targetDate), // Dùng lại helper đã có
  });
  if (error) throw error;
  return data;
};