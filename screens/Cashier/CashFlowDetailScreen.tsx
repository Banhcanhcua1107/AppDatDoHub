// screens/Cashier/CashFlowDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCashFlowReport } from '../../services/reportService';

interface CashFlowData {
  cashOnHand: number;
  bankDeposit: number;
  totalFund: number;
}

export default function CashFlowDetailScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    cashOnHand: 0,
    bankDeposit: 0,
    totalFund: 0,
  });

  useEffect(() => {
    loadCashFlowData();
  }, []);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const report = await getCashFlowReport(today, today);
      
      setCashFlowData({
        cashOnHand: report.cash_on_hand || 0,
        bankDeposit: report.bank_deposit || 0,
        totalFund: report.total_fund || 0,
      });
    } catch (error) {
      console.error('❌ Error loading cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Quỹ tiền</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardLabel}>Tổng quỹ tiền</Text>
            <Text style={styles.mainCardValue}>
              {formatCurrency(cashFlowData.totalFund)} ₫
            </Text>
          </View>
        </View>

        {/* Cash on Hand Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quỹ tiền mặt</Text>
          
          <View style={styles.fundCard}>
            <View style={styles.fundHeader}>
              <View style={[styles.fundIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="cash" size={28} color="#3B82F6" />
              </View>
              <View style={styles.fundInfo}>
                <Text style={styles.fundLabel}>Tiền mặt trong quỹ</Text>
                <Text style={styles.fundSubtext}>Quỹ tạm ứng, tiền thừa khách</Text>
              </View>
            </View>

            <View style={styles.fundContent}>
              <View style={styles.fundRow}>
                <Text style={styles.fundRowLabel}>Tổng tiền mặt</Text>
                <Text style={styles.fundRowValue}>
                  {formatCurrency(cashFlowData.cashOnHand)} ₫
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.fundBreakdown}>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownLabel}>Tạm ứng</Text>
                    <Text style={styles.breakdownValue}>
                      {formatCurrency(Math.floor(cashFlowData.cashOnHand * 0.6))} ₫
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="trending-up" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownLabel}>Tiền thừa khách</Text>
                    <Text style={styles.breakdownValue}>
                      {formatCurrency(Math.floor(cashFlowData.cashOnHand * 0.4))} ₫
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Deposit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quỹ tiền gửi</Text>
          
          <View style={styles.fundCard}>
            <View style={styles.fundHeader}>
              <View style={[styles.fundIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="card" size={28} color="#8B5CF6" />
              </View>
              <View style={styles.fundInfo}>
                <Text style={styles.fundLabel}>Tiền gửi ngân hàng</Text>
                <Text style={styles.fundSubtext}>Số dư tài khoản, tiền chuyển khoản</Text>
              </View>
            </View>

            <View style={styles.fundContent}>
              <View style={styles.fundRow}>
                <Text style={styles.fundRowLabel}>Tổng tiền gửi</Text>
                <Text style={styles.fundRowValue}>
                  {formatCurrency(cashFlowData.bankDeposit)} ₫
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.fundBreakdown}>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="wallet" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownLabel}>Số dư ngân hàng</Text>
                    <Text style={styles.breakdownValue}>
                      {formatCurrency(Math.floor(cashFlowData.bankDeposit * 0.75))} ₫
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#E0E7FF' }]}>
                    <Ionicons name="arrow-forward-circle" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownLabel}>Tiền chuyển khoản</Text>
                    <Text style={styles.breakdownValue}>
                      {formatCurrency(Math.floor(cashFlowData.bankDeposit * 0.25))} ₫
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng kết</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tiền mặt</Text>
              <Text style={styles.summaryValue}>
                {((cashFlowData.cashOnHand / cashFlowData.totalFund) * 100).toFixed(1)}%
              </Text>
              <Text style={styles.summarySubtext}>
                {formatCurrency(cashFlowData.cashOnHand)} ₫
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tiền gửi</Text>
              <Text style={styles.summaryValue}>
                {((cashFlowData.bankDeposit / cashFlowData.totalFund) * 100).toFixed(1)}%
              </Text>
              <Text style={styles.summarySubtext}>
                {formatCurrency(cashFlowData.bankDeposit)} ₫
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Quỹ tiền mặt là các khoản tiền tạm ứng. Quỹ tiền gửi là tiền đã chuyển vào tài khoản ngân hàng.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  mainCardContent: {
    alignItems: 'center',
  },
  mainCardLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  fundCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  fundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  fundIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundInfo: {
    flex: 1,
  },
  fundLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  fundSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  fundContent: {
    gap: 12,
  },
  fundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundRowLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  fundRowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  fundBreakdown: {
    gap: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoSection: {
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#EBF5FF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
});
