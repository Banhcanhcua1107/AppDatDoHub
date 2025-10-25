import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  qrValue: string | null; // Đây là đường link ZaloPay trả về, dùng để tạo QR
  amount: number;
  isLoading: boolean;
  onPaymentSuccess: () => void; // Hàm gọi khi thanh toán thành công
}

const ZaloPayQRModal: React.FC<Props> = ({
  isVisible,
  onClose,
  qrValue,
  amount,
  isLoading,
  onPaymentSuccess,
}) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Thanh toán ZaloPay</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-outline" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color="#0068FF" />
                <Text style={styles.loadingText}>Đang tạo mã thanh toán...</Text>
              </>
            ) : qrValue ? (
              <>
                <Text style={styles.scanText}>Dùng ZaloPay hoặc App ngân hàng để quét mã</Text>
                <View style={styles.qrContainer}>
                  <QRCode value={qrValue} size={220} />
                </View>
                <Text style={styles.amountLabel}>Số tiền cần thanh toán</Text>
                <Text style={styles.amountValue}>{amount.toLocaleString('vi-VN')}đ</Text>

                {/* Nút này chỉ để giả lập việc thanh toán thành công */}
                {/* Trong thực tế, bạn sẽ nhận tín hiệu từ server qua Realtime */}
                <TouchableOpacity style={styles.successButton} onPress={onPaymentSuccess}>
                  <Text style={styles.successButtonText}>(Giả lập) Bấm vào đây khi đã thanh toán</Text>
                </TouchableOpacity>

              </>
            ) : (
              <Text style={styles.errorText}>Không thể tạo mã QR. Vui lòng thử lại.</Text>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  content: { alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#4B5563' },
  scanText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  amountLabel: { fontSize: 14, color: '#6B7280' },
  amountValue: { fontSize: 32, fontWeight: 'bold', color: '#0068FF', marginTop: 4 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  successButton: {
    marginTop: 20,
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  successButtonText: {
    color: '#0284C7',
    fontWeight: '500',
  },
});

export default ZaloPayQRModal;