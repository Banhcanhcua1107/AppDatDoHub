// src/context/OrderContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CartItem } from '../screens/Menu/MenuScreen'; // Đảm bảo đường dẫn đúng

// Định nghĩa kiểu dữ liệu cho "kho" order
// Key là tableId (string), value là danh sách các món (CartItem[])
type OrdersState = {
  [tableId: string]: CartItem[];
};

// Định nghĩa những gì Context sẽ cung cấp
type OrderContextType = {
  orders: OrdersState;
  // Hàm để cập nhật order cho một bàn cụ thể
  updateOrderForTable: (tableId: string, items: CartItem[]) => void;
  // Hàm để lấy order của một bàn
  getOrderForTable: (tableId: string) => CartItem[];
  // Hàm để xóa order của một bàn (sau khi thanh toán)
  clearOrderForTable: (tableId: string) => void;
};

// Tạo Context với giá trị mặc định
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Tạo Provider component
export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrdersState>({});

  const updateOrderForTable = (tableId: string, items: CartItem[]) => {
    setOrders(prevOrders => ({
      ...prevOrders,
      [tableId]: items, // Cập nhật hoặc thêm mới order cho bàn này
    }));
  };

  const getOrderForTable = (tableId: string): CartItem[] => {
    return orders[tableId] || []; // Trả về mảng rỗng nếu chưa có order
  };
  
  const clearOrderForTable = (tableId: string) => {
    setOrders(prevOrders => {
      const newOrders = { ...prevOrders };
      delete newOrders[tableId]; // Xóa order của bàn
      return newOrders;
    });
  };

  const value = { orders, updateOrderForTable, getOrderForTable, clearOrderForTable };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Tạo một custom hook để sử dụng Context dễ dàng hơn
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};