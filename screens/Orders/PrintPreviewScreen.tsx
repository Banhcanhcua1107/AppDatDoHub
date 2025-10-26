// --- START OF FILE: screens/Orders/PrintPreviewScreen.tsx ---

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { RouteProp, useRoute, useNavigation, StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../constants/routes';
import BillContent from '../../components/BillContent';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';

type PrintPreviewScreenRouteProp = RouteProp<AppStackParamList, 'PrintPreview'>;

const PrintPreviewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PrintPreviewScreenRouteProp>();
  const { order, items, paymentMethod, shouldNavigateToHome } = route.params;

  const [copyCount, setCopyCount] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  
  // Chỉ hiển thị QR code khi KHÔNG phải thanh toán tiền mặt
  const shouldShowQR = paymentMethod !== 'cash';

  // Hàm đóng bàn (gọi API)
  const closeTableSession = async (orderId: string) => {
    try {
      setIsClosing(true);
      
      // 1️⃣ Lấy danh sách bàn của order
      const { data: orderTables, error: tablesError } = await supabase
        .from('order_tables')
        .select('table_id')
        .eq('order_id', orderId);

      if (tablesError) throw tablesError;
      const tableIds = orderTables.map((t) => t.table_id);

      // 2️⃣ Cập nhật order status thành 'closed'
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'closed' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // 3️⃣ Cập nhật trạng thái bàn thành 'Trống'
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'Trống' })
        .in('id', tableIds);

      if (tableError) throw tableError;

      console.log('✅ [PrintPreview] Đóng bàn thành công');
      Toast.show({
        type: 'success',
        text1: 'Hoàn tất phiên',
        text2: 'Đã dọn bàn',
      });
    } catch (error: any) {
      console.error('❌ [PrintPreview] Lỗi đóng bàn:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể đóng bàn',
      });
    } finally {
      setIsClosing(false);
    }
  };

  // Hàm xử lý khi nhấn nút Đóng
  const handleClose = async () => {
    // Nếu shouldNavigateToHome === true, tức là user đã chọn "Kết thúc phiên"
    // Lúc này cần đóng bàn trước khi quay về
    if (shouldNavigateToHome) {
      // Đóng bàn
      await closeTableSession(order.orderId);
      // Quay về màn hình Home
      navigation.dispatch(StackActions.popToTop());
    } else {
      // Chỉ quay lại màn hình trước đó (OrderConfirmationScreen)
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 20 }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton} disabled={isClosing}>
          <Text style={[styles.headerButtonText, isClosing && { opacity: 0.5 }]}>
            {isClosing ? 'Đang xử lý...' : 'Đóng'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xem trước</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={[styles.headerButtonText, styles.printButton]}>In</Text>
        </TouchableOpacity>
      </View>

      {/* Stepper for number of copies */}
      <View style={styles.stepperContainer}>
        <Text style={styles.stepperLabel}>Số liên in</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => setCopyCount(Math.max(1, copyCount - 1))}
            style={styles.stepperButton}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{copyCount}</Text>
          <TouchableOpacity
            onPress={() => setCopyCount(copyCount + 1)}
            style={styles.stepperButton}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dùng ScrollView và component BillContent để hiển thị */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BillContent order={order} items={items} showQRCode={shouldShowQR} />
      </ScrollView>
    </View>
  );
};

// Các style này chỉ dành cho phần khung của màn hình
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: { padding: 5 },
  headerButtonText: { fontSize: 16, color: '#007AFF' },
  printButton: { fontWeight: 'bold' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  stepperLabel: { fontSize: 16, color: '#333' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  stepperButton: { paddingHorizontal: 15, paddingVertical: 5 },
  stepperButtonText: { fontSize: 20, color: '#007AFF' },
  stepperValue: {
    fontSize: 16,
    paddingHorizontal: 15,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
    color: '#000',
  },
  scrollContent: { padding: 16 },
});

export default PrintPreviewScreen;
