// screens/Cashier/ProfitDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getProfitReport } from '../../services/supabaseService';
import PeriodSelector from '../../components/PeriodSelector';

const getDateRangeForPeriod = (period: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    switch (period) {
        case 'today': return { start: today, end: endOfDay };
        case 'yesterday':
            const yStart = new Date(today); yStart.setDate(yStart.getDate() - 1);
            const yEnd = new Date(yStart); yEnd.setHours(23, 59, 59, 999);
            return { start: yStart, end: yEnd };
        case 'this_week':
            const wStart = new Date(today); wStart.setDate(wStart.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
            return { start: wStart, end: endOfDay };
        case 'this_month':
            const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: mStart, end: endOfDay };
        default: return { start: today, end: endOfDay };
    }
};

const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

export default function ProfitDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [profitData, setProfitData] = useState<any>(null);

    const loadData = useCallback(async (period: string) => {
        try {
            setLoading(true);
            const { start, end } = getDateRangeForPeriod(period);
            const data = await getProfitReport(start, end);
            setProfitData(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải báo cáo lợi nhuận: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData('today'); }, [loadData]);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Lợi nhuận</Text>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <PeriodSelector onPeriodChange={(period) => loadData(period)} />
                {loading ? ( <ActivityIndicator style={{marginTop: 32}} size="large" color="#3B82F6" /> ) : 
                 !profitData ? ( <Text style={styles.emptyText}>Không có dữ liệu.</Text> ) : 
                 (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Lợi nhuận ròng</Text>
                            <Text style={[ styles.summaryValue, { color: profitData.netProfit >= 0 ? '#10B981' : '#EF4444' } ]}>
                                {formatCurrency(profitData.netProfit)} ₫
                            </Text>
                            <Text style={styles.summarySubtext}>Tỷ suất: {profitData.profitMargin.toFixed(1)}%</Text>
                        </View>
                        
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng doanh thu</Text>
                                <Text style={[styles.detailValue, { color: '#10B981' }]}>+{formatCurrency(profitData.totalRevenue)} ₫</Text>
                            </View>
                            <View style={styles.divider} />
                            
                            {/* [CẢI TIẾN] Hiển thị chi tiết các khoản chi */}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng chi phí</Text>
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(profitData.totalExpenses)} ₫</Text>
                            </View>
                             <View style={styles.subDetailRow}>
                                <Text style={styles.subDetailLabel}>Giá vốn hàng bán (COGS)</Text>
                                <Text style={styles.subDetailValue}>-{formatCurrency(profitData.totalCogs)} ₫</Text>
                            </View>
                            <View style={styles.subDetailRow}>
                                <Text style={styles.subDetailLabel}>Chi phí hoạt động</Text>
                                <Text style={styles.subDetailValue}>-{formatCurrency(profitData.operatingExpenses)} ₫</Text>
                            </View>
                             <View style={styles.divider} />
                             
                             <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold', color: '#1E293B' }]}>Lợi nhuận ròng</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: profitData.netProfit >= 0 ? '#10B981' : '#EF4444' }]}>
                                    {formatCurrency(profitData.netProfit)} ₫
                                </Text>
                            </View>
                        </View>
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
    emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },
    detailSection: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#475569' },
    detailValue: { fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    subDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, paddingLeft: 16 },
    subDetailLabel: { fontSize: 14, color: '#64748B' },
    subDetailValue: { fontSize: 14, color: '#64748B', fontWeight: '500' },
});