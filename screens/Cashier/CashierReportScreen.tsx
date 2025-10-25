// screens/Cashier/CashierReportScreen.tsx

import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo & Phân tích</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ReportItem
          icon="receipt-outline"
          title="Báo cáo Doanh thu"
          description="Xem chi tiết các giao dịch thành công"
          color="#10B981"
          onPress={() => navigation.navigate('SalesDetail')}
        />
        <ReportItem
          icon="trending-up-outline"
          title="Báo cáo Lợi nhuận"
          description="Phân tích lợi nhuận dựa trên doanh thu và chi phí"
          color="#F59E0B"
          onPress={() => navigation.navigate('ProfitDetail')}
        />
        {/* [MỚI] Thêm báo cáo quỹ tiền */}
        <ReportItem
          icon="wallet-outline"
          title="Báo cáo Quỹ tiền"
          description="Kiểm tra dòng tiền thu chi trong ngày"
          color="#8B5CF6"
          onPress={() => navigation.navigate('CashFlowDetail')}
        />
        <ReportItem
          icon="cube-outline"
          title="Báo cáo Tồn kho"
          description="Kiểm tra trạng thái còn hàng/hết hàng của món"
          color="#3B82F6"
          onPress={() => navigation.navigate('InventoryDetail')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles không thay đổi nhiều, chỉ điều chỉnh lại cho đẹp hơn
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  scrollContent: { padding: 16, paddingTop: 8 },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Bo tròn
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  itemDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});