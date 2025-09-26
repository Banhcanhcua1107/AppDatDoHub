import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrders } from '../../context/OrderContext';
import { CartItem } from '../Menu/MenuScreen';

// Dữ liệu bàn mẫu
const tableData: { id: string; name: string }[] = [
  { id: '1', name: 'Bàn 01' }, { id: '2', name: 'Bàn 02' },
  { id: '3', name: 'Bàn 03' }, { id: '4', name: 'Bàn 04' },
  { id: '5', name: 'Bàn 05' }, { id: '6', name: 'Bàn 06' },
  { id: '7', name: 'Bàn 07' }, { id: '8', name: 'Bàn 08' },
];

const ReturnItemsScreen = () => {
    const insets = useSafeAreaInsets();
    const { orders, getOrderForTable, updateOrderForTable } = useOrders();
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    
    // State để lưu số lượng trả cho từng món { itemId: quantityToReturn }
    const [itemsToReturn, setItemsToReturn] = useState<{[itemId: string]: number}>({});
    const [reason, setReason] = useState('');

    const tablesWithOrders = tableData.filter(table => orders[table.id] && orders[table.id].length > 0);

    const handleUpdateReturnQuantity = (item: CartItem, amount: number) => {
        const currentReturnQty = itemsToReturn[item.id] || 0;
        let newQty = currentReturnQty + amount;

        if (newQty < 0) newQty = 0;
        if (newQty > item.quantity) newQty = item.quantity;

        setItemsToReturn(prev => ({
            ...prev,
            [item.id]: newQty
        }));
    };

    const handleConfirmReturn = () => {
        if (!selectedTableId) return;
        const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum, qty) => sum + qty, 0);

        if (totalReturnQuantity === 0) {
            Alert.alert("Chưa chọn món", "Vui lòng chọn số lượng món cần trả.");
            return;
        }
        if (!reason.trim()) {
            Alert.alert("Thiếu lý do", "Vui lòng nhập lý do trả món.");
            return;
        }

        const currentOrder = getOrderForTable(selectedTableId);
        const newOrder = currentOrder
            .map(item => ({
                ...item,
                quantity: item.quantity - (itemsToReturn[item.id] || 0),
                totalPrice: (item.totalPrice / item.quantity) * (item.quantity - (itemsToReturn[item.id] || 0)),
            }))
            .filter(item => item.quantity > 0); // Lọc bỏ những món đã trả hết

        updateOrderForTable(selectedTableId, newOrder);

        Alert.alert("Thành công", "Đã cập nhật trả món thành công.");
        setSelectedTableId(null); // Quay lại màn hình chọn bàn
        setItemsToReturn({});
        setReason('');
    };
    
    // --- COMPONENT CON ---
    const ReturnDetails = () => {
        const selectedOrder = getOrderForTable(selectedTableId!);
        const selectedTable = tableData.find(t => t.id === selectedTableId);
        const totalReturnQuantity = Object.values(itemsToReturn).reduce((sum, qty) => sum + qty, 0);

        return (
            <View className="flex-1">
                <View className="flex-row items-center p-4">
                    <TouchableOpacity onPress={() => { setSelectedTableId(null); setItemsToReturn({}); }} className="p-2 -ml-2">
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-gray-800">Trả món cho {selectedTable?.name}</Text>
                </View>
                <FlatList
                    data={selectedOrder}
                    keyExtractor={item => item.id}
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
                />
                <View className="p-4 mt-auto border-t border-gray-200 bg-white">
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Nhập lý do trả món..."
                        className="bg-gray-100 rounded-lg p-3 text-base h-24"
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={handleConfirmReturn}
                        disabled={totalReturnQuantity === 0}
                        className={`mt-3 rounded-xl p-4 items-center justify-center ${totalReturnQuantity > 0 ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                        <Text className="text-white text-lg font-bold">Xác nhận trả {totalReturnQuantity > 0 ? totalReturnQuantity : ''} món</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const TableSelection = () => (
      <FlatList
        data={tablesWithOrders}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedTableId(item.id)} className="w-1/2 p-2">
            <View className="bg-white p-6 rounded-2xl items-center justify-center shadow">
              <Icon name="tablet-landscape-outline" size={40} color="#4B5563" />
              <Text className="text-lg font-bold text-gray-800 mt-3">{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View className="flex-1 items-center justify-center mt-20"><Text className="text-gray-500">Không có bàn nào đang phục vụ.</Text></View>}
      />
    );


    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
                <Text className="text-3xl font-bold text-gray-800">Trả món</Text>
            </View>
            {selectedTableId ? <ReturnDetails /> : <TableSelection />}
        </View>
    );
};

export default ReturnItemsScreen;