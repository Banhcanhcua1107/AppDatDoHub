import './reanimated-logger-config';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './config/toastConfig';
import { NetworkProvider } from './context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import './global.css';
import { Ionicons } from '@expo/vector-icons';

// [THÊM] Import các thành phần cần thiết
import { NotificationProvider } from './context/NotificationContext';
import { initializeAudio } from './utils/soundManager';

function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // [THÊM] Khởi tạo audio mode khi app bắt đầu.
    // Việc này đảm bảo âm thanh có thể phát ngay cả khi điện thoại ở chế độ im lặng (iOS).
    initializeAudio();

    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch (error) {
        console.log('Font load warning:', error);
      }
      setFontsLoaded(true);
    };

    loadFonts();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần duy nhất

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    // [SỬA LỖI] Bao bọc toàn bộ cây component bằng NotificationProvider
    // để bộ lắng nghe toàn cục có thể hoạt động ở bất kỳ đâu.
    <RootSiblingParent>
      <NotificationProvider>
        <AuthProvider>
          <NetworkProvider>
            <AppNavigator />
            <Toast config={toastConfig} />
          </NetworkProvider>
        </AuthProvider>
      </NotificationProvider>
    </RootSiblingParent>
  );
}

export default function App() {
  return (
    <SafeAreaProvider> 
      <AppContent />
    </SafeAreaProvider>
  );
}