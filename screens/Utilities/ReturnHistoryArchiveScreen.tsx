// screens/Utilities/ReturnHistoryArchiveScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SectionList,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTES } from '../../constants/routes';
import { useState, useCallback } from 'react';

// Kiểu dữ liệu cho một phiếu trả
interface ReturnSlipSummary {
  order_id: string;
  table_names: string;
  return_time: string;
  total_returned_items: number;
}

// Kiểu dữ liệu cho một Section trong SectionList
interface HistorySection {
  title: string; // Ví dụ: "Thứ Sáu, 24/10/2025"
  data: ReturnSlipSummary[];
}

type NavigationProps = NativeStackNavigationProp<AppStackParamList>;

// Component Card để hiển thị thông tin từng phiếu trả
const ReturnSlipCard: React.FC<{ item: ReturnSlipSummary }> = ({ item }) => {
  const navigation = useNavigation<NavigationProps>();
  const time = new Date(item.return_time).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(ROUTES.RETURNED_ITEMS_DETAIL, { orderId: item.order_id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.table_names}</Text>
        <View style={styles.badge}>
          <Icon name="arrow-undo-outline" size={14} color="#D97706" />
          <Text style={styles.badgeText}>{item.total_returned_items} món</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Icon name="time-outline" size={14} color="#6B7280" />
        <Text style={styles.cardTimestamp}>Lúc: {time}</Text>
        <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
      </View>
    </TouchableOpacity>
  );
};

const ReturnHistoryArchiveScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const [loading, setLoading] = useState(true);
  const [historySections, setHistorySections] = useState<HistorySection[]>([]);

  const fetchFullHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select(
          `
            order_id,
            created_at,
            orders ( order_tables ( tables ( name ) ) ),
            return_slip_items ( quantity )
          `
        )
        .eq('status', 'approved') // Chỉ lấy phiếu đã duyệt
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Nhóm các phiếu trả theo ngày
      const groupedByDate = (data as any[]).reduce((acc, slip) => {
        const date = new Date(slip.created_at).toLocaleDateString('vi-VN', {
          weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
        });

        if (!acc[date]) {
          acc[date] = [];
        }

        const tableNames =
          slip.orders?.order_tables
            .map((ot: { tables: { name: string } }) => ot.tables.name)
            .join(', ') || 'Không rõ';

        const totalItems = slip.return_slip_items.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );

        acc[date].push({
          order_id: slip.order_id,
          table_names: tableNames,
          return_time: slip.created_at,
          total_returned_items: totalItems,
        });

        return acc;
      }, {} as Record<string, ReturnSlipSummary[]>);

      // Chuyển đổi object đã nhóm thành mảng cho SectionList
      const sections: HistorySection[] = Object.keys(groupedByDate).map(date => ({
        title: date,
        data: groupedByDate[date],
      }));

      setHistorySections(sections);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải lịch sử: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFullHistory();
    }, [fetchFullHistory])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử trả món</Text>
        <TouchableOpacity onPress={fetchFullHistory} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={historySections}
        keyExtractor={(item, index) => item.order_id + index}
        renderItem={({ item }) => <ReturnSlipCard item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContent}
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  backButton: { padding: 4 },
  refreshButton: { padding: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    backgroundColor: '#F8F9FA',
    paddingTop: 20,
    paddingBottom: 8,
  },
  emptyText: { color: 'gray', marginTop: 16, fontSize: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  badgeText: { marginLeft: 4, color: '#92400E', fontWeight: '600', fontSize: 13 },
  cardFooter: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTimestamp: { fontSize: 13, color: '#4B5563', marginLeft: 6 },
});

export default ReturnHistoryArchiveScreen;