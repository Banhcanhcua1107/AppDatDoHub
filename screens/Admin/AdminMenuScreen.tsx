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
  Switch,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { getCloudinaryConfig } from '../../services/cloudinaryConfig';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

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
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

type ActiveTab = 'visible' | 'hidden';

// --- Modal Component để Thêm/Sửa Món với hỗ trợ Upload Ảnh ---
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(item ? { ...item } : { name: '', price: 0, cost: 0, description: '', category_id: categories[0]?.id });
    setSelectedImage(item?.image_url || null);
  }, [item, visible, categories]);

  // Hàm upload ảnh lên Cloudinary (không cần preset)
  const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Lấy Cloudinary config từ environment/Supabase Secrets
      const config = getCloudinaryConfig();
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `menu_${Date.now()}.jpg`,
      } as any);

      // SỬA LỖI: Thêm upload_preset và bỏ các trường không cần thiết cho unsigned upload
      formDataToSend.append('upload_preset', config.cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudinaryName}/image/upload`,
        {
          method: 'POST',
          body: formDataToSend,
          // Không cần header Content-Type, FormData tự xử lý
        }
      );

      const data = await response.json();
      
      if (data.error) {
        // Cung cấp thông báo lỗi chi tiết hơn
        console.error('Cloudinary Error:', data.error);
        Toast.show({ type: 'error', text1: 'Lỗi upload', text2: data.error.message || 'Lỗi upload ảnh từ Cloudinary' });
        throw new Error(data.error.message || 'Lỗi upload ảnh từ Cloudinary');
      }

      return data.secure_url; // Trả về URL ảnh từ Cloudinary
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi Upload', text2: error.message || 'Không thể upload ảnh lên Cloudinary' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể chọn ảnh' });
    }
  };

  // Hàm chụp ảnh từ camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể chụp ảnh' });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Tên món, Giá bán và Danh mục là bắt buộc.' });
      return;
    }

  let imageUrl: string | null | undefined = formData.image_url;

    // Nếu có ảnh được chọn và khác với ảnh cũ, upload lên Cloudinary
    if (selectedImage && selectedImage !== formData.image_url) {
      imageUrl = await uploadImageToCloudinary(selectedImage);
      if (!imageUrl) return; // Dừng nếu upload thất bại
    }

    onSave({ ...formData, image_url: imageUrl });
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
            
            {/* Image Upload Section */}
            <Text style={styles.label}>Hình ảnh sản phẩm</Text>
            <View style={styles.imageUploadContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.placeholderText}>Chưa chọn ảnh</Text>
                </View>
              )}
            </View>
            
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, styles.imageButtonBorder]} 
                onPress={pickImage}
                disabled={uploading}
              >
                <Ionicons name="image-outline" size={18} color="#3B82F6" />
                <Text style={styles.imageButtonText}>Chọn từ thư viện</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.imageButton, styles.imageButtonBorder]} 
                onPress={takePhoto}
                disabled={uploading}
              >
                <Ionicons name="camera-outline" size={18} color="#3B82F6" />
                <Text style={styles.imageButtonText}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>

            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.uploadingText}>Đang upload ảnh...</Text>
              </View>
            )}
            
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
                 <TouchableOpacity 
                   style={[styles.button, styles.saveButton, uploading && { opacity: 0.6 }]} 
                   onPress={handleSave}
                   disabled={uploading}
                 >
                   <Text style={styles.saveButtonText}>Lưu</Text>
                 </TouchableOpacity>
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const confirmActionRef = React.useRef<(() => Promise<void>) | null>(null);

  const fetchData = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('id, name').order('name', { ascending: true }),
      ]);
      if (menuRes.error) throw menuRes.error;
      if (catRes.error) throw catRes.error;
      // Sort để sản phẩm mới thêm ở đầu (is_active DESC, mới thêm sẽ có is_active = true)
      const sortedData = (menuRes.data as MenuItem[]).sort((a, b) => {
        if (a.is_available !== b.is_available) {
          return (b.is_available ? 1 : 0) - (a.is_available ? 1 : 0);
        }
        return a.name.localeCompare(b.name);
      });
      setMenuItems(sortedData);
      setCategories(catRes.data as Category[]);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu: ' + err.message });
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
      const dataToSave: any = {
        name: data.name,
        price: data.price,
        cost: data.cost,
        description: data.description,
        category_id: data.category_id,
      };

      // Thêm image_url nếu có
      if (data.image_url) {
        dataToSave.image_url = data.image_url;
      }

      let error;
      if (data.id) {
        const { error: updateError } = await supabase.from('menu_items').update(dataToSave).eq('id', data.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('menu_items').insert([dataToSave]);
        error = insertError;
      }
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Thành công', text2: `Đã ${data.id ? 'cập nhật' : 'thêm'} món thành công.` });
      setModalVisible(false);
      setEditingItem(null);
      await fetchData(false);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lưu món: ' + err.message });
    }
  };

  const handleToggleHiddenStatus = async (item: MenuItem) => {
    // Ask for confirmation when hiding an item; un-hiding is immediate
    const newHiddenStatus = !item.is_hidden;
    if (newHiddenStatus === true) {
      // show confirm modal before hiding
      setConfirmTitle('Xác nhận ẩn món');
      setConfirmMessage(`Bạn có chắc chắn muốn ẩn món "${item.name}" không?`);
      confirmActionRef.current = async () => {
        const { data: hasActiveOrders, error: checkError } = await supabase.rpc('check_item_has_active_orders', { p_item_id: item.id });
        if (checkError) { Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể kiểm tra trạng thái món.' }); return; }
        if (hasActiveOrders) { Toast.show({ type: 'error', text1: 'Không thể ẩn', text2: 'Món này vẫn còn trong các order đang hoạt động.' }); return; }
        const { error: updateError } = await supabase.from('menu_items').update({ is_hidden: newHiddenStatus }).eq('id', item.id);
        if (updateError) { Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật trạng thái ẩn của món.' }); } 
        else { setMenuItems(currentItems => currentItems.map(i => (i.id === item.id ? { ...i, is_hidden: newHiddenStatus } : i))); }
      };
      setConfirmVisible(true);
      return;
    }

    // If un-hiding, proceed immediately
    const { error: updateError } = await supabase.from('menu_items').update({ is_hidden: newHiddenStatus }).eq('id', item.id);
    if (updateError) { Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật trạng thái ẩn của món.' }); } 
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
      <ConfirmModal
        isVisible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        onClose={() => setConfirmVisible(false)}
        onConfirm={async () => {
          setConfirmVisible(false);
          if (confirmActionRef.current) await confirmActionRef.current();
        }}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="warning"
      />
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

  // Image Upload Styles
  imageUploadContainer: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  previewImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center',
    flex: 1,
  },
  placeholderText: { 
    color: '#9CA3AF', 
    fontSize: 14, 
    marginTop: 8,
    fontWeight: '500',
  },
  imageButtonsContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 16,
  },
  imageButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  imageButtonBorder: { 
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  imageButtonText: { 
    color: '#3B82F6', 
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  uploadingContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: { 
    color: '#3B82F6', 
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 13,
  },
});

export default AdminMenuScreen;