// screens/Cashier/ProfitDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getProfitReport } from '../../services/reportService'; // Đảm bảo import đúng đường dẫn

// --- Helpers ---
const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');
const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// --- Component chọn ngày (Giống hệt bên Tổng kết tài chính) ---
const DateSelector = ({ date, onDateChange }: { date: Date, onDateChange: (newDate: Date) => void }) => {
    const [showPicker, setShowPicker] = useState(false);
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) onDateChange(selectedDate);
    };
    return (
        <View>
            <TouchableOpacity style={styles.dateSelectorButton} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                <Text style={styles.dateSelectorText}>Xem ngày: {formatDate(date)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
};


export default function ProfitDetailScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const loadData = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            // Gọi hàm getProfitReport với cùng ngày bắt đầu và kết thúc
            const data = await getProfitReport(date, date);
            setReportData(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải báo cáo lợi nhuận: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Tải lại dữ liệu khi người dùng chọn ngày mới
    useEffect(() => {
        loadData(selectedDate);
    }, [selectedDate, loadData]);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo Lợi nhuận</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Sử dụng component chọn ngày mới */}
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? ( <ActivityIndicator style={{marginTop: 32}} size="large" color="#F59E0B" /> ) : 
                 !reportData ? ( <Text style={styles.emptyText}>Không có dữ liệu.</Text> ) : 
                 (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Lợi nhuận ròng</Text>
                            <Text style={[ styles.summaryValue, { color: reportData.netProfit >= 0 ? '#10B981' : '#EF4444' } ]}>
                                {formatCurrency(reportData.netProfit)} ₫
                            </Text>
                            <Text style={styles.summarySubtext}>Tỷ suất: {reportData.profitMargin?.toFixed(1) || 0}%</Text>
                        </View>
                        
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng doanh thu</Text>
                                <Text style={[styles.detailValue, { color: '#10B981' }]}>+{formatCurrency(reportData.totalRevenue)} ₫</Text>
                            </View>
                            <View style={styles.divider} />
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng chi phí</Text>
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(reportData.totalCogs + reportData.operatingExpenses)} ₫</Text>
                            </View>
                             <View style={styles.subDetailRow}>
                                <Text style={styles.subDetailLabel}>Giá vốn hàng bán (COGS)</Text>
                                <Text style={styles.subDetailValue}>-{formatCurrency(reportData.totalCogs)} ₫</Text>
                            </View>
                            <View style={styles.subDetailRow}>
                                <Text style={styles.subDetailLabel}>Chi phí hoạt động</Text>
                                <Text style={styles.subDetailValue}>-{formatCurrency(reportData.operatingExpenses)} ₫</Text>
                            </View>
                             <View style={styles.divider} />
                             
                             <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold', color: '#1E293B' }]}>Lợi nhuận ròng</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: reportData.netProfit >= 0 ? '#10B981' : '#EF4444' }]}>
                                    {formatCurrency(reportData.netProfit)} ₫
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
    // Styles cho bộ chọn ngày mới
    dateSelectorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    dateSelectorText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },
    detailSection: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#475569' },
    detailValue: { fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    subDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, paddingLeft: 16, marginTop: -8 },
    subDetailLabel: { fontSize: 14, color: '#64748B' },
    subDetailValue: { fontSize: 14, color: '#64748B', fontWeight: '500' },
});