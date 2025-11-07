// screens/Kitchen/ItemAvailabilityScreen.tsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';

// -- Không có thay đổi ở các phần import và type definitions --

type AvailabilityNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

interface MenuItem {
  id: string; // ID nên là string (uuid)
  name: string;
  is_available: boolean;
}

type ActiveTab = 'available' | 'unavailable';

// -- Component ItemCard không thay đổi --
const ItemCard: React.FC<{
  item: MenuItem;
  onUpdate: (id: string, newStatus: boolean) => void;
}> = ({ item, onUpdate }) => {
  const isAvailable = item.is_available;
  const buttonStyle = isAvailable ? styles.reportOutButton : styles.reportInButton;
  const buttonTextStyle = isAvailable ? styles.reportOutText : styles.reportInText;
  const buttonIcon = isAvailable ? (
    <View style={styles.circleIcon} />
  ) : (
    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
  );
  
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <TouchableOpacity 
        style={buttonStyle}
        onPress={() => onUpdate(item.id, !isAvailable)}
      >
        {buttonIcon}
        <Text style={buttonTextStyle}>{isAvailable ? 'Báo hết' : 'Báo còn'}</Text>
      </TouchableOpacity>
    </View>
  );
};


const ItemAvailabilityScreen = () => {
  const navigation = useNavigation<AvailabilityNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('available');

  const fetchMenuItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, is_available')
        // *** THAY ĐỔI QUAN TRỌNG: Chỉ lấy các món không bị ẩn ***
        .eq('is_hidden', false) 
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data as MenuItem[]);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMenuItems();
    }, [fetchMenuItems])
  );

  const handleUpdateAvailability = async (id: string, newStatus: boolean) => {
    // Giữ lại trạng thái cũ để rollback nếu lỗi
    const originalItems = [...menuItems];
    
    // Cập nhật giao diện ngay lập tức để người dùng thấy phản hồi
    setMenuItems(currentItems =>
      currentItems.map(item => (item.id === id ? { ...item, is_available: newStatus } : item))
    );

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Logic gửi thông báo khi báo hết không thay đổi, vẫn giữ nguyên
      // Lưu ý: Trigger trong DB đã xử lý việc này, code ở client chỉ là phương án dự phòng.

    } catch (err: any) {
      Alert.alert('Lỗi', `Không thể cập nhật trạng thái món: ${err.message}`);
      // Nếu có lỗi, trả lại trạng thái ban đầu
      setMenuItems(originalItems);
    }
  };

  // -- Phần logic filter và render không có thay đổi lớn --
  const filteredItems = useMemo(() => {
    const isAvailableTab = activeTab === 'available';
    return menuItems.filter(item => 
      item.is_available === isAvailableTab && 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, activeTab, searchQuery]);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo Hết / Báo Còn Món</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Món còn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'unavailable' && styles.activeTab]}
          onPress={() => setActiveTab('unavailable')}
        >
          <Text style={[styles.tabText, activeTab === 'unavailable' && styles.activeTabText]}>
            Món hết
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tên món..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ItemCard item={item} onUpdate={handleUpdateAvailability} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                    {searchQuery ? 'Không tìm thấy món nào' : `Không có món nào đang "${activeTab === 'available' ? 'còn' : 'hết'}"`}
                </Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

// -- Styles không thay đổi --
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E3A8A',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  searchBarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
  },
  
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
    color: '#111827'
  },
  reportOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  reportInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    backgroundColor: '#D1FAE5',
  },
  reportOutText: {
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '500',
  },
  reportInText: {
    color: '#059669',
    marginLeft: 6,
    fontWeight: '500',
  },
  circleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#EF4444',
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

export default ItemAvailabilityScreen;