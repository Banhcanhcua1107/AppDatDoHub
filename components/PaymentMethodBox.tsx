// components/PaymentMethodBox.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

interface PaymentMethodBoxProps {
  isVisible: boolean;
  onClose: () => void;
  totalAmount: number;
  onSelectMethod: (method: 'cash' | 'zalopay' | 'transfer') => void;
}

const PaymentMethodBox: React.FC<PaymentMethodBoxProps> = ({
  isVisible,
  onClose,
  totalAmount,
  onSelectMethod,
}) => {
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: 'cash-outline',
      color: '#10B981',
      description: 'Thanh toán bằng tiền mặt',
    },
    {
      id: 'zalopay', 
      name: 'ZaloPay', 
      icon: 'qr-code-outline', 
      color: '#0068FF',
      description: 'Thanh toán qua ví ZaloPay', 
    },
    {
      id: 'transfer',
      name: 'Chuyển khoản',
      icon: 'card-outline',
      color: '#3B82F6',
      description: 'Chuyển khoản ngân hàng',
    },
  ];

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
        
        <View style={styles.container}>
          <View style={styles.boxWrapper}>
            {/* Header */}
            <View style={styles.header}>
              <Icon name="card-outline" size={24} color="white" />
              <Text style={styles.headerText}>Chọn phương thức thanh toán</Text>
            </View>

            {/* Total Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Tổng thanh toán</Text>
              <Text style={styles.amountValue}>
                {totalAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>

            {/* Payment Methods */}
            <View style={styles.methodsContainer}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.methodButton}
                  onPress={() => {
                    onSelectMethod(method.id as 'cash' | 'zalopay' | 'transfer');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodIconContainer, { backgroundColor: `${method.color}20` }]}>
                    <Icon name={method.icon as any} size={32} color={method.color} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                  <Icon name="chevron-forward-outline" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>HỦY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  boxWrapper: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountContainer: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  methodsContainer: {
    padding: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButtonText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default PaymentMethodBox;
