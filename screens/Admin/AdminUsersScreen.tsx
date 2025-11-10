// screens/Admin/AdminUsersScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'nhan_vien' | 'bep' | 'thu_ngan' | 'admin';
}

const EDITABLE_ROLES: Exclude<UserProfile['role'], 'admin'>[] = ['nhan_vien', 'bep', 'thu_ngan'];
const ROLE_LABELS: Record<string, string> = { nhan_vien: 'Nhân viên', bep: 'Bếp', thu_ngan: 'Thu ngân', admin: 'Admin' };
const ROLE_COLORS: Record<string, string> = { nhan_vien: '#2196F3', bep: '#FF6B6B', thu_ngan: '#51CF66', admin: '#9C27B0' };

const TABS = [
  { key: 'all', label: 'Tất cả', icon: 'people-outline' as const },
  { key: 'nhan_vien', label: 'Nhân viên', icon: 'person-outline' as const },
  { key: 'bep', label: 'Bếp', icon: 'restaurant-outline' as const },
  { key: 'thu_ngan', label: 'Thu ngân', icon: 'cash-outline' as const },
];

export default function AdminUsersScreen({ onClose }: { onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'nhan_vien' | 'bep' | 'thu_ngan'>('all');

  const [formData, setFormData] = useState({
    id: '', full_name: '', email: '', password: '', role: 'nhan_vien' as const,
  });

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').neq('role', 'admin').order('full_name', { ascending: true });
      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể tải danh sách nhân viên: ${error.message}`);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchQuery.trim() || user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || user.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const openEditModal = (user: UserProfile) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ id: user.id, full_name: user.full_name || '', email: user.email || '', password: '', role: user.role });
    setModalVisible(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({ id: '', full_name: '', email: '', password: '', role: 'nhan_vien' });
    setModalVisible(true);
  };
  
  const handleSave = () => modalMode === 'add' ? handleCreateUser() : handleUpdateUser();
  
  const handleCreateUser = async () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.full_name.trim()) { Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email, mật khẩu và họ tên.'); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password, options: { data: { full_name: formData.full_name, role: formData.role } } });
      if (error) throw error;
      if (!data.user) throw new Error("Không thể tạo người dùng.");
      Alert.alert('Thành công', `Đã tạo nhân viên "${formData.full_name}".`);
      loadUsers();
      setModalVisible(false);
    } catch (error: any) { Alert.alert('Lỗi', `Không thể tạo nhân viên: ${error?.message || 'Lỗi không xác định'}`); } 
    finally { setIsLoading(false); }
  };
  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.full_name.trim()) { Alert.alert('Lỗi', 'Vui lòng điền tên nhân viên'); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: formData.full_name, role: formData.role }).eq('id', selectedUser.id);
      if (error) throw error;
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      loadUsers();
      setModalVisible(false);
    } catch (error: any) { Alert.alert('Lỗi', `Không thể cập nhật: ${error?.message || 'Lỗi không xác định'}`); } 
    finally { setIsLoading(false); }
  };
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    Alert.alert( 'Xác nhận xóa', `Bạn có chắc chắn muốn xóa nhân viên "${selectedUser.full_name}"?`,
      [ { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: selectedUser.id } });
              if (error) throw error;
              Alert.alert('Thành công', 'Đã xóa nhân viên.');
              loadUsers();
              setModalVisible(false);
            } catch (error: any) { Alert.alert('Lỗi', `Không thể xóa: ${error?.message || 'Lỗi không xác định'}`); } 
            finally { setIsLoading(false); }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}><View><Text style={styles.headerTitle}>Quản lý Nhân viên</Text><Text style={styles.headerSubtitle}>Thêm, sửa đổi thông tin và vai trò</Text></View><View style={{ flexDirection: 'row', gap: 12 }}><TouchableOpacity onPress={openAddModal} style={styles.headerButton}><Ionicons name="add" size={24} color="#111827" /></TouchableOpacity>{onClose && ( <TouchableOpacity onPress={onClose} style={[styles.headerButton, {backgroundColor: '#FEE2E2'}]}><Ionicons name="close" size={24} color="#EF4444" /></TouchableOpacity> )}</View></View>
      <View style={styles.searchSection}><Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} /><TextInput style={styles.searchInput} placeholder="Tìm theo tên hoặc email..." value={searchQuery} onChangeText={setSearchQuery} /></View>
      
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, selectedRoleFilter === tab.key && styles.activeTab]}
            onPress={() => setSelectedRoleFilter(tab.key as any)}
          >
            <Ionicons name={tab.icon} size={22} color={selectedRoleFilter === tab.key ? '#3B82F6' : '#6B7280'} />
            <Text style={[styles.tabText, selectedRoleFilter === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item: user }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => openEditModal(user)} activeOpacity={0.7}><View style={styles.userLeft}><Text style={styles.userName}>{user.full_name || 'Chưa có tên'}</Text><Text style={styles.userEmail}>{user.email}</Text></View><View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] || '#777' }]}><Text style={styles.roleBadgeText}>{ROLE_LABELS[user.role] || user.role}</Text></View></TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="people-outline" size={48} color="#D1D5DB" /><Text style={styles.emptyStateText}>Không tìm thấy nhân viên</Text></View>}
      />
      
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm nhân viên mới' : 'Chỉnh sửa thông tin'}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color="#D1D5DB" /></TouchableOpacity></View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.section}><Text style={styles.sectionLabel}>Họ tên *</Text><TextInput style={styles.input} value={formData.full_name} onChangeText={(text) => setFormData({ ...formData, full_name: text })} placeholder="Nguyễn Văn A" /></View>
              <View style={styles.section}><Text style={styles.sectionLabel}>Email *</Text><TextInput style={styles.input} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} autoCapitalize="none" keyboardType="email-address" editable={modalMode === 'add'} placeholder="email@example.com" /></View>
              {modalMode === 'add' && <View style={styles.section}><Text style={styles.sectionLabel}>Mật khẩu *</Text><TextInput style={styles.input} value={formData.password} onChangeText={(text) => setFormData({ ...formData, password: text })} secureTextEntry placeholder="Tối thiểu 6 ký tự" /></View>}
              <View style={styles.section}><Text style={styles.sectionLabel}>Chức vụ</Text>
                {EDITABLE_ROLES.map((role) => (
                  <TouchableOpacity key={role} style={[styles.roleOption, formData.role === role && styles.roleOptionSelected]} onPress={() => setFormData({ ...formData, role })}>
                    <View style={[styles.roleRadio, formData.role === role && styles.roleRadioSelected]}>{formData.role === role && <View style={styles.roleRadioDot} />}</View><Text style={styles.roleOptionText}>{ROLE_LABELS[role]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark" size={20} color="#fff" /><Text style={styles.saveBtnText}>Lưu</Text></>}</TouchableOpacity>
                {modalMode === 'edit' && <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteUser} disabled={isLoading}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>}
              </View>
            </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  searchSection: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, height: 40, color: '#1F2937' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white' },
  tabButton: { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: 'transparent', gap: 4 },
  activeTab: { borderBottomColor: '#3B82F6' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#3B82F6', fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  userRow: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userLeft: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  roleBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, marginTop: 50 },
  emptyStateText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalScroll: { paddingHorizontal: 20, paddingTop: 16 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1F2937' },
  roleOption: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  roleOptionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  roleRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  roleRadioSelected: { borderColor: '#3B82F6' },
  roleRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  roleOptionText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 20, paddingBottom: 40 },
  saveBtn: { flex: 1, backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  deleteBtn: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
});