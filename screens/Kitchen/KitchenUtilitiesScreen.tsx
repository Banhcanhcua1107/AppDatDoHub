// screens/Kitchen/KitchenUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

import UtilityItem from '../../components/UtilityItem';
import ConfirmModal from '../../components/ConfirmModal';

const KitchenUtilitiesScreen = () => {
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Khu vực tài khoản - Đã chỉnh sửa để giống màn hình nhân viên */}
        <View style={styles.section}>
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={() => setLogoutModalVisible(true)}
          />
        </View>

        {/* Thêm các tiện ích khác của bếp ở đây nếu cần */}
        
      </ScrollView>

      {/* Modal xác nhận đăng xuất */}
      <ConfirmModal
        isVisible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản bếp?"
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
    paddingHorizontal: 16, // Thêm padding ngang giống màn hình nhân viên
  },
  // Đã xóa sectionTitle vì không còn sử dụng
});

export default KitchenUtilitiesScreen;