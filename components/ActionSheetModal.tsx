// --- START OF FILE components/ActionSheetModal.tsx ---

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export interface ActionSheetItem {
  id: string;
  icon: string;
  text: string;
  color?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  actions: ActionSheetItem[];
  title?: string;
}

const ActionSheetModal: React.FC<Props> = ({ visible, onClose, actions, title }) => {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: ActionSheetItem }) => (
    <TouchableOpacity style={styles.actionButton} onPress={item.onPress}>
      <Icon name={item.icon} size={24} color={item.color || '#374151'} style={styles.icon} />
      <Text style={[styles.actionText, { color: item.color || '#374151' }]}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
          {title && <Text style={styles.title}>{title}</Text>}
          <FlatList
            data={actions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', // <-- Thay đổi
    alignItems: 'center',     // <-- Thêm
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16, // <-- Thay đổi
    paddingTop: 12,
    paddingHorizontal: 0, // Điều chỉnh padding cho phù hợp
    width: '85%',       // <-- Thêm chiều rộng
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  icon: {
    width: 35,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 47, // Căn lề với chữ
  },
  closeButton: {
    width: '30%',
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4B5563'
  }
});

export default ActionSheetModal;