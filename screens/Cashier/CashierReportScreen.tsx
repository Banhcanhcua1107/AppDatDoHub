// screens/Cashier/CashierReportScreen.tsx

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CashierStackParamList } from '../../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../services/supabase'; // Import supabase

type ReportNavigationProp = NativeStackNavigationProp<CashierStackParamList>;

// Hàm gọi RPC để lấy dữ liệu báo cáo (giống FinancialSummaryScreen)
const getDailySummary = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const { data, error } = await supabase.rpc('get_daily_summary_report', { 
        p_target_date: dateString 
    });
    // Dữ liệu trả về là một mảng, chúng ta chỉ cần phần tử đầu tiên
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
};


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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Xử lý khi người dùng chọn ngày để xuất file
  const onDateSelectedForExport = async (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLoading(true);
      try {
        // 1. Lấy dữ liệu báo cáo cho ngày đã chọn
        const reportData = await getDailySummary(selectedDate);
        if (!reportData) {
          throw new Error('Không có dữ liệu cho ngày này.');
        }

        // 2. Tạo nội dung file CSV
        const dateString = selectedDate.toISOString().split('T')[0];
        const headers = '"Chỉ số","Giá trị"';
        const rows = [
          `"Ngày báo cáo","${dateString}"`,
          `"Tổng Doanh thu",${reportData.totalRevenue}`,
          `"Tổng Giá vốn (COGS)",${reportData.totalCogs}`,
          `"Lợi nhuận gộp",${reportData.totalRevenue - reportData.totalCogs}`,
          `"Số dư đầu ngày",${reportData.openingBalance}`,
          `"Thu tiền mặt",${reportData.cashInflow}`,
          `"Chi tiền mặt",${reportData.cashOutflow}`,
          `"Thu qua App/Thẻ",${reportData.digitalInflow}`,
          `"Số dư cuối ngày",${reportData.closingBalance}`,
        ];
        const csvContent = `${headers}\n${rows.join('\n')}`;

        // 3. Lưu file vào thư mục tạm của ứng dụng
        const fileName = `BaoCao_${dateString}.csv`;
        const fileUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // 4. Mở hộp thoại chia sẻ
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Chia sẻ hoặc lưu báo cáo',
        });

      } catch (error: any) {
        Alert.alert("Lỗi xuất file", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo & Phân tích</Text>
        <TouchableOpacity style={styles.exportButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="download-outline" size={22} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Xuất file</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ReportItem
          icon="analytics-outline"
          title="Tổng kết Tài chính"
          description="Xem số dư cuối kỳ dựa trên tổng thu và tổng chi"
          color="#2563EB"
          onPress={() => navigation.navigate('FinancialSummary')} 
        />
        <ReportItem
          icon="receipt-outline"
          title="Báo cáo Doanh thu"
          description="Xem chi tiết các giao dịch thành công"
          color="#10B981"
          onPress={() => navigation.navigate('SalesDetail')}
        />
        <ReportItem
          icon="cube-outline"
          title="Báo cáo Tồn kho"
          description="Kiểm tra trạng thái còn/hết hàng của các món"
          color="#3B82F6"
          onPress={() => navigation.navigate('InventoryDetail')}
        />
        <ReportItem
          icon="trending-down-outline"
          title="Báo cáo Chi phí"
          description="Quản lý và theo dõi các khoản chi phí hàng ngày"
          color="#EF4444"
          onPress={() => navigation.navigate('Expenses')}
        />
      </ScrollView>

      {/* Component chọn ngày, chỉ hiện khi cần */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateSelectedForExport}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

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
  // Styles cho màn hình loading
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
});