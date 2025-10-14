// components/ConfirmModal.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'info' | 'warning'; // Thêm variant để tùy chỉnh màu
}

const ConfirmModal = ({
  isVisible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = 'danger', // Mặc định là danger (đỏ) để giữ tương thích với code cũ
}: ConfirmModalProps) => {
  
  // Hàm lấy thông tin màu sắc và icon theo variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          iconName: 'checkmark-circle-outline' as const,
          iconColor: '#10B981',
          confirmButtonColor: '#10B981', // Xanh lá
        };
      case 'info':
        return {
          iconName: 'information-circle-outline' as const,
          iconColor: '#3B82F6',
          confirmButtonColor: '#3B82F6', // Xanh dương
        };
      case 'warning':
        return {
          iconName: 'warning-outline' as const,
          iconColor: '#F97316',
          confirmButtonColor: '#F97316', // Cam
        };
      case 'danger':
      default:
        return {
          iconName: 'warning-outline' as const,
          iconColor: '#F97316',
          confirmButtonColor: '#DC2626', // Đỏ
        };
    }
  };
  
  const variantStyle = getVariantStyle();
  
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose} // Nhấn ra ngoài để đóng
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropTransitionOutTiming={0}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
            <Ionicons name={variantStyle.iconName} size={32} color={variantStyle.iconColor} />
            <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton, { backgroundColor: variantStyle.confirmButtonColor }]} 
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#DC2626', // Màu mặc định, sẽ bị override bởi inline style
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmModal;