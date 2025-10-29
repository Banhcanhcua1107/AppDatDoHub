// screens/Utilities/UtilitiesScreen.tsx
import React, { useState } from 'react'; // Import useState
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native'; // Đã xóa Alert
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import UtilityItem from '../../components/UtilityItem';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal'; // Import component Modal tùy chỉnh

// Định nghĩa kiểu cho navigation prop
type UtilitiesNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function UtilitiesScreen() {
  const navigation = useNavigation<UtilitiesNavigationProp>();
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
            icon="key-outline"
            title="Thay đổi mật khẩu"
            onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
          />
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            // Khi nhấn, chỉ cần mở modal lên bằng cách set state thành true
            onPress={() => setLogoutModalVisible(true)} 
          />
        </View>

        {/* Khu vực Thiết bị & Đồng bộ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết bị & Đồng bộ</Text>
          <UtilityItem icon="print-outline" title="Thiết lập máy in" onPress={() => { /* Navigate to PrinterSetupScreen */ }} />
          <UtilityItem icon="sync-outline" title="Đồng bộ dữ liệu" onPress={() => { /* Handle Sync */ }} />
          <UtilityItem icon="wifi-outline" title="Kiểm tra kết nối" onPress={() => {}} />
        </View>

        {/* Khu vực Hoạt động & Báo cáo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động & Báo cáo</Text>
          <UtilityItem 
            icon="receipt-outline" 
            title="Lịch sử hóa đơn" 
            onPress={() => navigation.navigate(ROUTES.BILL_HISTORY)} // Điều hướng đến màn hình lịch sử
          />
          <UtilityItem 
            icon="arrow-undo-circle-outline" // Thay icon cho phù hợp hơn
            title="Lịch sử trả món" 
            onPress={() => navigation.navigate(ROUTES.RETURN_HISTORY_ARCHIVE)} 
          />
        </View>
        
        {/* ... các khu vực khác */}
      </ScrollView>

      {/* Render component Modal ở đây */}
      {/* Nó sẽ chỉ hiển thị khi isLogoutModalVisible là true */}
      <ConfirmModal
        isVisible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onClose={() => setLogoutModalVisible(false)} // Nếu người dùng nhấn Hủy hoặc nhấn ra ngoài
        onConfirm={handleConfirmLogout} // Nếu người dùng nhấn nút Đăng xuất
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    paddingVertical: 12,
  }
});