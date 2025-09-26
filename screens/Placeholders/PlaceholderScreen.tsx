// screens/Placeholders/PlaceholderScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppTabParamList, ROUTES } from '../../constants/routes';

// 1. Định nghĩa kiểu cho props của màn hình này
// Nó sẽ nhận route name là một trong các tab placeholder
type PlaceholderScreenProps = BottomTabScreenProps<
  AppTabParamList, 
  | typeof ROUTES.RETURN_ITEMS_TAB 
  | typeof ROUTES.PROVISIONAL_BILL_TAB 
  | typeof ROUTES.UTILITIES_TAB
>;

// 2. Áp dụng kiểu đã định nghĩa vào component
const PlaceholderScreen = ({ route }: PlaceholderScreenProps) => {
  const { screenName } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình</Text>
      <Text style={styles.name}>{screenName}</Text>
    </View>
  );
};

// ... (phần styles giữ nguyên)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    color: '#333',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 8,
  }
});

export default PlaceholderScreen;