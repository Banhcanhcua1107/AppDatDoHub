// screens/Cashier/FinancialSummaryScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
// [THAY ĐỔI] Đổi tên hàm import cho tường minh
import { getDailyCashReconciliation as getDailySummary } from '../../services/supabaseService';

const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');
const formatDate = (date: Date) => date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric'});

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

export default function FinancialSummaryScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const loadData = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            // [THAY ĐỔI] Gọi hàm mới đã import
            const data = await getDailySummary(date);
            setReportData(data);
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải báo cáo: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(selectedDate); }, [selectedDate, loadData]);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#334155" /></TouchableOpacity>
                {/* [THAY ĐỔI] Đổi tiêu đề cho đúng mục đích */}
                <Text style={styles.headerTitle}>Tổng kết trong ngày</Text>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? ( <ActivityIndicator style={{marginTop: 32}} size="large" color="#3B82F6" /> ) : 
                 !reportData ? ( <Text style={styles.emptyText}>Không có dữ liệu.</Text> ) : 
                 (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Số dư cuối ngày</Text>
                            <Text style={[styles.summaryValue, { color: reportData.closingBalance >= 0 ? '#2563EB' : '#EF4444' }]}>
                                {formatCurrency(reportData.closingBalance)} ₫
                            </Text>
                            <Text style={styles.summarySubtext}>Cuối ngày = Đầu ngày + Tổng thu - Tổng chi</Text>
                        </View>
                        
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Số dư đầu ngày</Text>
                                <Text style={styles.detailValue}>{formatCurrency(reportData.openingBalance)} ₫</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                {/* [THAY ĐỔI] Sử dụng tên và dữ liệu mới */}
                                <Text style={styles.detailLabel}>Tổng thu trong ngày</Text>
                                <Text style={[styles.detailValue, { color: '#10B981' }]}>+{formatCurrency(reportData.totalInflow)} ₫</Text>
                            </View>
                            <View style={styles.detailRow}>
                                {/* [THAY ĐỔI] Sử dụng tên và dữ liệu mới */}
                                <Text style={styles.detailLabel}>Tổng chi trong ngày</Text>
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(reportData.totalOutflow)} ₫</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Số dư cuối ngày</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#2563EB' }]}>
                                    {formatCurrency(reportData.closingBalance)} ₫
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles giữ nguyên như trước, không cần thay đổi
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
    dateSelectorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    dateSelectorText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryLabel: { fontSize: 15, color: '#64748B' },
    summaryValue: { fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
    summarySubtext: { fontSize: 14, color: '#9CA3AF' },
    detailSection: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#475569' },
    detailValue: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
});