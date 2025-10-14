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
  ScrollView
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator';

type AvailabilityNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

interface MenuItem {
  id: number;
  name: string;
  is_available: boolean;
}

const ItemCard: React.FC<{
  item: MenuItem;
  onUpdate: (id: number, newStatus: boolean) => void;
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
      <Text style={styles.itemName}>{item.name}</Text>
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
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchUnavailable, setSearchUnavailable] = useState('');

  const fetchMenuItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items') // <-- THAY TÊN BẢNG NẾU CẦN
        .select('id, name, is_available')
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

  const handleUpdateAvailability = async (id: number, newStatus: boolean) => {
    // Cập nhật giao diện ngay lập tức để người dùng thấy phản hồi
    setMenuItems(currentItems =>
      currentItems.map(item => (item.id === id ? { ...item, is_available: newStatus } : item))
    );
    
    // Cập nhật lên server
    try {
      const { error } = await supabase
        .from('menu_items') // <-- THAY TÊN BẢNG NẾU CẦN
        .update({ is_available: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Lỗi', `Không thể cập nhật trạng thái món: ${err.message}`);
      setMenuItems(currentItems =>
        currentItems.map(item => (item.id === id ? { ...item, is_available: !newStatus } : item))
      );
    }
  };

  const filteredAvailableItems = useMemo(() => 
    menuItems.filter(item => item.is_available && item.name.toLowerCase().includes(searchAvailable.toLowerCase())),
    [menuItems, searchAvailable]
  );
  
  const filteredUnavailableItems = useMemo(() => 
    menuItems.filter(item => !item.is_available && item.name.toLowerCase().includes(searchUnavailable.toLowerCase())),
    [menuItems, searchUnavailable]
  );

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
      <ScrollView style={styles.container}>
        {/* DANH SÁCH MÓN CÒN */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>DANH SÁCH MÓN CÒN</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tên món..."
              value={searchAvailable}
              onChangeText={setSearchAvailable}
            />
          </View>
          <FlatList
            data={filteredAvailableItems}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <ItemCard item={item} onUpdate={handleUpdateAvailability} />}
            scrollEnabled={false} // Để ScrollView bên ngoài cuộn
          />
        </View>

        {/* DANH SÁCH MÓN HẾT */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>DANH SÁCH MÓN HẾT</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tên món..."
              value={searchUnavailable}
              onChangeText={setSearchUnavailable}
            />
          </View>
          <FlatList
            data={filteredUnavailableItems}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <ItemCard item={item} onUpdate={handleUpdateAvailability} />}
            scrollEnabled={false} // Để ScrollView bên ngoài cuộn
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
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
  listSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#111827',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    fontSize: 16,
    flex: 1,
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
});

export default ItemAvailabilityScreen;