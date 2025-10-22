// screens/Cashier/ProfitDetailScreen.tsx

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
import { getProfitReport } from '../../services/reportService';

type ProfitDetailNavigationProp = any;

interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export default function ProfitDetailScreen() {
  const navigation = useNavigation<ProfitDetailNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [profitData, setProfitData] = useState<ProfitData>({
    totalRevenue: 0,
    totalCost: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
  });

  useEffect(() => {
    loadProfitData();
  }, []);

  const loadProfitData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const report = await getProfitReport(today, today);
      
      setProfitData({
        totalRevenue: report.total_revenue || 0,
        totalCost: report.total_cogs || 0,
        totalExpenses: report.operating_cost || 0,
        grossProfit: report.gross_profit || 0,
        netProfit: report.net_profit || 0,
        profitMargin: report.profit_margin || 0,
      });
    } catch (error) {
      console.error('❌ Error loading profit data:', error);
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
        <Text style={styles.headerTitle}>Chi tiết Lợi nhuận</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Profit Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardLabel}>Lợi nhuận ròng</Text>
            <Text style={styles.mainCardValue}>
              {formatCurrency(profitData.netProfit)} ₫
            </Text>
            <View style={styles.mainCardFooter}>
              <View style={styles.marginBadge}>
                <Text style={styles.marginText}>
                  {profitData.profitMargin.toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.marginLabel}>Tỷ suất lợi nhuận</Text>
            </View>
          </View>
        </View>

        {/* Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="trending-up" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.breakdownLabel}>Doanh thu</Text>
                  <Text style={styles.breakdownSubtext}>Thu nhập từ bán hàng</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>
                {formatCurrency(profitData.totalRevenue)} ₫
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="cart" size={20} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.breakdownLabel}>Chi phí hàng hóa</Text>
                  <Text style={styles.breakdownSubtext}>Giá vốn hàng bán</Text>
                </View>
              </View>
              <Text style={[styles.breakdownValue, { color: '#EF4444' }]}>
                -{formatCurrency(profitData.totalCost)} ₫
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="wallet" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.breakdownLabel}>Chi phí hoạt động</Text>
                  <Text style={styles.breakdownSubtext}>Chi phí vận hành quán</Text>
                </View>
              </View>
              <Text style={[styles.breakdownValue, { color: '#F59E0B' }]}>
                -{formatCurrency(profitData.totalExpenses)} ₫
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.breakdownLabel}>Lợi nhuận ròng</Text>
                  <Text style={styles.breakdownSubtext}>Doanh thu - Chi phí</Text>
                </View>
              </View>
              <Text style={[styles.breakdownValue, { color: '#10B981', fontWeight: '700' }]}>
                {formatCurrency(profitData.netProfit)} ₫
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phân tích</Text>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisLabel}>Lợi nhuận gộp</Text>
              <Text style={styles.analysisValue}>
                {formatCurrency(profitData.grossProfit)} ₫
              </Text>
              <Text style={styles.analysisSubtext}>Trước chi phí vận hành</Text>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.analysisLabel}>Tỷ suất lợi nhuận</Text>
              <Text style={[styles.analysisValue, { color: '#3B82F6' }]}>
                {profitData.profitMargin.toFixed(1)}%
              </Text>
              <Text style={styles.analysisSubtext}>Trên doanh thu</Text>
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
    borderLeftColor: '#F59E0B',
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
    marginBottom: 16,
  },
  mainCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marginBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  marginText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  marginLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
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
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  breakdownSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  analysisCard: {
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
  analysisLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  analysisSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
