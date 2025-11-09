# 📦 Cài Đặt Dependencies

## Bước 1: Cài Đặt expo-image-picker

Chạy lệnh trong terminal:

```bash
npm install expo-image-picker
```

hoặc nếu dùng yarn:

```bash
yarn add expo-image-picker
```

## Bước 2: Chạy Migration SQL

1. Mở Supabase Dashboard → SQL Editor
2. Tạo query mới
3. Copy toàn bộ nội dung từ file `ADD_IMAGE_COLUMN.sql`
4. Bấm "Run" để thực thi

**SQL Command:**
```sql
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.menu_items.image_url IS 'URL hình ảnh sản phẩm được lưu từ Cloudinary';
```

## Bước 3: Khởi Động Lại Expo

```bash
npm start
```

hoặc 

```bash
expo start
```

Sau đó:
- iOS: Bấm `i` để khởi động simulator
- Android: Bấm `a` để khởi động emulator
- Hoặc dùng Expo Go app trên điện thoại

## ✅ Kiểm Tra Installation

Khi chạy lại, nếu không có lỗi "Module not found" thì đã cài đặt thành công!

## 🔗 Liên Kết Hữu Ích

- [expo-image-picker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Cloudinary Integration](https://cloudinary.com/documentation/cloudinary_references)
