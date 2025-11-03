// screens/Cashier/ExpensesScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    ActivityIndicator, Alert, Platform, Modal, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../services/supabase';
// ✅ SỬA LỖI 1: Import thư viện Toast
import Toast from 'react-native-toast-message'; 

// --- Types and Interfaces ---
interface Expense {
    id: string;
    description: string;
    amount: number;
    expense_date: string;
    payment_method: 'cash' | 'transfer';
    // ✅ NÂNG CẤP: Thêm trường category
    category: string;
}

// --- Constants ---
// ✅ NÂNG CẤP: Danh sách các loại chi phí phổ biến cho thu ngân
const EXPENSE_CATEGORIES = [
    { key: 'nguyen_lieu', label: 'Nguyên liệu', icon: 'leaf-outline' },
    { key: 'luong', label: 'Trả lương', icon: 'people-outline' },
    { key: 'thue_mb', label: 'Thuê mặt bằng', icon: 'business-outline' },
    { key: 'vat_dung', label: 'Vật dụng', icon: 'basket-outline' },
    { key: 'marketing', label: 'Marketing', icon: 'megaphone-outline' },
    { key: 'khac', label: 'Chi phí khác', icon: 'ellipsis-horizontal-outline' },
];


// --- Helper Functions ---
const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

// --- Reusable Components ---
const DateSelector = ({ date, onDateChange }: { date: Date, onDateChange: (newDate: Date) => void }) => {
    // ... Component này không đổi
    const [showPicker, setShowPicker] = useState(false);
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) onDateChange(selectedDate);
    };
    return (
        <View>
            <TouchableOpacity style={styles.dateSelectorButton} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                <Text style={styles.dateSelectorText}>Xem ngày: {formatDate(date)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date} mode="date" display="default"
                    onChange={handleDateChange} maximumDate={new Date()}
                />
            )}
        </View>
    );
};

// ✅ NÂNG CẤP: Modal thêm lựa chọn Category
const AddExpenseModal = ({ visible, onClose, onSave }: { visible: boolean, onClose: () => void, onSave: (expense: Omit<Expense, 'id'>) => void }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].label); // Mặc định là 'Nguyên liệu'
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const numericAmount = parseFloat(amount);
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Thông tin không hợp lệ', 'Vui lòng nhập đầy đủ mô tả và số tiền hợp lệ.');
            return;
        }

        setIsSaving(true);
        await onSave({
            description: description.trim(),
            amount: numericAmount,
            payment_method: paymentMethod,
            expense_date: new Date().toISOString().split('T')[0],
            category: category,
        });
        setIsSaving(false);
        // Reset form
        setDescription('');
        setAmount('');
        setPaymentMethod('cash');
        setCategory(EXPENSE_CATEGORIES[0].label);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Thêm khoản chi</Text>
                    
                    <Text style={styles.label}>Loại chi phí</Text>
                    <View style={styles.categoryContainer}>
                        {EXPENSE_CATEGORIES.map(cat => (
                            <TouchableOpacity 
                                key={cat.key}
                                style={[styles.categoryButton, category === cat.label && styles.categorySelected]}
                                onPress={() => setCategory(cat.label)}>
                                <Ionicons name={cat.icon as any} size={18} color={category === cat.label ? '#3B82F6' : '#64748B'} />
                                <Text style={[styles.categoryText, category === cat.label && styles.categoryTextSelected]}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Mô tả chi tiết</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: Mua 2kg cà phê"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text style={styles.label}>Số tiền</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số tiền"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu</Text>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// --- Main Screen Component ---
export default function ExpensesScreen() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setModalVisible] = useState(false);

    const loadExpenses = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            const dateString = date.toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('expense_date', dateString)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải danh sách chi phí: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExpenses(selectedDate);
    }, [selectedDate, loadExpenses]);

    const handleSaveExpense = async (expense: Omit<Expense, 'id'>) => {
        try {
            const { error } = await supabase.from('expenses').insert([expense]);
            if (error) throw error;

            // ✅ SỬA LỖI 2: Đặt Toast.show() vào đúng chỗ và nó sẽ hoạt động
            Toast.show({
                type: 'success',
                text1: 'Thêm thành công',
                text2: 'Khoản chi đã được ghi nhận.'
            });
            
            setModalVisible(false);

            // ✅ SỬA LỖI 3: Logic làm mới dữ liệu sẽ được thực thi
            const todayString = new Date().toISOString().split('T')[0];
            const selectedDateString = selectedDate.toISOString().split('T')[0];
            
            if (selectedDateString === todayString) {
                await loadExpenses(selectedDate); // Tải lại nếu đang xem ngày hôm nay
            } else {
                setSelectedDate(new Date()); // Chuyển về ngày hôm nay để xem chi phí mới
            }
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể lưu khoản chi: ' + error.message);
        }
    };
    
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý Chi phí</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#EF4444" /> : (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Tổng chi trong ngày</Text>
                            <Text style={styles.summaryValue}>-{formatCurrency(totalExpenses)} ₫</Text>
                            <Text style={styles.summarySubtext}>{expenses.length} khoản chi</Text>
                        </View>
                        
                        {expenses.length > 0 ? (
                            <View style={styles.expenseList}>
                                {expenses.map(item => (
                                    <View key={item.id} style={styles.expenseItem}>
                                        <View style={styles.expenseIcon}>
                                            <Ionicons name="document-text-outline" size={24} color={'#475569'} />
                                        </View>
                                        <View style={styles.expenseInfo}>
                                            <Text style={styles.expenseDescription}>{item.description}</Text>
                                            {/* ✅ NÂNG CẤP: Hiển thị category */}
                                            <Text style={styles.expenseMethod}>{item.category || 'Chưa phân loại'}</Text>
                                        </View>
                                        <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>Chưa có khoản chi nào trong ngày này.</Text>
                        )}
                    </>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <AddExpenseModal 
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveExpense}
            />
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    dateSelectorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    dateSelectorText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FEE2E2' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#EF4444', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },
    expenseList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
    expenseItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    expenseIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#F1F5F9' },
    expenseInfo: { flex: 1 },
    expenseDescription: { fontSize: 16, fontWeight: '600', color: '#334155' },
    expenseMethod: { fontSize: 13, color: '#9CA3AF', marginTop: 3, fontStyle: 'italic' },
    expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontStyle: 'italic' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 15, color: '#475569', fontWeight: '500', marginBottom: 8, marginTop: 4 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
    modalButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, backgroundColor: '#F1F5F9' },
    modalButtonText: { fontSize: 16, fontWeight: '600', color: '#475569' },
    saveButton: { backgroundColor: '#3B82F6' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    // Category Styles
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16, justifyContent: 'center' },
    categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent', gap: 6 },
    categorySelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    categoryText: { fontSize: 14, color: '#475569' },
    categoryTextSelected: { color: '#3B82F6', fontWeight: '600' },
});