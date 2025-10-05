// --- START OF FILE screens/Orders/ReturnedItemsDetailScreen.tsx ---

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { AppStackParamList } from '../../constants/routes';

// Định nghĩa kiểu dữ liệu cho các món trong phiếu trả
interface ReturnedItem {
  name: string;
  quantity: number;
  image_url: string | null;
}

// Định nghĩa kiểu dữ liệu cho một phiếu trả hàng
interface ReturnSlip {
  id: number;
  created_at: string;
  reason: string;
  returned_items: ReturnedItem[];
}

// Kiểu dữ liệu nhận về từ Supabase
type SlipFromDB = {
    id: number;
    created_at: string;
    reason: string;
    return_slip_items: {
        quantity: number;
        order_items: {
            customizations: { name: string, image_url: string | null }
        } | null;
    }[];
}

// Định nghĩa kiểu cho navigation và route
type ReturnedItemsDetailScreenRouteProp = RouteProp<AppStackParamList, 'ReturnedItemsDetail'>;
type ReturnedItemsDetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ReturnedItemsDetail'>;

// Component Card cho từng món hàng đã trả
const ReturnedItemCard: React.FC<{ item: ReturnedItem }> = ({ item }) => {
    const placeholderImage = 'https://via.placeholder.com/150';
    return (
        <View style={styles.itemCard}>
            <Image
                source={{ uri: item.image_url || placeholderImage }}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            </View>
            <Text style={styles.itemQuantity}>SL: {item.quantity}</Text>
        </View>
    );
};


const ReturnedItemsDetailScreen = ({ navigation }: { navigation: ReturnedItemsDetailScreenNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute<ReturnedItemsDetailScreenRouteProp>();
    const { orderId } = route.params;

    const [loading, setLoading] = useState(true);
    const [slips, setSlips] = useState<ReturnSlip[]>([]);

    const fetchReturnedItems = useCallback(async () => {
        setLoading(true);
        try {
            // [SỬA LỖI] Thay đổi câu query để lấy đúng cột JSONB `customizations`
            const { data, error } = await supabase
                .from('return_slips')
                .select(`
                    id, created_at, reason,
                    return_slip_items (
                        quantity,
                        order_items (
                           customizations 
                        )
                    )
                `)
                .eq('order_id', orderId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // [SỬA LỖI] Ép kiểu dữ liệu `data` về `any` rồi mới map để tránh lỗi TS
            const formattedSlips: ReturnSlip[] = (data as any[]).map((slip: SlipFromDB) => ({
                id: slip.id,
                created_at: slip.created_at,
                reason: slip.reason,
                returned_items: slip.return_slip_items.map(item => ({
                    // [SỬA LỖI] Truy cập đúng vào object customizations
                    name: item.order_items?.customizations?.name || 'Món không xác định',
                    quantity: item.quantity,
                    image_url: item.order_items?.customizations?.image_url || null,
                })),
            }));

            setSlips(formattedSlips);
        } catch (err: any) {
            Alert.alert("Lỗi", "Không thể tải danh sách món đã trả: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useFocusEffect(
        useCallback(() => {
            fetchReturnedItems();
        }, [fetchReturnedItems])
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.flex1}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={26} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết món đã trả</Text>
                <TouchableOpacity onPress={fetchReturnedItems} style={styles.refreshButton}>
                    <Icon name="refresh-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={slips}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.slipCard}>
                        <View style={styles.slipHeader}>
                             <Text style={styles.slipTimestamp}>
                                Phiếu trả lúc: {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <View style={styles.slipBody}>
                            {item.returned_items.map((returnedItem, index) => (
                                <ReturnedItemCard key={index} item={returnedItem} />
                            ))}
                        </View>
                        {item.reason && (
                            <View style={styles.reasonContainer}>
                                <Icon name="chatbox-ellipses-outline" size={16} color="#4B5563" />
                                <Text style={styles.reasonText}>Lý do: {item.reason}</Text>
                            </View>
                        )}
                    </View>
                )}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Icon name="document-text-outline" size={60} color="#9CA3AF" />
                        <Text style={styles.emptyText}>Đơn hàng này chưa trả món nào.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    refreshButton: { padding: 5 },
    slipCard: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
    slipHeader: { padding: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' },
    slipTimestamp: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    slipBody: { padding: 8 },
    itemCard: { flexDirection: 'row', alignItems: 'center', padding: 8, },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
    itemQuantity: { fontSize: 16, color: '#111827', fontWeight: 'bold' },
    reasonContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderTopWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    reasonText: { fontSize: 14, color: '#4B5563', marginLeft: 8, fontStyle: 'italic' },
    emptyText: { color: 'gray', marginTop: 16, fontSize: 16 },
});

export default ReturnedItemsDetailScreen;