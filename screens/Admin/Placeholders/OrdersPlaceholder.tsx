import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminOrdersPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📦 Admin Orders Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: 'bold' },
});
