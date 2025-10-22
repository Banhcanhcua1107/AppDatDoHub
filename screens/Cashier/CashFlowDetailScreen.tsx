// screens/Cashier/CashFlowDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getCashFundData } from '../../services/supabaseService';

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

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Quỹ tiền</Text>
                 <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" /></View>
            ) : !data ? (
                <View style={styles.centered}><Text>Không có dữ liệu.</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Tổng quỹ</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(data.totalFund)} ₫</Text>
                    </View>
                    
                    <View style={styles.detailCard}>
                        <Ionicons name="cash-outline" size={24} color="#10B981" />
                        <View style={styles.cardInfo}>
                           <Text style={styles.cardLabel}>Tiền mặt</Text>
                           <Text style={styles.cardValue}>{formatCurrency(data.cashOnHand)} ₫</Text>
                        </View>
                    </View>

                     <View style={styles.detailCard}>
                        <Ionicons name="card-outline" size={24} color="#3B82F6" />
                        <View style={styles.cardInfo}>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 14, color: '#64748B' },
    summaryValue: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginVertical: 4 },
    detailCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
    cardInfo: { flex: 1, marginLeft: 12 },
    cardLabel: { fontSize: 15, color: '#64748B' },
    cardValue: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginTop: 2 }
});