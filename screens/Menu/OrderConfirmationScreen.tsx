import React, { useState, useCallback, useEffect } from 'react';
import { 
    View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, 
    ActivityIndicator, InteractionManager, Modal, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

// --- Interfaces and Components (Không thay đổi) ---
interface DisplayItem {
    id: number; uniqueKey: string; name: string; quantity: number;
    unit_price: number; totalPrice: number; menuItemId?: number;
    customizations: any; isNew: boolean; isPaid: boolean;
}
const NoteInputModal: React.FC<{
    visible: boolean; initialValue: string; onClose: () => void; onSave: (note: string) => void;
}> = ({ visible, initialValue, onClose, onSave }) => {
    const [note, setNote] = useState(initialValue);
    useEffect(() => { setNote(initialValue); }, [initialValue]);
    const handleSave = () => { onSave(note.trim()); onClose(); };
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Thêm ghi chú</Text>
                    <TextInput style={styles.noteInput} placeholder="Ví dụ: ít cay, không hành..." value={note} onChangeText={setNote} multiline autoFocus />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={onClose}><Text style={styles.modalButtonText}>Hủy</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}><Text style={[styles.modalButtonText, styles.saveButtonText]}>Lưu</Text></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
const OrderListItem: React.FC<{ 
    item: DisplayItem, isExpanded: boolean, onPress: () => void,
    onUpdateQuantity: (newQuantity: number) => void, onOpenMenu: () => void,
}> = ({ item, isExpanded, onPress, onUpdateQuantity, onOpenMenu }) => {
    const { customizations, isNew, isPaid } = item;
    const sizeText = customizations.size?.name || 'N/A';
    const sugarText = customizations.sugar?.name || 'N/A';
    const toppingsText = (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
    const noteText = customizations.note;
    const ExpandedView = () => (
        <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Text className="text-gray-600 mr-4">Số lượng:</Text>
                    <TouchableOpacity onPress={() => onUpdateQuantity(item.quantity - 1)} disabled={!isNew} className={`w-8 h-8 items-center justify-center rounded-full ${!isNew ? 'bg-gray-100' : 'bg-gray-200'}`}><Icon name="remove" size={18} color={!isNew ? "#ccc" : "#333"} /></TouchableOpacity>
                    <Text className="text-lg font-bold mx-4">{item.quantity}</Text>
                    <TouchableOpacity onPress={() => onUpdateQuantity(item.quantity + 1)} disabled={!isNew} className={`w-8 h-8 items-center justify-center rounded-full ${!isNew ? 'bg-gray-100' : 'bg-blue-500'}`}><Icon name="add" size={18} color={!isNew ? "#ccc" : "white"} /></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={onOpenMenu} className="p-2"><Icon name="ellipsis-horizontal" size={24} color="gray" /></TouchableOpacity>
            </View>
        </View>
    );
    return (
      <View style={[styles.shadow, isPaid && styles.paidItem]} className="bg-white rounded-2xl p-4 mb-4">
        <TouchableOpacity onPress={onPress} disabled={isPaid}>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className={`text-lg font-bold ${isPaid ? 'text-gray-500' : 'text-gray-800'}`}>{item.name}</Text>
                <Text className="text-sm text-gray-500 mt-1">{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
                <Text className="text-sm text-gray-500">{`Topping: ${toppingsText}`}</Text>
                {noteText && (<View className="bg-yellow-50 p-2 rounded-md mt-2"><Text className="text-sm text-yellow-800 italic">Ghi chú: {noteText}</Text></View>)}
              </View>
              <View className="items-end">
                 {isNew && <View className="bg-green-100 px-2 py-1 rounded-full mb-1"><Text className="text-green-800 text-xs font-bold">Mới</Text></View>}
                 {isPaid && <View className="bg-gray-200 px-2 py-1 rounded-full mb-1"><Text className="text-gray-600 text-xs font-bold">Đã trả</Text></View>}
                <Text className={`text-lg font-semibold ${isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
            <View className="border-t border-dashed border-gray-200 mt-3 pt-2 flex-row justify-between items-center">
              <Text className={`text-base ${isPaid ? 'text-gray-500' : 'text-gray-600'}`}>{item.quantity} x {item.unit_price.toLocaleString('vi-VN')}đ</Text>
              {(!isNew && !isPaid) && <Icon name="flame-outline" size={20} color="#F97316" />}
            </View>
        </TouchableOpacity>
        {isExpanded && <ExpandedView />}
      </View>
    );
};
const ActionButton: React.FC<{ icon: string; text: string; color: string; disabled?: boolean; onPress: () => void; }> =
({ icon, text, color, disabled = false, onPress }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} className={`items-center justify-center ${disabled ? 'opacity-40' : 'opacity-100'}`}>
        <View style={{ backgroundColor: `${color}20`}} className="w-16 h-16 rounded-full items-center justify-center"><Icon name={icon} size={30} color={color} /></View>
        <Text style={{ color }} className="mt-2 font-semibold text-sm">{text}</Text>
    </TouchableOpacity>
);

// --- Main Component ---
type Props = NativeStackScreenProps<AppStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = ({ route, navigation }: Props) => {
    const { tableId, tableName } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const [allDisplayedItems, setAllDisplayedItems] = useState<DisplayItem[]>([]);
    const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
    const [isNoteModalVisible, setNoteModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<DisplayItem | null>(null);
    
    const fetchAllData = useCallback(async (isInitialLoad = true) => {
        if (isInitialLoad) setLoading(true);
        try {
            const { data: cartData, error: cartError } = await supabase.from('cart_items').select('*').eq('table_id', tableId);
            if (cartError) throw cartError;
            const newItems: DisplayItem[] = (cartData || []).map(item => ({ id: item.id, uniqueKey: `new-${item.id}`, name: item.customizations.name || 'Món mới', quantity: item.quantity, unit_price: item.unit_price, totalPrice: item.total_price, menuItemId: item.menu_item_id, customizations: item.customizations, isNew: true, isPaid: false }));
            const { data: pendingOrder, error: pendingOrderError } = await supabase.from('orders').select('id').eq('table_id', tableId).eq('status', 'pending').maybeSingle();
            if (pendingOrderError) throw pendingOrderError;
            let pendingItems: DisplayItem[] = [];
            if (pendingOrder) {
                setActiveOrderId(pendingOrder.id);
                const { data: items, error: pendingItemsError } = await supabase.from('order_items').select(`*, menu_items(name)`).eq('order_id', pendingOrder.id);
                if (pendingItemsError) throw pendingItemsError;
                pendingItems = (items || []).map(item => ({ id: item.id, uniqueKey: `pending-${item.id}`, name: item.menu_items?.name || 'Món đã xóa', quantity: item.quantity, unit_price: item.unit_price, totalPrice: item.quantity * item.unit_price, menuItemId: item.menu_item_id, customizations: item.customizations, isNew: false, isPaid: false }));
            } else { setActiveOrderId(null); }
            const { data: paidOrders, error: paidOrdersError } = await supabase.from('orders').select('id').eq('table_id', tableId).eq('status', 'paid');
            if (paidOrdersError) throw paidOrdersError;
            let paidItems: DisplayItem[] = [];
            if (paidOrders && paidOrders.length > 0) {
                const paidOrderIds = paidOrders.map(o => o.id);
                const { data: items, error: paidItemsError } = await supabase.from('order_items').select(`*, menu_items(name)`).in('order_id', paidOrderIds);
                if (paidItemsError) throw paidItemsError;
                paidItems = (items || []).map(item => ({ id: item.id, uniqueKey: `paid-${item.id}`, name: item.menu_items?.name || 'Món đã xóa', quantity: item.quantity, unit_price: item.unit_price, totalPrice: item.quantity * item.unit_price, menuItemId: item.menu_item_id, customizations: item.customizations, isNew: false, isPaid: true }));
            }
            setAllDisplayedItems([...paidItems, ...pendingItems, ...newItems]);
        } catch (error: any) { Alert.alert("Lỗi", `Không thể tải dữ liệu: ${error.message}`);
        } finally { if (isInitialLoad) setLoading(false); }
    }, [tableId]);
    useFocusEffect(useCallback(() => { 
        const task = InteractionManager.runAfterInteractions(() => { fetchAllData(true); });
        const channel = supabase.channel(`table-channel-${tableId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `table_id=eq.${tableId}` }, () => fetchAllData(false)).on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchAllData(false)).on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `table_id=eq.${tableId}` }, () => fetchAllData(false)).subscribe();
        return () => { task.cancel(); supabase.removeChannel(channel); };
    }, [fetchAllData, tableId]));
    const handleUpdateQuantity = async (item: DisplayItem, newQuantity: number) => {
        if (!item.isNew) return; 
        try {
            if (newQuantity < 1) { await handleRemoveItem(item); } else {
                await supabase.from('cart_items').update({ quantity: newQuantity, total_price: item.unit_price * newQuantity }).eq('id', item.id).throwOnError();
                await fetchAllData(false);
            }
        } catch(error: any) { Alert.alert("Lỗi", `Không thể cập nhật số lượng: ${error.message}`); }
    };
    const handleRemoveItem = (itemToRemove: DisplayItem) => {
        Alert.alert( "Xác nhận Hủy Món", `Bạn có chắc muốn hủy món "${itemToRemove.name}"?`,
            [{ text: "Không" }, { text: "Đồng ý", style: "destructive", onPress: async () => {
                try {
                    await supabase.from(itemToRemove.isNew ? 'cart_items' : 'order_items').delete().eq("id", itemToRemove.id).throwOnError();
                    await fetchAllData(false);
                } catch (error: any) { Alert.alert("Lỗi", `Không thể hủy món: ${error.message}`); }
            }}]
        );
    };
    const handleOpenItemMenu = (item: DisplayItem) => {
        setEditingItem(item);
        Alert.alert(`Tùy chỉnh "${item.name}"`, undefined, [ { text: "Ghi chú nhanh", onPress: () => setNoteModalVisible(true) }, { text: "Hủy món", style: "destructive", onPress: () => handleRemoveItem(item) }, { text: "Thoát" }]);
    };
    const handleSaveNote = async (newNote: string) => {
        if (!editingItem) return;
        try {
            const updatedCustomizations = { ...editingItem.customizations, note: newNote };
            await supabase.from(editingItem.isNew ? 'cart_items' : 'order_items').update({ customizations: updatedCustomizations }).eq('id', editingItem.id).throwOnError();
            await fetchAllData(false);
        } catch (error: any) { Alert.alert("Lỗi", `Không thể lưu ghi chú: ${error.message}`);
        } finally { setNoteModalVisible(false); setEditingItem(null); }
    };
    const newItemsFromCart = allDisplayedItems.filter(item => item.isNew);
    const billableItems = allDisplayedItems.filter(item => !item.isPaid);
    const paidItems = allDisplayedItems.filter(item => item.isPaid);
    const hasNewItems = newItemsFromCart.length > 0;
    const totalBill = billableItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const handleExitToHome = useCallback(() => navigation.goBack(), [navigation]);
    const sendNewItemsToKitchen = async (): Promise<number | null> => {
        if (!hasNewItems) return activeOrderId;
        try {
            let orderIdToUse = activeOrderId;
            if (!orderIdToUse) {
                await supabase.from('tables').update({ status: 'Đang phục vụ' }).eq('id', tableId).throwOnError();
                const { data: newOrder } = await supabase.from('orders').insert({ table_id: tableId, status: 'pending', total_price: 0 }).select('id').single().throwOnError();
                orderIdToUse = newOrder.id;
            }
            const itemsToInsert = newItemsFromCart.map(item => ({ order_id: orderIdToUse, menu_item_id: item.menuItemId, quantity: item.quantity, unit_price: item.unit_price, customizations: item.customizations }));
            await supabase.from('order_items').insert(itemsToInsert).throwOnError();
            await supabase.from('cart_items').delete().eq('table_id', tableId).throwOnError();
            return orderIdToUse;
        } catch (error: any) { Alert.alert("Lỗi Gửi Bếp", error.message); return null; }
    };
    const handleSendToKitchen = async () => {
        setLoading(true);
        const successId = await sendNewItemsToKitchen();
        if (successId !== null) {
          Alert.alert("Thành công", "Đã gửi yêu cầu cho bếp!");
          await fetchAllData(false);
        }
        setLoading(false);
    };
    const handleSaveAndExit = () => navigation.goBack();
    const handlePayment = async () => {
        if (billableItems.length === 0) { Alert.alert("Thông báo", "Không có món nào cần thanh toán."); return; }
        setLoading(true);
        let finalOrderId = activeOrderId;
        if (hasNewItems) {
            const returnedOrderId = await sendNewItemsToKitchen();
            if (!returnedOrderId) { setLoading(false); return; }
            finalOrderId = returnedOrderId;
        }
        if (!finalOrderId) { Alert.alert("Lỗi", "Không tìm thấy order để thanh toán."); setLoading(false); return; }
        setLoading(false);
        const finalBillToPay = allDisplayedItems.filter(i => !i.isPaid).reduce((s, i) => s + i.totalPrice, 0);
        Alert.alert("Xác nhận thanh toán", `Tổng hóa đơn là ${finalBillToPay.toLocaleString('vi-VN')}đ.`,
          [{ text: "Hủy" }, { text: "Giữ phiên", onPress: () => handleKeepSessionAfterPayment(finalOrderId!, finalBillToPay) }, { text: "Kết thúc", onPress: () => handleEndSessionAfterPayment(finalOrderId!, finalBillToPay) }]
        );
    };
    const handleKeepSessionAfterPayment = async (orderId: number, finalBill: number) => {
        setLoading(true);
        try {
            await supabase.from('orders').update({ status: 'paid', total_price: finalBill }).eq('id', orderId).throwOnError();
            setAllDisplayedItems(prevItems => prevItems.map(item => !item.isPaid ? { ...item, isPaid: true, isNew: false } : item));
            Alert.alert("Thành công", "Đã thanh toán. Bàn vẫn đang được phục vụ.");
            await fetchAllData(false);
        } catch (error: any) { 
            Alert.alert("Lỗi", `Không thể cập nhật trạng thái order: ${error.message}`); 
            await fetchAllData(false);
        } 
        finally { setLoading(false); }
    };
    const handleEndSessionAfterPayment = async (orderId: number, finalBill: number) => {
        setLoading(true);
        try {
            await supabase.from('orders').update({ status: 'closed', total_price: finalBill }).eq('id', orderId).throwOnError();
            await supabase.from('orders').update({ status: 'closed' }).eq('table_id', tableId).eq('status', 'paid').throwOnError();
            await supabase.from('tables').update({ status: 'Trống' }).eq('id', tableId).throwOnError();
            Alert.alert("Hoàn tất", "Bàn đã được thanh toán và dọn dẹp.");
            navigation.navigate(ROUTES.APP_TABS, { screen: ROUTES.HOME_TAB });
        } catch (error: any) { Alert.alert("Lỗi", `Không thể kết thúc phiên làm việc: ${error.message}`); }
        finally { setLoading(false); }
    };
    
    // =================================================================
    // [SỬA LỖI] Thêm điều hướng về Home sau khi đóng bàn thành công
    // =================================================================
    const handleCloseSessionAfterPayment = () => {
        Alert.alert("Xác nhận Đóng Bàn", "Bạn có chắc muốn kết thúc phiên và dọn bàn này không?",
            [{ text: "Hủy" }, { text: "Đồng ý", style: "destructive", onPress: async () => {
                setLoading(true);
                try {
                    // Cập nhật các order đã paid thành closed
                    await supabase.from('orders').update({ status: 'closed' }).eq('table_id', tableId).eq('status', 'paid').throwOnError();
                    // Cập nhật trạng thái bàn thành trống
                    await supabase.from('tables').update({ status: 'Trống' }).eq('id', tableId).throwOnError();
                    
                    Alert.alert("Thành công", "Đã đóng bàn và kết thúc phiên.");
                    navigation.navigate(ROUTES.APP_TABS, { screen: ROUTES.HOME_TAB });

                } catch(error: any) { 
                    Alert.alert("Lỗi", `Không thể đóng bàn: ${error.message}`); 
                }
                finally { setLoading(false); }
            }}]
        )
    };
    
    // --- Render ---
    if (loading) { return <View style={styles.containerCenter}><ActivityIndicator size="large" color="#3B82F6" /></View>; }
    const AddMoreItemsButton = () => (<TouchableOpacity style={styles.addMoreButton} onPress={() => navigation.navigate(ROUTES.MENU, { tableId, tableName })}><Icon name="add-outline" size={22} color="#3B82F6" /><Text style={styles.addMoreButtonText}>Thêm món khác</Text></TouchableOpacity>);
    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3"><View className="flex-row items-center justify-between"><TouchableOpacity onPress={handleExitToHome} className="p-2 -ml-2"><Icon name="arrow-back-outline" size={26} color="#1F2937" /></TouchableOpacity><Text className="text-xl font-bold text-gray-800">Order cho {tableName}</Text><View className="w-8" /></View></View>
            <FlatList
                data={allDisplayedItems}
                renderItem={({ item }) => (<OrderListItem item={item} isExpanded={expandedItemKey === item.uniqueKey} onPress={() => setExpandedItemKey(prevKey => (prevKey === item.uniqueKey ? null : item.uniqueKey))} onUpdateQuantity={(newQuantity) => handleUpdateQuantity(item, newQuantity)} onOpenMenu={() => handleOpenItemMenu(item)} />)}
                keyExtractor={(item) => item.uniqueKey}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
                ListEmptyComponent={<View className="mt-20 items-center"><Text className="text-gray-500 mb-6">Chưa có món nào được gọi.</Text><AddMoreItemsButton /></View>}
                ListFooterComponent={allDisplayedItems.length > 0 ? <AddMoreItemsButton /> : null}
            />
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <View className="flex-row items-center justify-between w-full mb-6 px-2"><Text className="text-gray-500 text-base font-medium">Cần thanh toán</Text><Text className="text-3xl font-bold text-gray-900">{totalBill.toLocaleString('vi-VN')}đ</Text></View>
                <View className="flex-row justify-around w-full">
                    <ActionButton icon="paper-plane-outline" text="Gửi bếp" color="#3B82F6" disabled={!hasNewItems} onPress={handleSendToKitchen} />
                    <ActionButton icon="save-outline" text="Lưu & Về" color="#8B5CF6" onPress={handleSaveAndExit} />
                    <ActionButton icon="cash-outline" text="Thanh toán" color="#10B981" onPress={handlePayment} disabled={billableItems.length === 0} />
                    {paidItems.length > 0 && billableItems.length === 0 && (<ActionButton icon="close-circle-outline" text="Đóng bàn" color="#EF4444" onPress={handleCloseSessionAfterPayment} disabled={loading}/>)}
                </View>
            </View>
             {editingItem && (<NoteInputModal visible={isNoteModalVisible} onClose={() => setNoteModalVisible(false)} initialValue={editingItem.customizations?.note || ''} onSave={handleSaveNote}/>)}
        </View>
    );
};
const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    shadow: { shadowColor: "#475569", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5 },
    paidItem: { backgroundColor: '#F9FAFB', opacity: 0.8 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 16, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#A5B4FC', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 16, marginTop: 16, marginBottom: 8 },
    addMoreButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    noteInput: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 100, textAlignVertical: 'top', fontSize: 16, marginBottom: 20, color: '#1F2937' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
    modalButtonText: { fontSize: 16, fontWeight: '600' },
    saveButton: { backgroundColor: '#3B82F6', marginLeft: 12 },
    saveButtonText: { color: 'white' },
});

export default OrderConfirmationScreen;