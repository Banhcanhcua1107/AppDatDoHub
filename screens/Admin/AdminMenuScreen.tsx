// screens/Admin/AdminMenuScreen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// --- Interfaces ---
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category_id: string;
  is_available: boolean;
  is_hidden: boolean;
  cost: number;
}

interface Category {
  id: string;
  name: string;
}

type ActiveTab = 'visible' | 'hidden';

// --- Modal Component để Thêm/Sửa Món (Không thay đổi so với lần trước) ---
const MenuItemModal = ({
  visible,
  onClose,
  onSave,
  item,
  categories,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => void;
  item: Partial<MenuItem> | null;
  categories: Category[];
}) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  useEffect(() => {
    setFormData(item ? { ...item } : { name: '', price: 0, cost: 0, description: '', category_id: categories[0]?.id });
  }, [item, visible, categories]);

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      Alert.alert('Thiếu thông tin', 'Tên món, Giá bán và Danh mục là bắt buộc.');
      return;
    }
    onSave(formData);
  };

  const setFormValue = (key: keyof MenuItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{item?.id ? 'Chỉnh sửa món' : 'Thêm món mới'}</Text>
            <Text style={styles.label}>Tên món</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={val => setFormValue('name', val)} placeholder="Vd: Cà phê sữa"/>
            <Text style={styles.label}>Giá bán</Text>
            <TextInput style={styles.input} value={String(formData.price || '')} onChangeText={val => setFormValue('price', Number(val.replace(/[^0-9]/g, '')))} placeholder="Vd: 25000" keyboardType="numeric"/>
            <Text style={styles.label}>Giá vốn (tùy chọn)</Text>
            <TextInput style={styles.input} value={String(formData.cost || '')} onChangeText={val => setFormValue('cost', Number(val.replace(/[^0-9]/g, '')))} placeholder="Vd: 10000" keyboardType="numeric"/>
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={formData.category_id} onValueChange={(itemValue) => setFormValue('category_id', itemValue)}>
                {categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={cat.id} />)}
              </Picker>
            </View>
            <Text style={styles.label}>Mô tả (tùy chọn)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={val => setFormValue('description', val)} placeholder="Vd: Thơm ngon đậm vị" multiline/>
            <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Text style={styles.cancelButtonText}>Hủy</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}><Text style={styles.saveButtonText}>Lưu</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- Main Screen Component ---
