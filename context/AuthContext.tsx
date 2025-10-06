import React, { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa những gì context sẽ cung cấp
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Tạo Context với một giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider component
// Component này sẽ "bọc" toàn bộ ứng dụng của bạn
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    // Trong thực tế, bạn sẽ lưu token vào AsyncStorage ở đây
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Xóa token khỏi AsyncStorage
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Tạo một custom hook để dễ dàng sử dụng context ở các component khác
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
