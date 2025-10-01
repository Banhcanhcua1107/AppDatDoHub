// screens/Placeholders/PlaceholderScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppTabParamList, ROUTES } from '../../constants/routes';

// 1. Định nghĩa kiểu cho props của màn hình này (giữ nguyên)
type PlaceholderScreenProps = BottomTabScreenProps<
  AppTabParamList, 
  | typeof ROUTES.RETURN_ITEMS_TAB 
  | typeof ROUTES.PROVISIONAL_BILL_TAB 
  | typeof ROUTES.UTILITIES_TAB
>;

// 2. Áp dụng kiểu và sửa lỗi
const PlaceholderScreen = ({ route }: PlaceholderScreenProps) => {
  // [SỬA LỖI Ở ĐÂY]
  // Dùng optional chaining (?.) để truy cập an toàn vào 'params'.
  // Nếu route.params không tồn tại hoặc không có screenName,
  // thì sẽ lấy tên của route hiện tại (route.name) làm giá trị dự phòng.
  const screenNameToDisplay = route.params?.screenName ?? route.name;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình</Text>
      <Text style={styles.name}>{screenNameToDisplay}</Text>
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