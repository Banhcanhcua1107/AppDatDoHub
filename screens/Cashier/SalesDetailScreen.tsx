// screens/Cashier/SalesDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getTransactions } from '../../services/supabaseService';
import DateTimePicker from '@react-native-community/datetimepicker';

// ✅ SỬA LỖI: Thêm kiểm tra an toàn để tránh crash nếu `date` không hợp lệ
const formatDate = (date: Date) => {
    // Nếu không có ngày, trả về một chuỗi mặc định thay vì gây lỗi
    if (!date) return 'Chọn ngày...'; 
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric'});
};

const getDateRangeForDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const DateSelector = ({ date, onDateChange }: { date: Date, onDateChange: (newDate: Date) => void }) => {
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
                    value={date || new Date()} // Đảm bảo value luôn hợp lệ
                    mode="date" display="default"
                    onChange={handleDateChange} maximumDate={new Date()}
                />
            )}
        </View>
    );
};

const paymentMethodDetails = {
  cash: { icon: 'cash-outline', color: '#10B981', label: 'Tiền mặt' },
  momo: { icon: 'wallet-outline', color: '#D70F64', label: 'Momo' },
  transfer: { icon: 'card-outline', color: '#3B82F6', label: 'Chuyển khoản' },
};

const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

export default function SalesDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    
    // ✅ SỬA LỖI: Đảm bảo state luôn được khởi tạo với một Date object hợp lệ
    const [selectedDate, setSelectedDate] = useState(new Date());

    const loadData = useCallback(async (date: Date) => {
        if (!date) return; // Không tải dữ liệu nếu ngày không tồn tại
        try {
            setLoading(true);
            const { start, end } = getDateRangeForDay(date);
            const data = await getTransactions(start, end);
            setTransactions(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu doanh thu: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(selectedDate);
    }, [selectedDate, loadData]);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Doanh thu</Text>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? ( <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#3B82F6" /> ) : 
                (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)} ₫</Text>
                            <Text style={styles.summarySubtext}>{transactions.length} giao dịch thành công</Text>
                        </View>
                        
                        <Text style={styles.sectionTitle}>Danh sách giao dịch</Text>
                        {transactions.length > 0 ? (
                            <View style={styles.transactionList}>
                                {transactions.map(item => {
                                    const payment = (paymentMethodDetails as any)[item.payment_method] || paymentMethodDetails.cash;
                                    return (
                                        <View key={item.id} style={styles.transactionItem}>
                                            <View style={[styles.iconContainer, { backgroundColor: `${payment.color}20` }]}>
                                                <Ionicons name={payment.icon as any} size={22} color={payment.color} />
                                            </View>
                                            <View style={styles.transactionInfo}>
                                                <Text style={styles.transactionTitle}>{item.table_name || 'Mang về'}</Text>
                                                <Text style={styles.transactionSubtitle}>{`${payment.label} • ${item.transaction_time}`}</Text>
                                            </View>
                                            <View style={styles.transactionAmountContainer}>
                                                <Text style={styles.transactionAmount}>+{formatCurrency(item.amount)}</Text>
                                                <Text style={styles.transactionItems}>{item.items} món</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>Không có giao dịch trong ngày này.</Text>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles không thay đổi
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    dateSelectorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    dateSelectorText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontStyle: 'italic' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
    transactionList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
    transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',},
    iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    transactionSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
    transactionAmountContainer: { alignItems: 'flex-end' },
    transactionAmount: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    transactionItems: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
});