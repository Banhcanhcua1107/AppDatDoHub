// services/supabaseService.ts

import { supabase } from './supabase';

/**
 * [MỚI] Hàm helper để chuyển đổi Date object sang chuỗi 'YYYY-MM-DD'
 * theo đúng múi giờ của thiết bị, tránh lỗi do toISOString() gây ra.
 */
const formatDateToLocalYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  // getMonth() trả về từ 0-11, nên cần +1. padStart để thêm '0' nếu cần.
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};


/**
 * Lấy danh sách các giao dịch đã thanh toán trong một khoảng thời gian.
 * @param startDate - Ngày bắt đầu
 * @param endDate - Ngày kết thúc
 * @returns Danh sách giao dịch
 */
export const getTransactions = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_transactions_report', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    console.error('Lỗi khi lấy danh sách giao dịch:', error);
    throw error;
  }

  return data.map((item: any) => ({
    ...item,
    time: item.transaction_time,
  }));
};

/**
 * Lấy báo cáo lợi nhuận trong một khoảng thời gian.
 * @param startDate - Ngày bắt đầu
 * @param endDate - Ngày kết thúc
 * @returns Đối tượng báo cáo lợi nhuận
 */
export const getProfitReport = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_profit_report', {
    // [SỬA LỖI] Sử dụng hàm helper mới để đảm bảo ngày tháng là chính xác
    p_start_date: formatDateToLocalYYYYMMDD(startDate),
    p_end_date: formatDateToLocalYYYYMMDD(endDate),
  });

  if (error) {
    console.error('Lỗi khi lấy báo cáo lợi nhuận:', error);
    throw error;
  }
  return data;
};

/**
 * Lấy báo cáo quỹ tiền (tiền mặt và tiền gửi) trong ngày.
 * @param startDate - Thời gian bắt đầu
 * @param endDate - Thời gian kết thúc
 * @returns Đối tượng báo cáo quỹ tiền
 */
export const getCashFundData = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_cash_fund_data', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    console.error('Lỗi khi lấy báo cáo quỹ tiền:', error);
    throw error;
  }
  return data;
};

/**
 * Lấy trạng thái tồn kho của tất cả các món trong menu.
 * @returns Danh sách các món và trạng thái còn/hết hàng.
 */
export const getInventoryStatus = async () => {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, is_available')
        // [XÓA BỎ] Không còn lọc .eq('is_available', false) nữa
        .order('name');
    
    if (error) {
        console.error('Lỗi khi lấy trạng thái tồn kho:', error);
        throw error;
    }
    
    // [CẬP NHẬT] Dùng toán tử 3 ngôi để trả về trạng thái chính xác
    return data.map(item => ({
        id: item.id,
        name: item.name,
        status: item.is_available ? 'Còn hàng' : 'Hết hàng', 
    }));
};