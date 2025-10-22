// screens/Menu/EmptyTableActionBox.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

interface EmptyTableActionBoxProps {
  isVisible: boolean;
  onClose: () => void;
  tableName: string | null;
  tableId: string | null;
  onAction: (action: string, data?: any) => void;
}

const EmptyTableActionBox: React.FC<EmptyTableActionBoxProps> = ({
  isVisible,
  onClose,
  tableName,
  tableId,
  onAction,
}) => {
  const actions = [
    {
      id: 'enter_table',
      icon: 'restaurant-outline',
      text: 'Vào bàn',
      color: '#10B981',
    },
    {
      id: 'group_tables',
      icon: 'apps-outline',
      text: 'Gộp bàn',
      color: '#3B82F6',
    },
    {
      id: 'reserve_table',
      icon: 'bookmark-outline',
      text: 'Đặt trước',
      color: '#8B5CF6',
    },
  ];

  const handleActionPress = (action: string) => {
    onClose();
    setTimeout(() => {
      onAction(action, { tableId, tableName });
    }, 200);
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.actionBoxWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Tùy chọn {tableName}</Text>
          </View>

          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleActionPress(action.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <Icon name={action.icon as any} size={32} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  container: {
    position: 'absolute',
    bottom: 350,
    left: 10,
    right: 10,
  },
  actionBoxWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  actionCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButtonText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmptyTableActionBox;
