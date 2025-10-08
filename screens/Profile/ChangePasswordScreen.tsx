// screens/Profile/ChangePasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

// --- BẠN CẦN CẬP NHẬT CÁC IMPORT NÀY CHO ĐÚNG VỚI DỰ ÁN CỦA BẠN ---
import { AppStackParamList, ROUTES } from '../../constants/routes'; // Giả sử bạn có Stack cho các màn hình đã đăng nhập
import { changeUserPassword } from '../../services/authService'; // Hàm này sẽ được tạo ở bước 2

// Định nghĩa kiểu cho navigation stack sau khi đăng nhập
// Bạn cần thêm 'CHANGE_PASSWORD' vào file routes.ts và AppStackParamList
type ChangePasswordProps = NativeStackScreenProps<AppStackParamList, typeof ROUTES.CHANGE_PASSWORD>;

// Kiểu cho state lỗi
type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordScreen({ navigation }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateAndSubmit = async () => {
    const currentErrors: FormErrors = {};
    if (!currentPassword) {
      currentErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    }
    if (!newPassword) {
      currentErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (newPassword.length < 6) {
      currentErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    }
    if (newPassword && newPassword === currentPassword) {
        currentErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }
    if (!confirmPassword) {
      currentErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (newPassword !== confirmPassword) {
      currentErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    
    setErrors(currentErrors);

    // Nếu không có lỗi, tiến hành gọi API
    if (Object.keys(currentErrors).length === 0) {
      setIsLoading(true);
      try {
        await changeUserPassword(currentPassword, newPassword); 
        Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Đổi mật khẩu thành công!',
        });
        // Quay lại màn hình trước đó sau khi thành công
        navigation.goBack();
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Đổi mật khẩu thất bại',
          text2: err.message || 'Mật khẩu hiện tại không đúng hoặc đã có lỗi xảy ra.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderInput = (
    placeholder: string,
    value: string,
    setter: (text: string) => void,
    isVisible: boolean,
    toggleVisibility: () => void,
    error?: string,
    errorKey?: keyof FormErrors
  ) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#61677D"
          value={value}
          onChangeText={(text) => {
            setter(text);
            if (error && errorKey) setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
          }}
          secureTextEntry={!isVisible}
          style={styles.textInput}
        />
        <TouchableOpacity onPress={toggleVisibility} style={styles.iconButton}>
          <Ionicons name={isVisible ? 'eye-outline' : 'eye-off-outline'} size={22} color="gray" />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header tùy chỉnh */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#14181B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thay Đổi Mật Khẩu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {renderInput(
          "Mật khẩu hiện tại",
          currentPassword,
          setCurrentPassword,
          isCurrentPasswordVisible,
          () => setIsCurrentPasswordVisible(!isCurrentPasswordVisible),
          errors.currentPassword,
          'currentPassword'
        )}

        {renderInput(
          "Mật khẩu mới",
          newPassword,
          setNewPassword,
          isNewPasswordVisible,
          () => setIsNewPasswordVisible(!isNewPasswordVisible),
          errors.newPassword,
          'newPassword'
        )}

        {renderInput(
          "Nhập lại mật khẩu mới",
          confirmPassword,
          setConfirmPassword,
          isConfirmPasswordVisible,
          () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible),
          errors.confirmPassword,
          'confirmPassword'
        )}
        
        <TouchableOpacity
          onPress={validateAndSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Xác Nhận</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sử dụng StyleSheet để code sạch và hiệu năng tốt hơn
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 16,
  },
  scrollContainer: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F9FE',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: 'red',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  iconButton: {
    padding: 12,
  },
  errorText: {
    color: 'red',
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#3461FD',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});