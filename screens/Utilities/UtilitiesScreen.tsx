// screens/Utilities/UtilitiesScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import UtilityItem from '../../components/UtilityItem'; // Đảm bảo đường dẫn này đúng
import { AppStackParamList, ROUTES } from '../../constants/routes'; // Import routes và types

// Định nghĩa kiểu cho navigation prop để TypeScript hiểu được các màn hình có thể điều hướng tới
type UtilitiesNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function UtilitiesScreen() {
  // Sử dụng hook useNavigation để lấy đối tượng navigation
  const navigation = useNavigation<UtilitiesNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Khu vực tài khoản */}
        <View style={styles.section}>
          {/* Component hiển thị thông tin user (nếu có) */}
          <UtilityItem
            icon="key-outline"
            title="Thay đổi mật khẩu"
            // Khi nhấn vào, điều hướng tới màn hình CHANGE_PASSWORD
            onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
          />
          <UtilityItem icon="log-out-outline" title="Đăng xuất" onPress={() => { /* Xử lý đăng xuất ở đây */ }} />
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
          <UtilityItem icon="receipt-outline" title="Lịch sử hóa đơn" onPress={() => { /* Navigate to OrderHistoryScreen */ }} />
          <UtilityItem icon="qr-code-outline" title="Thiết lập QR thanh toán" onPress={() => { /* Navigate to QRSetupScreen */ }} />
        </View>

        {/* ... các khu vực khác */}
      </ScrollView>
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