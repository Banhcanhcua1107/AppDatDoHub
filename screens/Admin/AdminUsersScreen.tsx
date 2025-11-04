// screens/Admin/AdminUsersScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'nhan_vien' | 'bep' | 'thu_ngan' | 'admin';
  status: 'active' | 'inactive';
  join_date: string;
  permissions?: string[];
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminMenu: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
};

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUsers'>;

const ROLE_LABELS: Record<string, string> = {
  nhan_vien: 'Nhân viên',
  bep: 'Bếp',
  thu_ngan: 'Thu ngân',
  admin: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  nhan_vien: '#2196F3',
  bep: '#FF6B6B',
  thu_ngan: '#51CF66',
  admin: '#9C27B0',
};

const PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  nhan_vien: ['Xem menu', 'Tạo đơn hàng', 'Xem đơn hàng'],
  bep: ['Xem đơn hàng', 'Cập nhật trạng thái đơn', 'Xem menu'],
  thu_ngan: ['Xem đơn hàng', 'Xử lý thanh toán', 'In hóa đơn', 'Xem báo cáo'],
  admin: ['Toàn bộ quyền', 'Quản lý người dùng', 'Quản lý menu', 'Xem báo cáo'],
};

export default function AdminUsersScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'nhan_vien' as const,
    status: 'active' as const,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, users]);

  const loadUsers = async () => {
    try {
      // TODO: Gọi API để lấy danh sách nhân viên
      const mockUsers: User[] = [
        {
          id: '1',
          full_name: 'Nguyễn Văn A',
          email: 'vana@restaurant.com',
          phone: '0901234567',
          role: 'nhan_vien',
          status: 'active',
          join_date: '2024-01-15',
        },
        {
          id: '2',
          full_name: 'Trần Thị B',
          email: 'thib@restaurant.com',
          phone: '0902345678',
          role: 'bep',
          status: 'active',
          join_date: '2024-02-20',
        },
        {
          id: '3',
          full_name: 'Lê Văn C',
          email: 'vanc@restaurant.com',
          phone: '0903456789',
          role: 'thu_ngan',
          status: 'active',
          join_date: '2024-03-10',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    setSelectedUser(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'nhan_vien',
      status: 'active',
    });
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setIsAddingNew(false);
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const newUser: User = {
        id: isAddingNew ? Date.now().toString() : selectedUser?.id || '',
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        join_date: isAddingNew ? new Date().toISOString().split('T')[0] : selectedUser?.join_date || '',
      };

      if (isAddingNew) {
        setUsers([...users, newUser]);
        Alert.alert('Thành công', 'Thêm nhân viên mới thành công');
      } else {
        const updated = users.map((user) => (user.id === selectedUser?.id ? newUser : user));
        setUsers(updated);
        Alert.alert('Thành công', 'Cập nhật thông tin nhân viên thành công');
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin nhân viên');
    }
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài khoản nhân viên này?',
      [
        { text: 'Hủy', onPress: () => {} },
        {
          text: 'Xóa',
          onPress: () => {
            setUsers(users.filter((user) => user.id !== userId));
            Alert.alert('Thành công', 'Xóa nhân viên thành công');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleUserStatus = (userId: string) => {
    const updated = users.map((user) =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(updated);
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Nhân viên</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search and Filter */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhân viên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Role Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'all' && styles.roleButtonActive,
          ]}
          onPress={() => setSelectedRole('all')}
        >
          <Text
            style={[
              styles.roleButtonText,
              selectedRole === 'all' && styles.roleButtonTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        {Object.entries(ROLE_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.roleButton,
              selectedRole === key && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole(key)}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === key && styles.roleButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item: user }) => (
          <View style={styles.userCard}>
            <TouchableOpacity
              style={styles.userCardTouchable}
              onPress={() => openUserDetail(user)}
              activeOpacity={0.7}
            >
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.full_name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: ROLE_COLORS[user.role] },
                  ]}
                >
                  <Text style={styles.roleBadgeText}>
                    {ROLE_LABELS[user.role]}
                  </Text>
                </View>
              </View>

              <View style={styles.userFooter}>
                <Text style={styles.userPhone}>{user.phone}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        user.status === 'active' ? COLORS.success : '#CCC',
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.userActions}>
              <TouchableOpacity onPress={() => openEditModal(user)} style={styles.actionButton}>
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleUserStatus(user.id)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  {user.status === 'active' ? '🔒' : '🔓'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser(user.id)}
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
            <Text style={styles.emptyStateText}>Không có nhân viên nào</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
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
                {isAddingNew ? 'Thêm nhân viên mới' : 'Sửa thông tin nhân viên'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Chức vụ</Text>
              <View style={styles.roleContainer}>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.roleOption,
                      formData.role === key && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: key as any })}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === key && styles.roleOptionTextActive,
                      ]}
                    >
                      {label}
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
                  onPress={handleSaveUser}
                >
                  <Text style={styles.buttonSaveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết nhân viên</Text>
                  <Pressable onPress={() => setDetailModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Họ và tên:</Text>
                      <Text style={styles.infoValue}>{selectedUser.full_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{selectedUser.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Số điện thoại:</Text>
                      <Text style={styles.infoValue}>{selectedUser.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Chức vụ:</Text>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: ROLE_COLORS[selectedUser.role] },
                        ]}
                      >
                        <Text style={styles.roleBadgeText}>
                          {ROLE_LABELS[selectedUser.role]}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Ngày tham gia:</Text>
                      <Text style={styles.infoValue}>{selectedUser.join_date}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quyền hạn</Text>
                    {PERMISSIONS_BY_ROLE[selectedUser.role]?.map((perm, idx) => (
                      <View key={idx} style={styles.permissionRow}>
                        <Text style={styles.permissionText}>✓ {perm}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardTouchable: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  userPhone: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 20,
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
    paddingVertical: 60,
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleOptionText: {
    fontSize: 12,
    color: '#666',
  },
  roleOptionTextActive: {
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  permissionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 12,
    color: '#51CF66',
    fontWeight: '500',
  },
});
