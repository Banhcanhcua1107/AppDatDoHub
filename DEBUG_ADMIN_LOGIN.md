# Debug Admin Login

## Bước 1: Kiểm tra Admin User có tồn tại trong Supabase Authentication không?

Vào **Supabase Dashboard → Authentication → Users**

**Tìm kiếm:** `admin@admin.com.vn`

- ✅ Nếu thấy → Ghi lại **User ID** (UUID)
- ❌ Nếu không thấy → **PHẢI TẠO MỚI**

---

## Bước 2: Nếu chưa có, tạo admin user

1. Vào **Authentication → Users** → **Create user** (nút trên cùng)
2. Nhập:
   - Email: `admin@admin.com.vn`
   - Password: `admin123456`
   - Confirm Password: `admin123456`
3. **Bỏ chọn "Auto confirm user"** (để cho user confirm email)
4. Click **Create user**
5. **Ghi lại User ID** (UUID dài)

---

## Bước 3: Tạo Profile cho Admin

Vào **SQL Editor** → **New Query** → Copy-paste SQL này:

```sql
-- Tìm admin user UUID
SELECT id, email FROM auth.users WHERE email = 'admin@admin.com.vn';
```

**Ghi lại UUID**, rồi chạy SQL này:

```sql
-- Thêm admin vào profiles với UUID
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
  'PASTE_UUID_HERE',  -- ← Dán UUID từ auth.users
  'Admin Manager',
  'admin@admin.com.vn',
  'admin'
);
```

---

## Bước 4: Kiểm tra Profile đã được tạo

```sql
SELECT id, email, role FROM public.profiles WHERE email = 'admin@admin.com.vn';
```

Kết quả phải hiển thị:
- id: (UUID)
- email: admin@admin.com.vn
- role: admin

---

## Bước 5: Test Đăng Nhập Lại

1. Logout từ app
2. Đăng nhập lại với:
   - Email: `admin@admin.com.vn`
   - Password: `admin123456`
3. Kiểm tra Toast notification hiển thị gì:
   - ✅ "Đăng nhập thành công - Role: admin" → OK!
   - ❌ "Email hoặc mật khẩu không chính xác" → Auth fail
   - ❌ "Đăng nhập thành công - Role: undefined" → Profile fail

---

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|---------|
| Email hoặc mật khẩu không chính xác | Admin user chưa tạo hoặc sai password | Tạo/kiểm tra lại admin user |
| Đăng nhập OK, Role: undefined | Profile chưa được tạo | Chạy SQL thêm profile |
| Đăng nhập OK, Role: nhan_vien | Profile có nhưng role sai | Chạy SQL UPDATE role='admin' |
| Thấy 5 tab Admin nhưng không hiển thị gì | AdminTabs bug | Kiểm tra console logs |

---

## Quick Fix - Copy-Paste Toàn Bộ SQL

```sql
-- 1. Tìm UUID
SELECT id FROM auth.users WHERE email = 'admin@admin.com.vn';

-- 2. Copy UUID rồi thay vào đây:
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
  'YOUR_UUID_HERE',
  'Admin Manager',
  'admin@admin.com.vn',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. Kiểm tra
SELECT * FROM public.profiles WHERE email = 'admin@admin.com.vn';
```

---

## Lỗi Thường Gặp

### ❌ "column "phone" of relation "profiles" does not exist"
**Giải pháp:** Xóa cột phone khỏi SQL (đã sửa trong ADMIN_SETUP.sql)

### ❌ "duplicate key value violates unique constraint"
**Giải pháp:** Sử dụng `ON CONFLICT (id) DO UPDATE SET` thay vì INSERT

### ❌ "relation "public.profiles" does not exist"
**Giải pháp:** Kiểm tra lại tên bảng, phải là `public.profiles`

