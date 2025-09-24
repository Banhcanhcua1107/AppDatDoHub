// services/authService.ts
import { supabase } from './supabase';

// --- Hàm cho luồng Đăng ký ---

export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Không thể tạo người dùng. Vui lòng thử lại.");
  
  return data.user;
};

export const verifyOtpForSignup = async (email: string, token: string) => {
  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'signup',
  });

  if (error) throw new Error(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
};

export const resendOtpForSignup = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) throw new Error(error.message || 'Không thể gửi lại OTP.');
};

// --- Hàm cho luồng Đăng nhập / Đăng xuất ---

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");

  return data.user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};


// --- Hàm cho luồng Quên Mật khẩu ---

export const sendPasswordResetOtp = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message || 'Không thể gửi email đặt lại mật khẩu.');
};

export const verifyPasswordResetOtp = async (email: string, token: string) => {
    // Sau khi xác minh, Supabase sẽ tạo một phiên mới cho người dùng
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
    });
    if (error) throw new Error(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    if (!data.session) throw new Error('Không thể tạo phiên làm việc mới.');

    return data.session;
};

export const updateUserPassword = async (password: string) => {
    // Hàm này yêu cầu người dùng phải đang trong một phiên làm việc (session)
    // Phiên này được tạo sau khi verifyPasswordResetOtp thành công
    const { data, error } = await supabase.auth.updateUser({ password: password });
    
    if (error) throw new Error(error.message || 'Không thể cập nhật mật khẩu.');
    return data.user;
};