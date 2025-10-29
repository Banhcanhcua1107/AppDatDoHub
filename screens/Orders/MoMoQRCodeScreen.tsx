// screens/Orders/MoMoQRCodeScreen.tsx

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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Toast from 'react-native-toast-message';
import { supabase } from '../../services/supabase';
import { ProvisionalOrder, BillItem } from './ProvisionalBillScreen';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, StackActions } from '@react-navigation/native';

type Props = NativeStackScreenProps<AppStackParamList, 'MoMoQRCode'>;

const MoMoQRCodeScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { orderId, amount, pendingPaymentAction } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>('');
  const isNavigating = useRef(false);

  useEffect(() => {
    createMoMoQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, amount]);

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`momo_order_status_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        async (payload) => { // <-- Thêm async
           console.log('[Realtime] MoMoQRCodeScreen nhận được cập nhật:', payload);
          const newStatus = payload.new?.status;
          const currentPaymentMethod = payload.new?.payment_method;

          // Lắng nghe cả 'paid' và 'closed' và đảm bảo chưa điều hướng
          if ((newStatus === 'paid' || newStatus === 'closed') && !isNavigating.current) {
            
            // [SỬA LỖI] Nếu phương thức thanh toán chưa được set, tự động cập nhật
            // Đây là bước dự phòng quan trọng để đảm bảo báo cáo tài chính chính xác
            if (!currentPaymentMethod || currentPaymentMethod !== 'momo') {
                console.log("Dự phòng: Cập nhật payment_method thành 'momo'");
                await supabase
                    .from('orders')
                    .update({ payment_method: 'momo' })
                    .eq('id', orderId);
            }

            Toast.show({
              type: 'success',
              text1: 'Thanh toán thành công!',
              text2: 'Đang chuyển sang trang in hóa đơn...',
            });
            // Gọi hàm điều hướng
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

    const shouldGoHome = pendingPaymentAction === 'end';

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, created_at, total_price, order_tables(table_id, tables(id, name))')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) throw new Error('Không thể lấy thông tin đơn hàng.');

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, unit_price, customizations, menu_items(name)')
        .eq('order_id', orderId);

      if (itemsError) throw new Error('Không thể lấy danh sách items.');

      const billItems: BillItem[] = itemsData
        .map((item: any) => {
          const remainingQuantity = item.quantity - (item.returned_quantity || 0);
          if (remainingQuantity <= 0) return null;
          return {
            name: item.customizations?.name || item.menu_items?.name || 'Món đã xóa',
            quantity: remainingQuantity,
            unit_price: item.unit_price,
            totalPrice: remainingQuantity * item.unit_price,
          };
        })
        .filter((item): item is BillItem => item !== null);

      const tableList = orderData.order_tables.map((ot: any) => ot.tables).filter(Boolean);
      const finalPrice = billItems.reduce((sum, item) => sum + item.totalPrice, 0);

      const billOrder: ProvisionalOrder = {
        orderId: orderData.id,
        tables: tableList,
        totalPrice: finalPrice,
        totalItemCount: billItems.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: orderData.created_at,
      };

      // [MỚI] Nếu user chọn "giữ phiên" (không phải end), tạo order pending mới
      if (!shouldGoHome) {
        const tableIds = orderData.order_tables.map((ot: any) => ot.table_id);

        // Tạo order mới
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert([{ status: 'pending' }])
          .select('id')
          .single();

        if (createError) throw createError;

        // Liên kết order mới với các bàn cũ
        const orderTableInserts = tableIds.map((tableId: string) => ({
          order_id: newOrder.id,
          table_id: tableId,
        }));

        const { error: insertError } = await supabase
          .from('order_tables')
          .insert(orderTableInserts);

        if (insertError) throw insertError;

        console.log('✅ [MoMoQRCode] Tạo order pending mới thành công');
      }

      navigation.replace(ROUTES.PRINT_PREVIEW, {
        order: billOrder,
        items: billItems,
        paymentMethod: 'momo',
        shouldNavigateToHome: shouldGoHome,
      });
    } catch (error) {
      console.error('Lỗi khi chuẩn bị in hóa đơn:', error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu để in hóa đơn.');
      isNavigating.current = false;
      setIsLoading(false);
    }
  };

  const createMoMoQRCode = async () => {
    setIsLoading(true);
    setQrValue(null);
    try {
        console.log('Dữ liệu gửi lên Function:', { amount, orderId, orderInfo: `Thanh toan Don hang ${orderId.slice(-6)}`, userAction: pendingPaymentAction });
      const { data, error } = await supabase.functions.invoke('create-momo-payment', {
        body: { 
          amount, 
          orderId,
          orderInfo: `Thanh toan Don hang ${orderId.slice(-6)}`,
          userAction: pendingPaymentAction,
        },
      });

      if (error) throw error;

      if (data && data.qrCodeUrl) {
        console.log("✅ Nhận được QR Code từ Backend:", data.qrCodeUrl);
        setQrValue(data.qrCodeUrl);
        setOrderCode(orderId.slice(-6).toUpperCase());
      } else {
        throw new Error(data.message || 'Không nhận được mã QR từ server.');
      }
    } catch (error: any) {
      console.error('Lỗi khi gọi function tạo QR MoMo:', error);
      Alert.alert('Lỗi', 'Không thể tạo mã thanh toán. Vui lòng thử lại sau.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      const updatePayload: {
        status: 'paid' | 'closed';
        payment_method: string;
        paid_at: string;
        total_price: number;
      } = {
        status: 'paid',
        payment_method: 'momo',
        paid_at: new Date().toISOString(),
        total_price: amount,
      };

      if (pendingPaymentAction === 'end') {
        updatePayload.status = 'closed';

        const { data: orderTables } = await supabase
          .from('order_tables')
          .select('table_id')
          .eq('order_id', orderId);
        
        const tableIdsToUpdate = orderTables?.map(t => t.table_id) || [];

        if (tableIdsToUpdate.length > 0) {
          await supabase.from('tables').update({ status: 'Trống' }).in('id', tableIdsToUpdate).throwOnError();
        }
      }

      await supabase.from('orders').update(updatePayload).eq('id', orderId).throwOnError();
      
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể giả lập thanh toán: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán qua MoMo</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading && !qrValue ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#A60067" />
            <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
          </View>
        ) : qrValue ? (
          <>
            <View style={styles.qrContainer}>
              <QRCode value={qrValue} size={250} />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tiền cần thanh toán</Text>
                <Text style={styles.amountValue}>{amount.toLocaleString('vi-VN')}đ</Text>
              </View>
              {orderCode && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                  <Text style={styles.infoValue}>{orderCode}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.instructionContainer}>
                <Text style={styles.instructionTitle}>Hướng dẫn thanh toán</Text>
                <Text style={styles.instructionText}>
                    1. Mở ứng dụng <Text style={styles.boldText}>MoMo</Text> trên điện thoại của bạn.
                </Text>
                <Text style={styles.instructionText}>
                    2. Chọn chức năng <Text style={styles.boldText}>&quot;Quét mã QR&quot;</Text>.
                </Text>
                <Text style={styles.instructionText}>
                    3. Quét mã trên màn hình và hoàn tất thanh toán.
                </Text>
                <Text style={styles.instructionText}>
                    Màn hình sẽ tự động cập nhật khi giao dịch thành công.
                </Text>
            </View>
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>Không thể tạo mã QR</Text>
            <TouchableOpacity style={styles.retryButton} onPress={createMoMoQRCode}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {qrValue && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
            <Text style={styles.confirmButtonText}>(Test) Giả lập thanh toán thành công</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  headerPlaceholder: { width: 40 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  qrContainer: { alignItems: 'center', marginVertical: 24, backgroundColor: '#ffffff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  infoContainer: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  amountValue: { fontSize: 20, fontWeight: 'bold', color: '#A60067' },
  infoValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  instructionContainer: { backgroundColor: '#FFF0FB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FBCFE8' },
  instructionTitle: { fontSize: 16, fontWeight: 'bold', color: '#A60067', marginBottom: 12, textAlign: 'center' },
  instructionText: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 },
  boldText: { fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#DC2626', fontWeight: '600', marginTop: 12, textAlign: 'center' },
  retryButton: { marginTop: 24, backgroundColor: '#A60067', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 100 },
  retryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  confirmButton: { paddingVertical: 14, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default MoMoQRCodeScreen;