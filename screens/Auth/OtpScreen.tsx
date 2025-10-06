// OtpScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList, ROUTES } from '../../constants/routes';
import { verifyPasswordResetOtp, sendPasswordResetOtp } from '../../services/authService';

type OtpProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.OTP>;

export default function OtpScreen({ route, navigation }: OtpProps) {
  const { email } = route.params;
  // --- THAY ĐỔI 1: Chuyển state OTP từ mảng sang chuỗi ---
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- THÊM MỚI: State và Ref giống như OtpScreenR ---
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputRef = useRef<TextInput>(null);

  // --- THÊM MỚI: useEffect để tự động focus ---
  useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => {
      otpInputRef.current?.focus();
    });
    return focusSubscription;
  }, [navigation]);

  // --- THÊM MỚI: useEffect cho bộ đếm gửi lại OTP ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleConfirm = async () => {
    Keyboard.dismiss();
    // --- THAY ĐỔI 2: Cập nhật logic kiểm tra OTP ---
    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Logic nghiệp vụ vẫn giữ nguyên
      await verifyPasswordResetOtp(email, otp);
      Alert.alert('Thành công', 'Xác thực OTP thành công! Vui lòng tạo mật khẩu mới.', [
        { text: 'OK', onPress: () => navigation.navigate(ROUTES.RESET_PASSWORD, { email }) },
      ]);
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      // Logic nghiệp vụ vẫn giữ nguyên
      await sendPasswordResetOtp(email);
      Alert.alert('Đã gửi lại', `Một mã OTP mới đã được gửi đến ${email}.`);
      // --- THÊM MỚI: Bật lại bộ đếm ---
      setResendCooldown(60);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể gửi lại OTP.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- THAY ĐỔI 3: Cập nhật toàn bộ JSX để giống hệt OtpScreenR --- */}
      <View className="absolute top-12 left-5 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={32} color="#1F2937" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center px-8 pb-8">
        <Text className="text-4xl font-bold text-center" style={{ color: '#2A4ECA' }}>
          Nhập OTP
        </Text>
        <Text className="text-center text-base mt-4 mb-8 leading-6" style={{ color: '#61677D' }}>
          Nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn để đặt lại mật khẩu.
        </Text>
        <TextInput
          ref={otpInputRef}
          value={otp}
          onChangeText={(text) => {
            setOtp(text.replace(/[^0-9]/g, ''));
            if (error) setError(null);
          }}
          placeholder="------"
          placeholderTextColor="#D1D5DB"
          keyboardType="number-pad"
          maxLength={6}
          className={`rounded-xl px-5 py-4 text-center text-3xl bg-[#F5F9FE] text-gray-800 border-2 ${error ? 'border-red-500' : 'border-transparent'} focus:border-[#3461FD]`}
          style={{ letterSpacing: Platform.OS === 'ios' ? 12 : 8 }}
          autoFocus={true}
        />
        {error && <Text className="text-red-500 mt-2 text-center">{error}</Text>}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isLoading}
          className="bg-[#3461FD] rounded-xl py-4 mt-8 items-center justify-center h-16"
        >
          <Text className="text-center text-white font-bold text-lg">
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-base" style={{ color: '#7C8BA0' }}>
            Không nhận được mã?
          </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendCooldown > 0}
            className="ml-1"
          >
            <Text
              className={`text-base font-bold ${resendCooldown > 0 ? 'text-gray-400' : ''}`}
              style={resendCooldown === 0 ? { color: '#3461FD' } : {}}
            >
              {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : 'Gửi lại mã'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
