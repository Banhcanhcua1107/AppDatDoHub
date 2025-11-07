// screens/Admin/AdminUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

import UtilityItem from '../../components/UtilityItem';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUtilitiesScreen = () => {
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Khu vực tài khoản */}
        <View style={styles.section}>
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={() => setLogoutModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Modal xác nhận đăng xuất */}
      <ConfirmModal
        isVisible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 16,
  },
});

export default AdminUtilitiesScreen;
