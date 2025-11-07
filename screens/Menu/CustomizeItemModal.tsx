// --- START OF FILE CustomizeItemModal.tsx ---

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase'; // Import supabase

// --- [MỚI] Định nghĩa kiểu dữ liệu cho Options từ DB ---
type Choice = {
  id: number;
  name: string;
  price_adjustment: number;
};

type OptionGroup = {
  id: number;
  name: string;
  type: 'single' | 'multiple';
  option_choices: Choice[];
};

// --- Component con cho một dòng tùy chọn (Không đổi) ---
const OptionRow: React.FC<{
  label: string;
  price: number;
  selected: boolean;
  onPress: () => void;
}> = ({ label, price, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row justify-between items-center py-3 px-2 rounded-lg mb-2 ${selected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
  >
    <View className="flex-row items-center">
      <Icon
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? '#3461FD' : '#CBD5E0'}
      />
      <Text className={`ml-3 text-base ${selected ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
        {label}
      </Text>
    </View>
    {price > 0 && (
      <Text className="text-base text-gray-500">+ {price.toLocaleString('vi-VN')} đ</Text>
    )}
  </TouchableOpacity>
);

// --- [MỚI] Định nghĩa lại kiểu Item truyền vào ---
type MenuItemForModal = {
  id: string;
  name: string;
  image: string;
  price: number;
  remaining_quantity?: number | null; // [MỚI] Thêm số lượng còn lại
};

type CustomizeItemModalProps = {
  visible: boolean;
  onClose: () => void;
  item: MenuItemForModal | null;
  onAddToCart: (itemWithOptions: any) => void;
};

const CustomizeItemModal: React.FC<CustomizeItemModalProps> = ({
  visible,
  onClose,
  item,
  onAddToCart,
}) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<OptionGroup[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, any>>({}); // Dùng object để lưu lựa chọn
  const [totalPrice, setTotalPrice] = useState(0);
  const [note, setNote] = useState('');

  // --- [MỚI] Lấy các tùy chọn động từ DB khi item thay đổi ---
  useEffect(() => {
    if (!item) return;

    const fetchOptions = async () => {
      setLoading(true);
      // Lấy các option_groups liên kết với menu_item_id này, và lấy luôn các choices con
      const { data, error } = await supabase
        .from('option_groups')
        .select(
          `
          id, name, type,
          option_choices (id, name, price_adjustment)
        `
        )
        .in(
          'id',
          (
            await supabase
              .from('menu_item_options')
              .select('option_group_id')
              .eq('menu_item_id', item.id)
          ).data?.map((o) => o.option_group_id) || []
        );

      if (error) console.error('Lỗi lấy options:', error);
      else {
        setOptions(data || []);
        // Set giá trị mặc định cho các tùy chọn
        const defaults: Record<number, any> = {};
        (data || []).forEach((group) => {
          if (group.type === 'single' && group.option_choices.length > 0) {
            // Mặc định chọn cái đầu tiên cho single-choice
            defaults[group.id] = group.option_choices[0];
          } else if (group.type === 'multiple') {
            // Mặc định là mảng rỗng cho multiple-choice
            defaults[group.id] = [];
          }
        });
        setSelectedOptions(defaults);
      }
      setLoading(false);
    };

    fetchOptions();
    setQuantity(1); // Reset số lượng
    setNote('');
  }, [item]);

  // Tính lại tổng tiền mỗi khi có thay đổi
  useEffect(() => {
    if (!item) return;

    let optionsPrice = 0;
    Object.values(selectedOptions).forEach((selection) => {
      if (Array.isArray(selection)) {
        // multiple choices
        optionsPrice += selection.reduce((sum, choice) => sum + choice.price_adjustment, 0);
      } else if (selection?.price_adjustment) {
        // single choice
        optionsPrice += selection.price_adjustment;
      }
    });

    const total = (item.price + optionsPrice) * quantity;
    setTotalPrice(total);
  }, [item, quantity, selectedOptions]);

  if (!item) return null;

  const handleSelect = (group: OptionGroup, choice: Choice) => {
    setSelectedOptions((prev) => {
      const newSelection = { ...prev };
      if (group.type === 'single') {
        newSelection[group.id] = choice;
      } else {
        // multiple
        const currentSelection = (newSelection[group.id] as Choice[]) || [];
        const isSelected = currentSelection.some((c) => c.id === choice.id);
        if (isSelected) {
          newSelection[group.id] = currentSelection.filter((c) => c.id !== choice.id);
        } else {
          newSelection[group.id] = [...currentSelection, choice];
        }
      }
      return newSelection;
    });
  };

  const handleAddToCart = () => {
    // Chuyển đổi selectedOptions thành định dạng dễ đọc hơn để lưu
    const formattedOptions = {
      size: selectedOptions[1]?.name || 'Mặc định', // Giả sử ID 1 là Size
      sugar: selectedOptions[2]?.name || 'Mặc định', // Giả sử ID 2 là Đường
      toppings: (selectedOptions[3] || selectedOptions[4] || []).map((t: Choice) => ({
        name: t.name,
        price: t.price_adjustment,
      })),
    };

    const itemWithOptions = {
      ...item,
      menuItemId: item.id, // ID gốc của món
      quantity,
      size: { name: formattedOptions.size, price: selectedOptions[1]?.price_adjustment || 0 },
      sugar: { name: formattedOptions.sugar, price: selectedOptions[2]?.price_adjustment || 0 },
      toppings: formattedOptions.toppings,
      totalPrice,
      note: note.trim(),
    };
    onAddToCart(itemWithOptions);
    onClose();
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // --- RENDER ---
  const renderOptions = () => {
    if (loading) return <ActivityIndicator size="large" className="my-10" />;
    if (options.length === 0)
      return <Text className="text-center text-gray-500 my-10">Món này không có tùy chọn.</Text>;

    return options.map((group) => (
      <View key={group.id} className="mt-4">
        <Text className="text-lg font-bold text-gray-700 mb-1">{group.name}</Text>
        {group.option_choices.map((choice) => {
          let isSelected = false;
          if (group.type === 'single') {
            isSelected = selectedOptions[group.id]?.id === choice.id;
          } else {
            isSelected = (selectedOptions[group.id] as Choice[])?.some((c) => c.id === choice.id);
          }
          return (
            <OptionRow
              key={choice.id}
              label={choice.name}
              price={choice.price_adjustment}
              selected={isSelected}
              onPress={() => handleSelect(group, choice)}
            />
          );
        })}
      </View>
    ));
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalView}>
          <View className="w-full">
            {/* Header (Giữ nguyên) */}
            <View className="flex-row items-center mb-4">
              <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl mr-4" />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-bold text-gray-800">{item.name}</Text>
                  {item.remaining_quantity !== null && item.remaining_quantity !== undefined && (
                    <View className="bg-orange-100 px-2 py-1 rounded-lg">
                      <Text className="text-orange-700 font-semibold text-xs">
                        SL: {item.remaining_quantity}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg text-green-600 font-semibold mt-1">
                  {item.price.toLocaleString('vi-VN')} đ
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-1 -mt-8 -mr-2">
                <Icon name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 450 }}>{renderOptions()}</ScrollView>
            <View className="mt-5">
              <Text className="text-lg font-bold text-gray-700 mb-2">Ghi chú</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Ví dụ: không cay, nhiều đá..."
                placeholderTextColor="#9CA3AF"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            {/* Quantity & Total (Giữ nguyên) */}
            <View className="flex-row items-center justify-between w-full mt-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={decrement}
                  className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Icon name="remove" size={22} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold w-14 text-center">{quantity}</Text>
                <TouchableOpacity
                  onPress={increment}
                  className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
                >
                  <Icon name="add" size={22} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleAddToCart}
                className="bg-blue-500 rounded-xl px-6 py-3"
              >
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
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
  },
});

export default CustomizeItemModal;
