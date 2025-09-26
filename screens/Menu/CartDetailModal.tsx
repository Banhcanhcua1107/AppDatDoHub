import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CartItem } from './MenuScreen'; // Import kiểu dữ liệu từ MenuScreen

interface CartDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

const CartDetailModal: React.FC<CartDetailModalProps> = ({
  visible,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center mb-4 pb-4 border-b border-gray-200">
      <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-4" />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500 mt-1">
            {`Size: ${item.size.name}, Đường: ${item.sugar.name}`}
        </Text>
        <Text className="text-sm text-gray-500">
            {`Topping: ${item.toppings.length > 0 ? item.toppings.map(t => t.name).join(', ') : 'Không'}`}
        </Text>
        <Text className="text-base font-semibold text-red-500 mt-2">
          {(item.totalPrice / item.quantity).toLocaleString('vi-VN')}đ
        </Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 items-center justify-center bg-gray-200 rounded-full">
          <Icon name="remove" size={18} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold mx-3">{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 items-center justify-center bg-blue-500 rounded-full"> 
            <Icon name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200">
           <TouchableOpacity onPress={onClearCart} className="p-2">
                <Text className="text-blue-500">Xoá tất cả</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold">Giỏ hàng</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Danh sách món */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
            ListEmptyComponent={() => (
                <View className="items-center justify-center h-40">
                    <Text className="text-gray-500">Giỏ hàng của bạn đang trống</Text>
                </View>
            )}
          />

          <Text className="text-sm text-gray-400 text-center mt-auto pb-4">
            Giá món đã bao gồm thuế.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: '75%', // Chiều cao modal
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
});

export default CartDetailModal;