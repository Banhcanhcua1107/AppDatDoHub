// --- START OF FILE screens/Orders/ReturnItemsScreen.tsx ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';

interface ReturnedItem {
  name: string;
  quantity: number;
}

interface ReturnSlip {
  id: number;
  created_at: string;
  reason: string;
  order_id: string;
  returned_items: ReturnedItem[];
  table_names: string;
}

// [SỬA LỖI] Cập nhật lại cấu trúc kiểu dữ liệu cho đúng với query mới
type SlipFromDB = {
    id: number;
    created_at: string;
    reason: string;
    order_id: string;
    return_slip_items: {
        quantity: number;
        // Mối quan hệ đúng là tới 'order_items', không phải 'item_details'
        order_items: { 
            customizations: { 
                name: string 
            } 
        } | null;
    }[];
    orders: {
        order_tables: {
            tables: { name: string };
        }[];
    }[] | null; 
}


const ReturnSlipCard: React.FC<{ item: ReturnSlip }> = ({ item }) => {
    const time = new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(item.created_at).toLocaleDateString('vi-VN');

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Phiếu trả cho bàn {item.table_names}</Text>
                <Text style={styles.cardTimestamp}>{time} - {date}</Text>
            </View>
            <View style={styles.cardBody}>
                {item.returned_items.map((returnedItem, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{returnedItem.quantity}x {returnedItem.name}</Text>
                    </View>
                ))}
            </View>
            {item.reason && (
                <View style={styles.reasonContainer}>
                    <Icon name="chatbox-ellipses-outline" size={16} color="#4B5563" />
                    <Text style={styles.reasonText}>Lý do: {item.reason}</Text>
                </View>
            )}
        </View>
    );
}

const ReturnItemsScreen = () => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [slips, setSlips] = useState<ReturnSlip[]>([]);

    const fetchReturnSlips = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('return_slips')
                .select(`
                    id, created_at, reason, order_id,
                    return_slip_items (
                        *,
                        order_items ( customizations ) 
                    ),
                    orders ( order_tables ( tables ( name ) ) )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const formattedSlips: ReturnSlip[] = ((data as unknown) as SlipFromDB[]).map(slip => {
                const items = slip.return_slip_items.map(item => ({
                    // [SỬA LỖI] Lấy tên món từ đúng đường dẫn dữ liệu mới
                    name: item.order_items?.customizations?.name || 'Món không xác định',
                    quantity: item.quantity,
                }));

                const tables = slip.orders?.[0]?.order_tables.map(ot => ot.tables.name).join(', ') || 'Không rõ';

                return {
                    id: slip.id,
                    created_at: slip.created_at,
                    reason: slip.reason,
                    order_id: slip.order_id,
                    returned_items: items,
                    table_names: tables
                };
            });

            setSlips(formattedSlips);
        } catch (err: any) {
            Alert.alert("Lỗi", "Không thể tải lịch sử trả món: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReturnSlips();
        }, [fetchReturnSlips])
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-3 flex-row justify-between items-center">
                <Text className="text-3xl font-bold text-gray-800">Lịch sử trả món</Text>
                <TouchableOpacity onPress={fetchReturnSlips}>
                    <Icon name="refresh-outline" size={26} color="#333" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={slips}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <ReturnSlipCard item={item} />}
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
    card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
    cardHeader: { backgroundColor: '#F3F4F6', padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    cardTimestamp: { fontSize: 12, color: 'gray', marginTop: 2 },
    cardBody: { padding: 16 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    itemName: { fontSize: 15, color: '#374151' },
    reasonContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderTopWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    reasonText: { fontSize: 14, color: '#4B5563', marginLeft: 8, fontStyle: 'italic' },
});

export default ReturnItemsScreen;