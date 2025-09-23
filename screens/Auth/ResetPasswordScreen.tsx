import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Giả định bạn có một Stack Navigator như thế này
type AuthStackParamList = {
    //... các màn hình khác
    ResetPassword: { email: string };
    ResetSuccess: undefined;
};

type ResetPasswordProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: ResetPasswordProps) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ password?: string, confirmPassword?: string }>({});

  const validateAndSubmit = () => {
    const currentErrors: { password?: string, confirmPassword?: string } = {};
    if (!password) {
      currentErrors.password = 'Vui lòng nhập mật khẩu mới.';
    } else if (password.length < 6) {
      currentErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (!confirmPassword) {
      currentErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (password !== confirmPassword) {
      currentErrors.confirmPassword = 'Mật khẩu không khớp.';
    }

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      // --- Logic Cập nhật mật khẩu ---
      // Gọi API để cập nhật mật khẩu cho user với `email`
      console.log(`Cập nhật mật khẩu mới cho ${email}: ${password}`);
      navigation.navigate('ResetSuccess');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-8 pt-4">
           <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-5 z-10">
              <Ionicons name="arrow-back" size={32} color="#14181B" />
           </TouchableOpacity>

           <View className="flex-1 justify-center pb-8">
                <Text className="text-3xl font-bold text-center text-[#2A4ECA] mb-2">Tạo Mật Khẩu Mới</Text>
                <Text className="text-center text-base text-[#61677D] mb-10">
                    Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đây.
                </Text>

                {/* Password Input */}
                <View className="mb-4">
                    <View className={`flex-row items-center rounded-xl bg-[#F5F9FE] border ${errors.password ? 'border-red-500' : 'border-transparent'}`}>
                    <TextInput
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor="#61677D"
                        value={password}
                        onChangeText={(text) => { setPassword(text); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                        secureTextEntry={!isPasswordVisible}
                        className="flex-1 px-5 py-4 text-base text-gray-800"
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-3">
                        <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color="gray" />
                    </TouchableOpacity>
                    </View>
                    {errors.password && <Text className="text-red-500 mt-1 ml-1">{errors.password}</Text>}
                </View>

                {/* Confirm Password Input */}
                <View className="mb-6">
                    <View className={`flex-row items-center rounded-xl bg-[#F5F9FE] border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'}`}>
                    <TextInput
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor="#61677D"
                        value={confirmPassword}
                        onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                        secureTextEntry={!isConfirmPasswordVisible}
                        className="flex-1 px-5 py-4 text-base text-gray-800"
                    />
                    <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="p-3">
                        <Ionicons name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color="gray" />
                    </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text className="text-red-500 mt-1 ml-1">{errors.confirmPassword}</Text>}
                </View>
                
                {/* Submit Button */}
                <TouchableOpacity onPress={validateAndSubmit} className="bg-[#3461FD] rounded-xl py-4 mt-4">
                    <Text className="text-center text-white font-bold text-lg">Đặt Lại Mật Khẩu</Text>
                </TouchableOpacity>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}