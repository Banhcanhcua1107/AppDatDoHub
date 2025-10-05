// --- START OF FILE screens/Orders/ReturnSelectionScreen.tsx ---

import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface ItemToReturn {
  id: number;
  name: string;
  quantity: number;
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
  const { orderId, items } = route.params;
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

  const handleConfirmReturn = async () => {
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
      Alert.alert("Chưa chọn món", "Vui lòng chọn số lượng món cần trả.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Thiếu lý do", "Vui lòng nhập lý do trả món.");
      return;
    }

    setIsSubmitting(true);
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

      Alert.alert("Thành công", "Đã cập nhật trả món thành công.");
      navigation.goBack();

    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi trả món: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // **QUAN TRỌNG**: Chạy SQL này để tạo function update an toàn hơn
  /*
    CREATE OR REPLACE FUNCTION update_returned_quantity(p_order_item_id INT, p_quantity_to_return INT)
    RETURNS VOID AS $$
    BEGIN
        UPDATE order_items
        SET returned_quantity = returned_quantity + p_quantity_to_return
        WHERE id = p_order_item_id;
    END;
    $$ LANGUAGE plpgsql;
  */

  const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum, qty) => sum + qty, 0);

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn món cần trả</Text>
        <View style={{ width: 40 }} />
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        ListFooterComponent={
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Nhập lý do trả món (ví dụ: khách đổi ý, món bị lỗi...)"
            style={styles.reasonInput}
            multiline
          />
        }
      />
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity
            style={[styles.confirmButton, (totalReturnQuantity === 0 || isSubmitting) && styles.disabledButton]}
            onPress={handleConfirmReturn}
            disabled={totalReturnQuantity === 0 || isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmButtonText}>Xác nhận trả {totalReturnQuantity > 0 ? totalReturnQuantity : ''} món</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
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
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#6B7280',
    },
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
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
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
    disabledButton: {
        backgroundColor: '#9CA3AF'
    }
});

export default ReturnSelectionScreen;