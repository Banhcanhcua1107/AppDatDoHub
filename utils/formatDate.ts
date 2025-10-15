/**
 * Format date string to relative time (Vietnamese)
 * Supabase returns ISO 8601 format (UTC): "2025-01-15T08:30:00.000Z"
 * This function converts to local timezone and displays relative time
 * 
 * @param dateString - ISO 8601 date string from Supabase
 * @returns Formatted time string in Vietnamese
 * 
 * @example
 * formatDate("2025-01-15T08:30:00.000Z")
 * // Returns: "5 phút trước" | "2 giờ trước" | "3 ngày trước" | "15/01/2025 15:30"
 */
export const formatDate = (dateString: string): string => {
  // Validate input
  if (!dateString) {
    return 'Không xác định';
  }

  try {
    // Parse ISO string - JavaScript automatically converts UTC to local timezone
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('[formatDate] Invalid date string:', dateString);
      return 'Thời gian không hợp lệ';
    }

    // Get current time
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - date.getTime();
    
    // Handle future dates (clock sync issues)
    if (diffInMs < 0) {
      console.warn('[formatDate] Future date detected:', dateString);
      return 'Vừa xong';
    }
    
    // Calculate time differences
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Format relative time (Vietnamese)
    if (diffInSeconds < 30) {
      return 'Vừa xong';
    } else if (diffInMinutes < 1) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      // For dates older than 7 days, show full date/time
      // Format: DD/MM/YYYY HH:mm (local timezone)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch (error) {
    console.error('[formatDate] Error parsing date:', error, dateString);
    return 'Lỗi định dạng thời gian';
  }
};

/**
 * Format date to full Vietnamese format
 * @param dateString - ISO 8601 date string
 * @returns DD/MM/YYYY HH:mm
 */
export const formatFullDate = (dateString: string): string => {
  if (!dateString) return 'Không xác định';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Thời gian không hợp lệ';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('[formatFullDate] Error:', error);
    return 'Lỗi định dạng';
  }
};

/**
 * Format date to short format (only date)
 * @param dateString - ISO 8601 date string
 * @returns DD/MM/YYYY
 */
export const formatShortDate = (dateString: string): string => {
  if (!dateString) return 'Không xác định';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Không hợp lệ';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return 'Lỗi';
  }
};

/**
 * Format time only (HH:mm)
 * @param dateString - ISO 8601 date string
 * @returns HH:mm
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return '--:--';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch {
    return '--:--';
  }
};
