import './reanimated-logger-config';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
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

function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
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
}, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NetworkProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
      </NetworkProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider> 
      <AppContent />
    </SafeAreaProvider>
  );
}
