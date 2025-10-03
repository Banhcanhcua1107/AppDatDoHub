// --- START OF FILE MenuScreen.tsx ---

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, TextInput,
  Image, FlatList, ScrollView, ActivityIndicator, Alert, InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomizeItemModal from './CustomizeItemModal';
import CartDetailModal from './CartDetailModal';
import { supabase } from '../../services/supabase';


const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
};

// Hàm lấy các chữ cái đầu của một chuỗi
const getAcronym = (text: string): string => {
  if (!text) return '';
  return normalizeText(text)
    .split(' ')
    .map(word => word[0])
    .join('');
};
// --- Interfaces ---
interface ExistingItem {
    id: string; name: string; quantity: number; unit_price: number; totalPrice: number;
}
interface MenuItemFromDB {
  id: string; name: string; description: string | null; price: number; image_url: string | null;
}
interface CategoryFromDB {
  id: string; name: string; menu_items: MenuItemFromDB[];
}
export interface CartItem { // Dùng để truyền dữ liệu từ CustomizeModal về
  id: string; menuItemId: string; name: string; image: string; price: number; quantity: number;
  size: { name: string; price: number };
  sugar: { name: string; price: number };
  toppings: { name: string; price: number }[];
  totalPrice: number; note?: string;
}
export interface CartItemFromDB { // Dữ liệu thật từ Supabase
    id: number;
    table_id: number;
    menu_item_id: number;
    quantity: number;
    total_price: number;
    unit_price: number;
    customizations: {
        name: string;
        image: string;
        note?: string;
        size: { name: string; price: number };
        sugar: { name: string; price: number };
        toppings: { name: string; price: number }[];
    };
}

