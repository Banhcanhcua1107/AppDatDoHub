import './reanimated-logger-config';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './config/toastConfig';
import { NetworkProvider } from './context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider> 
      <AuthProvider>
        <NetworkProvider>
          <AppNavigator />
          <Toast config={toastConfig} />
        </NetworkProvider>
      </AuthProvider>
    </SafeAreaProvider>
    
  );
}
