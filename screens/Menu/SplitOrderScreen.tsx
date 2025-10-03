// screens/SplitOrderScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

// [CẬP NHẬT] Thêm 'image' vào interface
interface SplitItem {
  id: number;
  name: string;
  image: string | null;
  originalQuantity: number;
  unit_price: number;
  quantityToMove: number;
}

type Props = NativeStackScreenProps<AppStackParamList, 'SplitOrder'>;

const SplitItemRow: React.FC<{
  item: SplitItem;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}> = ({ item, onUpdateQuantity }) => {
  const placeholderImage = 'https://via.placeholder.com/150';
  const handleIncrease = () => {
    if (item.quantityToMove < item.originalQuantity) {
      onUpdateQuantity(item.id, item.quantityToMove + 1);
    }
  };
  const handleDecrease = () => {
    if (item.quantityToMove > 0) {
      onUpdateQuantity(item.id, item.quantityToMove - 1);
    }
  };

  return (
    <View style={styles.itemContainer}>
      {/* [THÊM MỚI] Hiển thị hình ảnh sản phẩm */}
      <Image
        source={{ uri: item.image || placeholderImage }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfoContainer}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>Tổng: {item.originalQuantity} • {item.unit_price.toLocaleString('vi-VN')}đ/món</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={handleDecrease} style={styles.quantityButton}>
          <Icon name="remove" size={18} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantityToMove}</Text>
        <TouchableOpacity onPress={handleIncrease} style={styles.quantityButton}>
          <Icon name="add" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SplitOrderScreen = ({ route, navigation }: Props) => {
  const { sourceOrderId, sourceTableNames, targetTable } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SplitItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchOrderItems = async () => {
        if (!sourceOrderId) return;
        setLoading(true);
        // [CẬP NHẬT] Lấy cột 'customizations' thay vì join bảng
        const { data, error } = await supabase
          .from('order_items')
          .select('id, quantity, unit_price, customizations')
          .eq('order_id', sourceOrderId);

        if (error) {
          Alert.alert("Lỗi", "Không thể tải danh sách món của order gốc.");
          navigation.goBack();
        } else {
          const fetchedItems: SplitItem[] = data.map(item => ({
            id: item.id,
            // [CẬP NHẬT] Lấy tên và hình ảnh từ customizations
            name: item.customizations?.name || 'Món không tên',
            image: item.customizations?.image || null,
            originalQuantity: item.quantity,
            unit_price: item.unit_price,
            quantityToMove: 0,
          }));
          setItems(fetchedItems);
        }
        setLoading(false);
      };

      fetchOrderItems();
    }, [sourceOrderId, navigation])
  );
  
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
      setItems(currentItems => 
          currentItems.map(item => 
              item.id === itemId ? { ...item, quantityToMove: newQuantity } : item
          )
      );
  };
  
  const handleConfirmSplit = async () => {
      const itemsToMove = items
          .filter(item => item.quantityToMove > 0)
          .map(item => ({
              item_id: item.id,
              quantity: item.quantityToMove
          }));

      if (itemsToMove.length === 0) {
          Alert.alert("Thông báo", "Vui lòng chọn ít nhất một món để tách.");
          return;
      }
      
      const totalItems = items.reduce((sum, item) => sum + item.originalQuantity, 0);
      const totalItemsToMove = itemsToMove.reduce((sum, item) => sum + item.quantity, 0);

      // Logic kiểm tra không cho tách hết món (đã có)
      if (totalItems === totalItemsToMove) {
          Alert.alert("Hành động không hợp lệ", "Bạn đang chọn tách toàn bộ order. Vui lòng sử dụng chức năng 'Chuyển Bàn' để thay thế.");
          return;
      }

      setIsSubmitting(true);
      try {
          const { error } = await supabase.rpc('handle_order_split', {
              source_order_id_input: sourceOrderId,
              target_table_id_input: targetTable.id,
              items_to_move_input: itemsToMove
          });

          if (error) throw error;
          
          Alert.alert("Thành công", `Đã tách món sang bàn ${targetTable.name}.`);
          navigation.pop(2);

      } catch (error: any) {
          Alert.alert("Lỗi", "Không thể tách order: " + error.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const totalToMove = items.reduce((sum, item) => sum + (item.quantityToMove * item.unit_price), 0);
  const hasItemsToMove = items.some(item => item.quantityToMove > 0);

  if (loading) {
    return <View style={styles.containerCenter}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back-outline" size={26} />
          </TouchableOpacity>
          <View>
              <Text style={styles.headerTitle}>Tách món từ {sourceTableNames}</Text>
              <Text style={styles.headerSubtitle}>sang {targetTable.name}</Text>
          </View>
          <View style={{width: 40}} />
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => <SplitItemRow item={item} onUpdateQuantity={handleUpdateQuantity} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50}}>Order gốc không có món nào.</Text>}
      />
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
          <View>
              <Text style={styles.totalLabel}>Tổng tách</Text>
              <Text style={styles.totalAmount}>{totalToMove.toLocaleString('vi-VN')}đ</Text>
          </View>
          <TouchableOpacity 
              style={[styles.confirmButton, (!hasItemsToMove || isSubmitting) && styles.disabledButton]}
              onPress={handleConfirmSplit}
              disabled={!hasItemsToMove || isSubmitting}
          >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Xác nhận tách</Text>}
          </TouchableOpacity>
      </View>
    </View>
  );
};

// [CẬP NHẬT] Styles để hiển thị hình ảnh
const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    headerSubtitle: { fontSize: 14, color: 'gray', textAlign: 'center' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: '#F0F0F0',
    },
    itemInfoContainer: {
      flex: 1,
      marginLeft: 12,
    },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    itemPrice: { fontSize: 13, color: 'gray', marginTop: 4 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { padding: 10, backgroundColor: '#F0F2F5', borderRadius: 20 },
    quantityText: { fontSize: 18, fontWeight: 'bold', minWidth: 30, textAlign: 'center', marginHorizontal: 5 },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    totalLabel: { fontSize: 14, color: 'gray' },
    totalAmount: { fontSize: 24, fontWeight: 'bold' },
    confirmButton: { backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#9CA3AF' }
});

export default SplitOrderScreen;