const ExistingItemsList: React.FC<{ items: ExistingItem[] }> = ({ items }) => {
    if (items.length === 0) return null;
    return (
        <View className="px-4 pt-3 bg-white border-b-8 border-gray-50">
            <Text className="text-base font-bold text-gray-700 mb-2">Các món đã gọi</Text>
            {items.map(item => (
                <View key={item.id} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-600">{String(item.quantity)}x {item.name ?? 'Món đã bị xóa'}</Text>
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
            <Text className="text-lg font-semibold text-gray-900">{item.price.toLocaleString('vi-VN')}đ</Text>
            <TouchableOpacity onPress={onSelect} className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
};

const HOT_CATEGORY_ID = 'hot_items';
type MenuScreenProps = NativeStackScreenProps<AppStackParamList, 'Menu'>;

const MenuScreen = ({ route, navigation }: MenuScreenProps) => {
  const { tableId, tableName } = route.params;
  const insets = useSafeAreaInsets();

  const [menuData, setMenuData] = useState<CategoryFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(HOT_CATEGORY_ID);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemFromDB | null>(null);
  const [isCartModalVisible, setCartModalVisible] = useState(false);
  const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);
  const [hotItems, setHotItems] = useState<MenuItemFromDB[]>([]);
  const [cartItems, setCartItems] = useState<CartItemFromDB[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fetchMenuAndData = useCallback(async (isInitialLoad = false) => {
    if(isInitialLoad) setLoading(true);
    try {
        const [menuResponse, hotItemsResponse, cartResponse] = await Promise.all([
            supabase.from('categories').select(`id, name, menu_items (id, name, description, price, image_url)`),
            supabase.from('menu_items').select('*').eq('is_hot', true).limit(10),
            supabase.from('cart_items').select(`*`).eq('table_id', tableId).order('created_at')
        ]);

        if (menuResponse.error) throw menuResponse.error;
        if (hotItemsResponse.error) throw hotItemsResponse.error;
        if (cartResponse.error) throw cartResponse.error;

        if (menuResponse.data) {
            const formattedData = menuResponse.data.map(cat => ({
                ...cat, id: String(cat.id),
                menu_items: cat.menu_items.map(item => ({ ...item, id: String(item.id) }))
            }));
            const hotCategory = { id: HOT_CATEGORY_ID, name: '🔥 Món Hot', menu_items: [] };
            formattedData.unshift(hotCategory);
            setMenuData(formattedData);
        }
        setHotItems(hotItemsResponse.data || []);
        setCartItems(cartResponse.data || []);
        
        const { data: orderLinkData, error: orderLinkError } = await supabase
            .from('order_tables')
            .select('orders!inner(id, status)')
            .eq('table_id', tableId)
            .eq('orders.status', 'pending');
            
        if (orderLinkError) throw orderLinkError;

        if (orderLinkData && orderLinkData.length > 0) {
            const pendingOrderIds = orderLinkData
                .map(link => link.orders?.[0]?.id)
                .filter((id): id is string => !!id);

            if (pendingOrderIds.length > 0) {
              const { data: items, error: itemsError } = await supabase
                  .from('order_items')
                  .select(`id, quantity, unit_price, menu_items(name)`)
                  .in('order_id', pendingOrderIds);

              if (itemsError) throw itemsError;
              
              const mappedItems = (items || []).map(item => {
                  const menuItemName = item.menu_items?.[0]?.name;
                  return { 
                      id: String(item.id), 
                      name: menuItemName || 'Món đã bị xóa', 
                      quantity: item.quantity, 
                      unit_price: item.unit_price, 
                      totalPrice: item.quantity * item.unit_price 
                  }
              });
              setExistingItems(mappedItems);
            } else {
              setExistingItems([]);
            }
        } else {
            setExistingItems([]);
        }

    } catch (error: any) {
        console.error("Lỗi khi tải dữ liệu MenuScreen:", error.message);
        Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
        if (isInitialLoad) setLoading(false);
    }
  }, [tableId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (!isActive) return;
        
        setLoading(true);

        try {
          const [menuResponse, hotItemsResponse, cartResponse, orderLinkResponse] = await Promise.all([
              supabase.from('categories').select(`id, name, menu_items (id, name, description, price, image_url)`),
              supabase.from('menu_items').select('*').eq('is_hot', true).limit(10),
              supabase.from('cart_items').select(`*`).eq('table_id', tableId),
              supabase.from('order_tables').select('orders!inner(id, status)').eq('table_id', tableId).eq('orders.status', 'pending')
          ]);

          if (!isActive) return;

          if (menuResponse.data) {
              const formattedData = menuResponse.data.map(cat => ({ ...cat, id: String(cat.id), menu_items: cat.menu_items.map(item => ({ ...item, id: String(item.id) })) }));
              const hotCategory = { id: HOT_CATEGORY_ID, name: '🔥 Món Hot', menu_items: [] };
              formattedData.unshift(hotCategory);
              setMenuData(formattedData);
          }
          setHotItems(hotItemsResponse.data || []);
          setCartItems(cartResponse.data || []);

          let existingItemsData: ExistingItem[] = [];
          if (orderLinkResponse.data && orderLinkResponse.data.length > 0) {
              const pendingOrderIds = orderLinkResponse.data.map(link => link.orders?.[0]?.id).filter((id): id is string => !!id);
              if (pendingOrderIds.length > 0) {
                  const { data: items, error: itemsError } = await supabase.from('order_items').select(`id, quantity, unit_price, menu_items(name)`).in('order_id', pendingOrderIds);
                  if (itemsError) throw itemsError;
                  existingItemsData = (items || []).map(item => ({ id: String(item.id), name: item.menu_items?.[0]?.name || 'Món đã bị xóa', quantity: item.quantity, unit_price: item.unit_price, totalPrice: item.quantity * item.unit_price }));
              }
          }
          setExistingItems(existingItemsData);

        } catch (error: any) {
          if (isActive) {
            console.error("[Focus] Lỗi khi tải dữ liệu:", error.message);
            Alert.alert("Lỗi", "Không thể tải lại dữ liệu bàn.");
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };
      
      const task = InteractionManager.runAfterInteractions(loadData);
      
      const channel = supabase.channel(`realtime-menu-${tableId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `table_id=eq.${tableId}` },
            (payload) => { 
              loadData();
            }
        ).subscribe();

      return () => {
        isActive = false;
        task.cancel();
        supabase.removeChannel(channel);
      };
    }, [tableId])
  );
  
  const handleSelectItem = (item: MenuItemFromDB) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleAddToCart = async (itemWithOptions: CartItem) => {
    try {
        const uniqueId = `${tableId}-${itemWithOptions.menuItemId}-${itemWithOptions.size.name}-${itemWithOptions.sugar.name}-${itemWithOptions.toppings.map(t => t.name).sort().join('-')}-${itemWithOptions.note || ''}`;
        
        const { data: existingItem, error: findError } = await supabase
            .from('cart_items')
            .select('id, quantity, total_price')
            .eq('unique_id', uniqueId)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }

        if (existingItem) {
            const newQuantity = existingItem.quantity + itemWithOptions.quantity;
            const newTotalPrice = existingItem.total_price + itemWithOptions.totalPrice;
            await supabase.from('cart_items')
                .update({ quantity: newQuantity, total_price: newTotalPrice })
                .eq('id', existingItem.id)
                .throwOnError();
        } else {
            await supabase.from('cart_items').insert({
                table_id: tableId,
                menu_item_id: itemWithOptions.menuItemId,
                quantity: itemWithOptions.quantity,
                unit_price: itemWithOptions.totalPrice / itemWithOptions.quantity,
                total_price: itemWithOptions.totalPrice,
                customizations: { 
                    size: itemWithOptions.size, 
                    sugar: itemWithOptions.sugar, 
                    toppings: itemWithOptions.toppings, 
                    note: itemWithOptions.note, 
                    name: itemWithOptions.name, 
                    image: itemWithOptions.image 
                },
                unique_id: uniqueId
            }).throwOnError();
        }

        await fetchMenuAndData(false); 

    } catch (error: any) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error.message);
        Alert.alert("Lỗi", "Không thể thêm món vào giỏ hàng. Vui lòng thử lại.");
    }
  };
  const handleConfirmOrder = () => {
    if (cartItems.length === 0 && existingItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm món vào giỏ hàng!");
      return;
    }
    navigation.navigate(ROUTES.ORDER_CONFIRMATION, { tableId: tableId, tableName: tableName });
  };

 const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await handleRemoveItem(cartItemId);
        return; 
      }
      
      const item = cartItems.find(i => i.id === cartItemId);
      if (item) {
        await supabase.from('cart_items')
          .update({ quantity: newQuantity, total_price: item.unit_price * newQuantity })
          .eq('id', cartItemId)
          .throwOnError();
      }
      
      await fetchMenuAndData(false);

    } catch (error: any) {
      console.error("Lỗi khi cập nhật số lượng:", error.message);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng món.");
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await supabase.from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .throwOnError();

      await fetchMenuAndData(false);

    } catch (error: any) {
      console.error("Lỗi khi xóa món:", error.message);
      Alert.alert("Lỗi", "Không thể xóa món khỏi giỏ hàng.");
    }
  };

  const handleClearCart = async () => {
    try {
      await supabase.from('cart_items')
        .delete()
        .eq('table_id', tableId)
        .throwOnError();
      
      await fetchMenuAndData(false);

    } catch (error: any) {
      console.error("Lỗi khi xóa giỏ hàng:", error.message);
      Alert.alert("Lỗi", "Không thể xóa giỏ hàng.");
    }
  };

  const handleGoBackWithConfirmation = () => {
    if (cartItems.length > 0) {
      Alert.alert("Thoát và hủy các món đã chọn?", "Giỏ hàng có món mới chưa gửi. Bạn có chắc muốn thoát và xóa chúng khỏi giỏ hàng?",
        [
          { text: "Ở lại", style: "cancel" },
          { text: "Thoát & Xóa", style: "destructive", onPress: async () => { await handleClearCart(); navigation.goBack(); } },
        ]
      );
    } else { navigation.goBack(); }
  };

  const newItemsQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const newItemsPrice = cartItems.reduce((total, item) => total + item.total_price, 0);
  const existingItemsQuantity = existingItems.reduce((total, item) => total + item.quantity, 0);
  const existingItemsPrice = existingItems.reduce((total, item) => total + item.totalPrice, 0);
  const totalCartQuantity = newItemsQuantity + existingItemsQuantity;
  const totalCartPrice = newItemsPrice + existingItemsPrice;

  let sourceItems: MenuItemFromDB[];
  if (searchQuery) {
      // Nếu có tìm kiếm, gộp TẤT CẢ các món từ TẤT CẢ các danh mục (trừ Món Hot)
      sourceItems = menuData.flatMap(category => category.menu_items);
  } else {
      // Nếu không tìm kiếm, chỉ hiển thị món từ danh mục đang chọn
      sourceItems = activeCategoryId === HOT_CATEGORY_ID 
          ? hotItems 
          : menuData.find(cat => cat.id === activeCategoryId)?.menu_items || [];
  }
  // const originalItemsToDisplay = activeCategoryId === HOT_CATEGORY_ID 
  //     ? hotItems 
  //     : menuData.find(cat => cat.id === activeCategoryId)?.menu_items || [];

  // const filteredItemsToDisplay = !searchQuery
  //   ? originalItemsToDisplay // Nếu không tìm kiếm, trả về danh sách gốc
  //   : originalItemsToDisplay.filter(item => {
  //       const normalizedQuery = normalizeText(searchQuery);
  //       const normalizedItemName = normalizeText(item.name);
  //       const itemAcronym = getAcronym(item.name);
        
  //       // Trả về true nếu tên món chứa chuỗi tìm kiếm, HOẶC
  //       // chữ cái đầu của tên món chứa chuỗi tìm kiếm
  //       return (
  //           normalizedItemName.includes(normalizedQuery) ||
  //           itemAcronym.includes(normalizedQuery)
  //       );
  //     });

      const itemsToDisplay = !searchQuery
    ? sourceItems // Nếu không tìm kiếm, trả về danh sách nguồn (đã được xác định ở trên)
    : sourceItems.filter(item => {
        const normalizedQuery = normalizeText(searchQuery);
        const normalizedItemName = normalizeText(item.name);
        const itemAcronym = getAcronym(item.name);
        
        return (
            normalizedItemName.includes(normalizedQuery) ||
            itemAcronym.includes(normalizedQuery)
        );
      });
  if (loading) {
    return (
      <View style={styles.containerCenter}><ActivityIndicator size="large" color="#3B82F6" /><Text className="mt-3 text-gray-600">Đang tải thực đơn...</Text></View>
    );
  }

  return (
    <View style={styles.flex1}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ paddingTop: insets.top + 10, backgroundColor: 'white' }} className="px-4 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleGoBackWithConfirmation} className="p-2 -ml-2"><Icon name="arrow-back-outline" size={24} color="#111827" /></TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Order cho {tableName}</Text><View className="w-8" />
        </View>
        
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="gray" style={styles.searchIcon} />
          <TextInput 
            placeholder="Tìm kiếm món (vd: cf sữa hoặc cfsua)" 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* [CẬP NHẬT] Ẩn thanh danh mục khi đang tìm kiếm */}
      {!searchQuery && (
        <View className="py-3 bg-white border-b-8 border-gray-50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {menuData.map(category => (
              <TouchableOpacity key={category.id} onPress={() => setActiveCategoryId(category.id)}
                className={`px-4 py-2 rounded-full mr-3 ${activeCategoryId === category.id ? 'bg-blue-200' : 'bg-gray-100'}`}>
                <Text className={`font-semibold ${activeCategoryId === category.id ? 'text-blue-800' : 'text-gray-600'}`}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList 
        ListHeaderComponent={<ExistingItemsList items={existingItems} />} 
        data={itemsToDisplay}
        keyExtractor={item => item.id} 
        numColumns={2} 
        contentContainerStyle={{ padding: 8, paddingBottom: 120 }}
        renderItem={({ item }) => <MenuItemGrid item={item} onSelect={() => handleSelectItem(item)} />}
        ListEmptyComponent={
            <View style={{marginTop: 50, alignItems: 'center'}}>
                <Text style={{color: 'gray', fontSize: 16}}>
                    {searchQuery ? 'Không tìm thấy món nào' : 'Danh mục này chưa có món'}
                </Text>
            </View>
        }
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity onPress={() => setCartModalVisible(true)} className="relative flex-row items-center gap-3" disabled={newItemsQuantity === 0}>
          <Icon name="cart" size={32} color="#3B82F6" />
           {totalCartQuantity > 0 && (<View style={styles.badgeContainer}><Text style={styles.badgeText}>{totalCartQuantity}</Text></View>)}
           <View>
              <Text className="text-gray-500 text-xs">Tổng cộng</Text>
              <Text className="text-lg font-bold text-gray-900">{totalCartPrice.toLocaleString('vi-VN')}đ</Text>
           </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirmOrder} style={[styles.confirmButton, (totalCartQuantity === 0) && styles.disabledButton]} disabled={totalCartQuantity === 0}>
          <Text style={styles.confirmButtonText}>Đồng ý</Text>
        </TouchableOpacity>
      </View>
      
      <CustomizeItemModal visible={isModalVisible} onClose={() => setModalVisible(false)}
        item={selectedItem ? { ...selectedItem, image: selectedItem.image_url || '' } : null} onAddToCart={handleAddToCart}
      />
      <CartDetailModal visible={isCartModalVisible} onClose={() => setCartModalVisible(false)} cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    shadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    gridItem: { width: '50%', padding: 8, height: 270 },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 999,
      paddingHorizontal: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 48,
      fontSize: 16,
    },
    clearButton: {
      padding: 4,
    },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, },
    badgeContainer: { position: 'absolute', top: -5, left: 20, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'white' },
    badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    confirmButton: { backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#9CA3AF' },
});

export default MenuScreen;