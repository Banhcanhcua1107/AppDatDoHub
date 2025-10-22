// utils/dateUtils.ts

export const getDateRangeForPeriod = (period: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  switch (period) {
    case 'today':
      return { start: today, end: endOfDay };
    case 'yesterday':
      const yesterdayStart = new Date(today);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start: yesterdayStart, end: yesterdayEnd };
    case 'this_week':
      const weekStart = new Date(today);
      // Đảm bảo tuần bắt đầu từ Thứ Hai
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      return { start: weekStart, end: endOfDay };
    case 'this_month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: monthStart, end: endOfDay };
    default:
      return { start: today, end: endOfDay };
  }
};