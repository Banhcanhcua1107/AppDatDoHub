import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MenuItem } from '../../constants/menuData';

// --- Dữ liệu giả cho các tùy chọn ---
const sizeOptions = [
  { id: 'size_m', name: 'Size M', price: 0 },
  { id: 'size_l', name: 'Size L', price: 5000 },
];
const sugarOptions = [
  { id: 'sugar_50', name: '50% Đường', price: 0 },
  { id: 'sugar_70', name: '70% Đường', price: 0 },
  { id: 'sugar_100', name: '100% Đường', price: 0 },
];
const toppingOptions = [
  { id: 'topping_1', name: 'Trân châu đen', price: 7000 },
  { id: 'topping_2', name: 'Thạch phô mai', price: 10000 },
];

// --- Component con cho một dòng tùy chọn ---
const OptionRow: React.FC<{ label: string, price: number, selected: boolean, onPress: () => void }> = ({ label, price, selected, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`flex-row justify-between items-center py-3 border-b border-gray-100 ${selected ? 'bg-blue-50' : ''}`}
  >
    <View className="flex-row items-center">
      <Icon name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? "#3461FD" : "#CBD5E0"} />
      <Text className={`ml-3 text-base ${selected ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{label}</Text>
    </View>
    {price > 0 && <Text className="text-base text-gray-500">+ {price.toLocaleString('vi-VN')} đ</Text>}
  </TouchableOpacity>
);

type CustomizeItemModalProps = {
  visible: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (itemWithOptions: any) => void; // Sẽ truyền object chứa cả tùy chọn
};

const CustomizeItemModal: React.FC<CustomizeItemModalProps> = ({ visible, onClose, item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [selectedSugar, setSelectedSugar] = useState(sugarOptions[2]);
  const [selectedToppings, setSelectedToppings] = useState<typeof toppingOptions>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Reset state khi một item mới được chọn
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedSize(sizeOptions[0]);
      setSelectedSugar(sugarOptions[2]);
      setSelectedToppings([]);
    }
  }, [item]);

  // Tính lại tổng tiền mỗi khi có thay đổi
  useEffect(() => {
    if (!item) return;
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    const total = (item.price + selectedSize.price + toppingsPrice) * quantity;
    setTotalPrice(total);
  }, [item, quantity, selectedSize, selectedToppings]);

  if (!item) return null;

  const handleSelectTopping = (topping: typeof toppingOptions[0]) => {
    setSelectedToppings(prev => {
      const isSelected = prev.find(t => t.id === topping.id);
      if (isSelected) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleAddToCart = () => {
    const itemWithOptions = {
      ...item,
      quantity,
      size: selectedSize,
      sugar: selectedSugar,
      toppings: selectedToppings,
      totalPrice,
      note: 'Ghi chú ở đây' // Lấy từ TextInput
    };
    onAddToCart(itemWithOptions);
    onClose();
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalView}>
          <View className="w-full">
            {/* Header */}
            <View className="flex-row items-center mb-4">
              <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl mr-4" />
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">{item.name}</Text>
                <Text className="text-lg text-green-600 font-semibold mt-1">{item.price.toLocaleString('vi-VN')} đ</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-1 -mt-8 -mr-2">
                <Icon name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 500 }}>
              {/* Size Options */}
              <View className="mt-2">
                <Text className="text-lg font-bold text-gray-700 mb-1">Chọn size</Text>
                {sizeOptions.map(option => (
                  <OptionRow key={option.id} label={option.name} price={option.price} selected={selectedSize.id === option.id} onPress={() => setSelectedSize(option)} />
                ))}
              </View>
              
              {/* Sugar Options */}
              <View className="mt-4">
                <Text className="text-lg font-bold text-gray-700 mb-1">Mức đường</Text>
                {sugarOptions.map(option => (
                  <OptionRow key={option.id} label={option.name} price={option.price} selected={selectedSugar.id === option.id} onPress={() => setSelectedSugar(option)} />
                ))}
              </View>

              {/* Topping Options */}
              <View className="mt-4">
                <Text className="text-lg font-bold text-gray-700 mb-1">Topping (chọn nhiều)</Text>
                {toppingOptions.map(option => (
                  <OptionRow key={option.id} label={option.name} price={option.price} selected={!!selectedToppings.find(t => t.id === option.id)} onPress={() => handleSelectTopping(option)} />
                ))}
              </View>
            </ScrollView>

            {/* Quantity & Total */}
            <View className="flex-row items-center justify-between w-full mt-6">
              <View className="flex-row items-center">
                <TouchableOpacity onPress={decrement} className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                  <Icon name="remove" size={22} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold w-14 text-center">{quantity}</Text>
                <TouchableOpacity onPress={increment} className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                  <Icon name="add" size={22} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleAddToCart} className="bg-blue-500 rounded-xl px-6 py-3">
                <Text className="text-white text-center font-bold text-base">
                  Thêm: {totalPrice.toLocaleString('vi-VN')} đ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,

  }
});

export default CustomizeItemModal;