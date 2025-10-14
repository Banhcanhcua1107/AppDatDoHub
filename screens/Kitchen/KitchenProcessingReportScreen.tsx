// screens/Kitchen/KitchenProcessingReportScreen.tsx

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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitchenStackParamList } from '../../navigation/AppNavigator'; // Giả định đường dẫn này đúng

type ReportNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;

// Định nghĩa cấu trúc dữ liệu cho một món hàng trong báo cáo
interface ReportItem {
  name: string;
  unit: string;
  sent_quantity: number;
  cancelled_quantity: number;
}

// Component Card để hiển thị thông tin từng món
const ReportItemCard: React.FC<{ item: ReportItem }> = ({ item }) => {
  const actual_processed = item.sent_quantity - item.cancelled_quantity;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemUnit}>ĐVT: {item.unit || 'Cái'}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SL gửi bếp/bar</Text>
          <Text style={styles.statValue}>{item.sent_quantity}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SL hủy món</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{item.cancelled_quantity}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SL thực chế biến</Text>
          <Text style={[styles.statValue, { color: '#10B981', fontWeight: 'bold' }]}>{actual_processed}</Text>
        </View>
      </View>
    </View>
  );
};

// Màn hình chính
const KitchenProcessingReportScreen = () => {
  const navigation = useNavigation<ReportNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportItem[]>([]);

  const fetchReportData = useCallback(async () => {
    try {
      // Lấy tất cả order items để xử lý
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, customizations, status');

      if (error) throw error;

      // Xử lý và tổng hợp dữ liệu
      const itemMap = new Map<string, ReportItem>();

      data.forEach((item: any) => {
        const name = item.customizations?.name || 'Món không xác định';
        const unit = item.customizations?.unit || 'Phần'; // Giả định có trường 'unit' trong customizations
        
        if (!itemMap.has(name)) {
          itemMap.set(name, {
            name: name,
            unit: unit,
            sent_quantity: 0,
            cancelled_quantity: 0,
          });
        }

        const currentItem = itemMap.get(name)!;
        
        // Tất cả món đều được tính là đã gửi cho bếp
        currentItem.sent_quantity += item.quantity;

        // Nếu món có trạng thái 'cancelled' thì cộng vào số lượng hủy
        // *** LƯU Ý: Giả định trạng thái hủy món là 'cancelled'. Bạn có thể thay đổi cho đúng với hệ thống.
        if (item.status === 'cancelled') {
          currentItem.cancelled_quantity += item.quantity;
        }
      });
      
      const aggregatedList = Array.from(itemMap.values());
      // Sắp xếp theo tên món A-Z
      aggregatedList.sort((a, b) => a.name.localeCompare(b.name));

      setReportData(aggregatedList);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu báo cáo: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReportData();
    }, [fetchReportData])
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
        <Text style={styles.headerTitle}>Thống kê chế biến</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={reportData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <ReportItemCard item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không có dữ liệu để thống kê.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  emptyText: { color: '#6B7280', marginTop: 16, fontSize: 18, textAlign: 'center' },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemUnit: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default KitchenProcessingReportScreen;