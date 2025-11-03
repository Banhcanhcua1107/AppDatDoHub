// screens/Cashier/CreatePurchaseOrderScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, 
    TextInput, ActivityIndicator, Alert, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Giao diện nguyên liệu gốc
interface Ingredient {
    id: string;
    name: string;
    unit: string;
}

// Giao diện nguyên liệu đã được chọn để nhập
interface SelectedIngredient extends Ingredient {
    quantity: string;
}

// Modal để chọn nguyên liệu từ danh sách có sẵn
const SelectIngredientModal = ({ visible, onClose, onSelect, onAddNew }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (visible) {
            fetchIngredients();
        }
    }, [visible]);

    const fetchIngredients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ingredients')
            .select('id, name, unit')
            .order('name');
        if (error) Alert.alert('Lỗi', 'Không thể tải danh sách nguyên liệu');
        else setIngredients(data || []);
        setLoading(false);
    };

    const filteredIngredients = ingredients.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chọn Nguyên liệu</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color="#334155" />
                    </TouchableOpacity>
                </View>
                <View style={styles.controlsContainer}>
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Tìm tên nguyên liệu..." 
                        value={search}
                        onChangeText={setSearch}
                    />
                     <TouchableOpacity style={styles.addNewButton} onPress={onAddNew}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addNewButtonText}>Tạo mới</Text>
                    </TouchableOpacity>
                </View>
                {loading ? <ActivityIndicator /> : (
                    <FlatList
                        data={filteredIngredients}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.ingredientSelectItem} onPress={() => onSelect(item)}>
                                <Text style={styles.ingredientSelectName}>{item.name}</Text>
                                <Text style={styles.ingredientSelectUnit}>({item.unit})</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

// Modal để tạo nguyên liệu mới (Tái sử dụng từ code cũ của bạn)
const AddIngredientModal = ({ visible, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [threshold, setThreshold] = useState('100');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data, error } = await supabase.from('ingredients').insert({
                name, unit, low_stock_threshold: parseInt(threshold), stock_quantity: 0
            }).select().single();
            if(error) throw error;

            Toast.show({ type: 'success', text1: 'Thêm thành công!' });
            onSave(data); // Trả về nguyên liệu vừa tạo
            // Reset state
            setName('');
            setUnit('');
            setThreshold('100');
        } catch(error: any) {
            Alert.alert('Lỗi', 'Không thể thêm nguyên liệu: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };
    // ... JSX của modal này tương tự code gốc ...
    return (
         <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Thêm Nguyên liệu mới</Text>
                    <TextInput style={styles.input} placeholder="Tên nguyên liệu" value={name} onChangeText={setName} />
                    <TextInput style={styles.input} placeholder="Đơn vị tính (gram, ml...)" value={unit} onChangeText={setUnit} />
                    <TextInput style={styles.input} placeholder="Ngưỡng báo sắp hết" keyboardType="number-pad" value={threshold} onChangeText={setThreshold} />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={onClose}><Text style={styles.modalButtonText}>Hủy</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
};


const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

export default function CreatePurchaseOrderScreen() {
    const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
    const [isSelectModalVisible, setSelectModalVisible] = useState(false);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigation = useNavigation();

    const handleSelectIngredient = (ingredient: Ingredient) => {
        // Kiểm tra xem đã tồn tại chưa
        if (selectedIngredients.some(i => i.id === ingredient.id)) {
            Toast.show({ type: 'info', text1: 'Nguyên liệu đã được chọn.' });
            return;
        }
        setSelectedIngredients(prev => [...prev, { ...ingredient, quantity: '' }]);
        setSelectModalVisible(false);
    };
    
    // Khi tạo mới thành công, tự động thêm vào danh sách
    const handleAddNewIngredient = (newIngredient: Ingredient) => {
        setAddModalVisible(false);
        handleSelectIngredient(newIngredient);
    };

    const handleQuantityChange = (id: string, quantity: string) => {
        setSelectedIngredients(prev => 
            prev.map(item => item.id === id ? { ...item, quantity } : item)
        );
    };

    const handleRemoveItem = (id: string) => {
        setSelectedIngredients(prev => prev.filter(item => item.id !== id));
    };

    const getTotalItems = () => selectedIngredients.length;

    const handleSavePurchaseOrder = async () => {
        if (selectedIngredients.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một nguyên liệu.');
            return;
        }

        const itemsToSave = selectedIngredients.map(item => ({
            ingredient_id: item.id,
            quantity: parseFloat(item.quantity.replace(',', '.'))
        }));

        if (itemsToSave.some(item => isNaN(item.quantity) || item.quantity <= 0)) {
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ cho tất cả nguyên liệu.');
            return;
        }

        setIsSaving(true);
        try {
            // 1. Tạo phiếu nhập kho trước
            const { data: poData, error: poError } = await supabase
                .from('purchase_orders')
                .insert({ status: 'pending' })
                .select()
                .single();

            if (poError) throw poError;
            const purchaseOrderId = poData.id;

            // 2. Thêm các chi tiết vào phiếu nhập
            const itemsWithPoId = itemsToSave.map(item => ({ ...item, purchase_order_id: purchaseOrderId }));
            const { error: itemsError } = await supabase
                .from('purchase_order_items')
                .insert(itemsWithPoId);

            if (itemsError) throw itemsError;

            // 3. Gọi RPC để hoàn thành phiếu và cập nhật kho
            const { error: rpcError } = await supabase.rpc('complete_purchase_order', {
                p_po_id: purchaseOrderId,
            });
            
            if (rpcError) throw rpcError;

            Toast.show({type: 'success', text1: 'Nhập kho thành công!'});
            navigation.goBack();

        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể lưu phiếu nhập kho: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Tạo Phiếu Nhập Kho</Text>
                    <Text style={styles.headerSubtitle}>{selectedIngredients.length} loại nguyên liệu</Text>
                </View>
                <View style={styles.itemCountBadge}>
                    <Text style={styles.itemCountText}>{selectedIngredients.length}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {selectedIngredients.length > 0 && (
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                            <Text style={styles.statLabel}>Tổng mục</Text>
                            <Text style={styles.statValue}>{selectedIngredients.length}</Text>
                        </View>
                    </View>
                )}

                {selectedIngredients.length > 0 ? (
                    <View style={styles.itemsSection}>
                        {selectedIngredients.map((item) => (
                            <View key={item.id} style={styles.selectedItemContainer}>
                                <View style={styles.itemIconContainer}>
                                    <Ionicons name="cube-outline" size={20} color="#3B82F6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.selectedItemName}>{item.name}</Text>
                                    <Text style={styles.selectedItemUnit}>Đơn vị: {item.unit}</Text>
                                </View>
                                <TextInput
                                    style={styles.quantityInput}
                                    placeholder="0"
                                    placeholderTextColor="#CBD5E1"
                                    keyboardType="numeric"
                                    value={item.quantity}
                                    onChangeText={text => handleQuantityChange(item.id, text)}
                                />
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => handleRemoveItem(item.id)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyStateTitle}>Chưa có nguyên liệu</Text>
                        <Text style={styles.emptyStateSubtext}>Nhấn nút bên dưới để thêm nguyên liệu</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.addButton} onPress={() => setSelectModalVisible(true)}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Thêm Nguyên liệu</Text>
                </TouchableOpacity>

            </ScrollView>
           
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveButtonFooter, (selectedIngredients.length === 0 || isSaving) && {backgroundColor: '#9CA3AF'}]} 
                    onPress={handleSavePurchaseOrder}
                    disabled={selectedIngredients.length === 0 || isSaving}
                >
                    {isSaving ? <ActivityIndicator color="#fff"/> : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Hoàn thành & Nhập kho</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <SelectIngredientModal 
                visible={isSelectModalVisible}
                onClose={() => setSelectModalVisible(false)}
                onSelect={handleSelectIngredient}
                onAddNew={() => {
                    setSelectModalVisible(false);
                    setTimeout(() => setAddModalVisible(true), 300);
                }}
            />
            <AddIngredientModal 
                visible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSave={handleAddNewIngredient}
            />

        </SafeAreaView>
    );
}

// Gộp các style lại đây cho gọn
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E2E8F0', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1E293B' 
    },
    headerSubtitle: { 
        fontSize: 12, 
        color: '#64748B',
        marginTop: 2,
    },
    itemCountBadge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 40,
        alignItems: 'center',
    },
    itemCountText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    scrollContent: { 
        padding: 16, 
        paddingBottom: 100 
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    itemsSection: {
        marginBottom: 16,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
    },
    
    // Styles cho màn hình tạo phiếu
    selectedItemContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        gap: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    itemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedItemName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B' 
    },
    selectedItemUnit: { 
        fontSize: 13, 
        color: '#64748B',
        marginTop: 4,
    },
    quantityInput: { 
        width: 70, 
        height: 44, 
        borderColor: '#CBD5E1', 
        borderWidth: 1, 
        borderRadius: 8, 
        paddingHorizontal: 10, 
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
    },
    deleteButton: {
        padding: 4,
    },
    addButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        padding: 16, 
        borderWidth: 2, 
        borderColor: '#3B82F6', 
        borderStyle: 'dashed', 
        borderRadius: 12, 
        marginTop: 8,
        backgroundColor: '#EFF6FF',
    },
    addButtonText: { 
        color: '#3B82F6', 
        fontWeight: '600',
        fontSize: 16,
    },
    footer: { 
        padding: 16, 
        borderTopWidth: 1, 
        borderTopColor: '#E2E8F0', 
        backgroundColor: '#fff' 
    },
    saveButtonFooter: { 
        backgroundColor: '#10B981', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },

    // Styles cho Modal chọn nguyên liệu
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E2E8F0' 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#1E293B',
    },
    controlsContainer: { 
        padding: 16, 
        flexDirection: 'row', 
        gap: 10, 
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    searchInput: { 
        flex: 1, 
        backgroundColor: '#F8FAFC', 
        borderRadius: 10, 
        paddingHorizontal: 16, 
        height: 44, 
        fontSize: 16, 
        borderWidth: 1, 
        borderColor: '#E2E8F0',
        color: '#1E293B',
    },
    addNewButton: {
        flexDirection: 'row', 
        gap: 6, 
        alignItems: 'center', 
        backgroundColor: '#10B981', 
        paddingHorizontal: 12, 
        borderRadius: 8, 
        height: 44,
    },
    addNewButtonText: {
        color: '#fff', 
        fontWeight: '600',
        fontSize: 14,
    },
    ingredientSelectItem: { 
        paddingHorizontal: 16, 
        paddingVertical: 14, 
        borderBottomWidth: 1, 
        borderBottomColor: '#F1F5F9', 
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        gap: 12, 
        alignItems: 'center' 
    },
    ingredientSelectName: { 
        fontSize: 16, 
        color: '#334155',
        fontWeight: '500',
    },
    ingredientSelectUnit: { 
        fontSize: 14, 
        color: '#64748B' 
    },

    // Styles cho Modal chung (tạo mới)
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    modalContainer: { 
        width: '100%', 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        padding: 20 
    },
    input: { 
        backgroundColor: '#F8FAFC', 
        borderRadius: 10, 
        padding: 14, 
        fontSize: 16, 
        marginBottom: 12, 
        borderWidth: 1, 
        borderColor: '#E2E8F0',
        color: '#1E293B',
    },
    modalButtons: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 12, 
        marginTop: 16 
    },
    modalButton: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 10, 
        alignItems: 'center', 
        backgroundColor: '#F1F5F9' 
    },
    modalButtonText: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#475569' 
    },
    saveButton: { 
        backgroundColor: '#3B82F6' 
    },
});