import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    InteractionManager // Thêm InteractionManager để sửa cảnh báo Reanimated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrders } from '../../context/OrderContext';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

// --- Component con OrderListItem (Không đổi) ---
const OrderListItem: React.FC<{ item: any, isNew?: boolean, isPaid?: boolean }> = ({ item, isNew = false, isPaid = false }) => {
    const sizeText = item.size?.name || item.size || 'N/A';
    const sugarText = item.sugar?.name || item.sugar || 'N/A';
    const toppingsArray = item.toppings?.map((t: any) => t.name || t) || [];
    const toppingsText = toppingsArray.length > 0 ? toppingsArray.join(', ') : 'Không có';
    const pricePerItem = item.unit_price || (item.totalPrice / (item.quantity || 1));
    const totalItemPrice = pricePerItem * item.quantity;
  
    return (
      <View style={[styles.shadow, isPaid && styles.paidItem]} className="bg-white rounded-2xl p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className={`text-lg font-bold ${isPaid ? 'text-gray-500' : 'text-gray-800'}`}>{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
            <Text className="text-sm text-gray-500">{`Topping: ${toppingsText}`}</Text>
          </View>
          <View className="items-end">
             {isNew && (
              <View className="bg-green-100 px-2 py-1 rounded-full mb-1">
                <Text className="text-green-800 text-xs font-bold">Mới</Text>
              </View>
            )}
             {isPaid && (
              <View className="bg-gray-200 px-2 py-1 rounded-full mb-1">
                <Text className="text-gray-600 text-xs font-bold">Đã trả</Text>
              </View>
            )}
            <Text className={`text-lg font-semibold ${isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {totalItemPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
        <View className="border-t border-dashed border-gray-200 mt-3 pt-2">
          <Text className={`text-base ${isPaid ? 'text-gray-500' : 'text-gray-600'}`}>
            {item.quantity} x {pricePerItem.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>
    );
};

// --- Component con ActionButton (Không đổi) ---
const ActionButton: React.FC<{ icon: string; text: string; color: string; disabled?: boolean; onPress: () => void; }> =
({ icon, text, color, disabled = false, onPress }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} className={`items-center justify-center transition-opacity ${disabled ? 'opacity-40' : 'opacity-100'}`}>
        <View style={{ backgroundColor: `${color}20`}} className="w-16 h-16 rounded-full items-center justify-center">
             <Icon name={icon} size={30} color={color} />
        </View>
        <Text style={{ color }} className="mt-2 font-semibold text-sm">{text}</Text>
    </TouchableOpacity>
);

type Props = NativeStackScreenProps<AppStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = ({ route, navigation }: Props) => {
    const { tableId, tableName } = route.params;
    const insets = useSafeAreaInsets();
    const { getOrderForTable, clearOrderForTable } = useOrders();

    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [paidItems, setPaidItems] = useState<any[]>([]);

    const newItemsFromCart = getOrderForTable(tableId);
    const hasNewItems = newItemsFromCart.length > 0;

    const handleExitToHome = useCallback(() => {
        if (hasNewItems) {
            Alert.alert(
                "Thoát và hủy thay đổi?",
                "Bạn có các món mới chưa gửi bếp. Bạn có chắc muốn thoát và xóa chúng?",
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
    }, [hasNewItems, navigation, tableId, clearOrderForTable]);

    const fetchTableData = useCallback(async () => {
        setLoading(true);
        const { data: tableData, error: tableError } = await supabase.from('tables').select('status').eq('id', tableId).single();

        if (tableError || !tableData) {
          Alert.alert("Lỗi", "Không thể lấy thông tin bàn.");
          setLoading(false);
          return;
        }

        if (tableData.status === 'Trống') {
          setActiveOrderId(null);
          setPendingItems([]);
          setPaidItems([]);
          setLoading(false);
          return;
        }

        const formatItems = (items: any[]) => items?.map(item => ({
            ...item.customizations, 
            id: item.id, 
            // [SỬA LỖI] Truy cập đúng vào tên món ăn
            name: item.menu_items?.name || 'Món đã bị xóa', 
            quantity: item.quantity, 
            unit_price: item.unit_price
        })) || [];

        const { data: pendingOrder } = await supabase.from('orders').select('id').eq('table_id', tableId).eq('status', 'pending').maybeSingle();
        if (pendingOrder) {
            setActiveOrderId(pendingOrder.id);
            const { data: items } = await supabase.from('order_items').select(`*, menu_items(name)`).eq('order_id', pendingOrder.id);
            setPendingItems(formatItems(items || []));
        } else {
            setActiveOrderId(null);
            setPendingItems([]);
        }

        const { data: paidOrders } = await supabase.from('orders').select('id').eq('table_id', tableId).eq('status', 'paid');
        if (paidOrders && paidOrders.length > 0) {
            const paidOrderIds = paidOrders.map(o => o.id);
            const { data: items } = await supabase.from('order_items').select(`*, menu_items(name)`).in('order_id', paidOrderIds);
            setPaidItems(formatItems(items || []));
        } else {
            setPaidItems([]);
        }

        setLoading(false);
    }, [tableId]);

    useFocusEffect(useCallback(() => { 
        // [SỬA LỖI] Dùng InteractionManager để tránh xung đột với animation
        const task = InteractionManager.runAfterInteractions(() => {
            fetchTableData();
        });
        return () => task.cancel();
    }, [fetchTableData]));

    const billableItems = [...pendingItems, ...newItemsFromCart];
    const allDisplayedItems = [...paidItems, ...billableItems];
    const totalBill = billableItems.reduce((sum, item) => sum + (item.unit_price ? (item.unit_price * item.quantity) : item.totalPrice), 0);

    const sendNewItemsToKitchen = async (): Promise<string | null> => {
        if (!hasNewItems) return activeOrderId;
        let orderIdToUse = activeOrderId;
        if (!orderIdToUse) {
            const { error: tableError } = await supabase.from('tables').update({ status: 'Đang phục vụ' }).eq('id', tableId);
            if (tableError) {
                Alert.alert("Lỗi", "Không thể cập nhật trạng thái bàn.");
                return null;
            }
            const { data: newOrder, error } = await supabase.from('orders').insert({ table_id: tableId, status: 'pending', total_price: 0 }).select('id').single();
            if (error || !newOrder) { Alert.alert("Lỗi", "Không thể tạo order mới."); return null; }
            orderIdToUse = newOrder.id;
        }
    
        const itemsToInsert = newItemsFromCart.map(item => ({
            order_id: orderIdToUse, menu_item_id: item.menuItemId, quantity: item.quantity, unit_price: item.totalPrice / item.quantity, customizations: { size: item.size, sugar: item.sugar, toppings: item.toppings }
        }));
    
        const { error } = await supabase.from('order_items').insert(itemsToInsert);
        if (error) {
          Alert.alert("Lỗi", "Không thể gửi món đến bếp.");
          return null;
        }
        clearOrderForTable(tableId);
        return orderIdToUse;
    };

    const handleSendToKitchen = async () => {
        setLoading(true);
        const successId = await sendNewItemsToKitchen();
        if (successId) {
          Alert.alert("Thành công", "Đã gửi yêu cầu cho bếp!");
          fetchTableData();
        } else {
          setLoading(false);
        }
    };
    
    const handleSaveAndExit = async () => {
        const successId = await sendNewItemsToKitchen();
        if (hasNewItems && !successId) { return; }
        Alert.alert("Đã lưu", "Tất cả thay đổi đã được lưu.");
        navigation.goBack();
    };

    const handlePayment = async () => {
        if (billableItems.length === 0) {
            Alert.alert("Thông báo", "Không có món nào cần thanh toán.");
            return;
        }
        setLoading(true);
        let finalOrderId = activeOrderId;
        if (hasNewItems) {
          const returnedOrderId = await sendNewItemsToKitchen();
          if (!returnedOrderId) { setLoading(false); return; }
          finalOrderId = returnedOrderId;
        }
        if (!finalOrderId) {
          Alert.alert("Lỗi", "Không tìm thấy order để thanh toán.");
          setLoading(false);
          return;
        }
        setLoading(false);
        Alert.alert("Xác nhận thanh toán", `Tổng hóa đơn cần thanh toán là ${totalBill.toLocaleString('vi-VN')}đ.`,
          [{ text: "Hủy", style: 'cancel' }, { text: "Giữ phiên bàn", onPress: () => handleKeepSessionAfterPayment(finalOrderId, totalBill) }, { text: "Kết thúc & Dọn bàn", onPress: () => handleEndSessionAfterPayment(finalOrderId, totalBill) }]
        );
    };

    const handleKeepSessionAfterPayment = async (orderId: string, finalBill: number) => {
        await supabase.from('orders').update({ status: 'paid', total_price: finalBill }).eq('id', orderId);
        Alert.alert("Thành công", "Đã thanh toán. Bàn vẫn đang được phục vụ.");
        fetchTableData();
    };

    const handleEndSessionAfterPayment = async (orderId: string, finalBill: number) => {
        setLoading(true);
    
        const { error: currentOrderError } = await supabase
          .from('orders')
          .update({ status: 'closed', total_price: finalBill })
          .eq('id', orderId);
    
        if (currentOrderError) {
          Alert.alert("Lỗi", "Không thể cập nhật order chính để kết thúc phiên.");
          setLoading(false);
          return;
        }
    
        const { error: otherOrdersError } = await supabase
          .from('orders')
          .update({ status: 'closed' })
          .eq('table_id', tableId)
          .eq('status', 'paid');
        
        if (otherOrdersError) {
            console.error("Lỗi khi đóng các order đã thanh toán cũ:", otherOrdersError.message);
        }
    
        const { error: tableError } = await supabase
          .from('tables')
          .update({ status: 'Trống' })
          .eq('id', tableId);
    
        if (tableError) {
          Alert.alert("Lỗi", "Không thể chuyển bàn về trạng thái Trống.");
          setLoading(false);
          return;
        }
    
        clearOrderForTable(tableId);
        setActiveOrderId(null);
        setPendingItems([]);
        setPaidItems([]);
    
        setLoading(false);
    
        Alert.alert("Hoàn tất", "Bàn đã được thanh toán và dọn dẹp.");
        navigation.navigate(ROUTES.APP_TABS, { screen: ROUTES.HOME_TAB });
    };

    if (loading) { return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>; }

    const AddMoreItemsButton = () => (
        <TouchableOpacity style={styles.addMoreButton} onPress={() => navigation.navigate(ROUTES.MENU, { tableId, tableName })}>
            <Icon name="add-outline" size={22} color="#3B82F6" />
            <Text style={styles.addMoreButtonText}>Thêm món khác</Text>
        </TouchableOpacity>
    );


    // const handleDirectEndSession = async () => {
    //     // 1. Kiểm tra xem có gì để thanh toán không
    //     if (billableItems.length === 0) {
    //         Alert.alert("Thông báo", "Không có món nào cần thanh toán để đóng bàn.");
    //         return;
    //     }

    //     // 2. Hỏi xác nhận người dùng
    //     Alert.alert(
    //         "Xác nhận Đóng Bàn",
    //         `Hành động này sẽ thanh toán tổng cộng ${totalBill.toLocaleString('vi-VN')}đ và kết thúc phiên làm việc tại bàn. Tiếp tục?`,
    //         [
    //             { text: "Hủy", style: 'cancel' },
    //             { 
    //                 text: "Đồng ý", 
    //                 style: 'destructive',
    //                 // 3. Nếu đồng ý, thực hiện toàn bộ logic
    //                 onPress: async () => {
    //                     setLoading(true);
    //                     let finalOrderId = activeOrderId;

    //                     // Gửi các món mới đến bếp (nếu có) trước khi đóng
    //                     if (hasNewItems) {
    //                         const returnedOrderId = await sendNewItemsToKitchen();
    //                         if (!returnedOrderId) { 
    //                             setLoading(false); 
    //                             return; 
    //                         }
    //                         finalOrderId = returnedOrderId;
    //                     }

    //                     if (!finalOrderId) {
    //                         Alert.alert("Lỗi", "Không tìm thấy order để xử lý.");
    //                         setLoading(false);
    //                         return;
    //                     }
                        
    //                     // Gọi thẳng hàm kết thúc phiên mà không cần qua bước trung gian
    //                     await handleEndSessionAfterPayment(finalOrderId, totalBill);
    //                 }
    //             }
    //         ]
    //     );
    // };

    const handleCloseSessionAfterPayment = () => {
        Alert.alert(
            "Xác nhận Đóng Bàn",
            "Bạn có chắc muốn kết thúc phiên làm việc và dọn bàn này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        // Tìm một order bất kỳ của bàn để truyền vào hàm (vì hàm cần orderId)
                        // Logic trong handleEndSessionAfterPayment sẽ tự động đóng TẤT CẢ các order của bàn
                        const { data: anyOrder } = await supabase
                            .from('orders')
                            .select('id')
                            .eq('table_id', tableId)
                            .limit(1)
                            .single();
                        
                        if (!anyOrder) {
                            Alert.alert("Lỗi", "Không tìm thấy order nào để đóng phiên.");
                            setLoading(false);
                            return;
                        }

                        // Gọi hàm kết thúc phiên. Tổng tiền ở đây không quan trọng
                        // vì các order đã được cập nhật giá khi thanh toán giữ phiên.
                        await handleEndSessionAfterPayment(anyOrder.id, totalBill);
                    }
                }
            ]
        )
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleExitToHome} className="p-2 -ml-2">
                        <Icon name="arrow-back-outline" size={26} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Order cho {tableName}</Text>
                    <View className="w-8" />
                </View>
            </View>

            <FlatList
                data={allDisplayedItems}
                renderItem={({ item, index }) => {
                    const isPaid = index < paidItems.length;
                    const isNew = index >= (paidItems.length + pendingItems.length);
                    return <OrderListItem item={item} isNew={isNew} isPaid={isPaid} />
                }}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
                ListEmptyComponent={
                    <View className="mt-20 items-center">
                        <Text className="text-gray-500 mb-6">Chưa có món nào được gọi.</Text>
                        <AddMoreItemsButton />
                    </View>
                }
                ListFooterComponent={allDisplayedItems.length > 0 ? <AddMoreItemsButton /> : null}
            />
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <View className="flex-row items-center justify-between w-full mb-6 px-2">
                    <Text className="text-gray-500 text-base font-medium">Cần thanh toán</Text>
                    <Text className="text-3xl font-bold text-gray-900">{totalBill.toLocaleString('vi-VN')}đ</Text>
                </View>
                <View className="flex-row justify-around w-full">
                    <ActionButton icon="paper-plane-outline" text="Gửi bếp" color="#3B82F6" disabled={!hasNewItems} onPress={handleSendToKitchen} />
                    <ActionButton icon="save-outline" text="Lưu & Về" color="#8B5CF6" onPress={handleSaveAndExit} />
                    <ActionButton icon="cash-outline" text="Thanh toán" color="#10B981" onPress={handlePayment} disabled={billableItems.length === 0} />
                    {paidItems.length > 0 && (
                      <ActionButton 
                          icon="close-circle-outline" 
                          text="Đóng bàn" 
                          color="#EF4444" 
                          onPress={handleCloseSessionAfterPayment} // Sẽ tạo hàm này ở bước 2
                          disabled={loading} // Vô hiệu hóa khi đang xử lý
                      />
                  )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadow: { shadowColor: "#475569", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5 },
    paidItem: { backgroundColor: '#F9FAFB', opacity: 0.8 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 16, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#A5B4FC', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 16, marginTop: 16, marginBottom: 8 },
    addMoreButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});

export default OrderConfirmationScreen;