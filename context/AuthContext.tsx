// context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// [THAY ĐỔI] Định nghĩa kiểu dữ liệu cho hồ sơ người dùng
interface UserProfile {
  id: string;
  email: string;
  role: 'nhan_vien' | 'bep' | 'admin' | 'thu_ngan' | string; // Mở rộng với các vai trò khác
  full_name?: string;
}

// [THAY ĐỔI] Cập nhật kiểu dữ liệu cho Context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null; // Thêm state để lưu thông tin người dùng
  // Sửa lại hàm login để nhận cả session và profile
  login: (data: { session: any; userProfile: UserProfile }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State mới

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const sessionJson = await AsyncStorage.getItem('user_session');
        const profileJson = await AsyncStorage.getItem('user_profile');

        if (sessionJson && profileJson) {
          // Nếu có cả session và profile trong storage, coi như đã đăng nhập
          setUserProfile(JSON.parse(profileJson));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Lỗi khi lấy dữ liệu auth từ storage:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // [THAY ĐỔI] Cập nhật hàm login
  const login = async (data: { session: any; userProfile: UserProfile }) => {
    try {
      // Lưu cả session và profile vào AsyncStorage
      await AsyncStorage.setItem('user_session', JSON.stringify(data.session));
      await AsyncStorage.setItem('user_profile', JSON.stringify(data.userProfile));
      
      // Cập nhật state
      setUserProfile(data.userProfile);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu auth:', e);
    }
  };

  // [THAY ĐỔI] Cập nhật hàm logout
  const logout = async () => {
    try {
      // Xóa cả session và profile
      await AsyncStorage.removeItem('user_session');
      await AsyncStorage.removeItem('user_profile');
      
      // Reset state
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Lỗi khi xóa dữ liệu auth:', e);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    userProfile, // Cung cấp userProfile ra ngoài context
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};