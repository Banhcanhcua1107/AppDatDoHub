import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Định nghĩa kiểu dữ liệu cho Context
interface NetworkContextType {
  isOnline: boolean;
  netInfoState: NetInfoState | null;
}

// Tạo Context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Tạo Provider Component
export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [netInfoState, setNetInfoState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái mạng
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetInfoState(state);
      const onlineStatus = !!state.isConnected && !!state.isInternetReachable;
      setIsOnline(onlineStatus);
    });

    return () => {
      // Dọn dẹp listener khi component bị hủy
      unsubscribe();
    };
  }, []);

  const value = { isOnline, netInfoState };

  return (
    <NetworkContext.Provider value={value}>
      {children}
      {/* Hiển thị một banner thông báo khi mất mạng */}
      {!isOnline && <OfflineBanner />}
    </NetworkContext.Provider>
  );
};

// Tạo một custom hook để dễ dàng sử dụng Context
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

// Component banner hiển thị khi offline
const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bannerContainer, { top: insets.top }]}>
      <Text style={styles.bannerText}>Bạn đang offline. Một số tính năng có thể bị hạn chế.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#EF4444', // Màu đỏ
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 1000,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});