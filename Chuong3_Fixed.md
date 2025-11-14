# CHƯƠNG 3: THIẾT KẾ HỆ THỐNG (TABLEFLOW)

## 📋 MỤC LỤC

1. [Giới Thiệu Chương 3](#giới-thiệu-chương-3)
2. [Tổng Quan Thiết Kế](#31-tổng-quan-thiết-kế)
3. [Sitemap & Hướng Dẫn Vẽ](#32-sitemap--hướng-dẫn-vẽ)
4. [Phân Tích Use Case](#33-phân-tích-use-case)
5. [Thiết Kế Cơ Sở Dữ Liệu](#34-thiết-kế-cơ-sở-dữ-liệu)
6. [Sơ Đồ Thiết Kế](#35-sơ-đồ-thiết-kế)
7. [Phân Quyền & Chức Năng](#36-phân-quyền--chức-năng)
8. [Cấu Trúc Mã Nguồn](#37-cấu-trúc-mã-nguồn)
9. [Thiết Kế Giao Diện](#38-thiết-kế-giao-diện)

---

## GIỚI THIỆU CHƯƠNG 3

**Chương này trình bày chi tiết quá trình thiết kế hệ thống ứng dụng quản lý nhà hàng/quán cà phê TableFlow**, tập trung vào việc đảm bảo hiệu quả, tính trực quan, và khả năng mở rộng cho bốn vai trò chính: **Nhân viên phục vụ (Staff), Bếp (Kitchen), Thu ngân (Cashier), và Quản lý (Admin)**.

### ⚠️ Lưu Ý Quan Trọng

**TableFlow là ứng dụng NỘI BỘ dành cho nhân viên và quản lý nhà hàng, KHÔNG có vai trò khách hàng.** Hệ thống được thiết kế duy nhất cho:
- 👨‍💼 **Nhân viên phục vụ (Staff)**: Gọi món tại bàn
- 👨‍🍳 **Bộ phận bếp (Kitchen)**: Xem danh sách và cập nhật trạng thái các món
- 💳 **Thu ngân (Cashier)**: Xử lý thanh toán và in hóa đơn
- 📊 **Quản lý (Admin)**: Giám sát hoạt động và quản lý hệ thống

### Nội Dung Chương Bao Gồm

| Mục | Nội Dung |
|-----|---------|
| **3.1** | Tổng quan về thiết kế, mục tiêu, kiến trúc hệ thống |
| **3.2** | Sitemap: cấu trúc điều hướng cho 4 vai trò chính |
| **3.3** | Use Case: phân tích quy trình làm việc của từng vai trò |
| **3.4** | Thiết kế cơ sở dữ liệu: schema, bảng, mối quan hệ |
| **3.5** | Sơ đồ thiết kế: Class, Sequence, Activity, State diagrams |
| **3.6** | Phân quyền (RBAC) và RLS Policies |
| **3.7** | Cấu trúc mã nguồn và tổ chức code |
| **3.8** | Thiết kế giao diện, wireframes, design system |

---

## 3.1 TỔNG QUAN THIẾT KẾ

### 3.1.1 Mô Tả Hệ Thống

TableFlow là **ứng dụng di động nội bộ** được xây dựng dành riêng cho nhân viên và quản lý nhà hàng/quán cà phê, giúp:
- **Tự động hóa** quy trình gọi món → chế biến → thanh toán
- **Giảm sai sót** thông qua tích hợp realtime giữa các bộ phận
- **Tăng tốc độ phục vụ** bằng cách loại bỏ các bước thủ công
- **Nâng cao trải nghiệm khách hàng** với dịch vụ nhanh, chính xác

**Các thành phần chính**:
- **Gọi món tại bàn** (Staff/Nhân viên)
- **Kitchen Display System - KDS** (Bếp xem danh sách món)
- **Quản lý thanh toán** (Cashier/Thu ngân)
- **Quản lý hệ thống** (Admin/Quản lý)

Hệ thống được xây dựng với:
- **Front-end**: React Native + Expo (Cross-platform mobile)
- **Back-end**: Supabase (PostgreSQL + Realtime + Authentication)
- **Styling**: NativeWind (Tailwind CSS cho React Native)
- **Payment Gateway**: MoMo, VietQR (cho khách hàng)

### 3.1.2 Mục Tiêu Thiết Kế

| Tiêu Chí | Yêu Cầu | Chi Tiết |
|---------|--------|---------|
| **Tính Trực Quan** | Giao diện đơn giản, dễ sử dụng cho staff | Phù hợp mọi đối tượng nhân viên |
| **Hiệu Suất Cao** | Realtime updates < 1s, API response < 200ms | Tối ưu tốc độ, xử lý request nhanh |
| **Bảo Mật** | JWT authentication, RLS policies | Xác thực user, phân quyền chặt chẽ |
| **Khả Năng Mở Rộng** | Dễ thêm tính năng, thanh toán mới | Cấu trúc mã linh hoạt |
| **Realtime** | Đồng bộ dữ liệu ngay lập tức | Staff, Kitchen, Cashier cập nhật cùng lúc |

### 3.1.3 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    TABLEFLOW SYSTEM                      │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  STAFF/CASHIER   │  │  KITCHEN (KDS)   │  │  ADMIN (Web)     │
│   (Mobile App)   │  │  (Mobile App)    │  │  (Dashboard)     │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    SUPABASE        │
                    ├────────────────────┤
                    │ • PostgreSQL DB    │
                    │ • Realtime API     │
                    │ • Auth (JWT)       │
                    │ • Edge Functions   │
                    │ • Storage          │
                    └─────────────────────┘
```

---

## 3.2 SITEMAP & HƯỚNG DẪN VẼ

### 3.2.1 Sơ Đồ Sitemap Tổng Quát

```
┌─────────────────────────────────────────────────────────┐
│                   TABLEFLOW SITEMAP                      │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    STAFF (/)         KITCHEN (/)             ADMIN (/)
    (Gọi Món)        (KDS Display)          (Dashboard)
        │                  │                     │
     Bàn             Danh sách Đơn          Dashboard
     Menu            Từng Đơn Chi Tiết      Sản Phẩm
     Giỏ              Trạng Thái              Đơn Hàng
     ↓ Cashier        Cập Nhật               Nhân Viên
    Thanh Toán                               Báo Cáo
    In Hóa Đơn                               Cài Đặt
```

### 3.2.2 STAFF MODULE (Gọi Món & Thu Ngân)

```
LOGIN (/)
├── STAFF DASHBOARD
│   │
│   ├── 📋 GỌI MÓN (Order Entry)
│   │   ├── Chọn Bàn
│   │   ├── Xem Menu Sản Phẩm
│   │   │   ├── Phân Loại Danh Mục
│   │   │   ├── Tìm Kiếm Nhanh
│   │   │   └── Xem Chi Tiết
│   │   ├── Thêm Sản Phẩm Vào Giỏ
│   │   │   └── Tùy Chỉnh Sản Phẩm
│   │   ├── Xem Giỏ Hàng
│   │   │   ├── Sửa Số Lượng
│   │   │   └── Xóa Sản Phẩm
│   │   └── Xác Nhận & Gửi Bếp
│   │
│   ├── 💳 THU NGÂN (Cashier)
│   │   ├── Danh Sách Chờ Thanh Toán
│   │   ├── Chi Tiết Hóa Đơn
│   │   ├── Chọn Phương Thức Thanh Toán
│   │   │   ├── Tiền Mặt
│   │   │   ├── MoMo QR
│   │   │   ├── VietQR
│   │   │   └── Chuyển Khoản
│   │   ├── Xác Nhận Thanh Toán
│   │   ├── In Hóa Đơn
│   │   └── Đóng Bàn
│   │
│   ├── 📊 LỊC SỬ ĐƠN HÀNG
│   │   ├── Danh Sách Đơn Hôm Nay
│   │   └── Chi Tiết Đơn
│   │
│   ├── 📍 QUẢN LÝ BÀN
│   │   ├── Trạng Thái Bàn (Trống, Có Khách, Gộp)
│   │   ├── Chuyển Bàn
│   │   ├── Gộp Bàn
│   │   └── Tách Bàn
│   │
│   └── ⚙️ CÀI ĐẶT
│       └── Đăng Xuất
```

### 3.2.3 KITCHEN MODULE (KDS - Kitchen Display System)

```
LOGIN (/)
├── KITCHEN DASHBOARD
│   │
│   ├── 🎯 DANH SÁCH ĐƠN HÀNG (Main View)
│   │   ├── Filter: [Tất Cả] [Chờ] [Đang Nấu] [Hoàn Thành]
│   │   │
│   │   ├── Từng Bàn/Đơn
│   │   │   ├── Bàn số + Thời gian
│   │   │   ├── Danh sách các món
│   │   │   │   ├── ☐ Cà Phê Đen x2
│   │   │   │   ├── ☐ Trà Đá x1
│   │   │   │   └── [Bắt Đầu] / [✓ Hoàn Thành]
│   │   │   └── Thời gian nấu
│   │   │
│   │   └── Sắp xếp: Thời gian (cũ nhất trước)
│   │
│   ├── 🔔 THÔNG BÁO REALTIME
│   │   ├── Đơn hàng mới: âm thanh + rung
│   │   ├── Đơn hàng được hủy
│   │   └── Deadline đơn hàng
│   │
│   └── ⚙️ CÀI ĐẶT
│       ├── Vô hiệu hóa âm thanh
│       └── Đăng Xuất
```

### 3.2.4 ADMIN MODULE (Quản Lý Hệ Thống)

```
LOGIN (/)
├── ADMIN DASHBOARD
│   │
│   ├── 📊 DASHBOARD
│   │   ├── KPI Hôm Nay
│   │   │   ├── Tổng Doanh Thu
│   │   │   ├── Số Đơn Hàng
│   │   │   ├── Số Khách
│   │   │   └── Lợi Nhuận
│   │   ├── Biểu Đồ
│   │   │   ├── Doanh Thu Theo Giờ
│   │   │   ├── Top 10 Sản Phẩm
│   │   │   └── Phương Thức Thanh Toán
│   │   └── Thống Kê Realtime
│   │
│   ├── 🍕 QUẢN LÝ SẢN PHẨM
│   │   ├── Danh Sách Sản Phẩm
│   │   ├── Thêm Sản Phẩm Mới
│   │   ├── Sửa Sản Phẩm
│   │   ├── Xóa Sản Phẩm
│   │   ├── Upload Hình Ảnh
│   │   └── Nhập Hàng Loạt (CSV)
│   │
│   ├── 📦 QUẢN LÝ ĐƠN HÀNG
│   │   ├── Danh Sách Đơn Hàng
│   │   ├── Lọc Theo Trạng Thái
│   │   ├── Chi Tiết Đơn
│   │   ├── Cập Nhật Trạng Thái
│   │   ├── Hủy Đơn
│   │   └── Xuất Excel/PDF
│   │
│   ├── 🏠 QUẢN LÝ BÀN
│   │   ├── Danh Sách Bàn
│   │   ├── Thêm Bàn Mới
│   │   ├── Sửa Bàn
│   │   ├── Xóa Bàn
│   │   └── Cấu Hình Sơ Đồ Quán
│   │
│   ├── 👥 QUẢN LÝ NHÂN VIÊN
│   │   ├── Danh Sách Nhân Viên
│   │   ├── Thêm Nhân Viên
│   │   ├── Cấp/Thay Đổi Quyền (Role)
│   │   ├── Xóa Nhân Viên
│   │   └── Lịch Sử Hoạt Động
│   │
│   ├── 📈 BÁO CÁO
│   │   ├── Doanh Thu
│   │   │   ├── Hôm Nay
│   │   │   ├── Tuần Này
│   │   │   ├── Tháng Này
│   │   │   └── Năm Nay
│   │   ├── Lợi Nhuận & Chi Phí
│   │   ├── Sản Phẩm Bán Chạy
│   │   ├── Hoàn Trả & Khiếu Nại
│   │   └── Xuất PDF/Excel
│   │
│   └── ⚙️ CÀI ĐẶT HỆ THỐNG
│       ├── Thông Tin Cửa Hàng
│       ├── Cấu Hình Thanh Toán
│       ├── Cài Đặt Hoá Đơn
│       ├── Sao Lưu/Khôi Phục DB
│       └── Đăng Xuất
```

---

## 3.3 PHÂN TÍCH USE CASE

### 3.3.1 Sơ Đồ Use Case

```
                    ┌──────────────────────┐
                    │   TABLEFLOW SYSTEM   │
                    └──────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐ ┌──▼────────┐ ┌─▼────────────┐
        │    STAFF       │ │  KITCHEN  │ │    ADMIN     │
        │    (Phục Vụ)   │ │   (Bếp)   │ │   (Quản Lý)  │
        └────────────────┘ └───────────┘ └──────────────┘
             │                   │               │
        UC01: Gọi Món       UC03: Nhận      UC06: Dashboard
        UC02: Thanh Toán         Đơn        UC07: Quản Sản Phẩm
        UC04: Xem Lịch      UC04: Cập     UC08: Quản Đơn Hàng
                                Nhật        UC09: Báo Cáo
                            UC05: Thông
                                Báo
```

### 3.3.2 UC01: Gọi Món (Staff)

**Mô Tả**: Nhân viên phục vụ chọn bàn, lựa chọn sản phẩm, tạo đơn hàng và gửi đến bếp.

**Actors**: Nhân viên phục vụ (Staff)

**Precondition**: 
- Nhân viên đã đăng nhập
- Bàn trống hoặc có khách đang ngồi

**Postcondition**: 
- Đơn hàng được tạo trong cơ sở dữ liệu
- Bếp nhận được thông báo realtime
- Trạng thái bàn chuyển sang "Có khách"

**Main Flow**:

```
1. Nhân viên mở ứng dụng → Hiển thị danh sách bàn
2. Nhân viên chọn bàn trống → Màn hình Menu
3. Nhân viên duyệt menu, chọn sản phẩm
4. Nhân viên thêm sản phẩm vào giỏ (có thể tùy chỉnh)
5. Nhân viên xác nhận giỏ hàng → Gửi Bếp
6. Backend:
   - Tạo bản ghi Order (status: "pending")
   - Tạo OrderItems cho từng sản phẩm
   - Cập nhật trạng thái Bàn → "Có khách"
   - Broadcast realtime event đến Kitchen (KDS)
7. Bếp nhận thông báo (âm thanh + hiển thị trên KDS)
```

**Sequence Diagram**:

```
Staff    Frontend    Backend     Database    Kitchen
  │         │           │            │          │
  │ Choose  │           │            │          │
  │ Table   │           │            │          │
  ├────────►│           │            │          │
  │         │ GET       │            │          │
  │         ├──────────►│            │          │
  │         │ /tables   │ SELECT     │          │
  │         │           ├───────────►│          │
  │         │           │◄───────────┤ [Bàn 1] │
  │         │◄──────────┤            │ [Bàn 2] │
  │ Display │           │            │ [Bàn 3] │
  │ Tables  │           │            │          │
  │◄────────┤           │            │          │
  │         │           │            │          │
  │ Browse  │           │            │          │
  │ Menu    ├──────────►│            │          │
  │         │ GET       │ SELECT     │          │
  │         │ /items    ├───────────►│          │
  │         │           │◄───────────┤ Items[] │
  │         │◄──────────┤            │          │
  │ Select  │           │            │          │
  │ Items   ├──────────►│            │          │
  │ POST    │ /orders   │ INSERT     │          │
  │ Order   │ {items}   ├───────────►│          │
  │         │           │ ↓          │          │
  │         │           │ INSERT     │          │
  │         │           │ order_items│          │
  │         │           │ UPDATE     │          │
  │         │           │ tables     │          │
  │         │           │◄───────────┤          │
  │ Success │◄──────────┤            │  PUBLISH│
  │◄────────┤           │    order   ├─────────►│
  │         │           │            │ Received│
```

---

### 3.3.3 UC02: Thanh Toán (Cashier)

**Mô Tả**: Thu ngân xử lý thanh toán cho khách hàng, hỗ trợ nhiều phương thức.

**Actors**: Thu ngân (Cashier)

**Precondition**: 
- Đơn hàng đã được tạo
- Tất cả các món đã hoàn thành

**Postcondition**: 
- Giao dịch được ghi nhận
- Hóa đơn được in
- Bàn được đánh dấu là trống

**Main Flow**:

```
1. Thu ngân xem danh sách "Chờ Thanh Toán"
2. Thu ngân chọn đơn hàng → Hiển thị chi tiết
3. Thu ngân chọn phương thức:
   a) Tiền Mặt:
      - Nhập tiền khách đưa
      - Hệ thống tính tiền thối
      - Xác nhận → In Hóa Đơn
   b) MoMo:
      - Hệ thống tạo QR code
      - Hiển thị QR → Khách quét
      - Chờ IPN callback từ MoMo
      - Tự động xác nhận khi thanh toán thành công
   c) VietQR:
      - Tương tự MoMo
4. Backend:
   - Tạo Transaction record
   - Cập nhật Order status → "paid"
   - Cập nhật Table status → "Trống"
   - Gửi email xác nhận (nếu có)
5. In Hóa Đơn & Đóng Bàn
```

**Diagram Thanh Toán MoMo**:

```
Cashier   Frontend    Backend     Database    MoMo API
   │         │           │            │          │
   │ Request │           │            │          │
   │ Payment ├──────────►│            │          │
   │         │ POST      │            │          │
   │         │ /payment  │ INSERT     │          │
   │         │ {amount}  ├───────────►│          │
   │         │           │ transaction│          │
   │         │           │ status:    │          │
   │         │           │ pending    │          │
   │         │           │◄───────────┤          │
   │         │ Call      │            │          │
   │         │ MoMo API  ├───────────────────────►│
   │         │◄──────────┤            │          │
   │         │ QR Code   │            │ Return   │
   │ Display │           │            │ QR URL   │
   │ QR Code │◄──────────┤            │          │
   │◄────────┤           │            │          │
   │         │ [Chờ...]  │            │          │
   │         │           │            │  IPN     │
   │         │           │◄───────────┤ Callback│
   │         │           │ {resultCode:0}       │
   │         │ Notify    │            │          │
   │         ├──────────►│            │          │
   │         │ Success   │ UPDATE     │          │
   │         │ Payment   ├───────────►│          │
   │ Success │◄──────────┤ status:    │          │
   │         │           │ completed  │          │
   │         │ Print     │            │          │
   │         ├──────────►│            │          │
   │ Hóa Đơn │ Generate  │            │          │
   │◄────────┤ Invoice   │            │          │
   │         │           │            │          │
```

---

### 3.3.4 UC03: Kitchen Display System (KDS)

**Mô Tả**: Bếp nhận danh sách đơn hàng mới, cập nhật trạng thái các món.

**Actors**: Bộ phận Bếp (Kitchen Staff)

**Precondition**: 
- Nhân viên phục vụ đã gửi đơn hàng
- Bếp đã đăng nhập

**Postcondition**: 
- Trạng thái món được cập nhật
- Nhân viên phục vụ được thông báo

**Main Flow**:

```
1. Bếp mở KDS → Danh sách đơn chờ (realtime)
2. Bếp bắt đầu nấu:
   - Chọn đơn hàng
   - Bấm [Bắt Đầu] → Trạng thái: "Đang Nấu"
3. Bếp nấu xong:
   - Bấm [✓ Hoàn Thành] cho từng sản phẩm
4. Backend:
   - Cập nhật order_items status → "completed"
   - Broadcast thông báo đến Staff (Nhân viên phục vụ)
5. Staff nhận thông báo:
   - "Bàn X, sản phẩm Y sẵn sàng"
   - Đem sản phẩm ra bàn
6. Khi tất cả sản phẩm xong → Order status → "ready_to_serve"
```

---

## 3.4 THIẾT KẾ CƠ SỞ DỮ LIỆU

### 3.4.1 ERD - Entity Relationship Diagram

```
┌──────────────────────┐
│      profiles        │
├──────────────────────┤
│ id (PK) - UUID       │
│ email (UNIQUE)       │
│ password (hashed)    │
│ full_name            │
│ phone                │
│ role (ENUM)          │
│ is_active            │
│ created_at           │
└────┬─────────────────┘
     │
     │ 1──N
     ▼
┌──────────────────────┐          ┌──────────────────────┐
│      orders          │◄────────►│    transactions      │
├──────────────────────┤ 1──1     ├──────────────────────┤
│ id (PK) - UUID       │          │ id (PK) - UUID       │
│ table_id (FK)        │          │ order_id (FK)        │
│ staff_id (FK)        │          │ amount               │
│ status (ENUM)        │          │ method (ENUM)        │
│ payment_method       │          │ status (ENUM)        │
│ total_price          │          │ reference_id         │
│ paid_at              │          │ created_at           │
│ created_at           │          └──────────────────────┘
│ updated_at           │
└────┬─────────────────┘
     │
     │ 1──N
     ▼
┌──────────────────────┐
│   order_items        │
├──────────────────────┤
│ id (PK) - BIGINT     │
│ order_id (FK)        │
│ menu_item_id (FK)    │
│ quantity             │
│ price                │
│ status (ENUM)        │
│ notes                │
└────┬─────────────────┘
     │
     │ N──1
     ▼
┌──────────────────────┐
│   menu_items         │
├──────────────────────┤
│ id (PK) - UUID       │
│ name                 │
│ description          │
│ price                │
│ cost                 │
│ category_id (FK)     │
│ image_url            │
│ is_available         │
│ daily_limit          │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│      tables          │
├──────────────────────┤
│ id (PK) - BIGINT     │
│ number               │
│ status (ENUM)        │
│ capacity             │
│ location_zone        │
│ created_at           │
└──────────────────────┘
```

### 3.4.2 Bảng Chi Tiết

#### **profiles** (Người dùng)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- bcrypt hashed
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role TEXT CHECK (role IN ('staff', 'kitchen', 'cashier', 'admin')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**: Lưu thông tin nhân viên, phân quyền dựa trên `role`

---

#### **tables** (Bàn)
```sql
CREATE TABLE tables (
  id BIGSERIAL PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('Trống', 'Có khách', 'Gộp')) DEFAULT 'Trống',
  capacity INT,
  location_zone VARCHAR(50), -- e.g., "Tầng 1", "Ngoài trời"
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**: 
- `number`: Số hiệu bàn (1, 2, 3...)
- `status`: Trạng thái hiện tại
- `capacity`: Số ghế tối đa

---

#### **menu_items** (Sản phẩm)
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2), -- Giá vốn
  category VARCHAR(100),
  image_url TEXT, -- Cloudinary URL
  is_available BOOLEAN DEFAULT TRUE,
  daily_limit INT, -- Giới hạn bán/ngày
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### **orders** (Đơn hàng)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id BIGINT REFERENCES tables(id),
  staff_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'preparing', 'ready', 'paid', 'completed', 'cancelled')) 
    DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('cash', 'momo', 'vietqr', 'transfer')),
  total_price NUMERIC(10, 2),
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### **order_items** (Chi tiết đơn)
```sql
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2),
  status TEXT CHECK (status IN ('waiting', 'preparing', 'completed')) 
    DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### **transactions** (Giao dịch thanh toán)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10, 2),
  method TEXT CHECK (method IN ('cash', 'momo', 'vietqr', 'transfer')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) 
    DEFAULT 'pending',
  reference_id VARCHAR(255), -- Mã từ MoMo/VietQR
  response_data JSONB, -- Response từ payment gateway
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3.5 SƠ ĐỒ THIẾT KẾ

### 3.5.1 Class Diagram

```
┌─────────────────────────────────────────────────────┐
│                    User (Profile)                   │
├─────────────────────────────────────────────────────┤
│ - id: UUID                                          │
│ - email: string                                     │
│ - password: string (hashed)                         │
│ - fullName: string                                  │
│ - role: enum (staff | kitchen | cashier | admin)   │
│ - isActive: boolean                                 │
├─────────────────────────────────────────────────────┤
│ + login(): AuthToken                               │
│ + logout(): void                                    │
│ + updateProfile(): void                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                       Order                         │
├─────────────────────────────────────────────────────┤
│ - id: UUID                                          │
│ - tableId: number                                   │
│ - staffId: UUID                                     │
│ - status: enum                                      │
│ - paymentMethod: string                             │
│ - totalPrice: decimal                               │
│ - createdAt: datetime                               │
├─────────────────────────────────────────────────────┤
│ + create(): Order                                   │
│ + addItem(): void                                   │
│ + removeItem(): void                                │
│ + processPayment(): void                            │
│ + markAsCompleted(): void                           │
└─────────────────────────────────────────────────────┘
        │
        │ has 1---N
        ▼
┌─────────────────────────────────────────────────────┐
│                    OrderItem                        │
├─────────────────────────────────────────────────────┤
│ - id: BIGINT                                        │
│ - orderId: UUID                                     │
│ - menuItemId: UUID                                  │
│ - quantity: int                                     │
│ - status: enum (waiting | preparing | completed)   │
├─────────────────────────────────────────────────────┤
│ + updateStatus(): void                              │
│ + getPrice(): decimal                               │
└─────────────────────────────────────────────────────┘
```

---

### 3.5.2 State Diagram - Order Status

```
         ┌──────────┐
         │ pending  │ ← Order được tạo
         └────┬─────┘
              │
              ▼
         ┌──────────────┐
         │  preparing   │ ← Bếp bắt đầu nấu
         └────┬─────────┘
              │
              ▼
         ┌──────────────┐
         │   ready      │ ← Tất cả sản phẩm sẵn sàng
         └────┬─────────┘
              │
              ▼
         ┌──────────────┐
         │    paid      │ ← Khách thanh toán
         └────┬─────────┘
              │
              ▼
         ┌──────────────┐
         │  completed   │ ← Giao dịch hoàn tất
         └──────────────┘
         
         ┌──────────────┐
         │   cancelled  │ ← Đơn bị hủy (có thể từ pending/preparing)
         └──────────────┘
```

---

## 3.6 PHÂN QUYỀN & CHỨC NĂNG

### 3.6.1 Bảng Phân Quyền

| Chức Năng | Staff | Kitchen | Cashier | Admin |
|-----------|-------|---------|---------|-------|
| Xem Menu | ✅ | ❌ | ❌ | ✅ |
| Gọi Món | ✅ | ❌ | ❌ | ❌ |
| Xem KDS | ❌ | ✅ | ❌ | ✅ |
| Cập Nhật Trạng Thái Món | ❌ | ✅ | ❌ | ✅ |
| Xử Lý Thanh Toán | ❌ | ❌ | ✅ | ✅ |
| Xem Dashboard | ❌ | ❌ | ✅ | ✅ |
| Quản Lý Sản Phẩm | ❌ | ❌ | ❌ | ✅ |
| Quản Lý Nhân Viên | ❌ | ❌ | ❌ | ✅ |
| Báo Cáo | ❌ | ❌ | ✅ | ✅ |

### 3.6.2 RLS Policies

```sql
-- Staff: Xem tất cả bàn, tạo đơn cho bàn đó
CREATE POLICY staff_view_tables ON tables
  FOR SELECT USING (auth.jwt_meta('role') = 'staff');

CREATE POLICY staff_create_orders ON orders
  FOR INSERT WITH CHECK (auth.jwt_meta('role') = 'staff');

-- Kitchen: Xem tất cả đơn hàng  
CREATE POLICY kitchen_view_orders ON orders
  FOR SELECT USING (auth.jwt_meta('role') = 'kitchen');

CREATE POLICY kitchen_update_items ON order_items
  FOR UPDATE USING (auth.jwt_meta('role') = 'kitchen');

-- Cashier: Xem tất cả đơn, cập nhật thanh toán
CREATE POLICY cashier_view_orders ON orders
  FOR SELECT USING (auth.jwt_meta('role') IN ('cashier', 'admin'));

-- Admin: Toàn quyền
CREATE POLICY admin_all ON orders
  FOR ALL USING (auth.jwt_meta('role') = 'admin');
```

---

## 3.7 CẤU TRÚC MÃ NGUỒN

```
my-expo-app/
├── src/
│   ├── screens/
│   │   ├── Staff/
│   │   │   ├── TablesScreen.tsx          (Chọn bàn)
│   │   │   ├── MenuScreen.tsx            (Duyệt menu)
│   │   │   ├── CartScreen.tsx            (Giỏ hàng)
│   │   │   └── OrderListScreen.tsx       (Lịch sử)
│   │   ├── Cashier/
│   │   │   ├── PendingPaymentScreen.tsx  (Chờ thanh toán)
│   │   │   ├── PaymentMethodScreen.tsx   (Chọn phương thức)
│   │   │   └── InvoiceScreen.tsx         (In hóa đơn)
│   │   ├── Kitchen/
│   │   │   ├── KDSScreen.tsx             (Kitchen Display System)
│   │   │   └── OrderDetailScreen.tsx     (Chi tiết đơn)
│   │   └── Admin/
│   │       ├── DashboardScreen.tsx       (Dashboard)
│   │       ├── ProductScreen.tsx         (Quản lý sản phẩm)
│   │       ├── OrderScreen.tsx           (Quản lý đơn)
│   │       └── ReportScreen.tsx          (Báo cáo)
│   ├── components/
│   │   ├── OrderCard.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── TableGrid.tsx
│   │   └── PaymentModal.tsx
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── orderService.ts
│   │   ├── menuService.ts
│   │   └── paymentService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   └── useRealtimeListener.ts
│   ├── types/
│   │   └── index.ts
│   └── navigation/
│       ├── RootNavigator.tsx
│       ├── StaffNavigator.tsx
│       ├── KitchenNavigator.tsx
│       ├── CashierNavigator.tsx
│       └── AdminNavigator.tsx
├── supabase/
│   ├── functions/
│   │   ├── create-momo-payment/
│   │   ├── momo-ipn-handler/
│   │   └── generate-invoice/
│   └── migrations/
│       └── 001_init_schema.sql
└── assets/
    └── images/
```

---

## 3.8 THIẾT KẾ GIAO DIỆN

### 3.8.1 Design System

**Color Palette**:
- Primary: #A60067 (MoMo Pink)
- Secondary: #6B7280 (Gray)
- Success: #16A34A (Green)
- Warning: #F59E0B (Orange)
- Error: #DC2626 (Red)

**Typography**:
- Display: 48px Bold
- Heading 1: 32px Bold
- Body: 16px Regular
- Caption: 14px Regular

---

### 3.8.2 Wireframe - Staff: Order Entry

```
┌─────────────────────────────────────────┐
│ TableFlow - Gọi Món           [👤]     │
├─────────────────────────────────────────┤
│                                         │
│  📍 Chọn Bàn:                          │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ 1   │ │ 2   │ │ 3   │ ← Trống    │
│  └─────┘ └─────┘ └─────┘              │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ 4   │ │ 5   │ │ 6   │ ← Có Khách │
│  └─────┘ └─────┘ └─────┘              │
│                                         │
├─────────────────────────────────────────┤
│ 🔍 Tìm: [__________]                   │
│                                         │
│ [Cà Phê] [Trà] [Juice] [Ăn Vặt]      │
├─────────────────────────────────────────┤
│ ☕ Cà Phê Đen         | 49.000đ  [+]  │
│ Mô tả sản phẩm...                      │
│                                         │
│ 🥤 Trà Đá            | 39.000đ  [+]  │
│ Mô tả sản phẩm...                      │
├─────────────────────────────────────────┤
│ 🛒 Giỏ (2)                             │
│ ┌────────────────────────────────────┐ │
│ │ Cà Phê Đen x2  | 98.000đ   [- + x]│ │
│ │ ────────────────────────────────── │ │
│ │ Tổng: 98.000đ                      │ │
│ └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│    [Xóa]              [Gửi Bếp →]     │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3.8.3 Wireframe - Kitchen: KDS

```
┌──────────────────────────────────────────┐
│ Kitchen Display System           🔔     │
├──────────────────────────────────────────┤
│ [Tất Cả] [Chờ] [Đang Nấu] [Hoàn]     │
├────────┬────────┬────────┬───────┬─────┤
│ BÀNG 1 │ BÀNG 2 │ BÀNG 3 │ BÀNG4 │     │
│ 🟥    │ 🟨    │ 🟩    │ 🟩    │     │
│        │        │        │        │     │
│ x2 Cà  │ x1 Trà │ x1 BFC │ x2 Bánh│     │
│ Phê    │ Đá     │ Fried  │ Mì    │     │
│ x1 Bánh│        │        │       │     │
│        │        │ (nấu   │ (nấu  │     │
│ 10:45  │ 10:50  │ 12min) │ 8min) │     │
│        │        │        │       │     │
│ [Start]│ [✓Done]│ [✓Done]│ [✓ D] │     │
│        │        │        │       │     │
└────────┴────────┴────────┴───────┴─────┘
```

---

## 📚 TÓM TẮT CHƯƠNG 3

| Mục | Nội Dung |
|-----|---------|
| **3.1** | Tổng quan thiết kế, mục tiêu, kiến trúc client-server |
| **3.2** | Sitemap: 4 vai trò (Staff, Kitchen, Cashier, Admin) |
| **3.3** | Use Case: Gọi Món, Thanh Toán, KDS |
| **3.4** | Schema PostgreSQL: 6 bảng chính |
| **3.5** | Class Diagram, State Diagram |
| **3.6** | RBAC Policies, RLS rules |
| **3.7** | Cấu trúc mã nguồn React Native + Supabase |
| **3.8** | Design System, Wireframes |

---

**Phiên Bản**: 2.0 (Fixed - Chỉ có 4 vai trò, không có Customer)  
**Cập Nhật**: 2025-11-14  
**Author**: TableFlow Team
