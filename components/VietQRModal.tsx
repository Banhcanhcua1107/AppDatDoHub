// VietQRModal.tsx
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
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { Image } from 'react-native';


interface VietQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  qrValue: string | null;
  amount: number;
  merchantName?: string; // Tên chủ/merchant
  note?: string; // Ghi chú (orderId)
  onSimulatePaid?: () => void; // Giả lập test
  onConfirmPaid?: () => void; // ✅ Nút xác nhận thủ công
}



const VietQRModal: React.FC<VietQRModalProps> = ({
  isVisible,
  onClose,
  isLoading,
  qrValue,
  amount,
  merchantName,
  note,
  onSimulatePaid,
  onConfirmPaid,
}) => {
  return (
    <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Thanh toán Chuyển khoản (VietQR)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close-outline" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : qrValue ? (
              <>
                <View style={styles.qrContainer}>
                  <Image
                      source={{ uri: qrValue }}
                      style={{ width: 220, height: 220, borderRadius: 12 }}
                      resizeMode="contain"
                    />
                </View>

                <View style={{ alignItems: 'center', marginTop: 8 }}>
                  <Text style={styles.amountLabel}>Số tiền cần thanh toán</Text>
                  <Text style={styles.amountValue}>{amount.toLocaleString('vi-VN')}đ</Text>

                  {merchantName && (
                    <Text style={styles.merchantText}>Người nhận: {merchantName}</Text>
                  )}
                  {note && <Text style={styles.noteText}>Ghi chú: {note}</Text>}

                  <Text style={styles.instructionText}>
                    Mở app ngân hàng → Quét mã QR → Chuyển khoản đúng số tiền.
                  </Text>
                </View>

                {/* Nút xác nhận thanh toán */}
                {onConfirmPaid && (
                  <TouchableOpacity style={styles.confirmButton} onPress={onConfirmPaid}>
                    <Icon name="checkmark-circle-outline" size={20} color="white" />
                    <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                  </TouchableOpacity>
                )}

                {/* Nút giả lập test (nếu có) */}
                {onSimulatePaid && (
                  <TouchableOpacity style={styles.simulateButton} onPress={onSimulatePaid}>
                    <Text style={styles.simulateButtonText}>Giả lập thanh toán (test)</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Icon name="warning-outline" size={40} color="#EF4444" />
                <Text style={styles.errorText}>Không thể tạo mã QR. Vui lòng thử lại.</Text>
              </View>
            )}
          </View>

          <Text style={styles.footerText}>
            Sau khi xác nhận, hóa đơn sẽ được đánh dấu là đã thanh toán.
          </Text>
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
    maxWidth: 360,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 12,
  },
  amountLabel: { fontSize: 13, color: '#6B7280' },
  amountValue: { fontSize: 26, fontWeight: 'bold', color: '#10B981' },
  merchantText: { marginTop: 8, fontSize: 14, color: '#374151' },
  noteText: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  instructionText: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 12 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 16,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 6 },
  simulateButton: {
    marginTop: 10,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  simulateButtonText: { color: 'white', fontWeight: '600' },
  errorContainer: { alignItems: 'center', justifyContent: 'center' },
  errorText: { marginTop: 12, fontSize: 15, color: '#DC2626', textAlign: 'center' },
  footerText: {
    padding: 14,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    backgroundColor: '#F0FDF4',
  },
});

export default VietQRModal;
