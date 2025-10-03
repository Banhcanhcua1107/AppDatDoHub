// --- START OF FILE OrderConfirmationScreen.tsx ---

import React, { useState, useCallback, useEffect } from 'react';
import { 
    View, Text, StyleSheet, StatusBar, SectionList, TouchableOpacity, Alert, 
    ActivityIndicator, Modal, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

// --- Interfaces and Components (Không thay đổi) ---
interface OrderSection {
    title: string;
    data: DisplayItem[];
}
interface DisplayItem {
    id: number; uniqueKey: string; name: string; quantity: number;
    unit_price: number; totalPrice: number; menuItemId?: number;
    customizations: any; isNew: boolean; isPaid: boolean; created_at?: string;
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

type Props = NativeStackScreenProps<AppStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = ({ route, navigation }: Props) => {
    const { tableId: initialTableId, tableName: initialTableName, orderId: routeOrderId } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(routeOrderId || null);
    
    const [displayedSections, setDisplayedSections] = useState<OrderSection[]>([]);
    const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
    const [isNoteModalVisible, setNoteModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<DisplayItem | null>(null);
    const [currentTables, setCurrentTables] = useState<{id: string, name: string}[]>(initialTableId ? [{id: initialTableId, name: initialTableName}] : []);

    const fetchAllData = useCallback(async (isInitialLoad = true) => {
        if (isInitialLoad) setLoading(true);
        try {
            let orderIdToFetch = activeOrderId;
            if (!orderIdToFetch && initialTableId) {
                const { data: orderLink } = await supabase.from('order_tables').select('orders!inner(id)').eq('table_id', initialTableId).eq('orders.status', 'pending').limit(1).single();
                if (orderLink?.orders) {
                    const foundOrder = Array.isArray(orderLink.orders) ? orderLink.orders[0] : orderLink.orders;
                    if (foundOrder?.id) {
                        orderIdToFetch = foundOrder.id;
                        if (!activeOrderId) setActiveOrderId(orderIdToFetch);
                    }
                }
            }

            let newItems: DisplayItem[] = [];
            let pendingItems: DisplayItem[] = [];
            let paidItems: DisplayItem[] = [];
            let freshTables: {id: string, name: string}[] = [];

            if (orderIdToFetch) {
                // [CẬP NHẬT] Lấy cả cột created_at của order_items
                const { data: orderDetails, error: orderError } = await supabase.from('orders').select(`id, status, order_items(id, quantity, unit_price, customizations, created_at), order_tables(tables(id, name))`).eq('id', orderIdToFetch).single();
                if (orderError) throw orderError;
                if (orderDetails) {
                    freshTables = orderDetails.order_tables.map((ot: any) => ot.tables).filter(Boolean);
                    if (freshTables.length > 0) setCurrentTables(freshTables);

                    (orderDetails.order_items || []).forEach((item: any) => {
                        const displayItem: DisplayItem = {
                            id: item.id, uniqueKey: `${orderDetails.status}-${item.id}`, name: item.customizations?.name || 'Món đã xóa', quantity: item.quantity,
                            unit_price: item.unit_price, totalPrice: item.quantity * item.unit_price, menuItemId: item.menu_item_id,
                            customizations: item.customizations, created_at: item.created_at, isNew: false, isPaid: orderDetails.status === 'paid' || orderDetails.status === 'closed'
                        };
                        if (displayItem.isPaid) paidItems.push(displayItem); else pendingItems.push(displayItem);
                    });
                }
            }
            
            const representativeTableId = freshTables[0]?.id || initialTableId;
            if (representativeTableId) {
                const { data: cartData, error: cartError } = await supabase.from('cart_items').select('*').eq('table_id', representativeTableId);
                if (cartError) throw cartError;
                newItems = (cartData || []).map(item => ({ id: item.id, uniqueKey: `new-${item.id}`, name: item.customizations.name || 'Món mới', quantity: item.quantity, unit_price: item.unit_price, totalPrice: item.total_price, menuItemId: item.menu_item_id, customizations: item.customizations, isNew: true, isPaid: false }));
            }
            
            // --- [LOGIC MỚI] Nhóm các món theo từng đợt ---
            const sections: OrderSection[] = [];

            // 1. Section cho các món mới (chưa gửi bếp)
            if (newItems.length > 0) {
                sections.push({ title: 'Món mới chờ gửi bếp', data: newItems });
            }

            // 2. Nhóm các món đã gửi bếp theo thời gian
            const groupedPendingItems = pendingItems.reduce((acc, item) => {
                // [SỬA LỖI] Đảm bảo timestamp là một chuỗi hợp lệ
                const timestamp = item.created_at || new Date().toISOString();
                if (!acc[timestamp]) {
                    acc[timestamp] = [];
                }
                acc[timestamp].push(item);
                return acc;
            }, {} as Record<string, DisplayItem[]>);

            // 3. Chuyển các nhóm thành các section và sắp xếp theo thời gian
            const pendingSections = Object.keys(groupedPendingItems)
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map((timestamp, index) => ({
                    title: `Đợt ${index + 1} - ${new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
                    data: groupedPendingItems[timestamp],
                }));
            
            sections.push(...pendingSections);

            // 4. Section cho các món đã thanh toán
            if (paidItems.length > 0) {
                sections.push({ title: 'Món đã thanh toán', data: paidItems });
            }

            setDisplayedSections(sections);
            // --------------------------------------------------

        } catch (error: any) { 
            if (error.code !== 'PGRST116') Alert.alert("Lỗi", `Không thể tải dữ liệu: ${error.message}`);
        } finally { 
            if (isInitialLoad) setLoading(false); 
        }
    }, [activeOrderId, initialTableId]);
    
    useFocusEffect(
      useCallback(() => {
        fetchAllData(true);
        const channel = supabase.channel(`public:order_confirmation_v2:${activeOrderId || initialTableId}`)
          .on('postgres_changes', { event: '*', schema: 'public' }, 
            (payload) => { fetchAllData(false); })
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      }, [fetchAllData, activeOrderId, initialTableId])
    );
    
    const handleUpdateQuantity = async (item: DisplayItem, newQuantity: number) => {
        if (!item.isNew) return; 
        try {
            if (newQuantity < 1) { await handleRemoveItem(item); } else {
                await supabase.from('cart_items').update({ quantity: newQuantity, total_price: item.unit_price * newQuantity }).eq('id', item.id).throwOnError();
                fetchAllData(false);
            }
        } catch(error: any) { Alert.alert("Lỗi", `Không thể cập nhật số lượng: ${error.message}`); }
    };
    const handleRemoveItem = (itemToRemove: DisplayItem) => {
        Alert.alert( "Xác nhận Hủy Món", `Bạn có chắc muốn hủy món "${itemToRemove.name}"?`,
            [{ text: "Không" }, { text: "Đồng ý", style: "destructive", onPress: async () => {
                try {
                    await supabase.from(itemToRemove.isNew ? 'cart_items' : 'order_items').delete().eq("id", itemToRemove.id).throwOnError();
                    fetchAllData(false);
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
            fetchAllData(false);
        } catch (error: any) { Alert.alert("Lỗi", `Không thể lưu ghi chú: ${error.message}`);
        } finally { setNoteModalVisible(false); setEditingItem(null); }
    };
    const allItems = displayedSections.flatMap(s => s.data);
    const representativeTable = currentTables[0] || {id: initialTableId, name: initialTableName};
    const currentTableNameForDisplay = currentTables.map(t => t.name).join(', ');
    const newItemsFromCart = allItems.filter(item => item.isNew);
    const billableItems = allItems.filter(item => !item.isPaid);
    const paidItems = allItems.filter(item => item.isPaid);
    const hasNewItems = newItemsFromCart.length > 0;
    const totalBill = billableItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const handleExitToHome = useCallback(() => navigation.goBack(), [navigation]);
    const sendNewItemsToKitchen = async (): Promise<string | null> => {
        if (!hasNewItems) return activeOrderId;
        try {
            let orderIdToUse = activeOrderId;
            if (!orderIdToUse) {
                const { data: newOrder } = await supabase.from('orders').insert({ status: 'pending', total_price: 0 }).select('id').single();
                if (!newOrder) throw new Error("Không thể tạo order mới.");
                orderIdToUse = newOrder.id;
                await supabase.from('order_tables').insert({ order_id: orderIdToUse, table_id: representativeTable.id }).throwOnError();
                await supabase.from('tables').update({ status: 'Đang phục vụ' }).eq('id', representativeTable.id).throwOnError();
                setActiveOrderId(orderIdToUse);
            }
            const itemsToInsert = newItemsFromCart.map(item => ({ order_id: orderIdToUse, menu_item_id: item.menuItemId, quantity: item.quantity, unit_price: item.unit_price, customizations: item.customizations }));
            await supabase.from('order_items').insert(itemsToInsert).throwOnError();
            await supabase.from('cart_items').delete().in('id', newItemsFromCart.map(i => i.id)).throwOnError();
            return orderIdToUse;
        } catch (error: any) { Alert.alert("Lỗi Gửi Bếp", error.message); return null; }
    };
    const handleSendToKitchen = async () => { setLoading(true); const s = await sendNewItemsToKitchen(); if (s) { fetchAllData(false); } setLoading(false); };
    const handleSaveAndExit = () => navigation.goBack();
    const handlePayment = async () => {
        const allItems = displayedSections.flatMap(s => s.data);
        const billableItems = allItems.filter(item => !item.isPaid);
        
        if (billableItems.length === 0) { Alert.alert("Thông báo", "Không có món nào cần thanh toán."); return; }

        setLoading(true);
        let finalOrderId = activeOrderId;
        if (allItems.some(i => i.isNew)) {
            const returnedOrderId = await sendNewItemsToKitchen();
            if (!returnedOrderId) { setLoading(false); return; }
            finalOrderId = returnedOrderId;
            // Tải lại dữ liệu sau khi gửi bếp để tính tổng tiền cuối cùng cho chính xác
            await fetchAllData(false); 
        }
        if (!finalOrderId) { Alert.alert("Lỗi", "Không tìm thấy order để thanh toán."); setLoading(false); return; }
        
        // Tính lại tổng tiền sau khi đã gửi bếp (nếu có)
        const finalBillToPay = displayedSections.flatMap(s => s.data).filter(i => !i.isPaid).reduce((s, i) => s + i.totalPrice, 0);

        setLoading(false);
        Alert.alert("Xác nhận thanh toán", `Tổng hóa đơn là ${finalBillToPay.toLocaleString('vi-VN')}đ.`,
          [{ text: "Hủy" }, { text: "Giữ phiên", onPress: () => handleKeepSessionAfterPayment(finalOrderId!, finalBillToPay) }, { text: "Kết thúc", onPress: () => handleEndSessionAfterPayment(finalOrderId!, finalBillToPay) }]
        );
    };
    const handleKeepSessionAfterPayment = async (orderId: string, finalBill: number) => {
        setLoading(true);
        try {
            await supabase.from('orders').update({ status: 'paid', total_price: finalBill }).eq('id', orderId).throwOnError();
            fetchAllData(true);
            Alert.alert("Thành công", "Đã thanh toán. Bàn vẫn đang được phục vụ.");
        } catch (error: any) { 
            Alert.alert("Lỗi", `Không thể cập nhật trạng thái order: ${error.message}`); 
            fetchAllData(false);
        } 
        finally { setLoading(false); }
    };
    const handleEndSessionAfterPayment = async (orderId: string, finalBill: number) => {
        setLoading(true);
        try {
            const { data: orderTables, error: tablesError } = await supabase.from('order_tables').select('table_id').eq('order_id', orderId);
            if (tablesError) throw tablesError;
            const tableIdsToUpdate = orderTables.map(t => t.table_id);
            await supabase.from('orders').update({ status: 'closed', total_price: finalBill }).eq('id', orderId).throwOnError();
            await supabase.from('tables').update({ status: 'Trống' }).in('id', tableIdsToUpdate).throwOnError();
            Alert.alert("Hoàn tất", "Bàn đã được thanh toán và dọn dẹp.");
            navigation.navigate(ROUTES.APP_TABS, { screen: ROUTES.HOME_TAB });
        } catch (error: any) { Alert.alert("Lỗi", `Không thể kết thúc phiên làm việc: ${error.message}`); }
        finally { setLoading(false); }
    };
    const handleCloseSessionAfterPayment = () => {
        if (!activeOrderId) return;
        Alert.alert("Xác nhận Đóng Bàn", "Bạn có chắc muốn kết thúc phiên và dọn bàn này không?",
            [{ text: "Hủy" }, { text: "Đồng ý", style: "destructive", onPress: async () => {
                setLoading(true);
                try {
                    const { data: orderTables, error: tablesError } = await supabase.from('order_tables').select('table_id').eq('order_id', activeOrderId);
                    if (tablesError) throw tablesError;
                    const tableIdsToUpdate = orderTables.map(t => t.table_id);
                    await supabase.from('orders').update({ status: 'closed' }).eq('id', activeOrderId).throwOnError();
                    await supabase.from('tables').update({ status: 'Trống' }).in('id', tableIdsToUpdate).throwOnError();
                    Alert.alert("Thành công", "Đã đóng bàn và kết thúc phiên.");
                    navigation.navigate(ROUTES.APP_TABS, { screen: ROUTES.HOME_TAB });
                } catch(error: any) { Alert.alert("Lỗi", `Không thể đóng bàn: ${error.message}`); }
                finally { setLoading(false); }
            }}]
        )
    };
    
    
    // --- Render ---
    if (loading) { return <View style={styles.containerCenter}><ActivityIndicator size="large" color="#3B82F6" /></View>; }
    
    const AddMoreItemsButton = () => (
        <TouchableOpacity style={styles.addMoreButton} onPress={() => navigation.navigate(ROUTES.MENU, { tableId: representativeTable.id, tableName: currentTableNameForDisplay, orderId: activeOrderId || undefined })}>
            <Icon name="add-outline" size={22} color="#3B82F6" />
            <Text style={styles.addMoreButtonText}>Thêm món khác</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleExitToHome} className="p-2 -ml-2"><Icon name="arrow-back-outline" size={26} color="#1F2937" /></TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 flex-1 text-center" numberOfLines={1} ellipsizeMode='tail'>
                        Order cho {currentTableNameForDisplay}
                    </Text>
                    <View className="w-8" />
                </View>
            </View>
            
            <SectionList
                sections={displayedSections}
                keyExtractor={(item) => item.uniqueKey}
                renderItem={({ item }) => (
                    <OrderListItem 
                        item={item} 
                        isExpanded={expandedItemKey === item.uniqueKey} 
                        onPress={() => setExpandedItemKey(prevKey => (prevKey === item.uniqueKey ? null : item.uniqueKey))} 
                        onUpdateQuantity={(newQuantity) => handleUpdateQuantity(item, newQuantity)} 
                        onOpenMenu={() => handleOpenItemMenu(item)} 
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
                ListEmptyComponent={<View className="mt-20 items-center"><Text className="text-gray-500 mb-6">Chưa có món nào được gọi.</Text><AddMoreItemsButton /></View>}
                ListFooterComponent={allItems.length > 0 ? <AddMoreItemsButton /> : null}
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
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B5563',
        backgroundColor: '#F8F9FA',
        paddingTop: 20,
        paddingBottom: 8,
    },
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