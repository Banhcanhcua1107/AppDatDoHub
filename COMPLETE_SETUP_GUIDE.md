# 🍕 Hướng Dẫn Hoàn Chỉnh - Khôi Phục Dữ Liệu Menu trên Supabase

## 📊 Cấu Trúc Dữ Liệu Được Sử Dụng

Ứng dụng của bạn sử dụng 5 bảng chính để quản lý menu:

### 1. **categories** (Danh mục)
- Lưu trữ các nhóm danh mục (Cà phê, Cơm, Bún & Mì, v.v.)
- Mục đích: Tổ chức các món ăn

### 2. **menu_items** (Các món ăn)
- Lưu trữ thông tin từng món (tên, giá, ảnh, mô tả)
- Mỗi món thuộc một danh mục

### 3. **option_groups** (Nhóm tùy chọn)
- Ví dụ: "Chọn size", "Mức đường", "Topping"
- Mỗi nhóm có kiểu: `single` (chỉ chọn 1) hoặc `multiple` (chọn nhiều)

### 4. **option_choices** (Lựa chọn cụ thể)
- Ví dụ: "Size M" (0đ), "Size L" (+5000đ), "Size XL" (+10000đ)
- Mỗi lựa chọn có thể có phí bổ sung

### 5. **menu_item_options** (Liên kết)
- Kết nối menu_items với option_groups
- Ví dụ: "Cà phê Latte" có thể thêm Size, Mức đường, Topping

---

## 🚀 Các Bước Thực Hiện

### **BƯỚC 1: Khôi Phục Danh Mục và Món Ăn**

