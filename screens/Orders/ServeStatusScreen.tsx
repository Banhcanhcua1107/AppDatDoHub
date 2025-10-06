// --- START OF FILE ServeStatusScreen.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface ServeItem {
  id: number;
  name: string;
  quantity: number;
  is_served: boolean;
}

type Props = NativeStackScreenProps<AppStackParamList, 'ServeStatus'>;

const ServeItemRow: React.FC<{
  item: ServeItem;
  onToggleStatus: () => void;
}> = ({ item, onToggleStatus }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.is_served && styles.servedItemText]}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleStatus}
        style={[styles.checkButton, item.is_served ? styles.checkedButton : styles.uncheckedButton]}
      >
        <Icon
          name={item.is_served ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={item.is_served ? '#10B981' : '#9CA3AF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const ServeStatusScreen = ({ route, navigation }: Props) => {
  const { orderId, tableName } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServeItem[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('id, quantity, is_served, customizations')
        .eq('order_id', orderId);

      if (error) throw error;

      const formattedItems = data.map((item) => ({
        id: item.id,
        name: item.customizations?.name || 'Món không xác định',
        quantity: item.quantity,
        is_served: item.is_served,
      }));
      setItems(formattedItems);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggleStatus = async (itemToUpdate: ServeItem) => {
    const newStatus = !itemToUpdate.is_served;
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ is_served: newStatus })
        .eq('id', itemToUpdate.id);

      if (error) throw error;

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemToUpdate.id ? { ...item, is_served: newStatus } : item
        )
      );
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái món: ' + err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex1}>
      {/* [SỬA] Đổi StatusBar để chữ và icon trên cùng (pin, sóng) thành màu trắng */}
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          {/* [SỬA] Đổi màu icon thành trắng */}
          <Icon name="arrow-back-outline" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra món cho {tableName}</Text>
        <TouchableOpacity onPress={fetchItems} style={styles.backButton}>
          {/* [SỬA] Đổi màu icon thành trắng */}
          <Icon name="refresh-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ServeItemRow item={item} onToggleStatus={() => handleToggleStatus(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: 'gray' }}>Chưa có món nào trong order này.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#F8F9FA' },
  // [SỬA] Đổi màu nền header và bỏ đường viền dưới
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#3B82F6', // Màu xanh dương
  },
  backButton: { padding: 5 },
  // [SỬA] Đổi màu chữ header thành trắng
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  itemQuantity: { fontSize: 13, color: 'gray', marginTop: 4 },
  servedItemText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  checkButton: { padding: 8 },
  checkedButton: {},
  uncheckedButton: {},
});

export default ServeStatusScreen;
