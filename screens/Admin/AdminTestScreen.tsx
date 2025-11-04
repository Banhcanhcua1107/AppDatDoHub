import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ ADMIN TEST SCREEN</Text>
      <Text style={styles.subtitle}>Nếu bạn thấy dòng này, AdminTabs đang render đúng!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
