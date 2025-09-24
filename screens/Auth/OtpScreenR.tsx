// OtpScreenR.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  Keyboard,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthStackParamList, ROUTES } from '../../constants/routes';
import { verifyOtpForSignup, resendOtpForSignup } from '../../services/authService';

type OtpScreenRProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.OTP_REGISTER>;

export default function OtpScreenR({ route, navigation }: OtpScreenRProps) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => {
      otpInputRef.current?.focus();
    });
    return focusSubscription;
  }, [navigation]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await verifyOtpForSignup(email, otp);
      Alert.alert(
        "Xác thực thành công!",
        "Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.",
        [{ text: "OK", onPress: () => navigation.navigate(ROUTES.LOGIN) }]
      );
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await resendOtpForSignup(email);
      Alert.alert("Thành công", "Một mã OTP mới đã được gửi đến email của bạn.");
      setResendCooldown(60);
    } catch (err: any)
      {
      Alert.alert("Lỗi", err.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute top-12 left-5 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={32} color="#1F2937" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center px-8 pb-8">
        <Text className="text-4xl font-bold text-center" style={{ color: '#2A4ECA' }}>
          Xác thực Email
        </Text>
        <Text className="text-center text-base mt-4 mb-8 leading-6" style={{ color: '#61677D' }}>
          Nhập mã OTP gồm 6 chữ số đã được gửi đến địa chỉ email của bạn.
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
          onPress={handleVerifyOtp} 
          disabled={isLoading}
          className="bg-[#3461FD] rounded-xl py-4 mt-8 items-center justify-center h-16"
        >
          <Text className="text-center text-white font-bold text-lg">
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
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