// screens/Cashier/InventoryDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getInventoryStatus } from '../../services/supabaseService';

export default function InventoryDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getInventoryStatus();
            setItems(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu tồn kho: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const outOfStockCount = items.filter(item => item.status === 'out').length;
    const inStockCount = items.length - outOfStockCount;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Tồn kho</Text>
                 <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" /></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}><Text style={styles.statValue}>{items.length}</Text><Text style={styles.statLabel}>Tổng món</Text></View>
                        <View style={styles.statCard}><Text style={[styles.statValue, {color: '#10B981'}]}>{inStockCount}</Text><Text style={styles.statLabel}>Còn hàng</Text></View>
                        <View style={styles.statCard}><Text style={[styles.statValue, {color: '#EF4444'}]}>{outOfStockCount}</Text><Text style={styles.statLabel}>Hết hàng</Text></View>
                    </View>
                    
                    <View style={styles.listContainer}>
                        {items.map(item => {
                            const isOutOfStock = item.status === 'out';
                            return (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <View style={[styles.statusBadge, {backgroundColor: isOutOfStock ? '#FEF2F2' : '#F0FDF4'}]}>
                                        <Text style={[styles.statusText, {color: isOutOfStock ? '#DC2626' : '#16A34A'}]}>
                                            {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
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
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    statValue: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
    listContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    itemName: { fontSize: 15, color: '#334155' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '500' },
});