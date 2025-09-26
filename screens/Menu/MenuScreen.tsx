// --- START OF FILE MenuScreen.tsx ---

// [SỬA] Sửa lại các dòng import
import React, { useState, useCallback } from 'react'; 
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  InteractionManager
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect vẫn ở đây
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // [SỬA] Chuyển NativeStackScreenProps sang đây
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomizeItemModal from './CustomizeItemModal';
import CartDetailModal from './CartDetailModal';
import { useOrders } from '../../context/OrderContext';
import { supabase } from '../../services/supabase';

// --- Các phần còn lại của file giữ nguyên như trước ---

interface ExistingItem {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    totalPrice: number;
}

interface MenuItemFromDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface CategoryFromDB {
  id: string;
  name: string;
  menu_items: MenuItemFromDB[];
}

const ExistingItemsList: React.FC<{ items: ExistingItem[] }> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <View className="px-4 pt-3 bg-white border-b-8 border-gray-50">
            <Text className="text-base font-bold text-gray-700 mb-2">Các món đã gọi</Text>
            {items.map(item => (
                <View key={item.id} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-600">{item.quantity}x {item.name}</Text>
                    <Text className="text-gray-800 font-semibold">{(item.totalPrice).toLocaleString('vi-VN')}đ</Text>
                </View>
            ))}
        </View>
    );
};


const MenuItemGrid: React.FC<{ item: MenuItemFromDB, onSelect: () => void }> = ({ item, onSelect }) => {
  const placeholderImage = 'https://via.placeholder.com/150';

  return (
    <View style={styles.gridItem}>
      <TouchableOpacity onPress={onSelect} style={styles.shadow} className="bg-white rounded-2xl p-3 h-full justify-between">
        <View>
          <Image source={{ uri: item.image_url || placeholderImage }} className="w-full h-32 rounded-xl mb-2" />
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.description || 'Món ngon'}</Text>
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-lg font-semibold text-gray-900">
            {item.price.toLocaleString('vi-VN')}đ
          </Text>
          <TouchableOpacity onPress={onSelect} className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: { name: string; price: number };
  sugar: { name: string; price: number };
  toppings: { name: string; price: number }[];
  totalPrice: number;
}

type MenuScreenProps = NativeStackScreenProps<AppStackParamList, 'Menu'>;

