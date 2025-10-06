// --- START OF FILE screens/Orders/ReturnSelectionScreen.tsx (ĐÃ SỬA LỖI ĐIỀU HƯỚNG) ---

import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

// Interface cho món hàng cần trả, bao gồm cả image_url
interface ItemToReturn {
  id: number;
  name: string;
  quantity: number; // Số lượng đã gọi ban đầu
  unit_price: number;
  image_url: string | null;
}

type Props = NativeStackScreenProps<AppStackParamList, 'ReturnSelection'>;


const ReturnItemCard: React.FC<{
  item: ItemToReturn;
  returnQuantity: number;
  onUpdateQuantity: (amount: number) => void;
}> = ({ item, returnQuantity, onUpdateQuantity }) => {
  const placeholderImage = 'https://via.placeholder.com/150';

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url || placeholderImage }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Đã gọi: {item.quantity}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => onUpdateQuantity(-1)} style={styles.quantityButton}>
          <Icon name="remove" size={22} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{returnQuantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(1)} style={styles.quantityButton}>
          <Icon name="add" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ReturnSelectionScreen = ({ route, navigation }: Props) => {
  const { orderId, items, source } = route.params;
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [itemsToReturn, setItemsToReturn] = useState<{ [itemId: number]: number }>({});

  const handleUpdateQuantity = (itemId: number, amount: number) => {
    const originalItem = items.find(i => i.id === itemId);
    if (!originalItem) return;

    const currentQty = itemsToReturn[itemId] || 0;
    let newQty = currentQty + amount;

    if (newQty < 0) newQty = 0;
    if (newQty > originalItem.quantity) newQty = originalItem.quantity;

    setItemsToReturn(prev => ({ ...prev, [itemId]: newQty }));
  };
  
  const processItemReturns = async () => {
    const itemsToReturnList = Object.entries(itemsToReturn)
      .map(([itemId, quantity]) => {
        const originalItem = items.find(i => i.id === Number(itemId));
        return {
          order_item_id: Number(itemId),
          quantity,
          unit_price: originalItem?.unit_price || 0,
        };
      })
      .filter(i => i.quantity > 0);

    if (itemsToReturnList.length === 0) {
      return { success: true };
    }
    
    if (!reason.trim()) {
      Alert.alert("Thiếu lý do", "Vui lòng nhập lý do trả món.");
      return { success: false };
    }
    
    try {
      const { data: newSlip, error: slipError } = await supabase
        .from('return_slips')
        .insert({ order_id: orderId, reason: reason.trim() })
        .select('id')
        .single();

      if (slipError) throw slipError;
      if (!newSlip) throw new Error("Không thể tạo phiếu trả hàng.");
      const newSlipId = newSlip.id;

      const slipItemsToInsert = itemsToReturnList.map(item => ({
        return_slip_id: newSlipId,
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));
      const { error: slipItemsError } = await supabase.from('return_slip_items').insert(slipItemsToInsert);
      if (slipItemsError) throw slipItemsError;

      const updatePromises = itemsToReturnList.map(itemToReturn => {
          return supabase.rpc('update_returned_quantity', {
              p_order_item_id: itemToReturn.order_item_id,
              p_quantity_to_return: itemToReturn.quantity
          });
      });

      const results = await Promise.all(updatePromises);
      const updateError = results.find(res => res.error);
      if (updateError) throw updateError.error;
      
      return { success: true };
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi trả món: " + error.message);
      return { success: false };
    }
  };

  const handleConfirmReturn = async () => {
    setIsSubmitting(true);
    const { success } = await processItemReturns();
    if (success) {
      Alert.alert("Thành công", "Đã cập nhật trả món thành công.");
      navigation.goBack();
    }
    setIsSubmitting(false);
  };
  
  const handleProvisionalBill = async () => {
    setIsSubmitting(true);
    const { success: returnSuccess } = await processItemReturns();
    
    if (returnSuccess) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ is_provisional: true })
                .eq('id', orderId);

            if (error) throw error;
            
            Alert.alert("Thành công", "Đã tạm tính và xử lý trả món (nếu có).");
            // [ĐÃ SỬA] Sử dụng goBack() để quay lại màn hình trước đó (OrderScreen)
            navigation.goBack(); 
        } catch(error: any) {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái tạm tính: " + error.message);
        }
    }
    setIsSubmitting(false);
  };

  const handlePayment = async () => {
     setIsSubmitting(true);
     const { success: returnSuccess } = await processItemReturns();
     if(returnSuccess) {
         Alert.alert("Chuyển đến thanh toán", "Đã xử lý trả món (nếu có). Sẵn sàng chuyển đến màn hình thanh toán.");
         // Sắp tới: navigation.navigate(ROUTES.PAYMENT_SCREEN, { orderId });
     }
     setIsSubmitting(false);
  };

  const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum, qty) => sum + qty, 0);
  
  const renderBottomBar = () => {
    if (source === 'OrderScreen') {
      return (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
           <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>Tổng số món trả</Text>
              <Text style={styles.summaryQuantity}>{totalReturnQuantity}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
                style={[styles.halfButton, styles.provisionalButton, isSubmitting && styles.disabledButton]}
                onPress={handleProvisionalBill}
                disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Tạm tính</Text>}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.halfButton, styles.paymentButton, isSubmitting && styles.disabledButton]}
                onPress={handlePayment}
                disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Thanh toán</Text>}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
         <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Tổng số món trả</Text>
            <Text style={styles.summaryQuantity}>{totalReturnQuantity}</Text>
        </View>
        <TouchableOpacity
            style={[styles.confirmButton, (totalReturnQuantity === 0 || isSubmitting) && styles.disabledButton]}
            onPress={handleConfirmReturn}
            disabled={totalReturnQuantity === 0 || isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmButtonText}>Xác nhận trả món</Text>
          }
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Icon name="arrow-back-outline" size={26} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn món cần trả</Text>
            <View style={styles.headerSpacer} />
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ReturnItemCard
            item={item}
            returnQuantity={itemsToReturn[item.id] || 0}
            onUpdateQuantity={(amount) => handleUpdateQuantity(item.id, amount)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 200 }}
        ListFooterComponent={
          totalReturnQuantity > 0 ? (
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Nhập lý do trả món (bắt buộc nếu có trả món)"
              style={styles.reasonInput}
              multiline
            />
          ) : null
        }
      />

      {renderBottomBar()}
    </View>
  );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    headerContainer: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerButton: { padding: 8, marginLeft: -8 },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSpacer: { width: 32 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#475569',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
    },
    itemInfo: { flex: 1, justifyContent: 'center' },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    itemQuantity: { fontSize: 14, color: '#6B7280' },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    quantityButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        minWidth: 35,
        textAlign: 'center',
        color: '#111827',
    },
    reasonInput: {
        backgroundColor: 'white',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
        marginTop: 8,
        marginBottom: 16,
        color: '#1F2937',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        elevation: 10,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '500',
    },
    summaryQuantity: {
        fontSize: 20,
        color: '#1F2937',
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    disabledButton: { backgroundColor: '#9CA3AF' },
    halfButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    provisionalButton: {
        backgroundColor: '#8B5CF6',
    },
    paymentButton: {
        backgroundColor: '#10B981',
    },
});
export default ReturnSelectionScreen;