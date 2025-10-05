// --- START OF FILE components/ReturnedItemsIndicatorCard.tsx ---

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../services/supabase';
import { AppStackParamList } from '../constants/routes';

interface Props {
  orderId: string;
}

type NavigationProps = NativeStackNavigationProp<AppStackParamList>;

const ReturnedItemsIndicatorCard: React.FC<Props> = ({ orderId }) => {
  const [returnedCount, setReturnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const fetchReturnedItemsCount = async () => {
      // Chỉ fetch khi có orderId
      if (!orderId) {
        setLoading(false);
        return;
      };

      try {
        // Dùng rpc để tính tổng số lượng trả về từ DB cho hiệu năng tốt nhất
        const { data, error } = await supabase.rpc('get_total_returned_quantity_for_order', {
          p_order_id: orderId
        });

        if (error) throw error;
        
        setReturnedCount(data || 0);

      } catch (error) {
        // Không hiển thị lỗi cho người dùng, chỉ log ra console
        console.error("Error fetching returned items count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnedItemsCount();
  }, [orderId]);

  // Nếu đang tải hoặc không có món nào được trả, không hiển thị gì cả
  if (loading || returnedCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('ReturnedItemsDetail', { orderId })}
    >
      <View style={styles.iconContainer}>
        <Icon name="arrow-undo-outline" size={24} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Các món đã trả</Text>
        <Text style={styles.subtitle}>Đã trả {returnedCount} món. Nhấn để xem chi tiết.</Text>
      </View>
      <Icon name="chevron-forward-outline" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

// **QUAN TRỌNG**: Bạn cần chạy đoạn SQL này trong Supabase SQL Editor
// để tạo function `get_total_returned_quantity_for_order`
/*
  CREATE OR REPLACE FUNCTION get_total_returned_quantity_for_order(p_order_id uuid)
  RETURNS INT AS $$
  DECLARE
    total_quantity INT;
  BEGIN
    SELECT COALESCE(SUM(rsi.quantity), 0)
    INTO total_quantity
    FROM return_slip_items rsi
    JOIN return_slips rs ON rsi.return_slip_id = rs.id
    WHERE rs.order_id = p_order_id;
    
    RETURN total_quantity;
  END;
  $$ LANGUAGE plpgsql;
*/

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  iconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  subtitle: {
    fontSize: 13,
    color: '#B45309',
    marginTop: 2,
  },
});

export default ReturnedItemsIndicatorCard;