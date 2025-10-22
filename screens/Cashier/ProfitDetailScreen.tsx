// screens/Cashier/ProfitDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getProfitReport } from '../../services/supabaseService';

const getDateRangeForPeriod = (period: string) => {
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

export default function ProfitDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [selectedPeriod] = useState('today'); // Logic chọn period có thể thêm sau
    const [profitData, setProfitData] = useState<any>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const { start, end } = getDateRangeForPeriod(selectedPeriod);
            const data = await getProfitReport(start, end);
            setProfitData(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải báo cáo lợi nhuận: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Lợi nhuận</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" /></View>
            ) : !profitData ? (
                 <View style={styles.centered}><Text>Không có dữ liệu.</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Lợi nhuận ròng</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(profitData.netProfit)} ₫</Text>
                        <Text style={styles.summarySubtext}>Tỷ suất: {profitData.profitMargin.toFixed(1)}%</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tổng doanh thu</Text>
                            <Text style={styles.detailValue}>+{formatCurrency(profitData.totalRevenue)} ₫</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tổng chi phí</Text>
                            <Text style={[styles.detailValue, {color: '#EF4444'}]}>-{formatCurrency(profitData.totalExpenses)} ₫</Text>
                        </View>
                         <View style={styles.divider} />
                         <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, {fontWeight: '600'}]}>Lợi nhuận ròng</Text>
                            <Text style={[styles.detailValue, {fontWeight: '600', color: '#10B981'}]}>{formatCurrency(profitData.netProfit)} ₫</Text>
                        </View>
                    </View>
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
    detailSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, alignItems: 'center' },
    detailLabel: { fontSize: 15, color: '#334155' },
    detailValue: { fontSize: 15, fontWeight: '500', color: '#334155' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
});