1. Truy cập [Supabase](https://supabase.com) → Project của bạn
2. Mở **SQL Editor** → Tạo query mới
3. Sao chép toàn bộ nội dung từ file `mm.sql`
4. Nhấn **RUN** (hoặc Ctrl+Enter)

**Kết quả:**
- ✅ 9 danh mục được tạo
- ✅ 34 món ăn được thêm vào

---

### **BƯỚC 2: Thiết Lập Các Tùy Chọn (Options)**

1. Trong **SQL Editor**, tạo query mới
2. Sao chép toàn bộ nội dung từ file `setup_options.sql`
3. Nhấn **RUN**

**Kết quả:**
- ✅ 4 nhóm tùy chọn được tạo:
  1. Chọn size (single)
  2. Mức đường (single)
  3. Topping - Thúc ăng (multiple)
  4. Topping - Đồ ăn (multiple)

- ✅ Các lựa chọn cụ thể:
  - **Size**: M, L, XL
  - **Mức đường**: 50%, 70%, 100%
  - **Topping thúc ăng**: Trân châu, Trân châu đường đen, Thạch, Pudding, Nata de coco
  - **Topping đồ ăn**: Kem, Sô cô la, Caramel, Mứt

- ✅ Tất cả các liên kết được tạo:
  - Cà phê: Size + Mức đường + Topping
  - Cơm: Size + Topping đồ ăn
  - Bún/Mì/Bánh Mì: Size
  - Nước uống: Size + Mức đường + Topping thúc ăng

---

## 🔍 Kiểm Tra Dữ Liệu

Chạy các query sau trong SQL Editor để xác minh:

```sql
-- Kiểm tra danh mục
SELECT COUNT(*) as total_categories FROM categories;
-- Kết quả mong đợi: 9

-- Kiểm tra món ăn
SELECT COUNT(*) as total_menu_items FROM menu_items;
-- Kết quả mong đợi: 34

-- Kiểm tra option groups
SELECT COUNT(*) as total_option_groups FROM option_groups;
-- Kết quả mong đợi: 4

-- Kiểm tra option choices
SELECT COUNT(*) as total_option_choices FROM option_choices;
-- Kết quả mong đợi: 18

-- Kiểm tra liên kết menu_item_options
SELECT COUNT(*) as total_menu_item_options FROM menu_item_options;
-- Kết quả mong đợi: >100 (tùy vào số lượng liên kết)

-- Xem chi tiết từng danh mục và số món
SELECT 
    c.name as category,
    COUNT(m.id) as item_count
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Xem chi tiết một món và các tùy chọn của nó
SELECT 
    m.name as menu_item,
    og.name as option_group,
    og.type as option_type,
    COUNT(oc.id) as choices_count
FROM menu_items m
LEFT JOIN menu_item_options mio ON m.id = mio.menu_item_id
LEFT JOIN option_groups og ON mio.option_group_id = og.id
LEFT JOIN option_choices oc ON og.id = oc.option_group_id
WHERE m.name = 'Cà phê Latte'
GROUP BY m.id, og.id, m.name, og.name, og.type;
```

---

## 📱 Kiểm Tra trong Ứng Dụng

### 1. **Mở Menu Screen**
- ✅ Tất cả 9 danh mục sẽ hiển thị
- ✅ Mỗi danh mục sẽ có số lượng món phù hợp

### 2. **Chọn một Món (ví dụ: Cà phê Latte)**
- Modal **CustomizeItemModal** sẽ hiện lên
- ✅ Sẽ hiển thị:
  - Tên, giá, ảnh của món
  - "Chọn size" với 3 lựa chọn: M, L, XL
  - "Mức đường" với 3 lựa chọn: 50%, 70%, 100%
  - "Topping (Thúc ăng)" với 5 lựa chọn (có thể chọn nhiều)
  - "Topping (Đồ ăn)" với 4 lựa chọn (có thể chọn nhiều)

### 3. **Thêm vào Giỏ Hàng**
- Giá sẽ tự động cộng thêm phí của các tùy chọn
- Ví dụ:
  - Cà phê Latte: 40.000đ
  - + Size L: 5.000đ
  - + Trân châu: 7.000đ
  - = **52.000đ**

---

## ⚙️ Hiểu Về Code

### Cách `CustomizeItemModal.tsx` Hoạt Động:

```tsx
// Khi user chọn một món, modal này sẽ:

1. Lấy ID của món được chọn
2. Truy vấn bảng menu_item_options để tìm các option groups liên kết
3. Lấy các option_choices từ mỗi option_group
4. Hiển thị các tùy chọn ra UI
5. Khi user chọn xong, cộng tổng giá:
   - Giá món gốc + Tổng phí các tùy chọn được chọn
```

---

## 📋 Bảng Tóm Tắt Dữ Liệu

| Đối Tượng | Số Lượng | Ghi Chú |
|-----------|----------|--------|
| Categories | 9 | Cà phê, Cơm, Bún & Mì, v.v. |
| Menu Items | 34 | Toàn bộ các món ăn |
| Option Groups | 4 | Size, Mức đường, Topping |
| Option Choices | 18 | Lựa chọn cụ thể (M, L, XL, v.v.) |
| Menu Item Options | ~120+ | Liên kết giữa món và tùy chọn |

---

## 🆘 Gặp Vấn Đề?

### ❌ Lỗi: "Duplicate key value violates unique constraint"
- Có nghĩa là dữ liệu đã tồn tại
- Giải pháp: Script đã sử dụng `ON CONFLICT ... DO NOTHING` nên có thể chạy lại an toàn

### ❌ Lỗi: "Foreign key constraint failed"
- Có nghĩa là bảng `categories` chưa được tạo
- Giải pháp: Chạy file `mm.sql` trước

### ❌ Lỗi: "Column does not exist"
- Có thể tên cột không đúng
- Giải pháp: Kiểm tra lại schema của các bảng trong Supabase

### ❌ Options không hiển thị trong app
- Giải pháp:
  1. Kiểm tra xem `setup_options.sql` đã chạy thành công chưa
  2. Reload app
  3. Kiểm tra console để xem có lỗi gì không

---

## ✅ Checklist

- [ ] Chạy `mm.sql` thành công
- [ ] Chạy `setup_options.sql` thành công
- [ ] Kiểm tra dữ liệu bằng các query ở trên
- [ ] Reload app React Native
- [ ] Xem danh mục menu hiển thị đầy đủ
- [ ] Chọn một món xem options hiển thị đúng không
- [ ] Thêm vào giỏ hàng và kiểm tra giá

---

## 📞 Cần Giúp?

Nếu bạn gặp bất kỳ vấn đề gì:
1. Hãy chạy các query kiểm tra ở trên để xem dữ liệu như thế nào
2. Kiểm tra console app để xem có lỗi gì không
3. Kiểm tra quyền truy cập của user Supabase

Chúc bạn thành công! 🎉
