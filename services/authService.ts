// services/authService.ts
import { supabase } from './supabase';

// Hàm đăng ký người dùng
// THÊM :string vào sau mỗi tham số
export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    return data.user;
  }
  
  throw new Error("Đăng ký thành công, vui lòng kiểm tra email để xác thực.");
};

export const verifyOtp = async (email: string, token: string): Promise<void> => {
  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'signup', // Quan trọng: chỉ rõ đây là OTP để đăng ký
  });

  if (error) {
    // Ném ra lỗi để màn hình có thể bắt và hiển thị
    throw new Error(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
  }
  // Nếu không có lỗi, tức là xác thực thành công
};

export const resendOtp = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: 'signup', // Quan trọng: chỉ rõ đây là OTP để đăng ký
    email: email,
  });

  if (error) {
    throw error;
  }
};
// Hàm đăng nhập người dùng
// THÊM :string vào sau mỗi tham số
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

// (Tùy chọn) Hàm đăng xuất
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};