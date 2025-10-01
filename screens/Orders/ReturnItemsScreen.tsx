// --- START OF FILE ReturnItemsScreen.tsx ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StatusBar, ActivityIndicator, StyleSheet } from 'react-native'; // [FIX] Thêm Alert
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface Table {
    id: number;
    name: string;
}

interface ReturnableItem {
    id: number; // id của order_item
    name: string;
    quantity: number; // số lượng đã gọi
}

type MenuItemName = {
    name: string;
}

const ReturnItemsScreen = () => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [tablesWithOrders, setTablesWithOrders] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [returnableItems, setReturnableItems] = useState<ReturnableItem[]>([]);
    
    const [itemsToReturn, setItemsToReturn] = useState<{[itemId: number]: number}>({});
    const [reason, setReason] = useState('');

    const fetchServingTables = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('tables').select('id, name').eq('status', 'Đang phục vụ');
        if (error) { Alert.alert("Lỗi", "Không thể tải danh sách bàn."); } 
        else { setTablesWithOrders(data || []); }
        setLoading(false);
    }, []);

    useFocusEffect(useCallback(() => {
        if (!selectedTable) {
            fetchServingTables();
        }
    }, [selectedTable, fetchServingTables]));

    const handleSelectTable = async (table: Table) => {
        setLoading(true);
        setSelectedTable(table);
        const { data: pendingOrder } = await supabase.from('orders').select('id').eq('table_id', table.id).eq('status', 'pending').maybeSingle();
        if (pendingOrder) {
            const { data, error } = await supabase.from('order_items').select('id, quantity, menu_items(name)').eq('order_id', pendingOrder.id);
            if(error) { Alert.alert("Lỗi", "Không thể tải danh sách món của bàn."); }
            else {
                const formattedItems = (data || []).map(item => ({
                    id: item.id,
                    // [FIX] Ép kiểu an toàn cho dữ liệu trả về từ Supabase
                    name: (item.menu_items as MenuItemName[])?.[0]?.name || 'Món đã xóa',
                    quantity: item.quantity,
                }));
                setReturnableItems(formattedItems);
            }
        } else {
            setReturnableItems([]);
        }
        setLoading(false);
    };
    const handleUpdateReturnQuantity = (item: ReturnableItem, amount: number) => {
        const currentReturnQty = itemsToReturn[item.id] || 0;
        let newQty = currentReturnQty + amount;

        if (newQty < 0) newQty = 0;
        if (newQty > item.quantity) newQty = item.quantity;

        setItemsToReturn(prev => ({ ...prev, [item.id]: newQty }));
    };

    const handleConfirmReturn = async () => {
        const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum: number, qty: number) => sum + qty, 0);
        if (totalReturnQuantity === 0) { Alert.alert("Chưa chọn món", "Vui lòng chọn số lượng món cần trả."); return; }
        if (!reason.trim()) { Alert.alert("Thiếu lý do", "Vui lòng nhập lý do trả món."); return; }

        setLoading(true);
        try {
            const updates = Object.entries(itemsToReturn).map(([itemId, returnQty]) => {
                if (returnQty === 0) return null;
                const originalItem = returnableItems.find(item => item.id === Number(itemId));
                if (!originalItem) return null;

                const newQuantity = originalItem.quantity - returnQty;
                if (newQuantity <= 0) {
                    return supabase.from('order_items').delete().eq('id', itemId);
                } else {
                    return supabase.from('order_items').update({ quantity: newQuantity }).eq('id', itemId);
                }
            }).filter(Boolean);

            await Promise.all(updates);

            Alert.alert("Thành công", "Đã cập nhật trả món thành công.");
            setSelectedTable(null);
            setItemsToReturn({});
            setReason('');
        } catch (error: any) {
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật trả món.");
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const ReturnDetails = () => {
        const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum: number, qty: number) => sum + qty, 0);
        return (
            <View style={styles.flex1}>
                <View className="flex-row items-center p-4">
                    <TouchableOpacity onPress={() => { setSelectedTable(null); setItemsToReturn({}); }} className="p-2 -ml-2">
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-gray-800">Trả món cho {selectedTable?.name}</Text>
                </View>
                <FlatList
                    data={returnableItems}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({item}) => (
                        <View className="bg-white p-4 rounded-xl mb-3 shadow">
                            <Text className="text-base font-bold text-gray-800">{item.name}</Text>
                            <Text className="text-sm text-gray-500 mb-3">Đã gọi: {item.quantity}</Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-base font-semibold text-blue-600">Số lượng trả:</Text>
                                <View className="flex-row items-center">
                                    <TouchableOpacity onPress={() => handleUpdateReturnQuantity(item, -1)} className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center">
                                        <Icon name="remove" size={20} color="black" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold w-12 text-center">{itemsToReturn[item.id] || 0}</Text>
                                    <TouchableOpacity onPress={() => handleUpdateReturnQuantity(item, 1)} className="w-9 h-9 bg-blue-500 rounded-full items-center justify-center">
                                        <Icon name="add" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<View className="mt-20 items-center"><Text>Bàn này không có món nào có thể trả.</Text></View>}
                />
                <View className="p-4 mt-auto border-t border-gray-200 bg-white">
                    <TextInput value={reason} onChangeText={setReason} placeholder="Nhập lý do trả món..."
                        className="bg-gray-100 rounded-lg p-3 text-base h-24" multiline textAlignVertical="top" />
                    <TouchableOpacity onPress={handleConfirmReturn} disabled={totalReturnQuantity === 0}
                        className={`mt-3 rounded-xl p-4 items-center justify-center ${totalReturnQuantity > 0 ? 'bg-red-500' : 'bg-gray-300'}`}>
                        <Text className="text-white text-lg font-bold">Xác nhận trả {totalReturnQuantity > 0 ? totalReturnQuantity : ''} món</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const TableSelection = () => (
      <FlatList
        data={tablesWithOrders}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectTable(item)} className="w-1/2 p-2">
            <View className="bg-white p-6 rounded-2xl items-center justify-center shadow">
              <Icon name="tablet-landscape-outline" size={40} color="#4B5563" />
              <Text className="text-lg font-bold text-gray-800 mt-3">{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View className="flex-1 items-center justify-center mt-20"><Text className="text-gray-500">Không có bàn nào đang phục vụ.</Text></View>}
      />
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
                <Text className="text-3xl font-bold text-gray-800">Trả món</Text>
            </View>
            {selectedTable ? <ReturnDetails /> : <TableSelection />}
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
});

export default ReturnItemsScreen;
// --- END OF FILE ReturnItemsScreen.tsx ---