# Hướng dẫn Setup Tính năng Tạm Tính (Provisional Bill)

## 📋 Mô tả
Tính năng Tạm Tính cho phép nhân viên đánh dấu các order để khách hàng có thể xem hóa đơn tạm tính trước khi thanh toán chính thức.

## 🔧 Cách Setup

### Bước 1: Chạy SQL Script
1. Mở **Supabase Dashboard** → SQL Editor
2. Copy toàn bộ nội dung file `supabase_provisional_bill.sql`
3. Paste và chạy trong SQL Editor
4. Đợi thông báo: `"Provisional bill functions created successfully!"`

### Bước 2: Kiểm tra Database
Đảm bảo bảng `orders` có cột `is_provisional`:
```sql
-- Nếu chưa có, chạy lệnh này:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_provisional BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_orders_provisional ON orders(is_provisional);
```

## 🎯 Cách sử dụng

### 📱 Trong OrderConfirmationScreen (Màn hình chi tiết order)
- Nhấn nút **"Tạm tính"** (icon receipt, màu tím)
- ✅ Order sẽ được đánh dấu `is_provisional = true`
- ✅ Box sẽ hiển thị trong tab **"Tạm tính"**
- ✅ Nhấn lại → Cập nhật dữ liệu mới nhất (KHÔNG mất trạng thái)

### 📋 Trong OrderScreen (Danh sách order)
- Nhấn icon **receipt** ở cuối mỗi card order
- 🔄 Sẽ **toggle** (bật/tắt) trạng thái tạm tính
  - **Bật (màu xanh)**: Hiển thị trong tab Tạm tính
  - **Tắt (màu xám)**: Ẩn khỏi tab Tạm tính

## 🔄 Workflow

```
OrderConfirmationScreen                OrderScreen
        |                                    |
        | Nhấn "Tạm tính"                    | Nhấn icon receipt
        ↓                                    ↓
   send_provisional_bill()         toggle_provisional_bill_status()
        |                                    |
        | Set is_provisional = true          | Toggle is_provisional
        ↓                                    ↓
    ✅ Luôn BẬT tạm tính                🔄 BẬT/TẮT tạm tính
        |                                    |
        +------------------------------------+
                        |
                        ↓
              Hiển thị trong Tab Tạm tính
              (nếu is_provisional = true)
```

## 📊 Database Functions

### 1. `send_provisional_bill(p_order_id UUID)`
- **Mục đích**: Gửi/cập nhật tạm tính
- **Hành động**: Set `is_provisional = true`
- **Dùng trong**: OrderConfirmationScreen
- **Đặc điểm**: Không toggle, luôn BẬT

### 2. `toggle_provisional_bill_status(p_order_id UUID)`
- **Mục đích**: Bật/tắt hiển thị tạm tính
- **Hành động**: Toggle `is_provisional`
- **Dùng trong**: OrderScreen
- **Đặc điểm**: Đổi trạng thái (true ↔ false)

### 3. `cancel_provisional_bill(p_order_id UUID)` *(Tùy chọn)*
- **Mục đích**: Hủy tạm tính
- **Hành động**: Set `is_provisional = false`
- **Dùng trong**: Chưa implement (dự phòng)

## ⚠️ Lưu ý quan trọng

1. **Không mất dữ liệu**: 
   - Khi toggle OFF ở OrderScreen, order vẫn tồn tại
   - Chỉ ẩn khỏi tab "Tạm tính", KHÔNG xóa

2. **Cập nhật realtime**:
   - Thay đổi từ OrderConfirmationScreen → OrderScreen tự động cập nhật
   - Thay đổi từ OrderScreen → Tab Tạm tính tự động cập nhật

3. **Yêu cầu kết nối mạng**:
   - Cả 2 tính năng đều cần online
   - Sẽ hiển thị thông báo lỗi nếu offline

## 🐛 Troubleshooting

### Vấn đề: Function không tìm thấy
```sql
-- Kiểm tra function đã tạo chưa:
SELECT proname FROM pg_proc WHERE proname LIKE '%provisional%';

-- Kết quả mong đợi:
-- send_provisional_bill
-- toggle_provisional_bill_status
-- cancel_provisional_bill
```

### Vấn đề: Cột is_provisional không tồn tại
```sql
-- Thêm cột:
ALTER TABLE orders ADD COLUMN is_provisional BOOLEAN DEFAULT false;
```

### Vấn đề: Không realtime update
```sql
-- Enable realtime cho bảng orders:
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## 📝 Changelog

- **v1.0** (2025-10-14): 
  - Tách logic thành 2 functions riêng biệt
  - Fix bug mất dữ liệu khi toggle
  - Thêm thông báo rõ ràng hơn
