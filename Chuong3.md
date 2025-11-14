# CHƯƠNG 3: THIẾT KẾ HỆ THỐNG

## 📋 MỤC LỤC

1. [Giới Thiệu Chương 3](#giới-thiệu-chương-3)
2. [Tổng Quan Thiết Kế](#31-tổng-quan-thiết-kế)
3. [Sitemap & Hướng Dẫn Vẽ](#32-sitemap--hướng-dẫn-vẽ)
4. [Phân Tích Use Case](#33-phân-tích-use-case)
5. [Thiết Kế Cơ Sở Dữ Liệu](#34-thiết-kế-cơ-sở-dữ-liệu)
6. [Sơ Đồ Thiết Kế (Class Diagram, Sequence, Activity)](#35-sơ-đồ-thiết-kế)
7. [Phân Quyền & Chức Năng](#36-phân-quyền--chức-năng)
8. [Cấu Trúc Mã Nguồn](#37-cấu-trúc-mã-nguồn)
9. [Thiết Kế Giao Diện](#38-thiết-kế-giao-diện)

---

## GIỚI THIỆU CHƯƠNG 3

**Chương này trình bày chi tiết quá trình thiết kế hệ thống ứng dụng quản lý nhà hàng/quán cà phê**, tập trung vào việc đảm bảo hiệu quả, tính trực quan, và khả năng mở rộng. 

### Nội Dung Chương Bao Gồm:

| Mục | Nội Dung |
|-----|---------|
| **3.1** | **Tổng quan về thiết kế**: Mô tả mục tiêu và nguyên tắc thiết kế của hệ thống, công nghệ chính, kiến trúc client-server |
| **3.2** | **Sitemap**: Cấu trúc điều hướng của website, giúp người dùng dễ dàng truy cập các chức năng, kèm hướng dẫn vẽ trong Figma |
| **3.3** | **Use Case**: Các trường hợp sử dụng, minh họa cách người dùng tương tác với hệ thống, bao gồm Sequence Diagram và Activity Diagram |
| **3.4** | **Thiết kế cơ sở dữ liệu**: Mô tả schema, bảng, và mối quan hệ để lưu trữ dữ liệu hiệu quả (ERD, SQL implementation) |
| **3.5** | **Sơ đồ luồng hoạt động**: Minh họa quy trình xử lý từ giao diện đến Backend và cơ sở dữ liệu (Class, Sequence, Activity, State Diagram) |
| **3.6** | **Phân quyền và chức năng**: Xác định vai trò người dùng (Customer, Staff, Admin) và các tính năng tương ứng, RLS Policies |
| **3.7** | **Cấu trúc mã nguồn**: Tổ chức mã nguồn để dễ bảo trì và mở rộng (folder structure, services, hooks) |
| **3.8** | **Thiết kế giao diện người dùng**: Chi tiết về thiết kế UI/UX, Design System, bao gồm wireframe và nguyên tắc thiết kế |

---

## 3.1 TỔNG QUAN THIẾT KẾ

Chương này trình bày chi tiết quá trình thiết kế hệ thống ứng dụng quản lý nhà hàng/quán cà phê, tập trung vào việc đảm bảo hiệu quả, tính trực quan, và khả năng mở rộng. Nội dung bao gồm:

- **Tổng quan về thiết kế**: Mô tả mục tiêu và nguyên tắc thiết kế của hệ thống
- **Sitemap**: Cấu trúc điều hướng của website, giúp người dùng dễ dàng truy cập các chức năng
- **Phân tích Use Case**: Các trường hợp sử dụng, minh họa cách người dùng tương tác với hệ thống
- **Thiết kế cơ sở dữ liệu**: Mô tả schema, bảng, và mối quan hệ để lưu trữ dữ liệu hiệu quả
- **Sơ đồ luồng hoạt động**: Minh họa quy trình xử lý từ giao diện đến Backend và cơ sở dữ liệu
- **Phân quyền và chức năng**: Xác định vai trò người dùng và các tính năng tương ứng
- **Cấu trúc mã nguồn**: Tổ chức mã nguồn để dễ bảo trì và mở rộng
- **Thiết kế giao diện người dùng**: Chi tiết về thiết kế UI/UX, bao gồm wireframe và nguyên tắc thiết kế

### 3.1.1 Giới Thiệu & Mô Tả Hệ Thống

Hệ thống được thiết kế để **quản lý nhà hàng/quán cà phê** hiện đại, cung cấp một nền tảng bán hàng trực tuyến và quản lý kinh doanh toàn diện, đáp ứng nhu cầu của cả khách hàng và quản trị viên. 

**Các thành phần chính**:
- **Gọi món tại bàn** (dùng Expo mobile app)
- **In hóa đơn & quản lý tài chính** (React Native)
- **Backend xử lý đơn hàng** (PostgreSQL + Supabase)
- **Realtime updates** cho bếp và nhân viên

Hệ thống sử dụng mô hình **Single Page Application (SPA)** và **Native Mobile App**, được xây dựng với:
- **Front-end**: React Native + Expo (Mobile), Tailwind CSS (Styling)
- **Back-end**: Supabase (PostgreSQL + Edge Functions)
- **Quản lý hình ảnh**: Cloudinary
- **Các thư viện bổ sung**: 
  - `jsonwebtoken` - xác thực an toàn
  - `@supabase/realtime` - cập nhật realtime
  - `react-toastify` - thông báo trực quan
  - `jsPDF` - in hóa đơn

### 3.1.2 Mục Tiêu Thiết Kế

| Tiêu Chí | Yêu Cầu | Chi Tiết |
|---------|--------|---------|
| **Tính Trực Quan** | Giao diện đơn giản, dễ sử dụng cho staff & customer | Phù hợp với mọi đối tượng, từ người trẻ đến người lớn tuổi |
| **Hiệu Suất Cao** | Realtime updates < 1s, API response < 200ms | Tối ưu tốc độ tải trang < 2 giây, xử lý request < 100ms |
| **Bảo Mật** | JWT authentication, RLS policies trên Supabase | Xác thực người dùng, mã hóa mật khẩu bcrypt, bảo vệ dữ liệu giao dịch |
| **Khả Năng Mở Rộng** | Hỗ trợ thêm payment methods, reports, analytics | Cấu trúc mã & database linh hoạt, dễ thêm tính năng |
| **Responsive** | Mobile-first design, hoạt động trên điện thoại/tablet | Giao diện tương thích mọi thiết bị nhờ Tailwind CSS |

### 3.1.3 Kiến Trúc Hệ Thống Client-Server

Hệ thống được thiết kế dựa trên mô hình **client-server**, với:
- **Front-end**: Xử lý giao diện người dùng
- **Back-end**: Xử lý logic nghiệp vụ (Supabase Edge Functions)
- **Database**: Lưu trữ thông tin (PostgreSQL)

**Các công cụ hỗ trợ thiết kế**:
- **Figma**: Thiết kế giao diện UI/UX
- **Draw.io / Lucidchart**: Vẽ sơ đồ (ERD, Sequence, Activity)
- **Postman**: Kiểm tra API
- **MySQL Workbench / pgAdmin**: Thiết kế cơ sở dữ liệu

### 3.1.4 Công Nghệ Chính

```
Frontend:
├── React Native + Expo (Mobile App)
├── Tailwind CSS (Styling)
├── TypeScript (Type Safety)
└── Supabase Realtime (Live Updates)

Backend:
├── Supabase (PostgreSQL + Edge Functions)
├── Supabase Auth (JWT Authentication)
├── Cloudinary (Image Management)
└── Email Services (Nodemailer)

Database:
├── PostgreSQL (Supabase)
├── Tables: users, orders, menu_items, tables, transactions, ingredients
├── RLS Policies (Row Level Security)
└── Triggers & Functions

Payment Integration:
├── MoMo API (QR Code, IPN Webhook)
├── VietQR API (Bank Transfer)
└── Direct Payment (Cash, Transfer)

Monitoring & Analytics:
├── Supabase Logs
├── Chart.js / Recharts (Charts)
└── jsPDF / ExcelJS (Export)
```

### 3.1.5 Mô Tả Luồng Dữ Liệu Chính

```
┌─────────────────┐
│ Mobile App UI   │ (React Native)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Supabase Client Library     │ (Authentication + Queries)
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Supabase Backend            │ (PostgreSQL)
│ ├─ Edge Functions           │
│ ├─ Realtime Subscriptions   │
│ ├─ RLS Policies             │
│ └─ Webhooks                 │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Database (PostgreSQL)       │
│ ├─ Tables (users, orders...)│
│ ├─ Triggers (auto-update)   │
│ └─ Functions (business logic)
└─────────────────────────────┘
```

---

## 3.2 SITEMAP & HƯỚNG DẪN VẼ

### 3.2.1 Sơ Đồ Sitemap Tổng Quát

```
┌─────────────────────────────────────────────────────────────┐
│                       TABLEFLOW SYSTEM                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐ ┌──▼────────┐ ┌─▼────────────┐
        │  CUSTOMER APP  │ │ STAFF APP │ │  ADMIN WEB   │
        │   (Mobile)     │ │ (Mobile)  │ │  (Desktop)   │
        └────────────────┘ └───────────┘ └──────────────┘
                │                │              │
        ┌───────▼─────────┐     │       ┌──────▼──────┐
        │ Xem Menu        │     │       │ Dashboard   │
        │ Gọi Món         │     │       │ Analytics   │
        │ Thanh Toán      │     │       │ Quản Lý     │
        │ Lịch Sử         │     │       │             │
        └─────────────────┘     │       └─────────────┘
                                │
                        ┌───────▼────────┐
                        │  SUPABASE      │
                        │  - PostgreSQL  │
                        │  - Realtime    │
                        │  - Auth        │
                        └────────────────┘
```

### 3.2.2 Sitemap Chi Tiết - Customer Module

```
HOME (/)
├── Xem Menu Sản Phẩm (/menu)
│   ├── Phân Loại Danh Mục
│   ├── Tìm Kiếm
│   └── Chi Tiết Sản Phẩm (/menu/:id)
│       └── Thêm Vào Giỏ (Add to Cart)
│
├── Giỏ Hàng (/cart)
│   ├── Xem Sản Phẩm
│   ├── Chỉnh Sửa Số Lượng
│   └── Xóa Sản Phẩm
│
├── Thanh Toán (/checkout)
│   ├── COD (Cash on Delivery)
│   ├── MoMo QR Code (/momo-payment)
│   ├── VietQR (/vietqr-payment)
│   └── Xác Nhận (/order-confirmation)
│
├── Lịch Sử Đơn Hàng (/orders)
│   └── Chi Tiết (/orders/:id)
│
├── Cá Nhân (/profile)
│   ├── Thông Tin Tài Khoản
│   └── Cài Đặt
│
└── Thông Tin Liên Lạc (/contact)
```

### 3.2.3 Sitemap Chi Tiết - Staff Module

```
STAFF DASHBOARD (/)
├── Gọi Món (/order)
│   ├── Chọn Bàn
│   ├── Thêm Sản Phẩm
│   ├── Xác Nhận Đơn → KITCHEN (In hóa đơn)
│   └── Lịch Sử Đơn
│
├── Bếp (Kitchen) (/kitchen)
│   ├── Danh Sách Đơn Chờ
│   ├── Từng Món Chi Tiết
│   └── Đánh Dấu Hoàn Thành
│
├── Thu Ngân (Cashier) (/cashier)
│   ├── Danh Sách Chờ Thanh Toán
│   ├── Chọn Phương Thức (MoMo, VietQR, Cash)
│   ├── In Hóa Đơn
│   └── Đóng Bàn
│
├── Quản Lý Bàn (/tables)
│   ├── Trạng Thái Bàn (Trống, Có Khách, Gộp)
│   ├── Chuyển Bàn
│   └── Gộp Bàn
│
└── Cài Đặt (/settings)
    └── Đăng Xuất
```

### 3.2.4 Sitemap Chi Tiết - Admin Module

```
ADMIN DASHBOARD (/admin)
├── Dashboard (/dashboard)
│   ├── KPI Hôm Nay (Doanh Thu, Đơn, Khách)
│   ├── Biểu Đồ (Revenue, Best Items)
│   └── Thống Kê Theo Giờ
│
├── Quản Lý Sản Phẩm (/products)
│   ├── Danh Sách Sản Phẩm
│   ├── Thêm Sản Phẩm
│   ├── Sửa / Xóa
│   └── Nhập CSV Hàng Loạt
│
├── Quản Lý Đơn Hàng (/orders)
│   ├── Lọc Theo Trạng Thái
│   ├── Chi Tiết Đơn
│   ├── Cập Nhật Trạng Thái
│   └── Xuất Excel
│
├── Quản Lý Bàn (/tables)
│   ├── Danh Sách Bàn
│   ├── Thêm/Sửa/Xóa Bàn
│   └── Cấu Hình Sơ Đồ
│
├── Quản Lý Nhân Viên (/staff)
│   ├── Danh Sách Nhân Viên
│   ├── Cấp Quyền (Role)
│   └── Lịch Sử Hoạt Động
│
├── Báo Cáo (/reports)
│   ├── Doanh Thu Ngày/Tháng/Năm
│   ├── Top Sản Phẩm Bán Chạy
│   ├── Lợi Nhuận
│   └── Xuất PDF/Excel
│
└── Cài Đặt (/settings)
    ├── Thông Tin Cửa Hàng
    ├── Cấu Hình Thanh Toán
    └── Backup Database
```

### 3.2.5 Hướng Dẫn Vẽ Sitemap trong Figma

#### **Bước 1: Mở Figma**
1. Truy cập [figma.com](https://figma.com)
2. Tạo file mới: `File → New`
3. Đặt tên: `TableFlow - Sitemap`

#### **Bước 2: Tạo Khung & Typography**
```
Board kích thước: 1920 x 1080

Typography:
├── Tiêu đề Cấp 1: 48px, Bold (Tên Module)
├── Tiêu đề Cấp 2: 32px, Semibold (Chức Năng Chính)
├── Tiêu đề Cấp 3: 24px, Regular (Trang Con)
└── Chữ Nhỏ: 16px, Regular (Mô Tả)

Color Palette:
├── Primary: #A60067 (Màu MoMo)
├── Secondary: #6B7280 (Xám)
├── Success: #16A34A (Xanh)
├── Warning: #F59E0B (Cam)
└── Background: #F9FAFB (Trắng Nhẹ)
```

#### **Bước 3: Vẽ Cấu Trúc Phân Cấp**

**Cách 1: Dùng Diagram (Khuyến Nghị)**
```
1. Insert → Components → Diagram
2. Chọn Org Chart / Flowchart
3. Thêm từng node:
   - Rectangle (200 x 80) cho mỗi trang
   - Text: Tên trang + URL
   - Connector: Nối liên kết giữa các trang
```

**Cách 2: Vẽ Thủ Công**
```
1. Dùng Rectangle Tool (R):
   - Vẽ box cho mỗi trang
   - Áp dụng Stroke: 2px, màu Primary
   - Fill: Background color

2. Dùng Connector Tool:
   - Nối các box với đường kết nối
   - Chỉnh hướng (Ngang, Dọc)

3. Thêm Text:
   - Tên trang: Bold 16px
   - URL: Italic 12px xám
   - Mô tả: Regular 12px dưới tên
```

#### **Bước 4: Chia Layers theo Vai Trò**

```
Figma Frame Layout:
├── Customer Flow
│   ├── Home
│   ├── Menu
│   ├── Cart
│   ├── Checkout
│   └── Orders
├── Staff Flow
│   ├── Order Entry
│   ├── Kitchen Display
│   ├── Cashier
│   └── Table Management
└── Admin Flow
    ├── Dashboard
    ├── Products
    ├── Orders
    └── Reports
```

#### **Bước 5: Thêm Color Legend & Notes**

```
Legend:
🔵 Trang Công Khai (Public)
🟣 Trang Riêng (Authenticated)
🔴 Trang Admin (Admin Only)

Notes:
- Mũi tên đặc = Luồng chính
- Mũi tên nét đứt = Luồng phụ
- Ghi chú: URL routes, điều kiện truy cập
```

#### **Bước 6: Export**
```
1. Select Board → File → Export
2. Format: PNG (72x) hoặc PDF
3. Tên file: Sitemap-TableFlow.png
4. Lưu vào: assets/diagrams/
```

### 3.2.6 Ví Dụ HTML Sitemap (Tùy Chọn)

```html
<!-- Có thể tạo sitemap tương tác bằng HTML -->
<div class="sitemap">
  <h1>TableFlow Sitemap</h1>
  
  <section class="module">
    <h2>🛍️ Customer Module</h2>
    <ul>
      <li><a href="/menu">Menu (/menu)</a></li>
      <li><a href="/cart">Giỏ Hàng (/cart)</a></li>
      <li><a href="/checkout">Thanh Toán (/checkout)</a></li>
      <li><a href="/orders">Lịch Sử (/orders)</a></li>
    </ul>
  </section>
  
  <section class="module">
    <h2>👨‍💼 Staff Module</h2>
    <ul>
      <li><a href="/staff/order">Gọi Món (/order)</a></li>
      <li><a href="/staff/kitchen">Bếp (/kitchen)</a></li>
      <li><a href="/staff/cashier">Thu Ngân (/cashier)</a></li>
    </ul>
  </section>
</div>
```

---

## 3.3 PHÂN TÍCH USE CASE

### 3.3.1 Sơ Đồ Use Case Tổng Quát

```
                          ┌─────────────────┐
                          │   TABLEFLOW     │
                          │     SYSTEM      │
                          └─────────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
        ┌───────▼────────┐  ┌─────▼────────┐  ┌─────▼────────┐
        │   CUSTOMER     │  │    STAFF     │  │    ADMIN     │
        │  (Guest/User)  │  │  (Cashier,   │  │   (Manager)  │
        │                │  │   Kitchen)   │  │              │
        └────────────────┘  └──────────────┘  └──────────────┘
             │                    │                    │
        UC01: Xem Menu        UC04: Gọi Món      UC09: Dashboard
        UC02: Gọi Món        UC05: Xử Lý Bếp    UC10: Báo Cáo
        UC03: Thanh Toán     UC06: Thu Ngân     UC11: Quản Lý
        UC08: Lịch Sử        UC07: Quản Bàn     UC12: Cấu Hình
```

### 3.3.2 Use Case Chi Tiết - UC02: Khách Hàng Gọi Món

#### **Mô Tả Tổng Quát**
- **Actor**: Khách hàng
- **Precondition**: Khách hàng đã được gán bàn
- **Postcondition**: Đơn hàng được lưu, gửi đến bếp
- **Flow chính**: 3 bước

#### **Sequence Diagram - Gọi Món**

```
Customer    UI        Backend      Database     Kitchen
   │         │          │            │            │
   │ Browse  │          │            │            │
   ├────────►│          │            │            │
   │         │ GET      │            │            │
   │         ├─────────►│            │            │
   │         │ /menu    │            │            │
   │         │ (items)  │            │            │
   │         │◄─────────┤            │            │
   │ Display │          │            │            │
   │◄────────┤          │            │            │
   │         │          │            │            │
   │ Select  │          │            │            │
   ├────────►│          │            │            │
   │ Add     │ POST     │            │            │
   │ to Cart ├─────────►│            │            │
   │         │ /order   │            │            │
   │         │ {items}  │            │            │
   │         │          │ INSERT     │            │
   │         │          ├───────────►│            │
   │         │◄─────────┤ order_id   │            │
   │ Confirm │          │            │            │
   │◄────────┤          │            │            │
   │         │          │ PUBLISH    │            │
   │         │          ├────────────────────────►│
   │         │          │ new_order  │  Notified  │
   │         │          │            │            │
```

#### **Activity Diagram - Gọi Món**

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Hiển Thị Menu   │
└────┬────────────┘
     │
     ▼
┌──────────────────────┐      No    ┌──────────────┐
│ Khách Chọn Sản Phẩm? ├──────────►│ Menu Trống?  │
└────┬─────────────────┘           └──────────────┘
Yes  │
     ▼
┌─────────────────────┐
│ Thêm Vào Giỏ (Cart) │
└────┬────────────────┘
     │
     ▼
┌──────────────────────┐      No    ┌────────────┐
│ Thêm Sản Phẩm Khác? ├──────────►│ Xác Nhận   │
└────┬─────────────────┘           └─────┬──────┘
Yes  │                                    │
     └──────────────────┬──────────────────┘
                        │
                        ▼
                 ┌────────────────┐
                 │ Gửi Đơn (Order)│
                 └────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Đơn Vào Kitchen     │
            │ Hiển Thị Realtime   │
            └────┬────────────────┘
                 │
                 ▼
            ┌──────────┐
            │   END    │
            └──────────┘
```

### 3.3.3 Use Case Chi Tiết - UC03: Thanh Toán

#### **Sequence Diagram - Thanh Toán MoMo**

```
Customer  Cashier    System    MoMo API    Database   Email Service
   │        │          │          │           │            │
   │ Request│          │          │           │            │
   │Payment ├────────► │          │           │            │
   │        │ (amount) │          │           │            │
   │        │          │ POST     │           │            │
   │        │          ├─────────►│           │            │
   │        │          │ createQR │           │            │
   │        │          │          │ QR URL    │            │
   │        │          │◄─────────┤           │            │
   │ Scan QR│          │          │           │            │
   │◄───────┤          │          │           │            │
   │ & Pay  │          │          │           │            │
   │ MoMo   │ Confirm  │          │           │            │
   │ App    │          │ INSERT   │           │            │
   │───────►├────────►│ order    │           │            │
   │        │         │         ├──────────►│ record ok  │
   │        │         │          │           │            │
   │        │         │          │ IPN       │            │
   │        │         │          │ Callback  │            │
   │        │         │          │◄──────────┤            │
   │        │         │ UPDATE   │           │            │
   │        │         │ status   │           │            │
   │        │         │ paid     ├──────────►│ UPDATE     │
   │        │         │          │           │            │
   │        │ Success │          │           │            │
   │        │◄────────┤          │           │  Email     │
   │        │         │          │           ├───────────►│
   │ Receipt│         │          │           │ Confirm    │
   │◄───────┤         │          │           │            │
   │        │         │          │           │            │

Legend:
─────► : Sync call
─ ─ ─► : Async call (IPN)
```

---

## 3.4 THIẾT KẾ CƠ SỞ DỮ LIỆU

### 3.4.1 ERD - Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │
│ email               │◄─┐
│ password            │  │
│ role (admin/staff)  │  │
│ created_at          │  │
└─────────────────────┘  │
          │              │
          │ 1──N         │
          ▼              │
┌─────────────────────┐  │
│      orders         │  │
├─────────────────────┤  │
│ id (PK)             │  │
│ user_id (FK)    ────┘  │
│ status              │   │
│ total_price         │   │
│ payment_method      │   │
│ created_at          │   │
└─────┬───────────────┘   │
      │ 1──N              │
      ▼                   │
┌─────────────────────┐   │
│  order_items        │   │
├─────────────────────┤   │
│ id (PK)             │   │
│ order_id (FK)       │   │
│ menu_item_id (FK) ──┼───┘
│ quantity            │
│ price               │
└─────────────────────┘

(xem ERD đầy đủ ở mục 3.4.2)
```

### 3.4.2 Schema Chi Tiết từ PostgreSQL

#### **Bảng: users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role TEXT CHECK (role IN ('customer', 'staff', 'admin')),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- `id`: Định danh duy nhất (UUID)
- `email`: Email xác thực (duy nhất)
- `role`: Vai trò (customer/staff/admin)
- `phone, address`: Thông tin giao hàng

---

#### **Bảng: tables**

```sql
CREATE TABLE tables (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status TEXT CHECK (status IN ('Trống', 'Có khách', 'Gộp')),
  seats INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- `id`: Số hiệu bàn (1, 2, 3...)
- `name`: Tên bàn ("Bàn 1", "Bàn 2"...)
- `status`: Trạng thái hiện tại
- `seats`: Số ghế

---

#### **Bảng: menu_items**

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2), -- Giá vốn
  category VARCHAR(100),
  image_url TEXT,
  daily_limit INT DEFAULT NULL,
  remaining_quantity INT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- `price`: Giá bán
- `cost`: Giá vốn (tính lợi nhuận)
- `daily_limit`: Giới hạn số lượng bán/ngày
- `remaining_quantity`: Số lượng còn lại trong ngày

---

#### **Bảng: orders**

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  table_id BIGINT REFERENCES tables(id),
  status TEXT CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  total_price NUMERIC(10, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'momo', 'vietqr')),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  paid_at TIMESTAMP,
  is_provisional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- `status`: Trạng thái xử lý (chờ → đã thanh toán → hoàn thành)
- `payment_method`: Phương thức thanh toán
- `is_provisional`: Tính toán tạm (chưa chốt bill)

---

#### **Bảng: order_items**

```sql
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2),
  status TEXT CHECK (status IN ('waiting', 'preparing', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- Liên kết mỗi sản phẩm với đơn hàng
- `status`: Trạng thái từng món (chờ → nấu → hoàn thành)

---

#### **Bảng: transactions**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10, 2),
  method TEXT CHECK (method IN ('cash', 'momo', 'vietqr')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  reference_id VARCHAR(255), -- Mã giao dịch từ MoMo
  raw_response JSONB, -- Response từ payment gateway
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- Ghi chép mỗi giao dịch thanh toán
- `reference_id`: ID từ MoMo/VietQR để theo dõi

---

#### **Bảng: ingredients**

```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50), -- 'kg', 'liter', 'pieces'
  stock_quantity NUMERIC(10, 2),
  low_stock_threshold NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mô Tả**:
- Tồn kho nguyên liệu
- `low_stock_threshold`: Ngưỡng cảnh báo

---

#### **Bảng: menu_item_ingredients** (Công Thức)

```sql
CREATE TABLE menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity_needed NUMERIC(10, 2)
);
```

**Mô Tả**:
- Định nghĩa công thức nấu ăn
- Liên kết sản phẩm ← nguyên liệu

---

### 3.4.3 Mối Quan Hệ & Ràng Buộc

| Quan Hệ | Chi Tiết |
|---------|---------|
| **users → orders** | 1 user có N orders (1-N) |
| **orders → order_items** | 1 order có N items (1-N) |
| **order_items → menu_items** | N items tham chiếu 1 menu_item (N-1) |
| **orders → transactions** | 1 order có 1 transaction (1-1) |
| **menu_items → ingredients** | N-N qua bảng menu_item_ingredients |

---

### 3.4.4 Diagram SQL (Tạo từ SQL Backup)

```sql
-- Ví dụ: Tạo order mới
BEGIN TRANSACTION;

-- 1. Insert Order
INSERT INTO orders (user_id, table_id, status, total_price, payment_method)
VALUES ($1, $2, 'pending', $3, 'cash');

-- 2. Insert Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
VALUES ($4, $5, $6, $7);

-- 3. Trừ nguyên liệu
UPDATE ingredients 
SET stock_quantity = stock_quantity - $8
WHERE id = $9;

-- 4. Update Menu Item Remaining
UPDATE menu_items 
SET remaining_quantity = remaining_quantity - $6
WHERE id = $5;

COMMIT;
```

---

## 3.5 SƠ ĐỒ THIẾT KẾ

### 3.5.1 Class Diagram (Phần Mềm)

```
┌──────────────────────────┐
│      User               │
├──────────────────────────┤
│ - id: UUID              │
│ - email: string         │
│ - password: string      │
│ - role: enum            │
└──────────────────────────┘
         ▲
         │ inherit
         │
    ┌────┴─────┬───────────┐
    │           │           │
┌───▼──┐   ┌───▼──┐   ┌───▼──┐
│Admin │   │Staff │   │Client│
└──────┘   └──────┘   └──────┘


┌──────────────────────────┐
│      Order              │
├──────────────────────────┤
│ - id: UUID              │
│ - user_id: FK           │
│ - status: enum          │
│ - total_price: decimal  │
│ - created_at: datetime  │
├──────────────────────────┤
│ + create(): void        │
│ + update(): void        │
│ + cancel(): void        │
└──────────────────────────┘
         ▲
         │ has
         │ 1---N
         │
┌────────┴──────────────────┐
│   OrderItem              │
├─────────────────────────────┤
│ - id: BIGINT               │
│ - order_id: FK             │
│ - menu_item_id: FK         │
│ - quantity: int            │
│ - status: enum             │
└─────────────────────────────┘
```

### 3.5.2 Sequence Diagram - Quy Trình Đặt Hàng (Chi Tiết)

```
┌─────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐
│   Customer  │ │ Frontend │ │  Backend   │ │ Database │ │  Kitchen │
└─────────────┘ └──────────┘ └────────────┘ └──────────┘ └──────────┘
      │              │              │              │              │
      │ Browse Menu  │              │              │              │
      ├─────────────►│              │              │              │
      │              │ GET /menu    │              │              │
      │              ├─────────────►│              │              │
      │              │              │ SELECT *     │              │
      │              │              ├─────────────►│              │
      │              │              │◄─────────────┤              │
      │              │              │ menu[]       │              │
      │              │◄─────────────┤              │              │
      │◄─────────────┤              │              │              │
      │ Display Menu │              │              │              │
      │              │              │              │              │
      │ Select Item  │              │              │              │
      ├─────────────►│              │              │              │
      │ (qty)        │ POST /order  │              │              │
      │              ├─────────────►│              │              │
      │              │              │ Validate     │              │
      │              │              │ + Deduct Qty │              │
      │              │              ├─────────────►│              │
      │              │              │ INSERT order │              │
      │              │              │ INSERT items │              │
      │              │              │◄─────────────┤              │
      │              │              │ order_id     │              │
      │              │◄─────────────┤              │              │
      │◄─────────────┤              │ PUBLISH      │              │
      │ Confirmed    │              │ new_order    ├─────────────►│
      │              │              │              │ Received     │
      │              │              │              │ (Realtime)   │
      │              │              │              │              │
```

### 3.5.3 Activity Diagram - Thanh Toán MoMo

```
┌──────────────────────────────────────────────────────────┐
│                    Cashier Flow                          │
└──────────────────────────────────────────────────────────┘

        START
          │
          ▼
   ┌─────────────────────┐
   │ Khách Thanh Toán    │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────────────────────────────┐
   │ Chọn Phương Thức Thanh Toán:               │
   │ ○ Cash  ○ MoMo  ○ VietQR                   │
   └────────┬────────────────────────────────────┘
            │
  ┌─────────┴─────────────────────────────┐
  │                                        │
  ▼ MoMo                                   ▼ Cash/VietQR
┌─────────────────────┐           ┌──────────────────┐
│ Tạo QR Code MoMo    │           │ Xác Nhận Thanh   │
│ Backend gọi API     │           │ Toán Trực Tiếp   │
│ createQR()          │           │                  │
└────────┬────────────┘           └──────┬───────────┘
         │                               │
         ▼                               ▼
    ┌──────────────────────────────────────────┐
    │ Hiển Thị QR / Form Xác Nhận              │
    └───────────────────┬──────────────────────┘
                        │
                        ▼
                   [Chờ MoMo IPN]
                   [hoặc Xác Nhận]
                        │
                        ▼
         ┌──────────────────────────────┐
         │ Callback từ MoMo / Xác Nhận  │
         └────────┬─────────────────────┘
                  │
        ┌─────────┴───────────┐
        │                     │
        ▼ Success             ▼ Failed
   ┌──────────────┐      ┌──────────────┐
   │ Update Order │      │ Thất Bại     │
   │ status=paid  │      │ Retry?       │
   │              │      │              │
   │ In Hóa Đơn   │      └──────────────┘
   │              │
   │ Đóng Bàn     │
   └──────────────┘
        │
        ▼
      END
```

### 3.5.4 State Diagram - Order Status

```
        ┌─────────────┐
        │   pending   │ ◄─── Order được tạo
        └──────┬──────┘
               │ Customer thanh toán
               ▼
        ┌─────────────┐
        │    paid     │
        └──────┬──────┘
               │ Bếp hoàn thành tất cả món
               ▼
        ┌─────────────┐
        │ completed   │ ◄─── Khách nhận hàng
        └─────────────┘
        
        ┌─────────────┐
        │  pending    │
        └──────┬──────┘
               │ Khách hủy trong 10 phút
               ▼
        ┌─────────────┐
        │ cancelled   │ ◄─── Hoàn tiền
        └─────────────┘
```

---

## 3.6 PHÂN QUYỀN & CHỨC NĂNG

### 3.6.1 Phân Quyền theo Vai Trò

#### **Customer (Khách Hàng)**

| Chức Năng | Quyền |
|-----------|-------|
| Xem Menu | ✅ |
| Gọi Món | ✅ |
| Thanh Toán | ✅ |
| Hủy Đơn (trong 10p) | ✅ |
| Xem Lịch Sử | ✅ |
| Quản Lý Sản Phẩm | ❌ |
| Xem Dashboard | ❌ |

```sql
-- RLS Policy cho customers
CREATE POLICY customer_see_own_orders ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

---

#### **Staff (Nhân Viên)**

Tùy vào role con:

**Cashier (Thu Ngân)**:
- Xem danh sách chờ thanh toán
- Xử lý thanh toán
- In hóa đơn
- Báo cáo hôm nay

**Kitchen (Bếp)**:
- Xem danh sách đơn chờ
- Đánh dấu hoàn thành từng món
- Nhận thông báo realtime

```sql
-- RLS Policy cho staff
CREATE POLICY staff_see_all_orders ON orders
  FOR SELECT USING (
    auth.jwt_meta('role') = 'staff' 
    OR auth.jwt_meta('role') = 'admin'
  );
```

---

#### **Admin (Quản Lý)**

| Chức Năng | Quyền |
|-----------|-------|
| CRUD Sản Phẩm | ✅ |
| CRUD Đơn Hàng | ✅ |
| CRUD Bàn | ✅ |
| CRUD Nhân Viên | ✅ |
| Báo Cáo & Analytics | ✅ |
| Cấu Hình Hệ Thống | ✅ |
| Backup Database | ✅ |

```sql
-- RLS Policy cho admin
CREATE POLICY admin_all ON orders
  FOR ALL USING (auth.jwt_meta('role') = 'admin');
```

---

### 3.6.2 Chức Năng Chi Tiết

#### **Customer Module**

```typescript
// /src/screens/Customer/

✅ MenuScreen
   - GET /api/menu_items
   - Hiển thị danh sách, phân loại, tìm kiếm

✅ CartScreen
   - POST /api/cart/add
   - PUT /api/cart/update
   - DELETE /api/cart/remove
   - GET /api/cart/total

✅ CheckoutScreen
   - POST /api/orders/create
   - Chọn phương thức thanh toán
   - MoMo: GET qr code, poll status
   - Cash: Xác nhận trực tiếp

✅ OrderHistoryScreen
   - GET /api/orders/:userId
   - Filter by status
```

---

#### **Staff Module**

```typescript
// /src/screens/Staff/

✅ OrderEntryScreen (Gọi Món)
   - Chọn bàn
   - POST /api/orders + order_items
   - Gửi bếp

✅ KitchenDisplayScreen (Bếp)
   - Realtime GET /api/orders?status=pending
   - PUT /api/order_items/:id/status → 'completed'
   - Realtime notification khi có order mới

✅ CashierScreen (Thu Ngân)
   - GET /api/orders?status=paid
   - SELECT payment_method
   - PUT /api/orders/:id → mark 'completed'
   - Print invoice (HTML to PDF)
   - POST /api/daily_report

✅ TableManagementScreen
   - GET /api/tables
   - PUT /api/tables/:id/status
   - Visual floor map
```

---

#### **Admin Module**

```typescript
// /src/screens/Admin/

✅ DashboardScreen
   - GET /api/dashboard/kpis (revenue, orders, customers)
   - GET /api/dashboard/sales_by_hour
   - Charts: Chart.js / Recharts

✅ ProductManagementScreen
   - GET/POST/PUT/DELETE /api/menu_items
   - Upload image → Cloudinary
   - Batch import CSV

✅ OrderManagementScreen
   - GET /api/orders (with filters)
   - PUT /api/orders/:id/status
   - Export Excel/PDF

✅ ReportingScreen
   - Daily / Monthly / Yearly reports
   - Profit & loss
   - Top products
   - Export capabilities

✅ SettingsScreen
   - Restaurant info
   - Payment settings
   - Backup/Restore DB
```

---

## 3.7 CẤU TRÚC MÃ NGUỒN

### 3.7.1 Cấu Trúc Thư Mục

```
my-expo-app/
├── src/
│   ├── screens/
│   │   ├── Customer/
│   │   │   ├── MenuScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   ├── CheckoutScreen.tsx
│   │   │   └── OrderHistoryScreen.tsx
│   │   ├── Staff/
│   │   │   ├── OrderEntryScreen.tsx
│   │   │   ├── KitchenDisplayScreen.tsx
│   │   │   ├── CashierScreen.tsx
│   │   │   └── TableManagementScreen.tsx
│   │   └── Admin/
│   │       ├── DashboardScreen.tsx
│   │       ├── ProductScreen.tsx
│   │       ├── OrderScreen.tsx
│   │       └── ReportingScreen.tsx
│   ├── components/
│   │   ├── OrderCard.tsx
│   │   ├── MenuItemCard.tsx
│   │   └── PaymentModal.tsx
│   ├── services/
│   │   ├── supabase.ts (Client)
│   │   ├── orderService.ts
│   │   ├── menuService.ts
│   │   └── paymentService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   └── useRealtimeOrders.ts
│   ├── types/
│   │   └── index.ts (TypeScript interfaces)
│   └── navigation/
│       ├── AppNavigator.tsx
│       ├── CustomerNavigator.tsx
│       ├── StaffNavigator.tsx
│       └── AdminNavigator.tsx
├── supabase/
│   ├── functions/
│   │   ├── create-momo-payment/
│   │   ├── momo-ipn-handler/
│   │   └── generate-report/
│   └── migrations/
│       └── 001_initial_schema.sql
└── assets/
    └── images/
```

---

### 3.7.2 Ví Dụ: OrderService

```typescript
// /src/services/orderService.ts

import { supabase } from './supabase';

export const createOrder = async (
  tableId: number,
  items: OrderItem[],
  paymentMethod: 'cash' | 'momo' | 'vietqr'
) => {
  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: tableId,
      status: 'pending',
      payment_method: paymentMethod,
      total_price: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.qty,
        unit_price: item.price,
      }))
    );

  if (itemsError) throw itemsError;

  // 3. Broadcast to kitchen (Realtime)
  supabase.channel(`kitchen-${tableId}`).send('broadcast', {
    event: 'new_order',
    payload: { order_id: order.id, table_id: tableId },
  });

  return order;
};
```

---

## 3.8 THIẾT KẾ GIAO DIỆN

### 3.8.1 Design System

#### **Color Palette**

```
Primary:    #A60067 (MoMo Pink)
Secondary:  #6B7280 (Gray)
Success:    #16A34A (Green)
Warning:    #F59E0B (Amber)
Error:      #DC2626 (Red)
Background: #F9FAFB (Off White)
Surface:    #FFFFFF (White)
```

#### **Typography**

```
Display:     48px, Bold, #1F2937
Heading 1:   32px, Bold, #1F2937
Heading 2:   24px, Semibold, #374151
Heading 3:   20px, Semibold, #374151
Body:        16px, Regular, #374151
Caption:     14px, Regular, #6B7280
```

#### **Spacing**

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

---

### 3.8.2 Wireframe - Order Entry Screen

```
┌─────────────────────────────────────────┐
│  TableFlow - Order Entry        [Back] │  (Header)
├─────────────────────────────────────────┤
│                                         │
│  Chọn Bàn:  [Bàn 1]  [Bàn 2]  [Bàn 3] │  (Table Selection)
│             [Bàn 4]  [Bàn 5]  [Bàn 6] │
│                                         │
├─────────────────────────────────────────┤
│ 📋 Menu Items                           │  (Menu Search)
│ ┌────────────────────────────────────┐  │
│ │ [Cà Phê] [Trà] [Juice] [Ăn Vặt]  │  │
│ └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ☕ Cà Phê Đen             49.000đ   │ │  (Item Card)
│ │ Lorem ipsum dolor...                 │ │
│ │        [+]                           │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🥤 Trà Đá                39.000đ    │ │
│ │ Lorem ipsum dolor...                 │ │
│ │        [+]                           │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ 🛒 Giỏ (3)              [Xóa Tất]      │
│ ┌─────────────────────────────────────┐ │
│ │ Cà Phê Đen x2      98.000đ  [- + x]│ │
│ │ Trà Đá x1          39.000đ  [- + x]│ │
│ │ ────────────────────────────────    │ │
│ │ Tổng: 137.000đ                      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│       [Xóa Đơn]      [Gửi Bếp →]       │  (Actions)
│                                         │
└─────────────────────────────────────────┘
```

---

### 3.8.3 Wireframe - Kitchen Display System (KDS)

```
┌──────────────────────────────────────────────┐
│  Kitchen Display System                      │
├──────────────────────────────────────────────┤
│                                              │
│ [Tất Cả] [Chờ] [Đang Nấu] [Hoàn Thành]    │
│                                              │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  BÀNG 1          │  BÀNG 2                  │
│  ┌────────────┐  │  ┌────────────────────┐ │
│  │ 🟥 Chờ      │  │  │ 🟨 Đang Nấu       │ │
│  │            │  │  │                    │ │
│  │ x2 Cà Phê  │  │  │ x1 Trà Đá          │ │
│  │ x1 Bánh    │  │  │ (đã nấu 8 phút)    │ │
│  │            │  │  │                    │ │
│  │ 10:45 AM   │  │  │ [✓ Xong]          │ │
│  │            │  │  │                    │ │
│  │ [Bắt Đầu]  │  │  └────────────────────┘ │
│  │            │  │                          │
│  └────────────┘  │  BÀNG 3                  │
│                  │  ┌────────────────────┐ │
│  BÀNG 4          │  │ 🟩 Hoàn Thành      │ │
│  ┌────────────┐  │  │                    │ │
│  │ 🟩 Hoàn    │  │  │ x1 Juice           │ │
│  │ Thành      │  │  │                    │ │
│  │            │  │  │ [➤ Phục Vụ]       │ │
│  │ x3 Bánh    │  │  │                    │ │
│  │            │  │  └────────────────────┘ │
│  │ [➤ Phục]   │  │                          │
│  │            │  │                          │
│  └────────────┘  │                          │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

---

### 3.8.4 Nguyên Tắc Thiết Kế

1. **Mobile First**: Thiết kế cho điện thoại trước, rồi mở rộng lên tablet/desktop
2. **Accessibility**: Đủ contrast, font size lớn, easy to tap
3. **Performance**: Lazy loading, optimized images từ Cloudinary
4. **Consistency**: Cùng component library, spacing, colors

---

## 🎯 TÓM TẮT CHƯƠNG 3

| Mục | Nội Dung |
|-----|---------|
| **3.1** | Tổng quan & mục tiêu thiết kế |
| **3.2** | Sitemap chi tiết + hướng dẫn vẽ Figma |
| **3.3** | Use case (UC01-UC12) + Sequence/Activity diagrams |
| **3.4** | Schema PostgreSQL + ERD + SQL implementation |
| **3.5** | Class/Sequence/Activity/State diagrams |
| **3.6** | Phân quyền RLS + chức năng theo role |
| **3.7** | Cấu trúc thư mục & code organization |
| **3.8** | Design system, wireframes, UI principles |

---

## 📚 TÀI LIỆU THAM KHẢO

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Figma Wireframing**: https://www.figma.com/resources/
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/

---

**Phiên Bản**: 1.0  
**Cập Nhật**: 2025-11-14  
**Author**: TableFlow Team
