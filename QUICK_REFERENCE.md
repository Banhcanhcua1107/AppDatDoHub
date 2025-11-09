# ⚡ Quick Reference - AdminMenuScreen

## ✅ What's New

| # | Tính Năng | Trạng Thái | Chi Tiết |
|---|----------|-----------|---------|
| 1 | Sản phẩm mới ở đầu danh sách | ✅ Xong | Sắp xếp theo `created_at DESC` |
| 2 | Upload ảnh trong modal | ✅ Xong | Thư viện + Camera |
| 3 | Tích hợp Cloudinary | ✅ Xong | Tự động upload + lấy URL |
| 4 | Lưu URL vào database | ✅ Xong | Column `image_url` trong Supabase |

## 🚀 Khởi Động (5 Phút)

### Step 1: Cài Đặt Package ✅ (Đã làm)
```bash
npm install expo-image-picker
```

### Step 2: SQL Migration ⏳ (Bạn cần làm)
```sql
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

**Nơi chạy:** Supabase SQL Editor

**File:** `ADD_IMAGE_COLUMN.sql`

### Step 3: Restart Ứng Dụng ⏳ (Bạn cần làm)
```bash
npm start
```

## 📱 Sử Dụng

### Thêm Sản Phẩm
1. 🔵 Bấp **[+]** ở góc dưới phải
2. 📸 Chọn ảnh (Thư viện hoặc Camera)
3. 📝 Nhập: Tên, Giá, Danh mục
4. 💾 Bấp **Lưu**
5. ✅ Sản phẩm hiển thị ở đầu danh sách

### Sửa Sản Phẩm
1. ✏️ Bấp nút **Sửa** trên sản phẩm
2. 📸 (Tùy chọn) Thay đổi ảnh
3. 💾 Bấp **Lưu**

### Ẩn/Hiện
- 👁️ Toggle ON = Đang bán
- 👁️ Toggle OFF = Đã ẩn

## 🎨 Giao Diện

**Modal Dialog:**
```
┌─ HÌNH ẢNH (180×180) ─────────────┐
│  [Chọn ảnh] [Chụp ảnh]           │
├──────────────────────────────────┤
│ Tên: _____________ Giá: _______ │
│ Danh mục: [Dropdown] │ Mô tả: __ │
├──────────────────────────────────┤
│              [Hủy]  [💾 Lưu]     │
└──────────────────────────────────┘
```

**List Item:**
```
┌────────────────────────────────────┐
│ ● Tên Sản Phẩm    [✏️] [👁️]        │
│   Danh mục • 25.000đ               │
└────────────────────────────────────┘
```

## 💻 Code Changes

### Import (line 25)
```tsx
import * as ImagePicker from 'expo-image-picker';
```

### Interface (line 35)
```tsx
image_url?: string;
```

### Key Functions
```tsx
uploadImageToCloudinary(imageUri: string): Promise<string>
pickImage(): Promise<void>
takePhoto(): Promise<void>
```

### Sorting (line 260)
```tsx
.order('created_at', { ascending: false })  // ← Mới nhất đầu tiên
```

### Save (line 275)
```tsx
dataToSave.image_url = data.image_url;
```

## 🗄️ Database

### SQL Migration
```sql
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### Column Info
- **Name:** `image_url`
- **Type:** TEXT
- **Nullable:** YES
- **Example:** `https://res.cloudinary.com/dp0th1tjn/image/upload/...`

## ☁️ Cloudinary

**Config (từ .env):**
```
CLOUDINARY_NAME: dp0th1tjn
Upload URL: https://api.cloudinary.com/v1_1/dp0th1tjn/image/upload
Preset: ml_default
```

**Upload Process:**
```
Ảnh từ phone 
→ Gửi tới Cloudinary 
→ Nhận secure_url 
→ Lưu vào Supabase
```

## 🛡️ Error Handling

| Lỗi | Xử Lý |
|-----|-------|
| Upload fail | Alert: "Lỗi Upload" |
| No image selected | Skip upload, save form only |
| Validation fail | Alert: "Thiếu thông tin" |
| DB save fail | Alert: "Không thể lưu món" |

## ✅ Testing

- [ ] New item at top?
- [ ] Image preview works?
- [ ] Upload to Cloudinary?
- [ ] URL saved in Supabase?
- [ ] Link accessible?

## 📞 Troubleshoot

| Vấn Đề | Giải Pháp |
|--------|----------|
| Module not found | `npm install expo-image-picker` |
| Image upload fails | Check internet, check Cloudinary |
| image_url not saved | Run SQL migration |
| App crashes | Restart: `npm start` |

## 📁 Files

| File | Loại | Mục Đích |
|------|------|---------|
| `AdminMenuScreen.tsx` | Source | Main component (sửa lớn) |
| `ADD_IMAGE_COLUMN.sql` | SQL | Database migration |
| `ADMIN_MENU_SUMMARY.md` | Doc | Chi tiết hoàn chỉnh |
| `VISUAL_GUIDE.md` | Doc | Sơ đồ & diagram |
| `INSTALLATION_GUIDE.md` | Doc | Hướng dẫn cài đặt |

## 🔑 Key Imports

```tsx
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
```

## 🎯 Success Metrics

✅ Sản phẩm mới ở đầu danh sách
✅ Có thể upload ảnh
✅ Ảnh tự động upload lên Cloudinary
✅ URL lưu vào database
✅ Không có error

## 💡 Pro Tips

1. **Ảnh 1:1** (square) → UI đẹp nhất
2. **Quality 0.7** → Nhanh, nhẹ nhàng
3. **Retry logic** → Nếu fail, user bấp lại "Lưu"
4. **Cloudinary free tier** → Đủ dùng

## 🆘 Need Help?

1. Kiểm tra Console Log
2. Xem Supabase Dashboard
3. Xem Cloudinary Media Library
4. Đọc chi tiết: `ADMIN_MENU_SUMMARY.md`

---

**Status: ✅ Hoàn Thành** 🎉

**Last Updated:** 2025-11-08
**Created by:** GitHub Copilot ✨
