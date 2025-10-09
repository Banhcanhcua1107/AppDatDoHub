// screens/Kitchen/KitchenUtilitiesScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const KitchenUtilitiesScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Xác nhận Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy' },
      { text: 'Đồng ý', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.utilityItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.utilityText}>Đăng xuất</Text>
        </TouchableOpacity>
        {/* Thêm các tiện ích khác của bếp ở đây */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  container: {
    padding: 16,
  },
  utilityItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  utilityText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default KitchenUtilitiesScreen;