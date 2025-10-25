// screens/Cashier/InventoryDetailScreen.tsx

import React, { useState, useCallback, useMemo } from 'react';
// SỬA THÀNH DÒNG NÀY
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getInventoryStatus } from '../../services/supabaseService';

// [MỚI] Định nghĩa các loại tab
type TabType = 'all' | 'inStock' | 'outOfStock';

// [CẢI TIẾN] Component hiển thị một món, linh hoạt hơn
const InventoryItem = ({ name, status }: { name: string; status: string }) => {
    const isOutOfStock = status === 'Hết hàng';
    const statusColor = isOutOfStock ? '#DC2626' : '#16A34A';
    const statusBgColor = isOutOfStock ? '#FEF2F2' : '#F0FDF4';
    const iconName = isOutOfStock ? 'close-circle-outline' : 'checkmark-circle-outline';

    return (
        <View style={styles.itemRow}>
            <Ionicons name={iconName} size={22} color={statusColor} style={styles.itemIcon} />
            <Text style={styles.itemName}>{name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
        </View>
    );
};

export default function InventoryDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [allItems, setAllItems] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('all'); // State cho tab đang active

    // Tải dữ liệu từ service
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getInventoryStatus();
            setAllItems(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu tồn kho: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    // [CẢI TIẾN] Tính toán các chỉ số thống kê
    const { inStockCount, outOfStockCount } = useMemo(() => {
        const outCount = allItems.filter(item => item.status === 'Hết hàng').length;
        return {
            outOfStockCount: outCount,
            inStockCount: allItems.length - outCount,
        };
    }, [allItems]);

    // [CẢI TIẾN] Lọc danh sách hiển thị dựa trên tab đang active
    const filteredItems = useMemo(() => {
        if (activeTab === 'inStock') {
            return allItems.filter(item => item.status === 'Còn hàng');
        }
        if (activeTab === 'outOfStock') {
            return allItems.filter(item => item.status === 'Hết hàng');
        }
        return allItems; // 'all' tab
    }, [activeTab, allItems]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Tồn kho</Text>
                 <View style={{ width: 28 }} />
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Thẻ thống kê */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}><Text style={styles.statValue}>{allItems.length}</Text><Text style={styles.statLabel}>Tổng món</Text></View>
                    <View style={styles.statCard}><Text style={[styles.statValue, {color: '#10B981'}]}>{inStockCount}</Text><Text style={styles.statLabel}>Còn hàng</Text></View>
                    <View style={styles.statCard}><Text style={[styles.statValue, {color: '#EF4444'}]}>{outOfStockCount}</Text><Text style={styles.statLabel}>Hết hàng</Text></View>
                </View>

                {/* [MỚI] Thanh chọn Tab */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'all' && styles.activeTabButton]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả ({allItems.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'inStock' && styles.activeTabButton]}
                        onPress={() => setActiveTab('inStock')}
                    >
                         <Text style={[styles.tabText, activeTab === 'inStock' && styles.activeTabText]}>Còn hàng ({inStockCount})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'outOfStock' && styles.activeTabButton]}
                        onPress={() => setActiveTab('outOfStock')}
                    >
                         <Text style={[styles.tabText, activeTab === 'outOfStock' && styles.activeTabText]}>Hết hàng ({outOfStockCount})</Text>
                    </TouchableOpacity>
                </View>

                {/* Danh sách món */}
                {loading ? (
                    <ActivityIndicator style={{marginTop: 40}} size="large" color="#3B82F6" />
                ) : (
                    <View style={styles.listContainer}>
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => <InventoryItem key={item.id} name={item.name} status={item.status} />)
                        ) : (
                            <Text style={styles.emptyText}>Không có món nào trong mục này.</Text>
                        )}
                    </View>
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
    
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
    
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 10,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    activeTabText: {
        color: '#3B82F6',
    },
    
    listContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemIcon: {
        marginRight: 12,
    },
    itemName: { 
        fontSize: 15, 
        color: '#334155', 
        flex: 1 
    },
    statusBadge: { 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        borderRadius: 16 
    },
    statusText: { 
        fontSize: 12, 
        fontWeight: '600' 
    },
    emptyText: {
        padding: 24,
        textAlign: 'center',
        color: '#9CA3AF',
        fontStyle: 'italic',
    }
});