// --- START OF FILE screens/Orders/ReturnItemsScreen.tsx (ĐÃ SỬA LỖI) ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';

// Kiểu dữ liệu cho một Order có món đã trả
interface ReturnedOrderSummary {
  order_id: string;
  table_names: string;
  last_return_time: string;
  total_returned_items: number;
}

type NavigationProps = NativeStackNavigationProp<AppStackParamList>;

// Component Card mới, giao diện giống màn hình Order
const ReturnedOrderCard: React.FC<{ item: ReturnedOrderSummary }> = ({ item }) => {
    const navigation = useNavigation<NavigationProps>();
    const time = new Date(item.last_return_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(item.last_return_time).toLocaleDateString('vi-VN');

    return (
        <TouchableOpacity 
            style={styles.card}
            // [SỬA LỖI 1] Sử dụng hằng số ROUTES đã thêm
            onPress={() => navigation.navigate(ROUTES.RETURNED_ITEMS_DETAIL, { orderId: item.order_id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bàn {item.table_names}</Text>
                <View style={styles.badge}>
                    <Icon name="arrow-undo-outline" size={14} color="#D97706" />
                    <Text style={styles.badgeText}>{item.total_returned_items} món</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Icon name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.cardTimestamp}>Lần trả cuối: {time} - {date}</Text>
                <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
            </View>
        </TouchableOpacity>
    );
}

const ReturnItemsScreen = () => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [returnedOrders, setReturnedOrders] = useState<ReturnedOrderSummary[]>([]);

    const fetchReturnHistory = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('return_slips')
                .select(`
                    order_id,
                    created_at,
                    orders ( order_tables ( tables ( name ) ) ),
                    return_slip_items ( quantity )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // [SỬA LỖI 2] Cung cấp kiểu dữ liệu rõ ràng cho TypeScript
            const groupedByOrder = (data as any[]).reduce((acc, slip) => {
                const orderId = slip.order_id;
                if (!acc[orderId]) {
                    const tableNames = slip.orders?.order_tables
                        .map((ot: { tables: { name: string } }) => ot.tables.name) // Thêm type cho 'ot'
                        .join(', ') || 'Không rõ';

                    acc[orderId] = {
                        order_id: orderId,
                        table_names: tableNames,
                        last_return_time: slip.created_at,
                        total_returned_items: 0,
                    };
                }
                const slipTotal = slip.return_slip_items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
                acc[orderId].total_returned_items += slipTotal;
                
                return acc;
            }, {} as Record<string, ReturnedOrderSummary>);

            const formattedList: ReturnedOrderSummary[] = Object.values(groupedByOrder);
            setReturnedOrders(formattedList);

        } catch (err: any) {
            Alert.alert("Lỗi", "Không thể tải lịch sử trả món: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReturnHistory();
        }, [fetchReturnHistory])
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3 flex-row justify-between items-center">
                <Text className="text-3xl font-bold text-gray-800">Lịch sử trả món</Text>
                <TouchableOpacity onPress={fetchReturnHistory}>
                    <Icon name="refresh-outline" size={26} color="#333" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={returnedOrders}
                keyExtractor={item => item.order_id}
                renderItem={({ item }) => <ReturnedOrderCard item={item} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Icon name="document-text-outline" size={60} color="#9CA3AF" />
                        <Text style={styles.emptyText}>Chưa có phiếu trả món nào.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: 'gray', marginTop: 16, fontSize: 16 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 16, 
        marginBottom: 16, 
        elevation: 4, 
        shadowColor: '#475569',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: { 
        padding: 16, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#F3F4F6'
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        marginLeft: 4,
        color: '#92400E',
        fontWeight: '600',
        fontSize: 13
    },
    cardFooter: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    cardTimestamp: { fontSize: 13, color: '#4B5563', marginLeft: 6 },
});

export default ReturnItemsScreen;