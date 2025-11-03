// screens/Cashier/FinancialSummaryScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../services/supabase'; // Import supabase client
// import { useNavigation } from '@react-navigation/native';

// Hàm gọi RPC mới
const getDailySummary = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const { data, error } = await supabase.rpc('get_daily_summary_report', { 
        p_target_date: dateString 
    });
    if (error) throw error;
    return data;
};

const formatCurrency = (amount: number = 0) => (amount || 0).toLocaleString('vi-VN');
const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric'});

// Component chọn ngày (không đổi)
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
                    value={date} mode="date" display="default"
                    onChange={handleDateChange} maximumDate={new Date()}
                />
            )}
        </View>
    );
};

export default function FinancialSummaryScreen() {
    // const navigation = useNavigation();
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
                
                {loading ? ( <ActivityIndicator style={{marginTop: 32}} size="large" color="#3B82F6" /> ) : 
                 !reportData ? ( <Text style={styles.emptyText}>Không có dữ liệu.</Text> ) : 
                 (
                    <>
                        {/* --- Phần 1: Báo cáo Lãi/Lỗ --- */}
                        <Text style={styles.sectionTitle}>Kết quả kinh doanh</Text>
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng Doanh thu</Text>
                                <Text style={[styles.detailValue, { color: '#10B981' }]}>+{formatCurrency(reportData.totalRevenue)} ₫</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tổng Chi phí</Text>
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(reportData.totalCogs + reportData.operatingExpenses)} ₫</Text>
                            </View>
                             <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Lợi nhuận ròng</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: reportData.netProfit >= 0 ? '#10B981' : '#EF4444' }]}>
                                    {formatCurrency(reportData.netProfit)} ₫
                                </Text>
                            </View>
                        </View>

                        {/* --- Phần 2: Đối soát Quỹ Tiền mặt --- */}
                        <Text style={styles.sectionTitle}>Đối soát quỹ tiền mặt</Text>
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
                                <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(reportData.cashOutflow)} ₫</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Số dư tiền mặt cuối ngày</Text>
                                <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#2563EB' }]}>
                                    {formatCurrency(reportData.closingBalance)} ₫
                                </Text>
                            </View>
                        </View>
                        
                        {/* --- Phần 3: Các khoản thu khác --- */}
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
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#475569', marginTop: 20, marginBottom: 12, paddingLeft: 4},
    detailSection: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#475569' },
    detailValue: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    otherRevenueCard: { marginTop: 16, backgroundColor: '#F0FDF4', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#BBF7D0' },
    otherRevenueSubtext: { fontSize: 13, color: '#4ADE80', paddingBottom: 16, marginTop: -10, }
});