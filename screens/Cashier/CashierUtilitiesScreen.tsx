// screens/Cashier/CashierUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import UtilityItem from '../../components/UtilityItem';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { CashierStackParamList } from '../../navigation/AppNavigator';

type UtilitiesNavigationProp = NativeStackNavigationProp<CashierStackParamList>;

export default function CashierUtilitiesScreen() {
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
        {/* Khu vực tài khoản - GIỮ NGUYÊN */}
        <View style={styles.section}>
          <UtilityItem
            icon="key-outline"
            title="Thay đổi mật khẩu"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={() => setLogoutModalVisible(true)} 
          />
        </View>

        {/* Khu vực Thiết bị & Đồng bộ - GIỮ NGUYÊN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết bị & Đồng bộ</Text>
          <UtilityItem 
            icon="print-outline" 
            title="Thiết lập máy in" 
            onPress={() => {}} 
          />
          <UtilityItem 
            icon="sync-outline" 
            title="Đồng bộ dữ liệu" 
            onPress={() => {}} 
          />
          <UtilityItem 
            icon="wifi-outline" 
            title="Kiểm tra kết nối" 
            onPress={() => {}} 
          />
        </View>

        {/* Khu vực Hoạt động & Báo cáo - GIỮ NGUYÊN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động & Báo cáo</Text>
          <UtilityItem 
            icon="receipt-outline" 
            title="Lịch sử hóa đơn" 
            onPress={() => navigation.navigate('BillHistory')}
          />
          <UtilityItem 
            icon="arrow-undo-circle-outline" // Thay icon cho phù hợp hơn
            title="Lịch sử trả món" 
            onPress={() => navigation.navigate(ROUTES.RETURN_HISTORY_ARCHIVE)} 
          />
        </View>

        {/* Khu vực Quản lý Thu ngân - CẬP NHẬT LẠI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý Thu ngân</Text>
          <UtilityItem 
            icon="stats-chart-outline"
            title="Tổng quan" 
            onPress={() => navigation.navigate('Dashboard')}
          />
          <UtilityItem 
            icon="bar-chart-outline" 
            title="Báo cáo" 
            onPress={() => navigation.navigate('CashierReport')}
          />
          {/* <UtilityItem 
            icon="wallet-outline" 
            title="Quỹ tiền" 
            onPress={() => navigation.navigate('CashFlowDetail')}
          /> */}
           <UtilityItem 
            icon="cube-outline" 
            title="Kho" 
            onPress={() => navigation.navigate('Inventory')}
          />
          <UtilityItem 
            icon="cart-outline" 
            title="Mua hàng" 
            onPress={() => navigation.navigate('Purchase')}
          />
          <UtilityItem 
            icon="restaurant-outline" 
            title="Thực đơn" 
            onPress={() => navigation.navigate('MenuManagement')}
          />
           {/* <UtilityItem 
            icon="pricetag-outline" 
            title="Khuyến mãi" 
            onPress={() => navigation.navigate('Promotions')}
          /> */}
        </View>
      </ScrollView>

      <ConfirmModal
        isVisible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    paddingVertical: 12,
  }
});