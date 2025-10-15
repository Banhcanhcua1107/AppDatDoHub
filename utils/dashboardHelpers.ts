// utils/dashboardHelpers.ts
// Helper functions cho Dashboard

/**
 * Format số tiền theo định dạng Việt Nam
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

/**
 * Format số tiền kèm ký hiệu đơn vị
 */
export const formatCurrencyFull = (amount: number): string => {
  return `${formatCurrency(amount)} ₫`;
};

/**
 * Rút gọn số tiền (K, M, B)
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K ₫`;
  }
  return `${amount} ₫`;
};

/**
 * Tính thời gian trôi qua
 */
export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

/**
 * Format ngày giờ đầy đủ
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format ngày
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

/**
 * Lấy thời gian bắt đầu ngày (00:00:00)
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Lấy thời gian kết thúc ngày (23:59:59)
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Lấy thời gian bắt đầu tuần
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là ngày đầu tuần
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Lấy thời gian bắt đầu tháng
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Tính % tăng/giảm so với kỳ trước
 */
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format % tăng/giảm
 */
export const formatGrowth = (growth: number): string => {
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

/**
 * Kiểm tra có phải ngày hôm nay không
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Kiểm tra có phải hôm qua không
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Lấy label thời gian thân thiện
 */
export const getFriendlyDateLabel = (date: Date): string => {
  if (isToday(date)) return 'Hôm nay';
  if (isYesterday(date)) return 'Hôm qua';
  
  const diffDays = Math.floor((new Date().getTime() - date.getTime()) / 86400000);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return formatDate(date);
};

/**
 * Parse số từ string (xử lý cả null/undefined)
 */
export const parseNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse integer từ string
 */
export const parseInt = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Tạo màu ngẫu nhiên cho charts
 */
export const getRandomColor = (index: number): string => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];
  return colors[index % colors.length];
};

/**
 * Tạo gradient color
 */
export const getGradientColors = (percentage: number): string => {
  if (percentage >= 80) return '#10B981'; // Green
  if (percentage >= 60) return '#3B82F6'; // Blue
  if (percentage >= 40) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

/**
 * Validate date
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Safe date parse
 */
export const parseDate = (value: any): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isValidDate(date) ? date : null;
  }
  return null;
};

/**
 * Format time only (HH:mm)
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Tính trung bình
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

/**
 * Tính tổng
 */
export const sum = (numbers: number[]): number => {
  return numbers.reduce((sum, n) => sum + n, 0);
};

/**
 * Tìm max
 */
export const max = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Tìm min
 */
export const min = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Round số về n chữ số thập phân
 */
export const round = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Clamp số trong khoảng min-max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${round(value, decimals)}%`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
