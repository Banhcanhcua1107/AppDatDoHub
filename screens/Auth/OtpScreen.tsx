import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    SafeAreaView, 
    TextInput, 
    Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Giả định bạn có một Stack Navigator như thế này
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Otp: { email: string };
  ResetPassword: { email: string };
};

type OtpProps = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export default function OtpScreen({ route, navigation }: OtpProps) {
  const { email } = route.params;
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động focus ô tiếp theo
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Tự động focus ô trước đó khi xóa
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  
  const handleConfirm = () => {
      const enteredOtp = otp.join('');
      if(enteredOtp.length < 6) {
          Alert.alert("Lỗi", "Vui lòng nhập đủ 6 chữ số OTP.");
          return;
      }

      // --- Logic Xác thực OTP ---
      // Trong ứng dụng thực tế, bạn sẽ gọi API để kiểm tra OTP
      // Ở đây, chúng ta giả lập mã OTP đúng là "123456"
      if (enteredOtp === "123456") {
          Alert.alert("Thành công", "Xác thực OTP thành công!", [
              { text: "OK", onPress: () => navigation.navigate("ResetPassword", { email }) }
          ]);
      } else {
          Alert.alert("Lỗi", "Mã OTP không chính xác. Vui lòng thử lại.");
      }
  };

  const handleResendOtp = () => {
      // Logic gửi lại OTP
      Alert.alert("Đã gửi lại", `Một mã OTP mới đã được gửi đến ${email}.`);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-4">
            {/* Nút Back */}
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="absolute top-20 left-5 z-10"
            >
                <Ionicons name="arrow-back" size={32} color="#14181B" />
            </TouchableOpacity>

            <View className="flex-1 justify-center items-center pb-8">
                <Text className="text-3xl font-bold text-[#2A4ECA] mb-2">Nhập OTP</Text>
                <Text className="text-center text-base text-[#61677D] mb-10 px-4">
                    Nhập mã OTP vừa được gửi cho bạn trên Email đã đăng ký của bạn
                </Text>

                {/* OTP Input Fields */}
                <View className="flex-row justify-between w-full mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => { inputs.current[index] = ref! }}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            className="w-12 h-14 bg-[#F5F9FE] rounded-xl text-center text-2xl font-bold text-gray-800 border border-gray-200"
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Confirm Button */}
                <TouchableOpacity 
                    onPress={handleConfirm}
                    className="w-full bg-[#3461FD] rounded-xl py-4"
                >
                    <Text className="text-center text-white font-bold text-lg">Xác nhận</Text>
                </TouchableOpacity>

                {/* Resend OTP */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600">Không nhận được OTP? </Text>
                    <TouchableOpacity onPress={handleResendOtp}>
                        <Text className="font-bold text-[#3461FD]">Gửi lại OTP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </SafeAreaView>
  );
}