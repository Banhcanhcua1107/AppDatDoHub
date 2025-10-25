// screens/Cashier/SalesDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getTransactions } from '../../services/supabaseService';
import PeriodSelector from '../../components/PeriodSelector';

// [GIỮ NGUYÊN] Hàm lấy khoảng thời gian
const getDateRangeForPeriod = (period: string) => {
    const today = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    switch (period) {
        case 'today':
            today.setHours(0, 0, 0, 0);
            return { start: today, end: endOfDay };
        case 'yesterday':
            const yStart = new Date();
            yStart.setDate(yStart.getDate() - 1);
            yStart.setHours(0, 0, 0, 0);
            const yEnd = new Date(yStart);
            yEnd.setHours(23, 59, 59, 999);
            return { start: yStart, end: yEnd };
        case 'this_week':
            const wStart = new Date();
            wStart.setDate(wStart.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Tuần bắt đầu từ T2
            wStart.setHours(0, 0, 0, 0);
            return { start: wStart, end: endOfDay };
        case 'this_month':
            const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
            mStart.setHours(0, 0, 0, 0);
            return { start: mStart, end: endOfDay };
        default:
            today.setHours(0, 0, 0, 0);
            return { start: today, end: endOfDay };
    }
};

// [GIỮ NGUYÊN] Chi tiết các phương thức thanh toán
const paymentMethodDetails = {
  cash: { icon: 'cash-outline', color: '#10B981', label: 'Tiền mặt' },
  momo: { icon: 'wallet-outline', color: '#D70F64', label: 'Momo' },
  transfer: { icon: 'card-outline', color: '#3B82F6', label: 'Chuyển khoản' },
};

// [GIỮ NGUYÊN] Hàm định dạng tiền tệ
const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

export default function SalesDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);

    const loadData = useCallback(async (period: string) => {
        try {
            setLoading(true);
            const { start, end } = getDateRangeForPeriod(period);
            const data = await getTransactions(start, end);
            setTransactions(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu doanh thu: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData('today');
    }, [loadData]);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Doanh thu</Text>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <PeriodSelector onPeriodChange={(period) => loadData(period)} />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#3B82F6" />
                ) : (
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
                                    // [SỬA LỖI] Thêm một đối tượng mặc định để ứng dụng không bị crash
                                    // khi gặp một payment_method không xác định (null, undefined, hoặc giá trị lạ).
                                    const defaultPayment = { icon: 'help-circle-outline', color: '#9CA3AF', label: 'Không rõ' };
                                    const payment = (paymentMethodDetails as any)[item.payment_method] || defaultPayment;

                                    return (
                                        <View key={item.id} style={styles.transactionItem}>
                                            <View style={[styles.iconContainer, { backgroundColor: `${payment.color}20` }]}>
                                                <Ionicons name={payment.icon} size={22} color={payment.color} />
                                            </View>
                                            <View style={styles.transactionInfo}>
                                                <Text style={styles.transactionTitle}>{item.table_name || 'Đơn mang về'}</Text>
                                                <Text style={styles.transactionSubtitle}>{`${payment.label} • ${item.time}`}</Text>
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
                            <Text style={styles.emptyText}>Không có giao dịch trong khoảng thời gian này.</Text>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontStyle: 'italic' },

    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },

    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
    transactionList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
    transactionItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 14, 
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    transactionSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
    transactionAmountContainer: { alignItems: 'flex-end' },
    transactionAmount: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    transactionItems: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
});