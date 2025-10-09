// screens/Kitchen/KitchenUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Giả sử bạn đã tạo và export các component này
import UtilityItem from '../../components/UtilityItem';
import ConfirmModal from '../../components/ConfirmModal';

const KitchenUtilitiesScreen = () => {
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  // Hàm xử lý khi xác nhận đăng xuất từ modal
  const handleConfirmLogout = () => {
    setLogoutModalVisible(false); // Đóng modal
    logout(); // Gọi hàm đăng xuất
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Khu vực tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản & Cài đặt</Text>
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={() => setLogoutModalVisible(true)} // Mở modal khi nhấn
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
    backgroundColor: '#F8F9FA' // Màu nền giống màn hình tiện ích của nhân viên
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 16,
  }
});

export default KitchenUtilitiesScreen;