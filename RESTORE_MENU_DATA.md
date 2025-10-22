# Hướng Dẫn Khôi Phục Dữ Liệu Menu trên Supabase

## 📋 Tổng Quan
Hướng dẫn này giúp bạn khôi phục dữ liệu menu đã xoá trên Supabase bằng cách chạy script SQL trong SQL Editor của Supabase.

## 🔧 Các Bước Thực Hiện

### Bước 1: Truy Cập Supabase
1. Đăng nhập vào [supabase.com](https://supabase.com)
2. Mở project của bạn
3. Điều hướng đến **SQL Editor** hoặc **Query Editor**

### Bước 2: Sao Chép Script SQL
1. Mở file `mm.sql` trong project
2. Sao chép toàn bộ nội dung của file

### Bước 3: Chạy Script trong Supabase
1. Trong Supabase, tạo một query mới bằng cách bấm "+ New Query"
2. Dán nội dung SQL vào editor
3. Bấm nút **"RUN"** hoặc nhấn **Ctrl+Enter** để thực thi

### Bước 4: Xác Nhận Dữ Liệu Được Thêm

Sau khi chạy script, bạn sẽ thấy các bảng được cập nhật:

#### **Danh Mục (Categories)** Được Tạo:
- Cà phê & Matcha
- Cơm
- Bún & Mì
- Bánh Mì
- Nước đóng lon
- Nước Ép
- Món Ăn Vặt
- Trà Sữa
- Trà Trái Cây

#### **Số Lượng Món Ăn (Menu Items)**:
- **Cà phê & Matcha**: 12 món
- **Cơm**: 3 món
- **Bún & Mì**: 5 món
- **Bánh Mì**: 3 món
- **Nước đóng lon**: 3 món
- **Nước Ép**: 3 món
- **Món Ăn Vặt**: 1 món
- **Trà Sữa**: 2 món
- **Trà Trái Cây**: 2 món

**Tổng cộng: 34 món ăn**

### Bước 5: Kiểm Tra trong Table Editor
1. Mở **Table Editor** trong Supabase
2. Chọn bảng `categories` để xem danh mục
3. Chọn bảng `menu_items` để xem các món ăn
4. Đảm bảo tất cả dữ liệu đã được thêm đúng

## ✅ Xác Minh Dữ Liệu

Bạn có thể chạy các query này để kiểm tra:

```sql
-- Kiểm tra số danh mục
SELECT COUNT(*) as total_categories FROM categories;

-- Kiểm tra số món ăn
SELECT COUNT(*) as total_items FROM menu_items;

-- Kiểm tra danh mục và số món
SELECT 
    c.name as category,
    COUNT(m.id) as item_count
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
GROUP BY c.id, c.name
ORDER BY c.name;
```

## 🚀 Kiểm Tra trong Ứng Dụng

Sau khi khôi phục dữ liệu:

1. Quay lại ứng dụng React Native của bạn
2. Mở **MenuScreen.tsx**
3. Nhấn F5 hoặc reload ứng dụng
4. Menu phải hiển thị tất cả danh mục và các món

## ⚠️ Lưu Ý Quan Trọng

- Script này sử dụng `ON CONFLICT ... DO NOTHING` để tránh lỗi nếu dữ liệu đã tồn tại
- Nếu bạn muốn xoá toàn bộ dữ liệu cũ trước khi thêm lại, hãy chạy:

```sql
-- CẢNH BÁO: Điều này sẽ xoá tất cả dữ liệu!
DELETE FROM menu_items;
DELETE FROM categories;
```

- Đảm bảo các hình ảnh từ Cloudinary vẫn khả dụng

## 📞 Gặp Vấn Đề?

Nếu script không chạy được:
1. Kiểm tra lỗi cú pháp SQL
2. Đảm bảo bảng `categories` và `menu_items` tồn tại
3. Kiểm tra quyền truy cập của user Supabase
