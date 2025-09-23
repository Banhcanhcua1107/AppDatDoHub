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
import { ROUTES } from "../../constants/routes";
// ------------------------------------
import { loginUser } from "../../services/authService";
import GoogleIconSVG from "../../assets/icons/GoogleIcon"; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { getUser } from "../../utils/authStorage";

// --- Định nghĩa kiểu (Types) ---
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const currentErrors: FormErrors = {};
    if (!email) { currentErrors.email = "Nhập Email is required"; }
    if (!password) { currentErrors.password = "Nhập Password is required"; }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

 const handleLogin = async () => {
  if (validateForm()) {
    try {
      const user = await loginUser(email, password);
      alert("Đăng nhập thành công: " + user.email);
      // TODO: chuyển sang màn hình chính (Tables/Orders)
    } catch (error: any) {
      alert("Lỗi đăng nhập: " + error.message);
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
              source={require("../../assets/images/auth-banner.png")}
              className="w-80 h-60"
              resizeMode="contain"
            />
          </View>

          {/* --- THAY THẾ KHỐI TEXT CŨ BẰNG ĐOẠN NÀY --- */}
          <MaskedView
            style={{ marginTop: 16 }} // NativeWind className không hoạt động tốt với MaskedView, nên dùng style
            maskElement={
              <Text className="text-4xl font-bold text-center">
                ĐĂNG NHẬP
              </Text>
            }
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
          {/* ------------------------------------------- */}

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
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="px-3 text-gray-500 font-medium">Hoặc</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <TextInput
              placeholder="Nhập Email"
              placeholderTextColor="#61677D"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
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
            <View className={`flex-row items-center rounded-xl bg-[#F5F9FE] border ${errors.password ? 'border-red-500' : 'border-transparent'}`}>
              <TextInput
                placeholder="Nhập Password"
                placeholderTextColor="#61677D"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
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
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-red-500 mt-1 ml-1">{errors.password}</Text>}
          </View>

          {/* Quên mật khẩu */}
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)} // <-- Dùng hằng số
            className="self-end mb-5"
          >
            <Text className="text-sm text-gray-500 font-medium">Quên Mật Khẩu?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-[#3461FD] rounded-xl py-4"
          >
            <Text className="text-center text-white font-bold text-lg">
              Đăng Nhập
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Bạn không có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="font-bold text-[#3461FD]">
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}