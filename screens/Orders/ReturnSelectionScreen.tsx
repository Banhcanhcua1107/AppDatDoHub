import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface ItemToReturn {
  id: number;
  name: string;
  quantity: number;
}

type Props = NativeStackScreenProps<AppStackParamList, 'ReturnSelection'>;

const ReturnItemRow: React.FC<{
  item: ItemToReturn;
  returnQuantity: number;
  onUpdateQuantity: (amount: number) => void;
}> = ({ item, returnQuantity, onUpdateQuantity }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Đã gọi: {item.quantity}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => onUpdateQuantity(-1)} style={styles.quantityButton}>
          <Icon name="remove" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{returnQuantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(1)} style={styles.quantityButton}>
          <Icon name="add" size={20} color="#333" />
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
        .map(([itemId, quantity]) => ({
        order_item_id: itemId,
        quantity: quantity,
        }))
        .filter(item => item.quantity > 0);

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
      const { error } = await supabase.rpc('handle_item_return', {
        p_order_id: orderId,
        p_reason: reason.trim(),
        p_items: itemsToReturnList,
      });

      if (error) throw error;
      
      Alert.alert("Thành công", "Đã cập nhật trả món thành công.");
      navigation.goBack();

    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi trả món: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <ReturnItemRow
            item={item}
            returnQuantity={itemsToReturn[item.id] || 0}
            onUpdateQuantity={(amount) => handleUpdateQuantity(item.id, amount)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
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
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    itemQuantity: { fontSize: 13, color: 'gray', marginTop: 4 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { padding: 10, backgroundColor: '#F0F2F5', borderRadius: 20 },
    quantityText: { fontSize: 18, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
    reasonInput: { backgroundColor: 'white', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top', fontSize: 16, marginTop: 16, color: '#1F2937' },
    bottomBar: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    confirmButton: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#9CA3AF' }
});

export default ReturnSelectionScreen;