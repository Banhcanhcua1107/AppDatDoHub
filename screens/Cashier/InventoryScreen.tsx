// screens/Cashier/InventoryScreen.tsx

import React, { useState, useCallback } from 'react';
import { 
    SafeAreaView, 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

// Giao diện cho một phiếu nhập trong danh sách
interface PurchaseOrder {
    id: string;
    status: string;
    created_at: string;
    purchase_order_items: {
        quantity: number;
        ingredients: {
            name: string;
            unit: string;
        }
    }[];
}

/**
 * Component hiển thị một dòng phiếu nhập trong FlatList.
 * Bọc trong TouchableOpacity để có thể bấm vào xem chi tiết.
 */
const PurchaseOrderItem = ({ item, onPress }: { item: PurchaseOrder, onPress: () => void }) => {
    const totalItems = item.purchase_order_items.length;
    const createdAt = new Date(item.created_at);

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            {/* Số thứ tự và icon */}
            <View style={styles.orderNumberContainer}>
                <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            </View>

            {/* Thông tin chính của phiếu */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                    Phiếu nhập #{item.id.substring(0, 6)}
                </Text>
                <View style={styles.detailsRow}>
                    <Ionicons name="calendar-outline" size={12} color="#64748B" />
                    <Text style={styles.itemDetail}>
                        {format(createdAt, "HH:mm 'ngày' dd/MM")}
                    </Text>
                    <Text style={styles.itemDetail}>•</Text>
                    <Ionicons name="cube-outline" size={12} color="#64748B" />
                    <Text style={styles.itemDetail}>
                        {totalItems} loại
                    </Text>
                </View>
            </View>

            {/* Icon điều hướng */}
            <View style={styles.itemActions}>
                <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
            </View>
        </TouchableOpacity>
    );
};


/**
 * Màn hình chính hiển thị danh sách các phiếu nhập kho.
 */
export default function InventoryScreen() {
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const navigation = useNavigation();

    // Hàm tải danh sách các phiếu nhập từ Supabase
    const loadPurchaseOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    id,
                    status,
                    created_at,
                    purchase_order_items (
                        quantity,
                        ingredients ( name, unit )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchaseOrders(data || []);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải danh sách phiếu nhập: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Tự động tải lại dữ liệu mỗi khi quay lại màn hình này
    useFocusEffect(
        useCallback(() => {
            loadPurchaseOrders();
        }, [loadPurchaseOrders])
    );

    const totalOrders = purchaseOrders.length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header của màn hình */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Lịch sử Nhập kho</Text>
                    <Text style={styles.headerSubtitle}>{totalOrders} phiếu</Text>
                </View>
            </View>

            {/* Statistics Cards */}
            {totalOrders > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                            <Ionicons name="document-outline" size={20} color="#3B82F6" />
                        </View>
                        <Text style={styles.statValue}>{totalOrders}</Text>
                        <Text style={styles.statLabel}>Tổng phiếu</Text>
                    </View>
                </View>
            )}

            {/* Hiển thị vòng xoay loading hoặc danh sách */}
            {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3B82F6" /> : (
                <FlatList
                    data={purchaseOrders}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <PurchaseOrderItem 
                            item={item} 
                            onPress={() => navigation.navigate('PurchaseOrderDetail', { orderId: item.id })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="inbox-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyStateTitle}>Chưa có phiếu nhập</Text>
                            <Text style={styles.emptyStateText}>Hãy tạo phiếu nhập kho mới</Text>
                        </View>
                    }
                />
            )}

            {/* Nút nổi để tạo phiếu nhập mới */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePurchaseOrder')}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Toàn bộ style cho màn hình
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8FAFC' 
    },
    header: { 
        paddingHorizontal: 16, 
        paddingVertical: 16, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#1E293B',
    },
    headerSubtitle: { 
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 16,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 16, 
        paddingBottom: 100,
        paddingTop: 12,
    },
    fab: { 
        position: 'absolute', 
        right: 20, 
        bottom: 20, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: '#10B981', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    itemContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 14, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: '#E2E8F0',
        alignItems: 'center',
        gap: 12,
    },
    orderNumberContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfo: { 
        flex: 1, 
        justifyContent: 'center' 
    },
    itemName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B', 
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemDetail: {
        fontSize: 13,
        color: '#64748B',
    },
    itemActions: { 
        alignItems: 'center', 
        justifyContent: 'flex-end',
    },
});