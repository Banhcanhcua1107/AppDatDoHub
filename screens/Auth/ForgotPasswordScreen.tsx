// ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList, ROUTES } from '../../constants/routes';
import { sendPasswordResetOtp } from '../../services/authService';

type ForgotPasswordProps = NativeStackScreenProps<
  AuthStackParamList,
  typeof ROUTES.FORGOT_PASSWORD
>;

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = async () => {
    setError(null);
    if (!email) {
      setError('Vui lòng nhập Email của bạn.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ Email không hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetOtp(email);
      Alert.alert(
        'Thành công',
        `Một mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`,
        [{ text: 'OK', onPress: () => navigation.navigate(ROUTES.OTP, { email }) }]
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-8 pt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-5 z-10 p-2"
          >
            <Ionicons name="arrow-back" size={32} color="#14181B" />
          </TouchableOpacity>

          <View className="flex-1 justify-center pb-8">
            <View className="items-center mb-2">
              <MaskedView
                maskElement={
                  <Text className="text-4xl font-bold text-center">Đặt lại mật khẩu</Text>
                }
              >
                <LinearGradient
                  colors={['#3461FD', '#2A4ECA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text className="text-4xl font-bold text-center" style={{ opacity: 0 }}>
                    Đặt lại mật khẩu
                  </Text>
                </LinearGradient>
              </MaskedView>
            </View>

            <Text className="text-center text-base text-[#61677D] mb-8">
              Nhập đúng email đã đăng ký để nhận mã OTP.
            </Text>

            <View className="mb-4">
              <TextInput
                placeholder="Nhập Email của bạn"
                placeholderTextColor="#61677D"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                className={`rounded-xl px-5 py-4 text-base bg-[#F5F9FE] text-gray-800 border ${error ? 'border-red-500' : 'border-transparent'}`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error && <Text className="text-red-500 mt-2 ml-1">{error}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleSendRequest}
              disabled={isLoading}
              className="bg-[#3461FD] rounded-xl py-4 mt-6 h-16 justify-center"
            >
              <Text className="text-center text-white font-bold text-lg">
                {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
