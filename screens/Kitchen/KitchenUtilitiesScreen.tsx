// screens/Kitchen/KitchenUtilitiesScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // << [THÊM] Import useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // << [THÊM] Import kiểu
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // << [THÊM] Import Stack Param List

import UtilityItem from '../../components/UtilityItem';
import ConfirmModal from '../../components/ConfirmModal';

// [THÊM] Định nghĩa kiểu cho navigation
type UtilitiesNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

const KitchenUtilitiesScreen = () => {
  const { logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation = useNavigation<UtilitiesNavigationProp>(); // << [THÊM] Khởi tạo navigation

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Khu vực báo cáo */}
        <View style={styles.section}>
          <UtilityItem
            icon="bar-chart-outline"
            title="Thống kê chế biến"
            onPress={() => navigation.navigate('KitchenProcessingReport')}
          />
        </View>

        <View style={styles.section}>
          <UtilityItem
            icon="swap-horizontal-outline"
            title="Báo hết / Báo còn"
            onPress={() => navigation.navigate('ItemAvailability')}
          />
        </View>

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
    paddingHorizontal: 16,

  },
});

export default KitchenUtilitiesScreen;