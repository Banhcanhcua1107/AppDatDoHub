// src/config/toastConfig.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

// Bảng màu để dễ quản lý
const COLORS = {
  success: '#22C55E', // Green-500
  error: '#EF4444',   // Red-500
  info: '#3B82F6',    // Blue-500
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

// Cấu hình giao diện tùy chỉnh cho các loại Toast
export const toastConfig = {
  // Giao diện cho thông báo thành công
  success: (props: BaseToastProps) => (
    <View style={[styles.container, styles.shadow]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.success }]}>
        <Ionicons name="checkmark-sharp" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
      </View>
    </View>
  ),

  // Giao diện cho thông báo lỗi
  error: (props: BaseToastProps) => (
    <View style={[styles.container, styles.shadow]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.error }]}>
        <Ionicons name="alert-sharp" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
      </View>
    </View>
  ),

  // Giao diện cho thông báo thông tin
  info: (props: BaseToastProps) => (
    <View style={[styles.container, styles.shadow]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.info }]}>
        <Ionicons name="information-sharp" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
      </View>
    </View>
  ),
};

// StyleSheet tập trung để dễ dàng chỉnh sửa
const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18, // Tạo hình tròn
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
});