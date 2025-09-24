import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Image,
  FlatList,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { menuData, MenuItem } from '../../constants/menuData';
import CustomizeItemModal from './CustomizeItemModal';

// --- [CẬP NHẬT] Component cho mỗi món ăn trong lưới ---
const MenuItemGrid: React.FC<{ item: MenuItem, onSelect: () => void }> = ({ item, onSelect }) => {
  return (
    <View style={styles.gridItem}>
      {/* Thêm `justify-between` để đẩy 2 khối nội dung ra hai đầu */}
      <TouchableOpacity onPress={onSelect} style={styles.shadow} className="bg-white rounded-2xl p-3 h-full justify-between">
        
        {/* Khối nội dung trên: Ảnh và Tên */}
        <View>
          {/* Tăng chiều cao ảnh lên h-32 (128px) */}
          <Image source={{ uri: item.image }} className="w-full h-32 rounded-xl mb-2" />
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{item.name}</Text>
          <Text className="text-sm text-gray-500">Hello World</Text>
        </View>

        {/* Khối nội dung dưới: Giá và Nút bấm */}
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900">
            ${item.price.toLocaleString('vi-VN')}
          </Text>
          <TouchableOpacity onPress={onSelect} className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

type MenuScreenProps = NativeStackScreenProps<AppStackParamList, 'Menu'>;

const MenuScreen = ({ route, navigation }: MenuScreenProps) => {
  // --- TOÀN BỘ LOGIC VÀ JSX CỦA MÀN HÌNH GIỮ NGUYÊN ---
  const { tableId, tableName } = route.params; 
  const insets = useSafeAreaInsets();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  

  const [activeCategory, setActiveCategory] = useState(menuData[0].id);
  const selectedCategory = menuData.find(cat => cat.id === activeCategory);
    const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

   const handleAddToCart = (itemWithOptions: any) => {
    console.log(`--- ORDER MỚI CHO BÀN ${tableName} (ID: ${tableId}) ---`);
    console.log(`Món: ${itemWithOptions.name}`);
    console.log(`Số lượng: ${itemWithOptions.quantity}`);
    console.log(`Size: ${itemWithOptions.size.name}`);
    console.log(`Đường: ${itemWithOptions.sugar.name}`);
    console.log(`Topping: ${itemWithOptions.toppings.map((t: any) => t.name).join(', ')}`);
    console.log(`Tổng tiền: ${itemWithOptions.totalPrice.toLocaleString('vi-VN')} đ`);
    // TODO: Cập nhật state quản lý giỏ hàng ở đây
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 30, backgroundColor: 'white' }} className="px-4 pb-3">
        {/* Dòng tiêu đề */}
        <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                <Icon name="arrow-back-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Order cho {tableName}</Text>
            <View className="w-8" />
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4">
          <TextInput placeholder="Tìm kiếm" className="flex-1 h-12" />
          <TouchableOpacity>
             <Icon name="filter-outline" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View className="py-3 bg-white border-b-8 border-gray-50">
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {menuData.map(category => (
              <TouchableOpacity 
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full mr-3 ${activeCategory === category.id ? 'bg-gray-200' : 'bg-transparent'}`}
              >
                <Text className={`font-semibold ${activeCategory === category.id ? 'text-gray-800' : 'text-gray-500'}`}>{category.name}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>
      
      {/* Danh sách món ăn dạng Lưới */}
      <FlatList
        data={selectedCategory?.items}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <MenuItemGrid item={item} onSelect={() => handleSelectItem(item)} />
        )}
      />

      <CustomizeItemModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    gridItem: {
        width: '50%',
        padding: 8,
        // Điều chỉnh chiều cao tổng thể để phù hợp với ảnh lớn hơn
        height: 250, 
    }
});

export default MenuScreen;