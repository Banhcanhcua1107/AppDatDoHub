import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetScreen() {
  useEffect(() => {
    const resetApp = async () => {
      try {
        // Xóa tất cả dữ liệu từ AsyncStorage
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage cleared - App should reset');
        
        // Đợi 2 giây rồi reload
        setTimeout(() => {
          // Force reload app (nếu dùng Expo)
          console.log('🔄 Reloading app...');
        }, 2000);
      } catch (error) {
        console.error('❌ Error clearing AsyncStorage:', error);
      }
    };

    resetApp();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3461FD" />
      <Text style={styles.text}>Đang reset ứng dụng...</Text>
      <Text style={styles.subtext}>Vui lòng đợi hoặc restart app thủ công</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  subtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
});
