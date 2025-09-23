import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";

// --- CÁC DÒNG IMPORT QUAN TRỌNG ---
import { Ionicons } from "@expo/vector-icons";
import MaskedView from '@react-native-masked-view/masked-view';

import { LinearGradient } from 'expo-linear-gradient';

// ------------------------------------

import GoogleIconSVG from "../../assets/icons/GoogleIcon"; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// import { saveUser } from "../../utils/authStorage";

import { registerUser } from "../../services/authService";
// --- Định nghĩa kiểu (Types) ---
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
// Sử dụng props cho màn hình Register
type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>; 
type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string; // Thêm trường lỗi cho xác nhận mật khẩu
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Thêm state cho xác nhận mật khẩu

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false); // Thêm state ẩn/hiện

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const currentErrors: FormErrors = {};

    // Validate Email
    if (!email) {
      currentErrors.email = "Vui lòng nhập Email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      currentErrors.email = "Địa chỉ Email không hợp lệ";
    }

    // Validate Password
    if (!password) {
      currentErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      currentErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      currentErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (password !== confirmPassword) {
      currentErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleRegister = async () => {
  if (validateForm()) {
    try {
      const user = await registerUser(email, password);
      alert("Đăng ký thành công: " + user.email);
      navigation.navigate("Login");
    } catch (error: any) {
      alert("Lỗi đăng ký: " + error.message);
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
              source={require("../../assets/images/auth-banner.png")} // Cập nhật đường dẫn
              className="w-80 h-52" // Giảm chiều cao banner một chút
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          {/* --- THAY THẾ KHỐI TEXT CŨ BẰNG ĐOẠN NÀY --- */}
                    <MaskedView
                      style={{ marginTop: 16 }} // NativeWind className không hoạt động tốt với MaskedView, nên dùng style
                      maskElement={
                        <Text className="text-4xl font-bold text-center">
                          ĐĂNG KÝ
                        </Text>
                      }
                    >
                      <LinearGradient
                        colors={['#3461FD', '#2A4ECA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text className="text-3xl font-bold text-center" style={{ opacity: 0 }}>
                          ĐĂNG KÝ
                        </Text>
                      </LinearGradient>
                    </MaskedView>

          {/* Social Buttons */}
          <View className="flex-row justify-between mt-8 gap-x-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl py-3 bg-[#F5F9FE]">
              <Ionicons name="logo-facebook" size={34} color="#3461FD" />
              <Text className="ml-2 text-lg font-semibold text-[#61677D]">Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl py-3 bg-[#F5F9FE]">
              <GoogleIconSVG size={28} />
              <Text className="ml-2 text-lg font-semibold text-[#61677D]">Google</Text>
            </TouchableOpacity>
          </View>


          {/* Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="px-3 text-gray-500 font-medium">Hoặc</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* --- FORM ĐĂNG KÝ --- */}
          {/* Email Input */}
          <View className="mb-4">
            <TextInput
              placeholder="Nhập Email"
              placeholderTextColor="#61677D"
              value={email}
              onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
              className={`rounded-xl px-5 py-4 text-base bg-[#F5F9FE] text-gray-800 border ${errors.email ? 'border-red-500' : 'border-transparent'}`}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text className="text-red-500 mt-1 ml-1">{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <View className={`flex-row items-center rounded-xl bg-[#F5F9FE] border ${errors.password ? 'border-red-500' : 'border-transparent'}`}>
              <TextInput
                placeholder="Nhập Mật khẩu"
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
                placeholder="Nhập lại Mật khẩu"
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
          <TouchableOpacity onPress={handleRegister} className="bg-[#3461FD] rounded-xl py-4">
            <Text className="text-center text-white font-bold text-lg">Đăng Ký</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Bạn đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="font-bold text-[#3461FD]">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}