const MenuScreen = ({ route, navigation }: MenuScreenProps) => {
  const { tableId, tableName } = route.params;
  const insets = useSafeAreaInsets();
  const { getOrderForTable, updateOrderForTable, clearOrderForTable  } = useOrders();

  const [menuData, setMenuData] = useState<CategoryFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemFromDB | null>(null);
  const [isCartModalVisible, setCartModalVisible] = useState(false);

  const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);

  const fetchMenuAndExistingItems = useCallback(async () => {
    setLoading(true);
    const { data: menu, error: menuError } = await supabase
      .from('categories')
      .select(`id, name, menu_items (id, name, description, price, image_url)`);

    if (menuError) {
      Alert.alert("Lỗi", "Không thể tải được thực đơn. Vui lòng thử lại.");
      console.error("Lỗi lấy menu:", menuError);
    } else if (menu) {
      const formattedData = menu.map(cat => ({
          ...cat,
          id: String(cat.id),
          menu_items: cat.menu_items.map(item => ({...item, id: String(item.id)}))
      }));
      setMenuData(formattedData);
      if (formattedData.length > 0) setActiveCategoryId(formattedData[0].id);
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('table_id', tableId)
      .in('status', ['pending', 'paid']);

    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`id, quantity, unit_price, menu_items(name)`)
        .in('order_id', orderIds);

      if (!itemsError && items) {
        const formattedExistingItems = items.map(item => ({
            id: String(item.id),
            name: item.menu_items?.[0]?.name || 'Món đã bị xóa',
            quantity: item.quantity,
            unit_price: item.unit_price,
            totalPrice: item.quantity * item.unit_price,
        }));
        setExistingItems(formattedExistingItems);
      }
    } else {
        setExistingItems([]);
    }

    setLoading(false);
  }, [tableId]);

  useFocusEffect(
    useCallback(() => {
      // Tạo một task để chạy sau khi các animation kết thúc
      const task = InteractionManager.runAfterInteractions(() => {
        // Đặt code fetch dữ liệu của bạn vào đây
        fetchMenuAndExistingItems();
      });

      // Cleanup function để hủy task nếu component unmount
      return () => task.cancel();
    }, [fetchMenuAndExistingItems])
  );
  
  const cartItems = getOrderForTable(tableId);

  const handleSelectItem = (item: MenuItemFromDB) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleAddToCart = (itemWithOptions: CartItem) => {
    const currentCart = getOrderForTable(tableId);
    let updatedCart;

    const uniqueCartId = `${itemWithOptions.menuItemId}-${itemWithOptions.size.name}-${itemWithOptions.sugar.name}-${itemWithOptions.toppings.map(t => t.name).sort().join('-')}`;
    const existingItemIndex = currentCart.findIndex(item => item.id === uniqueCartId);

    if (existingItemIndex > -1) {
        updatedCart = [...currentCart];
        const existingItem = updatedCart[existingItemIndex];
        existingItem.quantity += itemWithOptions.quantity;
        existingItem.totalPrice += itemWithOptions.totalPrice;
    } else {
        updatedCart = [...currentCart, { ...itemWithOptions, id: uniqueCartId }];
    }
    updateOrderForTable(tableId, updatedCart);
  };

   const handleConfirmOrder = () => {
    if (cartItems.length === 0 && existingItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm món vào giỏ hàng!");
      return;
    }

    const routes = navigation.getState()?.routes;
    const prevRouteName = routes && routes.length > 1 ? routes[routes.length - 2].name : null;

    if (prevRouteName === ROUTES.ORDER_CONFIRMATION) {
        navigation.goBack();
    } else {
        navigation.navigate(ROUTES.ORDER_CONFIRMATION, {
            tableId: tableId,
            tableName: tableName,
            items: cartItems,
        });
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const currentCart = getOrderForTable(tableId);
    const updatedCart = currentCart.map(item => {
      if (item.id === itemId) {
        const pricePerItem = item.totalPrice / item.quantity;
        return { ...item, quantity: newQuantity, totalPrice: pricePerItem * newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);
    updateOrderForTable(tableId, updatedCart);
  };

  const handleRemoveItem = (itemId: string) => {
    const currentCart = getOrderForTable(tableId);
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    updateOrderForTable(tableId, updatedCart);
  };

  const handleClearCart = () => {
    updateOrderForTable(tableId, []);
  };

  const newItemsQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const newItemsPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  const existingItemsQuantity = existingItems.reduce((total, item) => total + item.quantity, 0);
  const existingItemsPrice = existingItems.reduce((total, item) => total + item.totalPrice, 0);

  const totalCartQuantity = newItemsQuantity + existingItemsQuantity;
  const totalCartPrice = newItemsPrice + existingItemsPrice;

  const selectedCategory = menuData.find(cat => cat.id === activeCategoryId);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600">Đang tải thực đơn...</Text>
      </View>
    );
  }

   const handleGoBackWithConfirmation = () => {
    if (cartItems.length > 0) {
      Alert.alert(
        "Thoát và hủy các món đã chọn?",
        "Giỏ hàng của bạn có món mới chưa được lưu. Bạn có chắc muốn thoát và xóa chúng?",
        [
          { text: "Ở lại", style: "cancel" },
          {
            text: "Thoát",
            style: "destructive",
            onPress: () => {
              clearOrderForTable(tableId);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, backgroundColor: 'white' }} className="px-4 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleGoBackWithConfirmation} className="p-2 -ml-2">
            <Icon name="arrow-back-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Order cho {tableName}</Text>
          <View className="w-8" />
        </View>
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
              onPress={() => setActiveCategoryId(category.id)}
              className={`px-4 py-2 rounded-full mr-3 ${activeCategoryId === category.id ? 'bg-gray-200' : 'bg-transparent'}`}
            >
              <Text className={`font-semibold ${activeCategoryId === category.id ? 'text-gray-800' : 'text-gray-500'}`}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ExistingItemsList items={existingItems} />

      {/* Danh sách món ăn */}
      <FlatList
        data={selectedCategory?.menu_items}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <MenuItemGrid item={item} onSelect={() => handleSelectItem(item)} />
        )}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity 
          onPress={() => setCartModalVisible(true)} 
          className="relative flex-row items-center gap-3"
          disabled={newItemsQuantity === 0}
        >
          <Icon name="cart" size={32} color="#3B82F6" />
           {totalCartQuantity > 0 && (
             <View style={styles.badgeContainer}>
               <Text style={styles.badgeText}>{totalCartQuantity}</Text>
             </View>
           )}
           <View>
              <Text className="text-gray-500 text-xs">Tổng cộng</Text>
              <Text className="text-lg font-bold text-gray-900">{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
           </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleConfirmOrder} 
          style={[styles.confirmButton, (newItemsQuantity === 0 && existingItems.length === 0) && styles.disabledButton]}
          disabled={newItemsQuantity === 0 && existingItems.length === 0}
        >
          <Text style={styles.confirmButtonText}>Đồng ý</Text>
        </TouchableOpacity>
      </View>
      
      <CustomizeItemModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem ? { ...selectedItem, image: selectedItem.image_url || '' } : null}
        onAddToCart={handleAddToCart}
      />

      <CartDetailModal
        visible={isCartModalVisible}
        onClose={() => setCartModalVisible(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
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
        height: 270,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        left: 20,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
});

export default MenuScreen;
// --- END OF FILE MenuScreen.tsx ---