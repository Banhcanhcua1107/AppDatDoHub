import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Giả định bạn có một Stack Navigator như thế này
type AuthStackParamList = {
    Login: undefined;
    //... các màn hình khác
    ResetSuccess: undefined;
};

type ResetSuccessProps = NativeStackScreenProps<AuthStackParamList, 'ResetSuccess'>;

export default function ResetSuccessScreen({ navigation }: ResetSuccessProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        {/* Success Icon */}
        <View className="w-24 h-24 bg-green-100 rounded-full justify-center items-center mb-8">
            <Ionicons name="checkmark-done-circle" size={60} color="#22C55E" />
        </View>
        
        {/* Title */}
        <Text className="text-3xl font-bold text-center text-[#2A4ECA] mb-2">
            Thành Công!
        </Text>

        {/* Subtitle */}
        <Text className="text-center text-base text-[#61677D] mb-12">
            Bạn đã đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
        </Text>

        {/* Back to Login Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="w-full bg-[#3461FD] rounded-xl py-4"
        >
          <Text className="text-center text-white font-bold text-lg">
            Về Trang Đăng Nhập
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}