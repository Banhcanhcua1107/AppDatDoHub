import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

// --- CÁC DÒNG IMPORT QUAN TRỌNG ---
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList, ROUTES } from '../../constants/routes';
import { loginUser } from '../../services/authService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { useNetwork } from '../../context/NetworkContext';
// --- Định nghĩa kiểu (Types) ---
type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { isOnline } = useNetwork();
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const currentErrors: FormErrors = {};
    if (!email) {
      currentErrors.email = 'Nhập Email is required';
    }
    if (!password) {
      currentErrors.password = 'Nhập Password is required';
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleLogin = async () => {
        if (!isOnline) {
            Toast.show({ type: 'error', text1: 'Không có kết nối mạng' });
            return;
        }
        if (validateForm()) {
          try {
            // [THAY ĐỔI LỚN] loginUser bây giờ trả về một object
            const loginData = await loginUser(email, password);

            // console.log("DỮ LIỆU ĐĂNG NHẬP NHẬN ĐƯỢC:", JSON.stringify(loginData, null, 2));

            // Truyền toàn bộ object { session, userProfile } vào hàm login của context
            login(loginData); 

            Toast.show({
              type: 'success',
              text1: 'Đăng nhập thành công',
              text2: 'Chào mừng trở lại!',
            });

            // Sau khi login thành công, AppNavigator sẽ tự động chuyển màn hình
            // dựa trên vai trò, bạn không cần gọi navigation.navigate ở đây.

          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'Đăng nhập thất bại',
              text2: error.message || 'Đã có lỗi xảy ra.',
              position: 'top',
            });
          }
        }
      };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 pb-8">
          {/* Banner */}
          <View className="items-center">
            <Image
              source={require('../../assets/images/auth-banner.png')}
              className="w-80 h-60"
              resizeMode="contain"
            />
          </View>

          {/* Tiêu đề */}
          <MaskedView
            style={{ marginTop: 16 }}
            maskElement={<Text className="text-4xl font-bold text-center">ĐĂNG NHẬP</Text>}
          >
            <LinearGradient
              colors={['#3461FD', '#2A4ECA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-3xl font-bold text-center" style={{ opacity: 0 }}>
                ĐĂNG NHẬP
              </Text>
            </LinearGradient>
          </MaskedView>

          {/* Form Inputs - Tăng khoảng cách trên sau khi xóa social login */}
          <View className="mt-12">
            {/* Email Input */}
            <View className="mb-4">
              <TextInput
                placeholder="Nhập Email"
                placeholderTextColor="#61677D"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`rounded-xl px-5 py-4 text-base bg-[#F5F9FE] text-gray-800 border ${errors.email ? 'border-red-500' : 'border-transparent'}`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text className="text-red-500 mt-1 ml-1">{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <View
                className={`flex-row items-center rounded-xl bg-[#F5F9FE] border ${errors.password ? 'border-red-500' : 'border-transparent'}`}
              >
                <TextInput
                  placeholder="Nhập Password"
                  placeholderTextColor="#61677D"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  secureTextEntry={!isPasswordVisible}
                  className="flex-1 px-5 py-4 text-base text-gray-800"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="p-3"
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 mt-1 ml-1">{errors.password}</Text>}
            </View>
          </View>

          {/* Quên mật khẩu */}
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            className="self-end mb-5"
          >
            <Text className="text-sm text-gray-500 font-medium">Quên Mật Khẩu?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleLogin} className="bg-[#3461FD] rounded-xl py-4">
            <Text className="text-center text-white font-bold text-lg">Đăng Nhập</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Bạn không có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="font-bold text-[#3461FD]">Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