const AdminMenuScreen = ({ onClose }: { onClose?: () => void }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('visible');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const fetchData = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('id, name').order('name', { ascending: true }),
      ]);
      if (menuRes.error) throw menuRes.error;
      if (catRes.error) throw catRes.error;
      setMenuItems(menuRes.data as MenuItem[]);
      setCategories(catRes.data as Category[]);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu: ' + err.message);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(true); }, [fetchData]));
  
  const openModal = (item: Partial<MenuItem> | null) => {
    setEditingItem(item);
    setModalVisible(true);
  };
  
  const handleSaveItem = async (data: Partial<MenuItem>) => {
    try {
      // ... (logic lưu giữ nguyên)
      const dataToSave = {
        name: data.name,
        price: data.price,
        cost: data.cost,
        description: data.description,
        category_id: data.category_id,
      };
      let error;
      if (data.id) {
        const { error: updateError } = await supabase.from('menu_items').update(dataToSave).eq('id', data.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('menu_items').insert([dataToSave]);
        error = insertError;
      }
      if (error) throw error;
      Alert.alert('Thành công', `Đã ${data.id ? 'cập nhật' : 'thêm'} món thành công.`);
      setModalVisible(false);
      setEditingItem(null);
      await fetchData(false);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể lưu món: ' + err.message);
    }
  };

  const handleToggleHiddenStatus = async (item: MenuItem) => {
    // ... (logic ẩn/hiện giữ nguyên)
    const newHiddenStatus = !item.is_hidden;
    if (newHiddenStatus === true) {
      const { data: hasActiveOrders, error: checkError } = await supabase.rpc('check_item_has_active_orders', { p_item_id: item.id });
      if (checkError) { Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái món.'); return; }
      if (hasActiveOrders) { Alert.alert('Không thể ẩn', 'Món này vẫn còn trong các order đang hoạt động.'); return; }
    }
    const { error: updateError } = await supabase.from('menu_items').update({ is_hidden: newHiddenStatus }).eq('id', item.id);
    if (updateError) { Alert.alert('Lỗi', 'Không thể cập nhật trạng thái ẩn của món.'); } 
    else { setMenuItems(currentItems => currentItems.map(i => (i.id === item.id ? { ...i, is_hidden: newHiddenStatus } : i))); }
  };

  // [CẢI TIẾN GIAO DIỆN] renderItem được thiết kế lại
  const renderItem = ({ item }: { item: MenuItem }) => {
    const categoryName = categories.find(c => c.id === item.category_id)?.name || 'Không rõ';
    const isAvailable = item.is_available;
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          {/* Cột trái: Thông tin chính */}
          <View style={styles.itemMainInfo}>
            <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? '#22C55E' : '#EF4444' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                {categoryName} • {item.price.toLocaleString('vi-VN')}đ
              </Text>
              {!isAvailable && <Text style={styles.outOfStockLabel}>Hết hàng</Text>}
            </View>
          </View>
          
          {/* Cột phải: Các hành động */}
          <View style={styles.itemActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
              <Ionicons name="pencil" size={20} color="#4B5563" />
            </TouchableOpacity>
            <Switch
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={!item.is_hidden ? '#22C55E' : '#f4f3f4'}
              onValueChange={() => handleToggleHiddenStatus(item)}
              value={!item.is_hidden}
            />
          </View>
        </View>
      </View>
    );
  };

  const filteredItems = menuItems.filter(item => activeTab === 'visible' ? !item.is_hidden : item.is_hidden);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.headerTitle}>Quản lý Menu</Text>
          <Text style={styles.headerSubtitle}>Thêm, sửa, ẩn/hiện sản phẩm</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => fetchData(true)} style={styles.refreshButton}><Ionicons name="refresh" size={24} color="#111827" /></TouchableOpacity>
          {onClose && <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="#111827" /></TouchableOpacity>}
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'visible' && styles.activeTab]} onPress={() => setActiveTab('visible')}>
          <Ionicons name="eye-outline" size={18} color={activeTab === 'visible' ? '#3B82F6' : '#6B7280'} style={{ marginRight: 8 }} />
          <Text style={[styles.tabText, activeTab === 'visible' && styles.activeTabText]}>Đang bán</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'hidden' && styles.activeTab]} onPress={() => setActiveTab('hidden')}>
          <Ionicons name="eye-off-outline" size={18} color={activeTab === 'hidden' ? '#3B82F6' : '#6B7280'} style={{ marginRight: 8 }} />
          <Text style={[styles.tabText, activeTab === 'hidden' && styles.activeTabText]}>Đã ẩn</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#3B82F6" /></View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="fast-food-outline" size={60} color="#D1D5DB" /><Text style={styles.emptyText}>Không có món nào.</Text></View>}
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={() => openModal(null)}><Ionicons name="add" size={32} color="white" /></TouchableOpacity>

      <MenuItemModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveItem} item={editingItem} categories={categories}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  refreshButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  closeButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white' },
  tabButton: { flex: 1, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#3B82F6' },
  tabText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#3B82F6', fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  
  // [CẢI TIẾN GIAO DIỆN] Item styles
  itemContainer: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemContent: { flexDirection: 'row', alignItems: 'center', padding: 16, },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  itemMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 16, color: '#111827', fontWeight: '600', marginBottom: 2 },
  itemDetails: { fontSize: 14, color: '#6B7280' },
  itemPrice: { fontWeight: '500' },
  outOfStockLabel: { fontSize: 13, color: '#EF4444', fontStyle: 'italic', marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  editButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, padding: 20 },
  emptyText: { color: '#6B7280', fontSize: 16, marginTop: 16, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  
  // Styles cho Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1F2937' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#F3F4F6', borderRadius: 8, justifyContent: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  cancelButton: { backgroundColor: '#E5E7EB' },
  cancelButtonText: { color: '#4B5563', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#3B82F6' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});

export default AdminMenuScreen;