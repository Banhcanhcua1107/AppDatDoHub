// screens/Admin/AdminUsersScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
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

const ROLE_LABELS: Record<string, string> = { nhan_vien: 'Nhân viên', bep: 'Bếp', thu_ngan: 'Thu ngân', admin: 'Admin' };
const ROLE_COLORS: Record<string, string> = { nhan_vien: '#2196F3', bep: '#FF6B6B', thu_ngan: '#51CF66', admin: '#9C27B0' };

export default function AdminUsersScreen({ onClose }: { onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ full_name: '', role: 'nhan_vien' as const });

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể tải danh sách nhân viên: ${error.message}`);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = users.filter((user) =>
    !searchQuery.trim() || 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({ full_name: user.full_name || '', role: user.role });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !formData.full_name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tên nhân viên'); return;
    }
    try {
      const { error } = await supabase.from('profiles').update({ full_name: formData.full_name, role: formData.role }).eq('id', selectedUser.id);
      if (error) throw error;
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      loadUsers();
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Lỗi', `Không thể cập nhật: ${error?.message || 'Lỗi không xác định'}`);
    }
  };

  const handleDeleteUser = () => {
    Alert.alert('Xóa nhân viên', 'Hành động này bị vô hiệu hóa trên ứng dụng. Vui lòng thực hiện trong trang quản trị Supabase.', [{ text: 'Đã hiểu' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
            <Text style={styles.headerTitle}>Quản lý Nhân viên</Text>
            <Text style={styles.headerSubtitle}>Sửa đổi thông tin và vai trò</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={loadUsers} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color="#111827" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Search */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Tìm theo tên hoặc email..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item: user }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => openEditModal(user)} activeOpacity={0.7}>
            <View style={styles.userLeft}>
              <Text style={styles.userName}>{user.full_name || 'Chưa có tên'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] }]}>
              <Text style={styles.roleBadgeText}>{ROLE_LABELS[user.role]}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}><Ionicons name="people-outline" size={48} color="#ddd" /><Text style={styles.emptyStateText}>Không có nhân viên nào</Text></View>
        }
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            {selectedUser && ( <>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.section}><Text style={styles.sectionLabel}>Họ tên</Text><TextInput style={styles.input} value={formData.full_name} onChangeText={(text) => setFormData({ ...formData, full_name: text })} /></View>
                <View style={styles.section}><Text style={styles.sectionLabel}>Chức vụ</Text>
                  {(['nhan_vien', 'bep', 'thu_ngan', 'admin'] as const).map((role) => (
                    <TouchableOpacity key={role} style={[styles.roleOption, formData.role === role && styles.roleOptionSelected]} onPress={() => setFormData({ ...formData, role })}>
                      <View style={[styles.roleRadio, formData.role === role && styles.roleRadioSelected]}>{formData.role === role && <View style={styles.roleRadioDot} />}</View><Text style={styles.roleOptionText}>{ROLE_LABELS[role]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUser}><Ionicons name="checkmark" size={20} color="#fff" /><Text style={styles.saveBtnText}>Lưu</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteUser}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
                </View>
              </ScrollView>
            </>)}
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, height: 40, color: '#1F2937' },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  userRow: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userLeft: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  roleBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, marginTop: 50 },
  emptyStateText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalScroll: { paddingHorizontal: 16, paddingVertical: 16 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1F2937' },
  roleOption: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  roleOptionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  roleRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  roleRadioSelected: { borderColor: '#3B82F6' },
  roleRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  roleOptionText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 20, paddingBottom: 20 },
  saveBtn: { flex: 1, backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  deleteBtn: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
});