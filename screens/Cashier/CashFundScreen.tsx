// screens/Cashier/CashFundScreen.tsx

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

export default function CashFundScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [cashData, setCashData] = useState<CashFlowData>({
    cashOnHand: 0,
    bankDeposit: 0,
    totalFund: 0,
  });

  useEffect(() => {
    loadCashData();
  }, []);

  const loadCashData = async () => {
    try {
      setLoading(true);
      const report = await getCashFlowReport();
      
      setCashData({
        cashOnHand: report.cash_on_hand || 0,
        bankDeposit: report.bank_deposit || 0,
        totalFund: report.total_fund || 0,
      });
    } catch (error) {
      console.error('❌ Error loading cash data:', error);
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
          <ActivityIndicator size="large" color="#475569" />
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
          <Ionicons name="chevron-back" size={28} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quỹ tiền</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Fund Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Tổng quỹ tiền</Text>
          <Text style={styles.mainCardValue}>
            {formatCurrency(cashData.totalFund)} ₫
          </Text>
        </View>

        {/* Fund Breakdown Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chi tiết</Text>
          </View>
          
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cash-outline" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Tiền mặt</Text>
                <Text style={styles.itemDesc}>Tiền trong tủ quầy</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#F59E0B' }]}>
              {formatCurrency(cashData.cashOnHand)} ₫
            </Text>
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="card-outline" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Tiền gửi ngân hàng</Text>
                <Text style={styles.itemDesc}>Tiền trong tài khoản</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#10B981' }]}>
              {formatCurrency(cashData.bankDeposit)} ₫
            </Text>
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="wallet" size={18} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.itemLabel}>Tổng cộng</Text>
                <Text style={styles.itemDesc}>Tất cả quỹ tiền</Text>
              </View>
            </View>
            <Text style={[styles.itemValue, { color: '#2E7D32', fontWeight: '600' }]}>
              {formatCurrency(cashData.totalFund)} ₫
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#475569" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Quỹ tiền là gì?</Text>
              <Text style={styles.infoText}>
                Quỹ tiền bao gồm tổng cộng tiền mặt trong tủ quầy + tiền gửi ngân hàng. Giúp bạn quản lý tổng tài sản tiền mặt của cơ sở.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBF0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mainCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  itemDivider: {
    height: 6,
    backgroundColor: '#F9FAFB',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 16,
  },
});
