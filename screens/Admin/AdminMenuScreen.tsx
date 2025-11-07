import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert, Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  name: string;
  is_available: boolean;
  is_hidden: boolean;
}

type ActiveTab = 'visible' | 'hidden';

const AdminMenuScreen = () => {
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('visible');

  // *** SỬA LỖI useFocusEffect TẠI ĐÂY ***
  useFocusEffect(
    useCallback(() => {
      const fetchMenuItems = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('menu_items')
            .select('id, name, is_available, is_hidden')
            .order('name', { ascending: true });

          if (error) throw error;
          setMenuItems(data as MenuItem[]);
        } catch (err: any) {
          Alert.alert('Lỗi', 'Không thể tải danh sách món: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchMenuItems(); // Gọi hàm async bên trong
      
      // Không cần return gì cả
    }, []) // Thêm mảng phụ thuộc rỗng
  );

  const handleToggleHiddenStatus = async (item: MenuItem) => {
    const newHiddenStatus = !item.is_hidden;
    
    if (newHiddenStatus === true) {
      const { data: hasActiveOrders, error: checkError } = await supabase.rpc(
        'check_item_has_active_orders',
        { p_item_id: item.id }
      );

      if (checkError) {
        Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái món.');
        return;
      }

      if (hasActiveOrders) {
        Alert.alert('Không thể ẩn', 'Món này vẫn còn trong các order đang phục vụ hoặc chờ bếp.');
        return;
      }
    }
    
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ is_hidden: newHiddenStatus })
      .eq('id', item.id);

    if (updateError) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái ẩn của món.');
    } else {
      setMenuItems(currentItems =>
        currentItems.map(i => (i.id === item.id ? { ...i, is_hidden: newHiddenStatus } : i))
      );
      Alert.alert('Thành công', `Đã ${newHiddenStatus ? 'ẩn' : 'hiển thị'} món "${item.name}" khỏi menu.`);
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Ionicons
          name={item.is_available ? 'ellipse' : 'ellipse'}
          size={12}
          color={item.is_available ? '#22C55E' : '#EF4444'}
          style={styles.statusDot}
        />
        <Text style={styles.itemName}>{item.name}</Text>
        {!item.is_available && <Text style={styles.outOfStockLabel}>(Hết hàng)</Text>}
      </View>
      <View style={styles.actions}>
        <Text style={styles.actionLabel}>{item.is_hidden ? 'Đã ẩn' : 'Đang bán'}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={!item.is_hidden ? '#3B82F6' : '#f4f3f4'}
          onValueChange={() => handleToggleHiddenStatus(item)}
          value={!item.is_hidden}
        />
      </View>
    </View>
  );

  const filteredItems = menuItems.filter(item => 
    activeTab === 'visible' ? !item.is_hidden : item.is_hidden
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Menu</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'visible' && styles.activeTab]}
          onPress={() => setActiveTab('visible')}
        >
          <Ionicons 
            name="checkmark-circle-outline" 
            size={18} 
            color={activeTab === 'visible' ? '#3B82F6' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.tabText, activeTab === 'visible' && styles.activeTabText]}>
            Đang bán
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'hidden' && styles.activeTab]}
          onPress={() => setActiveTab('hidden')}
        >
          <Ionicons 
            name="eye-off-outline" 
            size={18} 
            color={activeTab === 'hidden' ? '#3B82F6' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.tabText, activeTab === 'hidden' && styles.activeTabText]}>
            Đã ẩn
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                    Không có món nào trong danh sách này.
                </Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

// Styles không đổi
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: { 
    borderBottomColor: '#3B82F6' 
  },
  tabText: { 
    fontSize: 15, 
    color: '#6B7280', 
    fontWeight: '500' 
  },
  activeTabText: { 
    color: '#3B82F6', 
    fontWeight: 'bold' 
  },
  listContainer: { 
    padding: 16 
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  outOfStockLabel: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    marginRight: 12,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  }
});

export default AdminMenuScreen;