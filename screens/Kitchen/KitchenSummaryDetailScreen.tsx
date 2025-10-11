// screens/Kitchen/KitchenSummaryDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // Đảm bảo đường dẫn này đúng

type SummaryDetailNavProp = NativeStackNavigationProp<KitchenStackParamList, 'KitchenSummaryDetail'>;
type SummaryDetailRouteProp = RouteProp<KitchenStackParamList, 'KitchenSummaryDetail'>;

const STATUS = {
  PENDING: 'waiting',
  IN_PROGRESS: 'in_progress',
};

interface SummaryDetailItem {
  id: number;
  quantity: number;
  status: 'waiting' | 'in_progress';
  customizations: any;
  table_name: string;
}

// ---- COMPONENT CON: HIỂN THỊ TỪNG ORDER ITEM ----
const DetailItemCard: React.FC<{ item: SummaryDetailItem }> = ({ item }) => {
  const { customizations, status } = item;
  const sizeText = customizations.size?.name || 'Mặc định';
  const sugarText = customizations.sugar?.name || 'Mặc định';
  const toppingsText = (customizations.toppings?.map((t: any) => t.name) || []).join(', ') || 'Không có';
  const noteText = customizations.note;

  const statusInfo = status === STATUS.IN_PROGRESS
    ? { text: 'Đang làm', color: '#F97316', icon: 'flame-outline' }
    : { text: 'Chờ bếp', color: '#6B7280', icon: 'time-outline' };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="receipt-outline" size={20} color="#1F2937" />
        <Text style={styles.tableName}>{item.table_name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.customizationText}>{`Số lượng: ${item.quantity}`}</Text>
        <Text style={styles.customizationText}>{`Size: ${sizeText}, Đường: ${sugarText}`}</Text>
        <Text style={styles.customizationText}>{`Topping: ${toppingsText}`}</Text>
        {noteText && <Text style={styles.noteText}>Ghi chú: {noteText}</Text>}
      </View>
       <View style={styles.cardFooter}>
         <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
      </View>
    </View>
  );
};


// ---- COMPONENT CHÍNH: MÀN HÌNH CHI TIẾT TỔNG HỢP ----
const KitchenSummaryDetailScreen = () => {
  const navigation = useNavigation<SummaryDetailNavProp>();
  const route = useRoute<SummaryDetailRouteProp>();
  const { itemName } = route.params; // Dòng này sẽ hết báo lỗi

  const [loading, setLoading] = useState(true);
  const [detailItems, setDetailItems] = useState<SummaryDetailItem[]>([]);

  const fetchDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id, quantity, status, customizations,
          orders ( order_tables ( tables ( name ) ) )
        `)
        .in('status', [STATUS.PENDING, STATUS.IN_PROGRESS])
        .eq('customizations->>name', itemName)
        .order('created_at', { referencedTable: 'orders', ascending: true });

      if (error) throw error;
      
      const mappedItems = data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        status: item.status,
        customizations: item.customizations,
        table_name: item.orders?.order_tables[0]?.tables?.name || 'Mang về',
      }));

      setDetailItems(mappedItems);

    } catch (err: any)      {
      Alert.alert('Lỗi', 'Không thể tải chi tiết món: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [itemName]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDetails();
      const channel = supabase
        .channel(`public:order_items:summary_detail:${itemName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
          () => fetchDetails()
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchDetails, itemName])
  );
  

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{itemName}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={detailItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DetailItemCard item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={{color: '#6B7280'}}>Không có yêu cầu nào cho món này.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  listContainer: { padding: 16 },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  tableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  cardBody: {
      paddingHorizontal: 16,
      paddingVertical: 12,
  },
  customizationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#D97706',
    fontStyle: 'italic',
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardFooter: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      alignItems: 'flex-start'
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  statusText: { 
      marginLeft: 6, 
      fontWeight: '600', 
      fontSize: 12 
  },
});

export default KitchenSummaryDetailScreen;