// SETUP_ADMIN_ACCOUNT.md - Hướng Dẫn Setup Tài Khoản Admin

# 🔐 Setup Tài Khoản Admin trên Supabase

## 📋 Bước 1: Tạo Tài Khoản Admin qua Supabase Console

### 1.1 Đăng nhập Supabase Dashboard
```
1. Truy cập: https://app.supabase.com/
2. Chọn project của bạn
3. Vào "Authentication" → "Users"
```

### 1.2 Tạo User Mới
```
1. Nhấn "Invite user" hoặc "Create user"
2. Điền thông tin:
   - Email:    admin@restaurant.com
   - Password: admin123456
3. Nhấn "Send invite" hoặc "Create user"
```

---

## 📋 Bước 2: Thêm Profile cho Admin

Sau khi tạo user, bạn cần thêm record trong bảng `profiles`:

### 2.1 Vào Table Editor
```
1. Vào "SQL Editor" hoặc "Table Editor"
2. Chọn bảng "profiles"
3. Nhấn "Insert row"
```

### 2.2 Điền Thông Tin Admin
```
Để thêm admin, chạy SQL query này:

INSERT INTO profiles (id, full_name, email, phone, role, status, join_date)
VALUES (
  '<ADMIN_USER_ID>', 
  'Admin User',
  'admin@restaurant.com',
  '0123456789',
  'admin',
  'active',
  NOW()
);
```

**Lưu ý**: Thay `<ADMIN_USER_ID>` bằng UUID của user vừa tạo (xem trong Users list)

### 2.3 Hoặc Thêm via Table Editor
```
1. Nhấn "+ Insert row"
2. Điền các trường:
   - id: [Copy từ User ID]
   - full_name: Admin User
   - email: admin@restaurant.com
   - phone: 0123456789
   - role: admin ← Quan trọng!
   - status: active
   - join_date: [Auto]
```

---

## 📋 Bước 3: Kiểm Tra RLS Policies (Quan Trọng!)

Admin cần quyền đọc/ghi tất cả dữ liệu. Kiểm tra RLS policies:

### 3.1 Vào Security → Policies
```
1. Chọn bảng "profiles"
2. Kiểm tra xem có policy nào giới hạn không
3. Nếu cần, tạo policy cho admin:
```

### 3.2 SQL để Tạo Policy cho Admin
```sql
-- Policy: Admin có thể đọc tất cả profiles
CREATE POLICY "Allow admin to read all profiles"
ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy: Admin có thể cập nhật tất cả profiles
CREATE POLICY "Allow admin to update all profiles"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy: Admin có thể xóa profiles
CREATE POLICY "Allow admin to delete profiles"
ON profiles
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

---

## 🔄 Bước 4: Test Đăng Nhập

### 4.1 Trên App
```
1. Chạy ứng dụng
2. Màn hình Login
3. Điền:
   - Email:    admin@restaurant.com
   - Password: admin123456
4. Nhấn "Đăng nhập"
```

### 4.2 Kiểm Tra Kết Quả
```
✅ Nếu thành công:
   - Sẽ thấy 5 tabs Admin ở bottom navigation
   - 🏠 | 🍽️ | 📋 | 👥 | 📊

❌ Nếu thất bại:
   - Kiểm tra email/password đúng chưa
   - Kiểm tra role = 'admin' trong profiles
   - Kiểm tra RLS policies
```

---

## 🔍 Cách Tìm Admin User ID trên Supabase

### Cách 1: Via Supabase Dashboard
```
1. Vào Authentication → Users
2. Tìm email "admin@restaurant.com"
3. Copy ID (UUID) của user
4. Sử dụng ID này để thêm vào profiles table
```

### Cách 2: Via SQL
```sql
SELECT id, email FROM auth.users 
WHERE email = 'admin@restaurant.com';
```

---

## 🛠️ Troubleshooting

### Problem: Đăng nhập không được
**Solution**:
1. Kiểm tra email/password đúng chưa
2. Kiểm tra user đã verified email chưa
3. Kiểm tra role trong profiles table = 'admin'

### Problem: Đăng nhập được nhưng không thấy Admin Tab
**Solution**:
1. Kiểm tra `RootNavigator.tsx` có import AdminTabs không
2. Kiểm tra AuthContext lưu role chính xác không
3. Restart app

### Problem: Không thể thêm profile
**Solution**:
1. Kiểm tra RLS policies đã tắt hoặc allow insert không
2. Kiểm tra ID đúng chưa
3. Kiểm tra role field tồn tại không

---

## 📊 SQL Script Hoàn Chỉnh (Copy-Paste Sẵn)

Nếu bạn đã có user ID, chạy script này:

```sql
-- Bước 1: Thêm profile cho admin
INSERT INTO public.profiles (
  id, 
  full_name, 
  email, 
  phone, 
  role, 
  status, 
  join_date
)
VALUES (
  'YOUR_ADMIN_USER_ID_HERE',  -- ← Thay bằng ID từ auth.users
  'Admin Manager',
  'admin@restaurant.com',
  '0123456789',
  'admin',
  'active',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active';

-- Bước 2: Kiểm tra đã thêm thành công
SELECT id, full_name, email, role FROM profiles 
WHERE role = 'admin';
```

---

## ✅ Verification Checklist

- [ ] User "admin@restaurant.com" tồn tại trong Authentication
- [ ] Profile record có role = 'admin'
- [ ] Email đã verified
- [ ] RLS policies cho phép admin đọc/ghi
- [ ] Có thể đăng nhập bằng app
- [ ] Thấy 5 Admin tabs sau khi đăng nhập
- [ ] Tất cả tính năng Admin hoạt động

---

## 🎯 Quick Setup (5 Phút)

**Nếu bạn muốn setup nhanh nhất:**

1. Vào Supabase Dashboard → Users
2. Create user: `admin@restaurant.com` / `admin123456`
3. Copy user ID
4. Vào SQL Editor, chạy:
   ```sql
   INSERT INTO profiles (id, full_name, email, phone, role, status)
   VALUES ('<PASTE_ID_HERE>', 'Admin', 'admin@restaurant.com', '0123456789', 'admin', 'active');
   ```
5. Test đăng nhập trên app

---

## 📱 Alternative: Dùng AuthService

Nếu bạn muốn tạo admin qua code, xem file:
`services/authService.ts`

Có thể thêm function:
```typescript
async function createAdmin(email: string, password: string, fullName: string) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw authError;

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      role: 'admin',
      status: 'active',
    });

  if (profileError) throw profileError;
  
  return authData.user;
}
```

---

## 🎓 Reference

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **User Management**: https://supabase.com/docs/reference/javascript/auth-admin-createuser

---

**Chúc bạn setup thành công! 🚀**

Nếu gặp vấn đề, hãy kiểm tra console app để xem error messages chi tiết.
