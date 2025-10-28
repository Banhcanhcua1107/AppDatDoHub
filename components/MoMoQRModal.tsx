// --- START OF FILE: src/components/MoMoQRModal.tsx (ĐÃ SỬA LẠI HOÀN CHỈNH) ---

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

interface MoMoQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  qrValue: string | null;
  amount: number;
  onPaymentSuccess: () => void;
}

// [SỬA] Đổi tên component thành MoMoQRModal
const MoMoQRModal: React.FC<MoMoQRModalProps> = ({
  isVisible,
  onClose,
  isLoading,
  qrValue,
  amount,
  onPaymentSuccess,
}) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* [SỬA] Đổi văn bản header */}
            <Text style={styles.headerText}>Thanh toán qua MoMo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close-outline" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <>
                {/* [SỬA] Đổi màu loading */}
                <ActivityIndicator size="large" color="#A60067" />
                <Text style={styles.loadingText}>Đang tạo mã thanh toán...</Text>
              </>
            ) : qrValue ? (
              <>
                <View style={styles.qrContainer}>
                  <QRCode value={qrValue} size={220} />
                </View>
                {/* [SỬA] Đổi văn bản hướng dẫn */}
                <Text style={styles.instructionText}>
                  Quét mã QR bằng ứng dụng <Text style={{fontWeight: 'bold'}}>MoMo</Text> để thanh toán
                </Text>
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Số tiền</Text>
                  {/* [SỬA] Đổi màu số tiền */}
                  <Text style={styles.amountValue}>
                    {amount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                 <Icon name="close-circle-outline" size={60} color="#EF4444" />
                 <Text style={styles.errorText}>Không thể tạo mã QR</Text>
                 <Text style={styles.errorSubText}>Vui lòng đóng và thử lại.</Text>
              </View>
            )}
          </View>

          {/* Footer - Nút giả lập thanh toán */}
          {!isLoading && qrValue && (
             <View style={styles.footer}>
                {/* [SỬA] Đổi màu nút xác nhận */}
                <TouchableOpacity style={styles.confirmButton} onPress={onPaymentSuccess}>
                    <Icon name="checkmark-circle-outline" size={22} color="white" />
                    <Text style={styles.confirmButtonText}>Xác nhận đã thanh toán</Text>
                </TouchableOpacity>
                <Text style={styles.footerNote}>
                    (Nút này dùng để giả lập thanh toán thành công)
                </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// [SỬA] Cập nhật lại toàn bộ styles cho phù hợp với MoMo
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  instructionText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  amountBox: {
    width: '100%',
    backgroundColor: '#FFF0FB',
    borderWidth: 1,
    borderColor: '#F472B6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#A60067',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A60067',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 12,
  },
  errorSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#A60067', // MoMo Color
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

// [SỬA] Export đúng tên component
export default MoMoQRModal;