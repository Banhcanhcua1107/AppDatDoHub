# 📸 Cải Tiến AdminMenuScreen - Hướng Dẫn Hoàn Chỉnh

## ✅ Các Tính Năng Đã Thêm

### 1. **Sản Phẩm Mới Hiển Thị Ở Đầu Danh Sách**
- Đổi sắp xếp từ `order('name', { ascending: true })` → `order('created_at', { ascending: false })`
- Khi thêm sản phẩm mới, nó sẽ hiển thị ở vị trí đầu tiên

### 2. **Upload Hình Ảnh trong Modal**
Khi bấm "+ Thêm món" hoặc "✏️ Sửa", bạn sẽ thấy:
```
┌─────────────────────────────────────┐
│      HÌNH ẢNH SẢN PHẨM              │
│                                     │
│  [Chọn từ thư viện] [Chụp ảnh]     │
└─────────────────────────────────────┘
```

**Tính năng:**
- ✅ Chọn ảnh từ thư viện (photo gallery)
- ✅ Chụp ảnh trực tiếp từ camera
- ✅ Xem trước (preview) ảnh đã chọn
- ✅ Hỗ trợ chỉnh sửa tỷ lệ (aspect ratio 1:1)

### 3. **Upload Ảnh Lên Cloudinary - Tự Động Lấy Link**
**Quy trình hoạt động:**

```
User chọn ảnh 📸
        ↓
Ấn nút "Lưu" ✅
        ↓
Hệ thống upload ảnh → Cloudinary 🌐
        ↓
Lấy link secure_url từ Cloudinary
        ↓
Lưu link vào Supabase (image_url)
        ↓
Hoàn thành! ✨
```

**Cách hoạt động:**
1. Khi user chọn ảnh và bấm "Lưu"
2. Hàm `uploadImageToCloudinary()` sẽ:
   - Tạo FormData chứa ảnh
   - Gửi tới Cloudinary API (unsigned upload)
   - Nhận lại `secure_url` (link công khai)
   - Trả link về để lưu vào database

## 🔧 Cấu Hình Cloudinary

**Thông tin từ .env:**
```
CLOUDINARY_NAME=dp0th1tjn
CLOUDINARY_API_KEY=634696531211488
CLOUDINARY_API_SECRET=k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ
```

**URL upload (đã cấu hình sẵn):**
```
https://api.cloudinary.com/v1_1/dp0th1tjn/image/upload
```

**Preset upload:** `ml_default` (unsigned - không cần auth)

## 🗄️ Database Setup

### 1. **Chạy Migration SQL**

Mở Supabase SQL Editor và chạy file: `ADD_IMAGE_COLUMN.sql`

```sql
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 2. **Verify Column Đã Được Thêm**

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='menu_items';
```

Kết quả sẽ hiển thị `image_url` dưới dạng `text` column.

## 📱 Cách Sử Dụng

### **Thêm Sản Phẩm Mới:**
1. Bấm nút "+" (FAB button) ở góc dưới phải
2. Modal mở lên → Bấp "Chọn từ thư viện" hoặc "Chụp ảnh"
3. Chọn/chụp ảnh → Nhập thông tin (Tên, Giá, Danh mục...)
4. Bấp "Lưu" → Hệ thống upload ảnh → Lưu vào database
5. ✅ Sản phẩm mới hiển thị ở đầu danh sách

### **Sửa Sản Phẩm:**
1. Bấm icon ✏️ trên sản phẩm
2. Modal mở lên với dữ liệu cũ
3. Có thể thay đổi ảnh bằng cách chọn ảnh mới
4. Bấp "Lưu" → Cập nhật (bao gồm ảnh nếu có)

### **Ẩn/Hiện Sản Phẩm:**
- Dùng toggle switch bên phải mỗi sản phẩm
- Toggle ON = Hiển thị (đang bán)
- Toggle OFF = Ẩn

## 🔍 File Đã Sửa Đổi

### `screens/Admin/AdminMenuScreen.tsx`

**Thay đổi chính:**
```tsx
// 1. Import expo-image-picker
import * as ImagePicker from 'expo-image-picker';

// 2. Thêm image_url vào MenuItem interface
interface MenuItem {
  image_url?: string;  // ← Mới
}

// 3. MenuItemModal: Thêm upload functionality
- const [selectedImage, setSelectedImage] = useState<string | null>(null);
- const [uploading, setUploading] = useState(false);
- uploadImageToCloudinary(imageUri): Promise<string> // Hàm upload
- pickImage(): Async function
- takePhoto(): Async function

// 4. fetchData: Sắp xếp theo ngày mới nhất
order('created_at', { ascending: false })  // ← Thay đổi từ 'name'

// 5. handleSaveItem: Lưu image_url
dataToSave.image_url = data.image_url;
```

## 🛡️ Error Handling

**Các tình huống được xử lý:**

```tsx
✅ Lỗi upload ảnh → Alert: "Lỗi Upload"
✅ Chọn hình ảnh thất bại → Alert: "Không thể chọn ảnh"
✅ Chụp ảnh thất bại → Alert: "Không thể chụp ảnh"
✅ Cloudinary timeout → Alert: "Lỗi upload ảnh lên Cloudinary"
✅ Thiếu thông tin bắt buộc → Alert: "Thiếu thông tin"
✅ Lỗi lưu database → Alert: "Không thể lưu món"
```

## 🎨 UI Components

### **Image Upload Section:**
- Preview box: 180px height, gray border
- Two buttons: "Chọn từ thư viện" + "Chụp ảnh"
- Loading state: Hiển thị spinner + "Đang upload ảnh..."

### **Image Button Styling:**
```
EFF6FF (light blue background)
3B82F6 (blue text + border)
Disabled state saat uploading
```

## 🚀 Testing Checklist

- [ ] Thêm sản phẩm mới + upload ảnh
- [ ] Kiểm tra sản phẩm hiển thị ở đầu danh sách
- [ ] Sửa sản phẩm + thay đổi ảnh
- [ ] Xem Supabase → image_url đã được lưu
- [ ] Xem Cloudinary console → ảnh đã upload
- [ ] Toggle ẩn/hiện sản phẩm
- [ ] Bấm đóng modal → không lưu khi hủy

## 📋 Permissions Cần Thiết

Trong `app.json` hoặc `eas.json`, đảm bảo có:
```json
{
  "plugins": [
    ["expo-image-picker", {
      "photosPermission": "Ứng dụng cần quyền truy cập thư viện ảnh",
      "cameraPermission": "Ứng dụng cần quyền truy cập camera"
    }]
  ]
}
```

## 💡 Tips & Tricks

1. **Tối ưu ảnh:** Ảnh được resize về 0.7 quality trước khi upload
2. **Tỷ lệ ảnh:** Buộc 1:1 (square) để UI đẹp
3. **File size:** Cloudinary sẽ tự động compress
4. **Retry logic:** Nếu upload thất bại, user có thể thử lại

## 🆘 Troubleshooting

### **Ảnh không upload?**
- Kiểm tra internet connection
- Xem Cloudinary dashboard xem có thể upload được không
- Kiểm tra credentials trong .env

### **Image permission lỗi?**
- iOS: Cấp permission thủ công trong Settings
- Android: Verify app permissions trong manifest

### **Ảnh không hiển thị sau lưu?**
- Kiểm tra Supabase → column image_url có dữ liệu không
- Kiểm tra Cloudinary URL còn hoạt động không
- Hard refresh app (pull-down to refresh)

---

**Được phát triển bởi GitHub Copilot** ✨
