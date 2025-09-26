import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from './context/AuthContext';
import "./global.css";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
