import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminUsersPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👥 Admin Users Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: 'bold' },
});
