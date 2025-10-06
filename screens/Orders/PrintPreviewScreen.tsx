import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';

// 1. THÊM CÁC IMPORT NÀY
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../../constants/routes';
import { BillItem } from './ProvisionalBillScreen'; 

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';


// Replace 'ROUTES.PRINT_PREVIEW' with the actual route name string, e.g. 'PrintPreview'
type PrintPreviewScreenRouteProp = RouteProp<AppStackParamList, 'PrintPreview'>;

const PrintPreviewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PrintPreviewScreenRouteProp>();
  const { order, items } = route.params;

  const [copyCount, setCopyCount] = useState(1);

  // --- Dữ liệu giả định cho các thông tin còn thiếu ---
  const invoiceId = `HD${order.orderId.substring(0, 6).toUpperCase()}`;
  const cashierName = "Hà Trang"; // Lấy từ thông tin đăng nhập hoặc truyền qua
  const serverName = "Hà Trang";  // Lấy từ order hoặc truyền qua
  const vatRate = 0.1; // 10%

  // --- Tính toán chi tiết hóa đơn ---
  const subtotal = items.reduce((sum: number, item: BillItem) => sum + item.totalPrice, 0);
  const discount = 0; // Giả định chưa có chiết khấu
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal - discount + vatAmount;

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN');
  const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
             ' ' + date.toLocaleDateString('vi-VN');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
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
                <TouchableOpacity onPress={() => setCopyCount(Math.max(1, copyCount - 1))} style={styles.stepperButton}>
                    <Text style={styles.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{copyCount}</Text>
                <TouchableOpacity onPress={() => setCopyCount(copyCount + 1)} style={styles.stepperButton}>
                    <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Bill Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.billContainer}>
                <View style={styles.tableInfo}>
                    <Text style={styles.tableName}>{order.tables.map((t: { name: string }) => t.name).join(', ')}</Text>
                </View>
                
                <Text style={styles.billTitle}>PHIẾU TÍNH TIỀN</Text>
                <Text style={styles.invoiceId}>{invoiceId}</Text>

                <View style={styles.timeInfoContainer}>
                    <Text style={styles.infoText}>Giờ vào: {formatDateTime(order.createdAt)}</Text>
                    <Text style={styles.infoText}>Giờ in: {formatDateTime(new Date().toISOString())}</Text>
                </View>
                <Text style={styles.infoText}>Thu ngân: {cashierName}</Text>
                <Text style={styles.infoText}>Phục vụ: {serverName}</Text>

                {/* Items Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.th, { flex: 4 }]}>Tên hàng</Text>
                    <Text style={[styles.tableCell, styles.th, { flex: 2, textAlign: 'right' }]}>Đ.Giá</Text>
                    <Text style={[styles.tableCell, styles.th, { flex: 1, textAlign: 'center' }]}>SL</Text>
                    <Text style={[styles.tableCell, styles.th, { flex: 2, textAlign: 'right' }]}>Thành tiền</Text>
                </View>

                {/* Items List */}
                {items.map((item: BillItem, index: number) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 4 }]}>{item.name}</Text>
                        <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(item.unit_price)}</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                        <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(item.totalPrice)}</Text>
                    </View>
                ))}

                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Chiết khấu:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(discount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Thuế VAT:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>Tổng Cộng:</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
                    </View>
                </View>
                
                {/* QR Code */}
                <View style={styles.qrContainer}>
                    <QRCode
                        value={`ORDER_ID:${order.orderId}|TOTAL:${grandTotal}`} // Thay đổi giá trị QR tùy theo nhu cầu
                        size={120}
                    />
                </View>

                <Text style={styles.footerText}>Xin cảm ơn quý khách và hẹn gặp lại!</Text>
            </View>
        </ScrollView>
    </View>
  );
};

// --- Styles for the component ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerButton: { padding: 5 },
  headerButtonText: { fontSize: 16, color: '#007AFF' },
  printButton: { fontWeight: 'bold' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff' },
  stepperLabel: { fontSize: 16, color: '#333' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  stepperButton: { paddingHorizontal: 15, paddingVertical: 5 },
  stepperButtonText: { fontSize: 20, color: '#007AFF' },
  stepperValue: { fontSize: 16, paddingHorizontal: 15, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ccc', color: '#000' },
  scrollContent: { padding: 16 },
  billContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tableInfo: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 20 },
  tableName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  billTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#000', textTransform: 'uppercase' },
  invoiceId: { textAlign: 'center', color: '#555', marginBottom: 15 },
  timeInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#333', marginBottom: 5 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableHeader: { borderBottomWidth: 2, borderBottomColor: '#333' },
  tableCell: { fontSize: 14, color: '#333' },
  th: { fontWeight: 'bold' },
  summaryContainer: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ccc', borderStyle: 'dashed' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#555' },
  summaryValue: { fontSize: 15, color: '#000', fontWeight: '500' },
  grandTotalRow: { marginTop: 5 },
  grandTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  qrContainer: { alignItems: 'center', marginVertical: 25 },
  footerText: { textAlign: 'center', fontStyle: 'italic', color: '#555' },
});

export default PrintPreviewScreen;