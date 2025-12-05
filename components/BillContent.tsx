// --- START OF FILE: src/components/BillContent.tsx ---

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Import các kiểu dữ liệu từ file gốc của chúng
import { ProvisionalOrder, BillItem } from '../screens/Orders/ProvisionalBillScreen';

// Định nghĩa các props mà component này sẽ nhận
interface BillContentProps {
  order: ProvisionalOrder;
  items: BillItem[];
  title?: string;
  showQRCode?: boolean; // Thêm prop để điều khiển hiển thị QR Code
}

const formatCurrency = (value: number) => Math.round(value).toLocaleString('vi-VN');
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return (
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
    ' ' +
    date.toLocaleDateString('vi-VN')
  );
};

const BillContent: React.FC<BillContentProps> = ({ order, items, title = 'PHIẾU TÍNH TIỀN', showQRCode = true }) => {
  // --- Dữ liệu và logic tính toán được giữ nguyên ---
  const invoiceId = `HD${order.orderId.substring(0, 6).toUpperCase()}`;
  const cashierName = 'Hà Trang';
  const serverName = 'Hà Trang';
  const vatRate = 0.1;

  // Tính toán: Giá món ăn không tính thuế VAT
  const subtotal = items.reduce((sum: number, item: BillItem) => sum + item.totalPrice, 0); // Tổng tiền hàng
  const discount = 0; // Chiết khấu
  const grandTotal = subtotal - discount; // Tổng cộng = Tổng tiền hàng - Chiết khấu

  return (
    // Đây là phần giao diện của hóa đơn được lấy từ PrintPreviewScreen
    <View style={styles.billContainer}>
      <View style={styles.tableInfo}>
        <Text style={styles.tableName}>
          {order.tables.map((t: { name: string }) => t.name).join(', ')}
        </Text>
      </View>

      <Text style={styles.billTitle}>{title}</Text>
      <Text style={styles.invoiceId}>{invoiceId}</Text>

      <View style={styles.timeInfoContainer}>
        <Text style={styles.infoText}>Giờ vào: {formatDateTime(order.createdAt)}</Text>
        <Text style={styles.infoText}>Giờ in: {formatDateTime(new Date().toISOString())}</Text>
      </View>
      <Text style={styles.infoText}>Thu ngân: {cashierName}</Text>
      <Text style={styles.infoText}>Phục vụ: {serverName}</Text>

      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.th, { flex: 4 }]}>Tên hàng</Text>
        <Text style={[styles.tableCell, styles.th, { flex: 2, textAlign: 'right' }]}>Đ.Giá</Text>
        <Text style={[styles.tableCell, styles.th, { flex: 1, textAlign: 'center' }]}>SL</Text>
        <Text style={[styles.tableCell, styles.th, { flex: 2, textAlign: 'right' }]}>
          Thành tiền
        </Text>
      </View>

      {items.map((item: BillItem, index: number) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 4 }]}>{item.name}</Text>
          <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
            {formatCurrency(item.unit_price)}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
          <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
            {formatCurrency(item.totalPrice)}
          </Text>
        </View>
      ))}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Chiết khấu:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(discount)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Tổng Cộng:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
        </View>
      </View>

      {/* Chỉ hiển thị QR Code nếu showQRCode = true */}
      {showQRCode && (
        <View style={styles.qrContainer}>
          <QRCode value={`ORDER_ID:${order.orderId}|TOTAL:${grandTotal}`} size={120} />
        </View>
      )}

      <Text style={styles.footerText}>Xin cảm ơn quý khách và hẹn gặp lại!</Text>
    </View>
  );
};

// Sao chép các style liên quan từ PrintPreviewScreen vào đây
const styles = StyleSheet.create({
  billContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 4 },
  tableInfo: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tableName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  billTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    textTransform: 'uppercase',
  },
  invoiceId: { textAlign: 'center', color: '#555', marginBottom: 15 },
  timeInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#333', marginBottom: 5 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: { borderBottomWidth: 2, borderBottomColor: '#333' },
  tableCell: { fontSize: 14, color: '#333' },
  th: { fontWeight: 'bold' },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderStyle: 'dashed',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#555' },
  summaryValue: { fontSize: 15, color: '#000', fontWeight: '500' },
  grandTotalRow: { marginTop: 5 },
  grandTotalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  qrContainer: { alignItems: 'center', marginVertical: 25 },
  footerText: { textAlign: 'center', fontStyle: 'italic', color: '#555',paddingTop: 10},
});

export default BillContent;
