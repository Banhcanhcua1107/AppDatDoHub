// src/screens/Home/OrderInfoBox.tsx (Lưu file này trong thư mục Home)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { supabase } from '../../services/supabase';

// --- Interfaces ---
interface OrderInfoBoxProps {
  isVisible: boolean;
  onClose: () => void;
  tableId: string | null;
  tableName: string | null;
  onActionPress: (action: string, data?: any) => void;
}
interface MenuItemProps {
  icon: string; text: string; action: string; color?: string;
}
interface OrderDetails {
  orderTime: string; totalItems: number; totalPrice: number;
}

// --- Components Con ---
const MenuActionItem: React.FC<{ item: MenuItemProps; onPress: (action: string) => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item.action)} style={styles.menuItem}>
    <Icon name={item.icon} size={24} color={item.color || '#4B5563'} style={styles.menuIcon} />
    <Text style={[styles.menuText, { color: item.color || '#1F2937' }]}>{item.text}</Text>
  </TouchableOpacity>
);

// --- Component Chính ---
const OrderInfoBox: React.FC<OrderInfoBoxProps> = ({ isVisible, onClose, tableId, tableName, onActionPress: handleParentAction }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`created_at, order_items(quantity, unit_price)`)
        .eq('table_id', tableId)
        .eq('status', 'pending')
        .single();
      
      if (error) throw error;

      if (data) {
        const totalItems = data.order_items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = data.order_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const orderTime = new Date(data.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setOrderDetails({ totalItems, totalPrice, orderTime });
      }
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể tải chi tiết order.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [tableId, onClose]);

  useEffect(() => {
    if (isVisible) {
      fetchOrderDetails();
    }
  }, [isVisible, fetchOrderDetails]);

  const menuActions: MenuItemProps[] = [
    { icon: 'cash-outline', text: 'Thanh toán', action: 'go_to_payment' },
    { icon: 'swap-horizontal-outline', text: 'Chuyển bàn', action: 'transfer_table', color: '#3B82F6' },
    { icon: 'layers-outline', text: 'Ghép order', action: 'merge_order' },
    { icon: 'close-circle-outline', text: 'Hủy order', action: 'cancel_order', color: '#EF4444' },
    { icon: 'git-compare-outline', text: 'Tách order', action: 'split_order' },
    { icon: 'print-outline', text: 'In phiếu kiểm đồ', action: 'print_check' },
  ];

  const handleActionPress = (action: string) => {
    setMenuVisible(false);
    setTimeout(() => handleParentAction(action, { tableId, tableName }), 200);
  };
  
  const handleQuickAction = (action: string) => {
    onClose();
    setTimeout(() => handleParentAction(action, { tableId, tableName }), 200);
  }

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#FFF" style={{ padding: 60 }} />;
    }
    if (!orderDetails) {
      return <Text style={styles.statusText}>Không tìm thấy thông tin order.</Text>
    }
    return (
        <>
            <View style={styles.infoContainer}>
              <View>
                <Text style={styles.orderTimeText}>Order: {orderDetails.orderTime}</Text>
                <Text style={styles.statusText}>Đang phục vụ</Text>
              </View>
              <View style={styles.priceContainer}>
                <View style={styles.itemCountContainer}>
                  <Icon name="person" size={14} color="white" />
                  <Text style={styles.itemCountText}>{orderDetails.totalItems}</Text>
                </View>
                <Text style={styles.priceText}>{orderDetails.totalPrice.toLocaleString('vi-VN')}</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('request_payment')}><Icon name="calculator-outline" size={24} color="#555" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('go_to_order_details')}><Icon name="restaurant-outline" size={24} color="#555" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('print_check')}><Icon name="receipt-outline" size={24} color="#555" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setMenuVisible(true)}><Icon name="ellipsis-horizontal" size={24} color="#555" /></TouchableOpacity>
            </View>
        </>
    );
  }

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}><BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /></Pressable>
      <View style={styles.container}>
        <Pressable>
            <View style={styles.header}><Text style={styles.headerText}>Bàn: {tableName}</Text></View>
            {renderContent()}
        </Pressable>
      </View>
      <View style={styles.closeButtonContainer}><TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>ĐÓNG</Text></TouchableOpacity></View>
      <Modal transparent={true} visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuContainer}>{menuActions.map(item => (<MenuActionItem key={item.action} item={item} onPress={handleActionPress} />))}</View>
        </Pressable>
      </Modal>
    </Modal>
  );
};
// --- Stylesheet (giữ nguyên từ trước) ---
const styles = StyleSheet.create({
    overlay:{flex:1},container:{position:'absolute',bottom:100,left:10,right:10,backgroundColor:'#F8F9FA',borderRadius:8,elevation:10,shadowColor:'#000',shadowOffset:{width:0,height:-4},shadowOpacity:0.1,shadowRadius:10},header:{backgroundColor:'#3B82F6',paddingVertical:12,paddingHorizontal:16,borderTopLeftRadius:8,borderTopRightRadius:8},headerText:{color:'white',fontSize:18,fontWeight:'bold'},infoContainer:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#007AFF',padding:16},orderTimeText:{color:'white',fontSize:16,fontWeight:'bold'},statusText:{color:'#E0E0E0',fontSize:14},priceContainer:{alignItems:'flex-end'},itemCountContainer:{flexDirection:'row',alignItems:'center',marginBottom:4},itemCountText:{color:'white',marginLeft:4,fontWeight:'bold'},priceText:{color:'white',fontSize:22,fontWeight:'bold'},actionsContainer:{flexDirection:'row',backgroundColor:'white',borderBottomLeftRadius:8,borderBottomRightRadius:8,borderTopWidth:1,borderTopColor:'#EEE'},actionButton:{flex:1,paddingVertical:12,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderRightColor:'#EEE'},closeButtonContainer:{position:'absolute',bottom:30,left:0,right:0,alignItems:'center'},closeButton:{backgroundColor:'white',paddingVertical:12,paddingHorizontal:30,borderRadius:8,elevation:5},closeButtonText:{color:'#333',fontWeight:'bold',fontSize:16},menuOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'},menuContainer:{backgroundColor:'white',borderRadius:12,padding:10,width:'85%',maxWidth:350,elevation:5},menuItem:{flexDirection:'row',alignItems:'center',paddingVertical:14,paddingHorizontal:10},menuIcon:{width:40,textAlign:'center'},menuText:{fontSize:16,marginLeft:10}
});
export default OrderInfoBox;