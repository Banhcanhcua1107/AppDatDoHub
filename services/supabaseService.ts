// services/supabaseService.ts

import { supabase } from './supabase'; // Giả sử bạn đã có file khởi tạo supabase client

// Lấy khoảng thời gian bắt đầu và kết thúc của một ngày
const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

// --- Dữ liệu cho Dashboard ---
export const getDashboardData = async () => {
  const { start, end } = getDayRange(new Date());

  // 1. Lấy thống kê cơ bản
  const { data: transactionsToday, error: transError } = await supabase
    .from('transactions')
    .select('amount, payment_method')
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (transError) throw transError;

  const todayRevenue = transactionsToday.reduce((sum, t) => sum + t.amount, 0);
  const todayOrders = transactionsToday.length;

  // 2. Lấy chi phí hôm nay
  const { data: expensesToday, error: expenseError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('expense_date', new Date().toISOString().split('T')[0]);
  
  if (expenseError) throw expenseError;

  const todayExpenses = expensesToday.reduce((sum, e) => sum + e.amount, 0);
  const todayProfit = todayRevenue - todayExpenses; // Lợi nhuận đơn giản

  // 3. Lấy món bán chạy
  const { data: topItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      menu_items (
        id,
        name
      )
    `)
    .gte('created_at', start)
    .lte('created_at', end)
    .limit(5);

  if (itemsError) throw itemsError;

  // Xử lý dữ liệu món bán chạy (tổng hợp lại)
  const itemSummary = new Map<string, { name: string; quantity: number }>();
  for (const item of topItems as any[]) {
      const { menu_items, quantity } = item;
      if (itemSummary.has(menu_items.id)) {
          itemSummary.get(menu_items.id)!.quantity += quantity;
      } else {
          itemSummary.set(menu_items.id, { name: menu_items.name, quantity });
      }
  }
  const processedTopItems = Array.from(itemSummary.values())
                                .sort((a, b) => b.quantity - a.quantity)
                                .slice(0, 5);


  // 4. Lấy cảnh báo tồn kho
  const { data: stockAlerts, error: stockError } = await supabase
    .from('menu_items')
    .select('id')
    .eq('is_available', false);
  
  if (stockError) throw stockError;

  const alerts = stockAlerts.length > 0
    ? [{
        id: 'stock-warning',
        type: 'warning',
        title: `Có ${stockAlerts.length} món đã hết hàng`,
        message: 'Vui lòng kiểm tra và cập nhật lại kho.',
      }]
    : [];

  // 5. Hoạt động gần đây
  const { data: recentOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, table_name, total_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) throw ordersError;

  const activities = recentOrders.map(order => ({
      id: order.id,
      type: 'payment',
      title: `Thanh toán cho ${order.table_name || 'đơn mang về'}`,
      timestamp: new Date(order.created_at),
      amount: order.total_amount,
  }));
  

  return {
    stats: {
      todayRevenue,
      todayOrders,
      todayCustomers: todayOrders, // Giả định 1 đơn = 1 khách
      todayProfit,
    },
    topItems: processedTopItems,
    activities,
    alerts,
  };
};


// --- Dữ liệu cho các màn hình báo cáo chi tiết ---

// Báo cáo Doanh thu (Lấy danh sách giao dịch)
export const getTransactions = async (startDate: Date, endDate: Date) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            payment_method,
            created_at,
            orders (
                table_name,
                order_items (
                    quantity
                )
            )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((t: any) => ({
        id: t.id,
        amount: t.amount,
        payment_method: t.payment_method,
        time: new Date(t.created_at).toLocaleTimeString('vi-VN'),
        table_name: t.orders.table_name,
        items: t.orders.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    }));
};

// Báo cáo Lợi nhuận
export const getProfitReport = async (startDate: Date, endDate: Date) => {
    const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (transError) throw transError;

    const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .lte('expense_date', endDate.toISOString().split('T')[0]);
    
    if (expenseError) throw expenseError;

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin
    };
};

// Báo cáo Tồn kho (Trạng thái món)
export const getInventoryStatus = async () => {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, is_available')
        .order('name');
    
    if (error) throw error;
    
    return data.map(item => ({
        id: item.id,
        name: item.name,
        status: item.is_available ? 'normal' : 'out',
    }));
};

// Báo cáo Quỹ tiền
export const getCashFundData = async (startDate: Date, endDate: Date) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('amount, payment_method')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    
    if (error) throw error;

    let cashOnHand = 0;
    let bankDeposit = 0;

    data.forEach(t => {
        if (t.payment_method === 'cash') {
            cashOnHand += t.amount;
        } else {
            bankDeposit += t.amount;
        }
    });

    return {
        cashOnHand,
        bankDeposit,
        totalFund: cashOnHand + bankDeposit,
    };
};