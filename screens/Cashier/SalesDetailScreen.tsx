// screens/Cashier/SalesDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getTransactions } from '../../services/supabaseService';

const getDateRangeForPeriod = (period: string) => {
    // Tương tự như file ProfitDetailScreen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    switch (period) {
        case 'today':
            return { start: today, end: endOfDay };
        case 'yesterday':
            const yStart = new Date(today);
            yStart.setDate(yStart.getDate() - 1);
            const yEnd = new Date(yStart);
            yEnd.setHours(23, 59, 59, 999);
            return { start: yStart, end: yEnd };
        case 'this_week':
            const wStart = new Date(today);
            wStart.setDate(wStart.getDate() - today.getDay() + 1);
            return { start: wStart, end: endOfDay };
        case 'this_month':
            const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: mStart, end: endOfDay };
        default:
            return { start: today, end: endOfDay };
    }
};

const paymentMethodDetails = {
  cash: { icon: 'cash-outline', color: '#10B981', label: 'Tiền mặt' },
  momo: { icon: 'wallet-outline', color: '#D70F64', label: 'Momo' },
  transfer: { icon: 'card-outline', color: '#3B82F6', label: 'Chuyển khoản' },
};

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
    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Doanh thu</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" /></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)} ₫</Text>
                        <Text style={styles.summarySubtext}>{transactions.length} giao dịch</Text>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Danh sách giao dịch</Text>
                    {transactions.length > 0 ? (
                        transactions.map(item => {
                            const payment = (paymentMethodDetails as any)[item.payment_method];
                            return (
                                <View key={item.id} style={styles.transactionItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${payment.color}20` }]}>
                                        <Ionicons name={payment.icon} size={20} color={payment.color} />
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionTitle}>{item.table_name || 'Đơn mang về'}</Text>
                                        <Text style={styles.transactionSubtitle}>{`${payment.label} • ${item.time}`}</Text>
                                    </View>
                                    <View style={styles.transactionAmountContainer}>
                                        <Text style={styles.transactionAmount}>+{formatCurrency(item.amount)} ₫</Text>
                                        <Text style={styles.transactionItems}>{item.items} món</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>Không có giao dịch trong khoảng thời gian này.</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 14, color: '#64748B' },
    summaryValue: { fontSize: 28, fontWeight: '700', color: '#10B981', marginVertical: 4 },
    summarySubtext: { fontSize: 13, color: '#9CA3AF' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 12 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8 },
    iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
    transactionSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    transactionAmountContainer: { alignItems: 'flex-end' },
    transactionAmount: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    transactionItems: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 },
});