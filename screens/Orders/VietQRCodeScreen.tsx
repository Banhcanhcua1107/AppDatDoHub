// screens/Orders/VietQRCodeScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { supabase } from '../../services/supabase';
import { ProvisionalOrder, BillItem } from './ProvisionalBillScreen';

type Props = NativeStackScreenProps<AppStackParamList, 'VietQRCode'>;

const VietQRCodeScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { orderId, amount, pendingPaymentAction } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [merchantName] = useState('Dang Thanh Hai');
  const [orderCode, setOrderCode] = useState<string>('');
  const isNavigating = useRef(false);

  useEffect(() => {
    createTransferQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, amount]);

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`vietqr_order_status_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('[Realtime] VietQRCodeScreen nhận được cập nhật:', payload);
          if (payload.new?.status === 'paid') {
            Toast.show({
              type: 'success',
              text1: 'Thanh toán thành công!',
              text2: 'Đang chuyển sang trang in hóa đơn...',
            });
            navigateToPrintPreview();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const navigateToPrintPreview = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    setIsLoading(true);
    try {
      // 1. [SỬA LỖI] Đổi tên cột `total_amount` thành `total_price` cho đúng với schema DB
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, created_at, total_price, order_tables(tables(id, name))') // Sửa ở đây
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('Lỗi Supabase khi lấy order:', orderError);
        throw new Error('Không thể lấy thông tin đơn hàng.');
      }

      // 2. Lấy các item của order
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, unit_price, customizations, menu_items(name)')
        .eq('order_id', orderId);

      if (itemsError) {
        throw new Error('Không thể lấy danh sách items.');
      }

      // 3. Format dữ liệu cho PrintPreview
      const billItems: BillItem[] = (itemsData || []).map((item: any) => ({
        name: item.menu_items?.name || 'Không xác định',
        quantity: item.quantity,
        unit_price: item.unit_price,
        totalPrice: item.quantity * item.unit_price,
      }));

      const tableList = orderData.order_tables.map((ot: any) => ot.tables).filter(Boolean);

      const billOrder: ProvisionalOrder = {
        orderId: orderData.id,
        tables: tableList,
        // [SỬA LỖI] Sử dụng `total_price` từ dữ liệu trả về
        totalPrice: orderData.total_price || amount, // Sửa ở đây
        totalItemCount: billItems.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: orderData.created_at,
      };

      // 4. Điều hướng đến PrintPreview
      console.log('🔄 [VietQRCodeScreen] Navigating to PrintPreview');
      console.log('   - shouldNavigateToHome:', pendingPaymentAction === 'end');
      
      navigation.replace(ROUTES.PRINT_PREVIEW, {
        order: billOrder,
        items: billItems,
        paymentMethod: 'transfer',
        shouldNavigateToHome: pendingPaymentAction === 'end',
      });

    } catch (error) {
      console.error('Lỗi khi chuẩn bị in hóa đơn:', error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu để in hóa đơn. Vui lòng thử lại.');
      isNavigating.current = false;
      setIsLoading(false);
    }
  };


  const createTransferQRCode = async () => {
    setIsLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('order_code')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData || !orderData.order_code) {
        throw new Error(orderError?.message || 'Không tìm thấy mã đơn hàng (order_code).');
      }

      setOrderCode(orderData.order_code);

      const resp = await axios.post('https://api.vietqr.io/v2/generate', {
        accountNo: '0329638454',
        accountName: 'Dang Thanh Hai',
        acqId: '970422', // MB Bank
        amount: amount,
        addInfo: `ThanhToan Don ${orderData.order_code}`,
        template: 'compact',
      });

      if (resp.data?.data?.qrDataURL) {
        setQrValue(resp.data.data.qrDataURL);
      } else {
        throw new Error('Không nhận được QR hợp lệ từ API.');
      }
    } catch (error) {
      console.error('Lỗi tạo QR:', error);
      Alert.alert('Lỗi', 'Không thể tạo mã thanh toán. Vui lòng thử lại sau.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_method: 'transfer',
        paid_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.');
      return;
    }
    
    await navigateToPrintPreview();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán chuyển khoản</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading && !qrValue ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
          </View>
        ) : qrValue ? (
          <>
            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: qrValue }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            {/* Amount Info */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tiền cần thanh toán</Text>
                <Text style={styles.amountValue}>{amount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Người nhận</Text>
                <Text style={styles.infoValue}>{merchantName}</Text>
              </View>

              {orderCode && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                  <Text style={styles.infoValue}>{orderCode}</Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionContainer}>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>Mở ứng dụng ngân hàng trên điện thoại</Text>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Chọn chức năng quét mã QR hoặc chuyển khoản
                </Text>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Quét mã QR hoặc nhập thông tin thanh toán
                </Text>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.instructionText}>
                  Nhấn &quot;Xác nhận thanh toán&quot; khi chuyển khoản thành công
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>Không thể tạo mã QR</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={createTransferQRCode}
              disabled={isLoading}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      {qrValue && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleGoBack}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="checkmark-circle-outline" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  instructionContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default VietQRCodeScreen;