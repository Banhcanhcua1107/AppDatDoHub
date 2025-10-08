// services/authService.ts
import { supabase } from './supabase';

// --- Hàm cho luồng Đăng ký ---

export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Không thể tạo người dùng. Vui lòng thử lại.');

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

export const loginUser = async (email: string, password: string): Promise<string> => { // Thay đổi kiểu trả về thành string
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    // Supabase thường trả về "Invalid login credentials" cho sai mật khẩu/email
    if (error.message === 'Invalid login credentials') {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    throw new Error(error.message);
  }
  
  // Lấy access_token từ session
  const token = data?.session?.access_token;

  if (!token) {
    // Trường hợp này hiếm, nhưng cần phòng ngừa
    throw new Error('Đăng nhập thành công nhưng không nhận được token xác thực.');
  }

  // Trả về chuỗi token thay vì đối tượng user
  return token;
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
    type: 'recovery',
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


export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  // Bước 1: Lấy email của người dùng đang đăng nhập từ session hiện tại
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    throw new Error('Không tìm thấy thông tin người dùng đang đăng nhập.');
  }
  const email = user.email;

  // Bước 2: Thử đăng nhập lại với mật khẩu hiện tại để xác thực.
  // Đây là bước kiểm tra bảo mật quan trọng nhất.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: currentPassword,
  });

  if (signInError) {
    // Nếu đăng nhập lại thất bại, có nghĩa là mật khẩu hiện tại không đúng.
    // Supabase thường trả về lỗi "Invalid login credentials".
    throw new Error('Mật khẩu hiện tại không chính xác.');
  }

  // Bước 3: Nếu xác thực thành công, tiến hành cập nhật mật khẩu mới.
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    // Nếu có lỗi trong quá trình cập nhật, ném lỗi ra ngoài.
    throw new Error(updateError.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
  }

  // Nếu không có lỗi nào xảy ra, hàm đã thực hiện thành công.
};