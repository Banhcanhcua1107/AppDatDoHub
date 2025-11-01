// screens/Cashier/FinancialSummaryScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
// Giả sử supabaseService là nơi bạn gọi hàm RPC get_daily_cash_reconciliation
import { getDailyCashReconciliation as getDailySummary } from '../../services/supabaseService';
import { useNavigation } from '@react-navigation/native';

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
                <Text style={styles.headerTitle}>Tổng kết tài chính</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? ( <ActivityIndicator style={{marginTop: 32}} size="large" color="#3B82F6" /> ) : 
                 !reportData ? ( <Text style={styles.emptyText}>Không có dữ liệu.</Text> ) : 
                 (
                    <>
                        {/* Khu vực đối soát tiền mặt */}
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Số dư đầu ngày</Text>
                                <Text style={styles.detailValue}>{formatCurrency(reportData.openingBalance)} ₫</Text>
                            </View>
                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Thu bằng tiền mặt</Text>
                                <Text style={[styles.detailValue, { color: '#10B981' }]}>+{formatCurrency(reportData.cashInflow)} ₫</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Chi bằng tiền mặt</Text>
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(reportData.totalOutflow)} ₫</Text>
                            </View>

                            <View style={styles.divider} />
                            
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Số dư tiền mặt cuối ngày</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#2563EB' }]}>
                                    {formatCurrency(reportData.closingBalance)} ₫
                                </Text>
                            </View>
                        </View>

                        {/* Khu vực thu qua kênh khác */}
                        <View style={styles.otherRevenueCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Thu qua App/Thẻ</Text>
                                <Text style={[styles.detailValue, { color: '#16A34A' }]}>
                                    +{formatCurrency(reportData.digitalInflow)} ₫
                                </Text>
                            </View>
                            <Text style={styles.otherRevenueSubtext}>Bao gồm MoMo, Chuyển khoản... (không ảnh hưởng quỹ tiền mặt)</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    scrollContent: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
    dateSelectorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    dateSelectorText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    detailSection: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#475569' },
    detailValue: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    otherRevenueCard: { marginTop: 16, backgroundColor: '#F0FDF4', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#BBF7D0' },
    otherRevenueSubtext: { fontSize: 13, color: '#4ADE80', paddingBottom: 16, marginTop: -10, }
});