// screens/Cashier/CashFlowDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getCashFundData } from '../../services/supabaseService';

const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');

export default function CashFlowDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
            const result = await getCashFundData(startOfDay, endOfDay);
            setData(result);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu quỹ tiền: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#3B82F6" /></View>;
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Quỹ tiền</Text>
                 <View style={{ width: 28 }} />
            </View>

            {!data ? (
                <View style={styles.centered}><Text style={styles.emptyText}>Không có dữ liệu.</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* [CẢI TIẾN] Thẻ tổng quan */}
                    <View style={styles.heroCard}>
                        <Text style={styles.heroLabel}>Tổng quỹ cuối ngày (dự kiến)</Text>
                        <Text style={styles.heroValue}>{formatCurrency(data.totalFund)} ₫</Text>
                    </View>
                    
                    {/* [CẢI TIẾN] Các thẻ chi tiết */}
                    <View style={styles.detailGrid}>
                        <View style={styles.detailCard}>
                            <Ionicons name="cash-outline" size={28} color="#10B981" />
                            <Text style={styles.cardLabel}>Tiền mặt</Text>
                            <Text style={styles.cardValue}>{formatCurrency(data.cashOnHand)} ₫</Text>
                        </View>
                         <View style={styles.detailCard}>
                            <Ionicons name="card-outline" size={28} color="#3B82F6" />
                            <Text style={styles.cardLabel}>Tiền gửi (App/CK)</Text>
                            <Text style={styles.cardValue}>{formatCurrency(data.bankDeposit)} ₫</Text>
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
    emptyText: { color: '#64748B' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    
    heroCard: { 
        backgroundColor: '#3B82F6', 
        borderRadius: 16, 
        padding: 24, 
        alignItems: 'center', 
        marginBottom: 24,
    },
    heroLabel: { fontSize: 15, color: '#E0E7FF' },
    heroValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginVertical: 8 },

    detailGrid: { gap: 16 },
    detailCard: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 20, 
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
        elevation: 3,
    },
    cardLabel: { fontSize: 16, color: '#475569', marginTop: 8 },
    cardValue: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 4 }
});