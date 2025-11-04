// screens/Admin/AdminMenuScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminMenu'>;

export default function AdminMenuScreen({ navigation }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [categories, setCategories] = useState(['Khai vị', 'Chính', 'Đồ uống', 'Tráng miệng']);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Chính',
    available: true,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, menuItems]);

  const loadMenuItems = async () => {
    try {
      // TODO: Gọi API để lấy danh sách sản phẩm
      const mockData: MenuItem[] = [
        {
          id: '1',
          name: 'Phở Bò',
          description: 'Phở bò truyền thống',
          price: 45000,
          category: 'Chính',
          available: true,
        },
        {
          id: '2',
          name: 'Cơm Tấm',
          description: 'Cơm tấm sườn nạc',
          price: 40000,
          category: 'Chính',
          available: true,
        },
        {
          id: '3',
          name: 'Cà Phê Đen',
          description: 'Cà phê đen đá',
          price: 15000,
          category: 'Đồ uống',
          available: true,
        },
      ];
      setMenuItems(mockData);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(menuItems);
      return;
    }
    const filtered = menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Chính',
      available: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (item: MenuItem) => {
    setIsAddingNew(false);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
    });
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const newItem: MenuItem = {
        id: isAddingNew ? Date.now().toString() : selectedItem?.id || '',
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
      };

      if (isAddingNew) {
        setMenuItems([...menuItems, newItem]);
        Alert.alert('Thành công', 'Thêm sản phẩm mới thành công');
      } else {
        const updated = menuItems.map((item) => (item.id === selectedItem?.id ? newItem : item));
        setMenuItems(updated);
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', onPress: () => {} },
        {
          text: 'Xóa',
          onPress: () => {
            setMenuItems(menuItems.filter((item) => item.id !== itemId));
            Alert.alert('Thành công', 'Xóa sản phẩm thành công');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleAvailability = (itemId: string) => {
    const updated = menuItems.map((item) =>
      item.id === itemId ? { ...item, available: !item.available } : item
    );
    setMenuItems(updated);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Menu</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Menu Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
                <View style={styles.itemBadges}>
                  <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                  {item.available && (
                    <View style={[styles.badge, { backgroundColor: COLORS.success }]}>
                      <Text style={styles.badgeText}>Có sẵn</Text>
                    </View>
                  )}
                  {!item.available && (
                    <View style={[styles.badge, { backgroundColor: COLORS.danger }]}>
                      <Text style={styles.badgeText}>Hết hàng</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleAvailability(item.id)}
                style={[
                  styles.actionButton,
                  { backgroundColor: item.available ? '#e8f5e9' : '#ffebee' },
                ]}
              >
                <Text style={styles.actionText}>{item.available ? '✓' : '✕'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Không có sản phẩm nào</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingNew ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Nhập mô tả sản phẩm"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Giá *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Danh mục</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      formData.category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSave]}
                  onPress={handleSaveItem}
                >
                  <Text style={styles.buttonSaveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 28,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  itemFooter: {
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#f5f5f5',
  },
  buttonCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonSave: {
    backgroundColor: COLORS.primary,
  },
  buttonSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
