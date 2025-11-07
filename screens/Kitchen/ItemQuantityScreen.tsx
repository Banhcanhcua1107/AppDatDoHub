// src/screens/Kitchen/ItemQuantityScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';

// [MỚI] Hàm chuẩn hóa text - loại bỏ dấu
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
};

// [MỚI] Hàm lấy viết tắt từ text
const getAcronym = (text: string): string => {
  if (!text) return '';
  return normalizeText(text)
    .split(' ')
    .map((word) => word[0])
    .join('');
};

// Interface MenuItem giữ nguyên
interface MenuItem {
  id: string;
  name: string;
  is_available: boolean;
  daily_stock_limit: number | null;
  remaining_quantity: number | null;
}

// [MỚI] Tạo một component riêng cho mỗi item trong danh sách
const QuantityItem: React.FC<{
  item: MenuItem;
  onUpdate: (
    item: MenuItem,
    field: 'daily_stock_limit' | 'is_available',
    value: number | boolean | null
  ) => void;
}> = ({ item, onUpdate }) => {
  const [tempLimit, setTempLimit] = useState(item.daily_stock_limit ?? 0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDecrement = () => {
    if (tempLimit > 0) {
      setTempLimit(tempLimit - 1);
    }
  };

  const handleIncrement = () => {
    setTempLimit(tempLimit + 1);
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    const newLimit = tempLimit === 0 ? null : tempLimit;
    await onUpdate(item, 'daily_stock_limit', newLimit);
    setIsModalVisible(false);
    setIsUpdating(false);
  };

  return (
    <>
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemStatus}>
            {`Còn lại: ${item.remaining_quantity ?? 'N/A'} / Giới hạn: ${item.daily_stock_limit ?? 'Không giới hạn'}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setTempLimit(item.daily_stock_limit ?? 0);
            setIsModalVisible(true);
          }}
        >
          <Icon name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal để chỉnh sửa số lượng */}
      <Modal transparent={true} visible={isModalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{item.name}</Text>
            <Text style={styles.modalSubtitle}>Chỉnh sửa giới hạn số lượng</Text>

            {/* Phần nhập số lượng với +/- */}
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleDecrement}
                disabled={tempLimit === 0}
              >
                <Icon name="remove" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{tempLimit}</Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleIncrement}>
                <Icon name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Các nút xác nhận/hủy */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, isUpdating && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={isUpdating}
              >
                <Text style={styles.confirmButtonText}>
                  {isUpdating ? 'Đang cập nhật...' : 'Xác nhận'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// Component chính
const ItemQuantityScreen = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, is_available, daily_stock_limit, remaining_quantity')
      .order('name', { ascending: true });

    if (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món.');
    } else {
      setItems(data as MenuItem[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleUpdateItem = async (
    item: MenuItem,
    field: 'daily_stock_limit' | 'is_available',
    value: number | boolean | null
  ) => {
    const updatePayload: Partial<MenuItem> = { [field]: value };
    
    if (field === 'daily_stock_limit' && typeof value === 'number') {
      updatePayload.remaining_quantity = value;
      updatePayload.is_available = true;
    } else if (field === 'daily_stock_limit' && value === null) {
        updatePayload.remaining_quantity = null;
        updatePayload.is_available = true;
    }

    const { error } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('id', item.id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Không thể cập nhật ${item.name}` });
    } else {
      Toast.show({ type: 'success', text1: 'Thành công', text2: `${item.name} đã được cập nhật` });
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === item.id ? { ...i, ...updatePayload } : i))
      );
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    Toast.show({ type: 'success', text1: 'Thành công', text2: 'Dữ liệu đã được cập nhật' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const filteredItems = items.filter(it => {
    const normalizedQuery = normalizeText(searchQuery);
    const normalizedItemName = normalizeText(it.name);
    const itemAcronym = getAcronym(it.name);
    
    return (
      normalizedItemName.includes(normalizedQuery) || 
      itemAcronym.includes(normalizedQuery)
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header với nút quay về */}
      <View style={[styles.headerTop, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý số lượng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Thanh tìm kiếm + nút cập nhật */}
      <View style={styles.headerRow}>
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm kiếm món..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Icon name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuantityItem item={item} onUpdate={handleUpdateItem} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy món nào.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    height: 48,
    color: '#1F2937',
  },
  clearButton: { padding: 4 },
  refreshButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  itemStatus: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // [MỚI] Styles cho Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    width: 80,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 16 },
});

export default ItemQuantityScreen;