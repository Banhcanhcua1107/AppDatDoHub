// --- START OF FILE: screens/Orders/PrintPreviewScreen.tsx ---

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { RouteProp, useRoute, useNavigation, StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../constants/routes';
import BillContent from '../../components/BillContent';

type PrintPreviewScreenRouteProp = RouteProp<AppStackParamList, 'PrintPreview'>;

const PrintPreviewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PrintPreviewScreenRouteProp>();
  const { order, items, paymentMethod, shouldNavigateToHome } = route.params;

  const [copyCount, setCopyCount] = useState(1);
  
  // Chỉ hiển thị QR code khi KHÔNG phải thanh toán tiền mặt
  const shouldShowQR = paymentMethod !== 'cash';

  // Hàm xử lý khi nhấn nút Đóng
  const handleClose = () => {
    if (shouldNavigateToHome) {
      // Quay về màn hình Home: đóng tất cả màn hình và về màn hình đầu tiên (tabs)
      // popToTop() sẽ đóng tất cả màn hình trừ màn hình root của stack
      navigation.dispatch(StackActions.popToTop());
    } else {
      // Quay lại màn hình trước đó
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 20 }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Đóng</Text>
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
