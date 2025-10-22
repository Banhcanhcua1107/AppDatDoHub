# 🔍 Hướng Dẫn Fix Lỗi: Column "image_url" does not exist

## ❌ Vấn Đề
```
ERROR:  42703: column "image_url" of relation "menu_items" does not exist
```

Điều này có nghĩa là **cột `image_url` không tồn tại** trong bảng `menu_items` của bạn.

---

## 🔧 Cách Fix

### BƯỚC 1: Kiểm Tra Cấu Trúc Bảng

1. Truy cập **Supabase** → Project của bạn
2. Mở **SQL Editor** → Query mới
3. Chạy query này:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;
```

4. **Xem kết quả** - Lưu ý tên các cột thực sự

### BƯỚC 2: Các Khả Năng

**Khả năng 1**: Cột tên là `image` (không phải `image_url`)
```sql
-- Thay vì:
INSERT INTO menu_items (name, image_url, description, price, category_id, is_available, is_hot)

-- Thành:
INSERT INTO menu_items (name, image, description, price, category_id, is_available, is_hot)
```

**Khả năng 2**: Cột tên là `photo` hoặc `url`
```sql
INSERT INTO menu_items (name, photo, description, price, category_id, is_available, is_hot)
-- hoặc
INSERT INTO menu_items (name, url, description, price, category_id, is_available, is_hot)
```

**Khả năng 3**: Không có cột ảnh (cần thêm cột mới)
```sql
-- Thêm cột image_url vào bảng
ALTER TABLE menu_items ADD COLUMN image_url TEXT;
```

---

## ✅ Cách Sửa File `mm.sql`

Sau khi biết tên cột thực sự, hãy thay thế trong file `mm.sql`:

**Ví dụ**: Nếu cột là `image` thay vì `image_url`:

1. Mở file `mm.sql`
2. Tìm dòng:
   ```sql
   INSERT INTO menu_items 
       (name, image_url, description, price, category_id, is_available, is_hot)
   ```
3. Thay thành:
   ```sql
   INSERT INTO menu_items 
       (name, image, description, price, category_id, is_available, is_hot)
   ```

---

## 📋 Các Cột Có Thể Tồn Tại

| Tên Cột | Mô Tả |
|---------|-------|
| `id` | ID tự động |
| `name` | Tên món ăn |
| `image` hoặc `image_url` | URL ảnh |
| `photo` | Ảnh |
| `url` | URL |
| `description` | Mô tả |
| `price` | Giá |
| `category_id` | ID danh mục |
| `is_available` | Còn hàng? |
| `is_hot` | Là món nóng? |
| `created_at` | Ngày tạo |
| `updated_at` | Ngày cập nhật |

---

## 🎯 Thứ Tự Thực Hiện

1. **Kiểm tra schema** bằng query ở trên
2. **Sửa tên cột** trong `mm.sql` theo tên cột thực tế
3. **Chạy `mm.sql`** trên Supabase
4. **Chạy `setup_options.sql`**
5. **Reload app**

---

## 💡 Mẹo

Nếu bạn có thể **xem trực tiếp trong Supabase Table Editor**:
1. Mở **Table Editor** → Chọn `menu_items`
2. Xem tên của các cột ở hàng đầu tiên
3. So sánh với script SQL của bạn

