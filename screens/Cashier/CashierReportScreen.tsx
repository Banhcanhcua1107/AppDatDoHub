// screens/Cashier/CashierReportScreen.tsx

import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CashierStackParamList } from '../../navigation/AppNavigator';

type ReportNavigationProp = NativeStackNavigationProp<CashierStackParamList>;

const ReportItem = ({ icon, title, description, onPress, color }: any) => (
  <TouchableOpacity style={styles.reportItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function CashierReportScreen() {
  const navigation = useNavigation<ReportNavigationProp>();
  const handleExport = () => { Alert.alert("Chức năng đang phát triển", "Chức năng xuất báo cáo sẽ sớm được cập nhật."); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo & Phân tích</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={22} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Xuất file</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* [BÁO CÁO MỚI] Đưa lên đầu tiên vì quan trọng nhất */}
        <ReportItem
          icon="analytics-outline"
          title="Tổng kết Tài chính"
          description="Xem số dư cuối kỳ dựa trên tổng thu và tổng chi"
          color="#2563EB"
          onPress={() => navigation.navigate('FinancialSummary')} 
        />
        <ReportItem
          icon="trending-up-outline"
          title="Báo cáo Lợi nhuận"
          description="Phân tích Lãi/Lỗ trong kỳ đã chọn"
          color="#F59E0B"
          onPress={() => navigation.navigate('ProfitDetail')}
        />
        <ReportItem
          icon="receipt-outline"
          title="Báo cáo Doanh thu"
          description="Xem chi tiết các giao dịch thành công"
          color="#10B981"
          onPress={() => navigation.navigate('SalesDetail')}
        />
        {/* <ReportItem
          icon="wallet-outline"
          title="Báo cáo Quỹ tiền"
          description="Đối soát dòng tiền mặt thu và chi trong kỳ"
          color="#8B5CF6"
          onPress={() => navigation.navigate('CashFlowDetail')}
        /> */}
        <ReportItem
          icon="cube-outline"
          title="Báo cáo Tồn kho"
          description="Kiểm tra trạng thái còn/hết hàng của các món"
          color="#3B82F6"
          onPress={() => navigation.navigate('InventoryDetail')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
// Styles giữ nguyên như trước...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, },
  exportButtonText: { marginLeft: 6, color: '#3B82F6', fontWeight: '600', fontSize: 14, },
  scrollContent: { padding: 16, paddingTop: 8 },
  reportItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16, },
  textContainer: { flex: 1, },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#334155', },
  itemDescription: { fontSize: 13, color: '#64748B', marginTop: 2, },
});