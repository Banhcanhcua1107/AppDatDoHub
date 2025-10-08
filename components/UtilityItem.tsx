// components/UtilityItem.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type UtilityItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
};

export default function UtilityItem({ icon, title, onPress }: UtilityItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#495057" />
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-forward-outline" size={22} color="#adb5bd" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#212529',
  },
});