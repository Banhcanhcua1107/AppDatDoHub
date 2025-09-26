// src/context/CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CartItem } from '../screens/Menu/MenuScreen'; // Điều chỉnh đường dẫn nếu cần

// Định nghĩa cấu trúc dữ liệu cho các giỏ hàng: key là tableId, value là mảng các món
interface CartsState {
  [tableId: string]: CartItem[];
}

// Định nghĩa những gì Context sẽ cung cấp
interface CartContextState {
  carts: CartsState;
  addToCart: (tableId: string, item: CartItem) => void;
  updateCartItemQuantity: (tableId: string, itemId: string, newQuantity: number) => void;
  clearCart: (tableId: string) => void;
  getCartForTable: (tableId: string) => CartItem[];
}

// Tạo Context với giá trị mặc định
const CartContext = createContext<CartContextState | undefined>(undefined);

// Tạo Provider component
export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [carts, setCarts] = useState<CartsState>({});

  const getCartForTable = (tableId: string): CartItem[] => {
    return carts[tableId] || [];
  };

  const addToCart = (tableId: string, newItem: CartItem) => {
    setCarts(prevCarts => {
      const currentCart = prevCarts[tableId] || [];
      // Tạo một ID duy nhất cho mỗi item trong giỏ hàng để xử lý việc trùng lặp
      const uniqueItemId = `${newItem.id}-${newItem.size.name}-${newItem.sugar.name}-${newItem.toppings.map(t => t.name).join('-')}`;
      
      const existingItemIndex = currentCart.findIndex(item => item.id === uniqueItemId);

      let updatedCart;
      if (existingItemIndex > -1) {
        // Món đã có, cập nhật số lượng và tổng tiền
        updatedCart = [...currentCart];
        const existingItem = updatedCart[existingItemIndex];
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice += newItem.totalPrice;
      } else {
        // Món chưa có, thêm mới vào giỏ
        updatedCart = [...currentCart, { ...newItem, id: uniqueItemId }];
      }
      
      return { ...prevCarts, [tableId]: updatedCart };
    });
  };
  
  const updateCartItemQuantity = (tableId: string, itemId: string, newQuantity: number) => {
     setCarts(prevCarts => {
        const currentCart = prevCarts[tableId] || [];
        const updatedCart = currentCart.map(item => {
            if (item.id === itemId) {
                const pricePerItem = item.totalPrice / item.quantity;
                return { ...item, quantity: newQuantity, totalPrice: pricePerItem * newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0); // Lọc bỏ món có số lượng bằng 0

        return { ...prevCarts, [tableId]: updatedCart };
     });
  };

  const clearCart = (tableId: string) => {
    setCarts(prevCarts => {
      const newCarts = { ...prevCarts };
      delete newCarts[tableId];
      return newCarts;
    });
  };

  return (
    <CartContext.Provider value={{ carts, addToCart, updateCartItemQuantity, clearCart, getCartForTable }}>
      {children}
    </CartContext.Provider>
  );
};

// Tạo custom hook để dễ dàng sử dụng context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};