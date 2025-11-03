// screens/Cashier/PurchaseOrderDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../services/supabase';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Giao diện cho một món trong phiếu nhập
interface PurchaseOrderItem {
    quantity: number;
    ingredients: {
        name: string;
        unit: string;
    };
}

// Giao diện cho toàn bộ phiếu nhập chi tiết
interface PurchaseOrderDetails {
    id: string;
    created_at: string;
    purchase_order_items: PurchaseOrderItem[];
}

export default function PurchaseOrderDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderId } = route.params as { orderId: string };

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<PurchaseOrderDetails | null>(null);

    const loadOrderDetails = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    id,
                    created_at,
                    purchase_order_items (
                        quantity,
                        ingredients ( name, unit )
                    )
                `)
                .eq('id', orderId)
                .single(); // Lấy duy nhất 1 bản ghi

            if (error) throw error;
            setOrder(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu nhập: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useFocusEffect(
        useCallback(() => {
            loadOrderDetails();
        }, [loadOrderDetails])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#334155" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết Phiếu nhập</Text>
                    <View style={{width: 24}} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyText}>Không tìm thấy phiếu nhập.</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    const totalItems = order.purchase_order_items.length;
    const createdAtDate = new Date(order.created_at);
    const formattedDate = format(createdAtDate, "HH:mm 'ngày' dd/MM/yyyy");
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết Phiếu nhập</Text>
                <View style={{width: 24}} />
            </View>

            <FlatList
                data={order.purchase_order_items}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <View style={styles.idContainer}>
                                    <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                                    <View>
                                        <Text style={styles.summaryLabel}>Mã phiếu</Text>
                                        <Text style={styles.summaryID}>#{order.id.substring(0, 8)}</Text>
                                    </View>
                                </View>
                                <View style={styles.badgeContainer}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>Đã hoàn thành</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                                <Text style={styles.infoText}>{formattedDate}</Text>
                            </View>
                            
                            <View style={styles.statsContainer}>
                                <View style={styles.statBox}>
                                    <Ionicons name="cube-outline" size={20} color="#10B981" />
                                    <Text style={styles.statLabel}>Tổng loại</Text>
                                    <Text style={styles.statValue}>{totalItems}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.listHeader}>Danh sách Nguyên liệu</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <View style={styles.detailItemContainer}>
                        <View style={styles.itemNumberContainer}>
                            <Text style={styles.itemNumber}>{index + 1}</Text>
                        </View>
                        <View style={styles.itemDetailsContainer}>
                            <Text style={styles.itemName}>{item.ingredients.name}</Text>
                            <Text style={styles.itemUnit}>{item.ingredients.unit}</Text>
                        </View>
                        <View style={styles.quantityBox}>
                            <Text style={styles.quantityLabel}>Số lượng</Text>
                            <Text style={styles.quantityValue}>{item.quantity}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Không có nguyên liệu</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8FAFC' 
    },
    header: { 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E2E8F0', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1E293B' 
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: { 
        textAlign: 'center', 
        color: '#9CA3AF', 
        marginTop: 40, 
        fontSize: 16 
    },
    summaryContainer: { 
        padding: 16, 
        backgroundColor: '#fff', 
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    summaryTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#1E293B', 
        marginBottom: 4 
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    summaryID: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 2,
    },
    summaryDate: { 
        fontSize: 14, 
        color: '#64748B' 
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    badgeText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    listHeader: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#334155', 
        marginBottom: 12, 
        paddingHorizontal: 4 
    },
    detailItemContainer: { 
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        gap: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    itemNumberContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    itemDetailsContainer: {
        flex: 1,
    },
    itemName: { 
        fontSize: 16, 
        color: '#334155', 
        fontWeight: '600',
        marginBottom: 4,
    },
    itemUnit: {
        fontSize: 13,
        color: '#64748B',
    },
    quantityBox: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    quantityValue: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B',
        marginTop: 2,
    },
});