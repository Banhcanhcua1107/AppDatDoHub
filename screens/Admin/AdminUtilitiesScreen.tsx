// screens/Admin/AdminUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import UtilityItem from '../../components/UtilityItem';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUtilitiesScreen = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
            <Text style={styles.headerTitle}>Tiện ích & Cài đặt</Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={() => setLogoutModalVisible(true)}
            isDanger={true}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        isVisible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
        variant="danger"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden', // Quan trọng để bo góc hoạt động
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
});

export default AdminUtilitiesScreen;