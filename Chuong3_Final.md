# CHƯƠNG 3 - THIẾT KẾ HỆ THỐNG

## 📋 MỤC LỤC

1. [Tổng Quan Thiết Kế](#31-tổng-quan-thiết-kế)
2. [Sitemap](#32-sitemap)
3. [Use Case](#33-use-case)
4. [Phân Quyền và Chức Năng](#34-phân-quyền-và-chức-năng)
5. [Thiết Kế Cơ Sở Dữ Liệu](#35-thiết-kế-cơ-sở-dữ-liệu)
6. [Sơ Đồ Luồng Hoạt Động](#36-sơ-đồ-luồng-hoạt-động)
7. [Cấu Trúc Mã Nguồn](#37-cấu-trúc-mã-nguồn)
8. [Thiết Kế Giao Diện Người Dùng](#38-thiết-kế-giao-diện-người-dùng)

---

## 3.1. TỔNG QUAN THIẾT KẾ

### 3.1.1. Giới Thiệu & Mô Tả Hệ Thống

TableFlow là **ứng dụng di động nội bộ** được thiết kế dành riêng cho nhân viên phục vụ, bộ phận bếp, thu ngân và quản lý nhà hàng/quán cà phê. Ứng dụng giúp **tự động hóa toàn bộ quy trình** từ gọi món → chế biến → thanh toán → báo cáo, đảm bảo đồng bộ dữ liệu realtime giữa các bộ phận.

**Các thành phần chính**:
- **Gọi món tại bàn**: Nhân viên phục vụ chọn bàn, duyệt menu, tạo đơn hàng
- **Kitchen Display System (KDS)**: Bếp xem danh sách đơn hàng realtime, cập nhật trạng thái các món
- **Quản lý thanh toán**: Thu ngân xử lý thanh toán, in hóa đơn, đóng bàn
- **Quản lý hệ thống**: Admin giám sát hoạt động, quản lý sản phẩm, báo cáo doanh thu

**Công nghệ sử dụng**:
- **Frontend**: React Native + Expo (cross-platform mobile iOS/Android)
- **Backend**: Supabase (PostgreSQL + Realtime + Authentication)
- **Styling**: NativeWind (Tailwind CSS cho React Native)
- **Payment**: MoMo QR, VietQR, Chuyển khoản, Tiền mặt
- **Storage**: Cloudinary (quản lý hình ảnh sản phẩm)

### 3.1.2. Mục Tiêu Thiết Kế

Hệ thống được thiết kế nhằm đạt được những mục tiêu sau:

| Tiêu Chí | Yêu Cầu | Chi Tiết |
|---------|--------|---------|
| **Tính Trực Quan** | Giao diện đơn giản, dễ sử dụng cho nhân viên | Phù hợp với mọi đối tượng, tối ưu cho thao tác nhanh |
| **Hiệu Suất Cao** | Realtime updates < 1s, API response < 200ms | Tối ưu tốc độ tải, xử lý request nhanh chóng |
| **Bảo Mật** | JWT authentication, RLS policies | Xác thực user chặt chẽ, phân quyền theo vai trò |
| **Khả Năng Mở Rộng** | Dễ thêm tính năng mới, phương thức thanh toán | Cấu trúc mã linh hoạt, database extensible |
| **Realtime** | Đồng bộ dữ liệu tức thời | Staff, Kitchen, Cashier cập nhật cùng lúc |

### 3.1.3. Kiến Trúc Hệ Thống Client-Server

Hệ thống TableFlow được xây dựng theo mô hình **client-server** với ba lớp chính:

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
                    │ • Row Level Security│
                    └─────────────────────┘
```

**Các thành phần**:
- **Frontend (Client)**: Ứng dụng React Native chạy trên điện thoại, xử lý giao diện và logic phía client
- **Backend (Server)**: Supabase xử lý xác thực, lưu trữ dữ liệu, và cung cấp API
- **Database (PostgreSQL)**: Lưu trữ toàn bộ dữ liệu ứng dụng

**Các công cụ hỗ trợ thiết kế**:
- **Figma**: Thiết kế giao diện UI/UX
- **Draw.io**: Vẽ sơ đồ (ERD, Sequence, Activity)
- **Postman**: Kiểm tra API
- **pgAdmin**: Quản lý cơ sở dữ liệu PostgreSQL

### 3.1.4. Công Nghệ Chính

```
Frontend Layer:
├── React Native + Expo (Mobile App)
├── NativeWind (Tailwind CSS)
├── TypeScript (Type Safety)
├── React Navigation (Navigation)
└── Supabase Realtime Client

Backend Layer:
├── Supabase (BaaS Platform)
├── PostgreSQL (Database)
├── Supabase Auth (JWT)
├── Supabase Realtime (Websocket)
└── Edge Functions (Serverless)

External Services:
├── MoMo API (Payment Gateway)
├── VietQR API (Bank Transfer)
└── Cloudinary (Image CDN)
```

---

## 3.2. SITEMAP

### 3.2.1. Tổng Quan Sitemap

TableFlow là ứng dụng nội bộ cho **4 vai trò chính** (Staff, Kitchen, Cashier, Admin), không có khách hàng. Mỗi vai trò có giao diện và chức năng riêng biệt tối ưu cho công việc cụ thể của họ.

**Hình 3.1: Sitemap TableFlow**

![Sitemap_TableFlow](./assets/sitemap_tableflow.png)

### 3.2.2. Chi Tiết Sitemap từng Vai Trò

#### **A. STAFF (Nhân Viên Phục Vụ) - Gọi Món**

```
LOGIN (/)
│
├── DASHBOARD
│   │
│   ├── 📋 GỌI MÓN (Order Entry)
│   │   ├── Chọn Bàn (Table Selection)
│   │   ├── Xem Menu Sản Phẩm
│   │   │   ├── Danh Mục
│   │   │   ├── Tìm Kiếm
│   │   │   └── Chi Tiết Sản Phẩm
│   │   ├── Giỏ Hàng Tạm
│   │   │   ├── Sửa Số Lượng
│   │   │   ├── Xóa Sản Phẩm
│   │   │   └── Tùy Chỉnh Sản Phẩm
│   │   └── Xác Nhận & Gửi Bếp
│   │
│   ├── 📊 LỊCH SỬ ĐƠN HÀNG
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

#### **B. KITCHEN (Bộ Phận Bếp) - KDS**

```
LOGIN (/)
│
├── KITCHEN DASHBOARD (KDS)
│   │
│   ├── 🎯 DANH SÁCH ĐƠN HÀNG
│   │   ├── Filter: [Tất Cả] [Chờ] [Đang Nấu] [Hoàn Thành]
│   │   │
│   │   └── Từng Bàn/Đơn
│   │       ├── Bàn số + Thời gian
│   │       ├── Danh sách sản phẩm
│   │       │   ├── Số lượng x Tên sản phẩm
│   │       │   └── [Bắt Đầu] / [✓ Hoàn Thành]
│   │       └── Thời gian nấu (Elapsed time)
│   │
│   ├── 🔔 THÔNG BÁO REALTIME
│   │   ├── Đơn hàng mới (Âm thanh + Rung)
│   │   ├── Đơn hàng bị hủy
│   │   └── Deadline cảnh báo
│   │
│   └── ⚙️ CÀI ĐẶT
│       ├── Vô hiệu hóa âm thanh
│       └── Đăng Xuất
```

#### **C. CASHIER (Thu Ngân) - Thanh Toán**

```
LOGIN (/)
│
├── CASHIER DASHBOARD
│   │
│   ├── 💳 THANH TOÁN
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
│   ├── 📈 THỐNG KÊ DOANH THU
│   │   ├── Doanh Thu Hôm Nay
│   │   ├── Theo Phương Thức Thanh Toán
│   │   └── Biểu Đồ Realtime
│   │
│   └── ⚙️ CÀI ĐẶT
│       └── Đăng Xuất
```

#### **D. ADMIN (Quản Lý) - Dashboard & Quản Lý Hệ Thống**

```
LOGIN (/)
│
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
│   │   ├── Sửa/Cập Nhật Giá
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
│   │   ├── Sửa/Xóa Bàn
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
│   │   ├── Doanh Thu (Ngày/Tháng/Năm)
│   │   ├── Lợi Nhuận & Chi Phí
│   │   ├── Sản Phẩm Bán Chạy
│   │   ├── Hoàn Trả & Khiếu Nại
│   │   └── Xuất PDF/Excel
│   │
│   └── ⚙️ CÀI ĐẶT HỆ THỐNG
│       ├── Thông Tin Cửa Hàng
│       ├── Cấu Hình Thanh Toán
│       ├── Cài Đặt Hóa Đơn
│       ├── Sao Lưu/Khôi Phục DB
│       └── Đăng Xuất
```

---

## 3.3. USE CASE

### 3.3.1. Sơ Đồ Use Case Tổng Quát

**Hình 3.2: Use Case Diagram TableFlow**

![UseCase_Diagram](./assets/usecase_diagram.png)

### 3.3.2. Chi Tiết Các Use Case

#### **UC01: Gọi Món (Staff)**

**Mô Tả**: Nhân viên phục vụ chọn bàn, duyệt menu, thêm sản phẩm vào giỏ, tùy chỉnh sản phẩm, và gửi đơn hàng đến bếp.

**Actors**: Nhân viên phục vụ (Staff)

**Precondition**: 
- Nhân viên đã đăng nhập vào hệ thống
- Bàn trống hoặc có khách đang ngồi

**Postcondition**: 
- Đơn hàng được tạo và lưu trong cơ sở dữ liệu
- Bếp nhận được thông báo realtime với chi tiết đơn hàng
- Trạng thái bàn được cập nhật từ "Trống" → "Có khách"
- Nhân viên xem được danh sách đơn trong lịch sử

**Main Flow**:

```
1. Nhân viên mở ứng dụng → Hiển thị danh sách bàn (Trống, Có khách, Gộp)
2. Nhân viên chọn bàn trống → Chuyển đến màn hình Menu
3. Nhân viên duyệt danh sách sản phẩm (có thể tìm kiếm, lọc theo danh mục)
4. Nhân viên chọn sản phẩm → Hiển thị chi tiết, tùy chỉnh (nếu có)
5. Nhân viên thêm sản phẩm vào giỏ hàng (có thể nhập số lượng, ghi chú)
6. Nhân viên có thể tiếp tục thêm sản phẩm khác hoặc xác nhận
7. Nhân viên xem giỏ hàng, kiểm tra tổng tiền, sửa số lượng/xóa sản phẩm
8. Nhân viên bấm "Xác Nhận & Gửi Bếp"
9. Backend xử lý:
   - Tạo bản ghi Order (status: pending)
   - Tạo OrderItems cho từng sản phẩm
   - Cập nhật trạng thái Bàn → "Có khách"
   - Broadcast realtime event đến Kitchen (KDS)
   - Phát thông báo (âm thanh + rung) cho bếp
10. Nhân viên nhìn thấy xác nhận "Đã gửi bếp"
11. Bếp nhận thông báo và thấy đơn hàng mới trên KDS
```

---

#### **UC02: Xử Lý Đơn Hàng (Kitchen)**

**Mô Tả**: Bộ phận bếp nhận danh sách đơn hàng từ nhân viên, cập nhật trạng thái từng sản phẩm, và thông báo cho nhân viên khi hoàn thành.

**Actors**: Bộ phận bếp (Kitchen Staff)

**Precondition**: 
- Bếp đã đăng nhập vào hệ thống KDS
- Nhân viên phục vụ đã gửi ít nhất 1 đơn hàng

**Postcondition**: 
- Trạng thái OrderItems được cập nhật (pending → preparing → completed)
- Nhân viên phục vụ được thông báo khi sản phẩm hoàn thành
- Bàn sẵn sàng để phục vụ

**Main Flow**:

```
1. Bếp mở KDS → Hiển thị danh sách đơn chờ (realtime)
2. Bếp nhìn thấy đơn hàng mới (có âm thanh + rung thông báo)
3. Bếp chọn đơn hàng → Xem chi tiết danh sách sản phẩm
4. Bếp bắt đầu nấu:
   - Chọn 1 hoặc nhiều sản phẩm
   - Bấm [Bắt Đầu] → Trạng thái item: "preparing"
   - Realtime hiển thị thời gian nấu (Elapsed time)
5. Sản phẩm hoàn thành:
   - Bấm [✓ Hoàn Thành] cho từng sản phẩm
6. Backend xử lý:
   - Cập nhật order_items status → "completed"
   - Broadcast thông báo đến Staff (nhân viên phục vụ)
   - Nếu tất cả sản phẩm xong → Order status → "ready"
7. Nhân viên nhận thông báo "Bàn X, sản phẩm Y sẵn sàng"
8. Nhân viên đem sản phẩm ra bàn
```

---

#### **UC03: Thanh Toán (Cashier)**

**Mô Tả**: Thu ngân xem danh sách chờ thanh toán, chọn phương thức thanh toán, xác nhận giao dịch, và in hóa đơn.

**Actors**: Thu ngân (Cashier)

**Precondition**: 
- Đơn hàng đã được tạo
- Tất cả sản phẩm đã hoàn thành (status = ready)
- Khách hàng yêu cầu thanh toán

**Postcondition**: 
- Giao dịch được ghi nhận trong bảng transactions
- Order status = "paid"
- Bàn được đánh dấu trống (status = "Trống")
- Hóa đơn được in

**Main Flow**:

```
1. Thu ngân xem màn hình "Chờ Thanh Toán" (danh sách các bàn/đơn hàng)
2. Thu ngân chọn đơn hàng → Hiển thị chi tiết hóa đơn
3. Thu ngân chọn phương thức thanh toán:

   A) TIỀN MẶT:
      - Nhập số tiền khách đưa
      - Hệ thống tính tiền thối tự động
      - Xác nhận → Lưu transaction
   
   B) MOMO QR:
      - Hệ thống tạo QR code từ MoMo API
      - Hiển thị QR → Khách quét bằng MoMo app
      - Chờ IPN callback từ MoMo
      - Tự động xác nhận khi resultCode = 0
   
   C) VIETQR:
      - Tương tự MoMo (hiển thị QR chuyển khoản)
      - Chờ xác nhận từ webhook
   
   D) CHUYỂN KHOẢN:
      - Hiển thị thông tin tài khoản
      - Khách chuyển tiền
      - Thu ngân xác nhận manual

4. Backend xử lý:
   - Tạo Transaction record
   - Cập nhật Order status → "paid"
   - Cập nhật Table status → "Trống"
   - Ghi log giao dịch

5. In Hóa Đơn:
   - Chọn in hoặc lưu PDF
   - Hiển thị biên lai

6. Đóng Bàn:
   - Bàn trở lại trạng thái "Trống"
   - Thu ngân có thể xử lý đơn tiếp theo
```

---

#### **UC04: Quản Lý Sản Phẩm (Admin)**

**Mô Tả**: Admin thêm, sửa, xóa sản phẩm, cập nhật giá, upload hình ảnh từ Cloudinary.

**Actors**: Quản lý (Admin)

**Main Flow**:

```
1. Admin vào "Quản Lý Sản Phẩm"
2. Xem danh sách sản phẩm hiện tại
3. Thêm sản phẩm mới:
   - Nhập tên, mô tả, giá, giá vốn
   - Chọn danh mục
   - Upload hình ảnh → Cloudinary
   - Lưu
4. Sửa sản phẩm:
   - Tìm sản phẩm
   - Cập nhật thông tin, giá
   - Lưu
5. Xóa sản phẩm:
   - Xác nhận xóa
```

---

#### **UC05: Báo Cáo Doanh Thu (Admin)**

**Mô Tả**: Admin xem báo cáo doanh thu, lợi nhuận, sản phẩm bán chạy.

**Actors**: Quản lý (Admin)

**Main Flow**:

```
1. Admin vào "Báo Cáo"
2. Chọn khoảng thời gian (Hôm nay, Tuần, Tháng, Năm)
3. Xem thống kê:
   - Tổng doanh thu
   - Số đơn hàng
   - Lợi nhuận
   - Chi phí
   - Top sản phẩm bán chạy
4. Xuất báo cáo (PDF/Excel)
```

---

## 3.4. PHÂN QUYỀN VÀ CHỨC NĂNG

### 3.4.1. Bảng Phân Quyền theo Vai Trò

| Chức Năng | Staff | Kitchen | Cashier | Admin |
|-----------|-------|---------|---------|-------|
| **Xem Menu** | ✅ | ❌ | ❌ | ✅ |
| **Gọi Món** | ✅ | ❌ | ❌ | ❌ |
| **Xem KDS (Kitchen Display)** | ❌ | ✅ | ❌ | ✅ |
| **Cập Nhật Trạng Thái Sản Phẩm** | ❌ | ✅ | ❌ | ✅ |
| **Xử Lý Thanh Toán** | ❌ | ❌ | ✅ | ✅ |
| **In Hóa Đơn** | ❌ | ❌ | ✅ | ✅ |
| **Xem Dashboard Doanh Thu** | ❌ | ❌ | ✅ | ✅ |
| **Quản Lý Sản Phẩm** | ❌ | ❌ | ❌ | ✅ |
| **Quản Lý Nhân Viên** | ❌ | ❌ | ❌ | ✅ |
| **Quản Lý Bàn** | ✅ | ❌ | ❌ | ✅ |
| **Báo Cáo & Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Cấu Hình Hệ Thống** | ❌ | ❌ | ❌ | ✅ |

### 3.4.2. Row Level Security (RLS) Policies

Supabase cung cấp Row Level Security (RLS) để kiểm soát truy cập dữ liệu dựa trên vai trò của người dùng:

```sql
-- Staff: Xem tất cả bàn, tạo đơn cho bàn đó
CREATE POLICY "staff_view_tables" ON public.tables
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "staff_create_orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'staff' 
    AND auth.uid() = user_id
  );

-- Kitchen: Xem tất cả đơn hàng
CREATE POLICY "kitchen_view_orders" ON public.orders
  FOR SELECT USING (auth.jwt() ->> 'role' = 'kitchen');

CREATE POLICY "kitchen_update_items" ON public.order_items
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'kitchen');

-- Cashier: Xem và cập nhật thanh toán
CREATE POLICY "cashier_view_orders" ON public.orders
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('cashier', 'admin'));

CREATE POLICY "cashier_create_transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('cashier', 'admin'));

-- Admin: Toàn quyền
CREATE POLICY "admin_all" ON public.orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 3.5. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 3.5.1. ERD - Entity Relationship Diagram

TableFlow sử dụng PostgreSQL với 6 bảng chính:

```
┌──────────────────────┐
│     profiles         │ (Người dùng)
├──────────────────────┤
│ id (UUID) - PK       │
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
┌──────────────────────┐
│      orders          │ (Đơn hàng)
├──────────────────────┤
│ id (UUID) - PK       │
│ table_id (FK)        │
│ staff_id (FK)        │
│ status (ENUM)        │
│ payment_method       │
│ total_price          │
│ paid_at              │
│ created_at           │
└──────────┬───────────┘
           │
           │ 1──N
           ▼
┌──────────────────────┐       ┌──────────────────────┐
│   order_items        │◄──────┤   transactions       │
├──────────────────────┤ 1──1  ├──────────────────────┤
│ id (PK) - BIGINT     │       │ id (UUID) - PK       │
│ order_id (FK)        │       │ order_id (FK)        │
│ menu_item_id (FK)    │       │ amount               │
│ quantity             │       │ method (ENUM)        │
│ price                │       │ status (ENUM)        │
│ status (ENUM)        │       │ reference_id         │
│ notes                │       │ created_at           │
└────┬─────────────────┘       └──────────────────────┘
     │
     │ N──1
     ▼
┌──────────────────────┐
│   menu_items         │ (Sản phẩm)
├──────────────────────┤
│ id (UUID) - PK       │
│ name                 │
│ description          │
│ price                │
│ cost                 │
│ category             │
│ image_url            │
│ is_available         │
│ daily_limit          │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│      tables          │ (Bàn)
├──────────────────────┤
│ id (BIGINT) - PK     │
│ number               │
│ status (ENUM)        │
│ capacity             │
│ location_zone        │
│ notes                │
│ created_at           │
└──────────────────────┘
```

### 3.5.2. Bảng Chi Tiết

#### **Bảng profiles**
Lưu thông tin nhân viên, phân quyền dựa trên role (staff, kitchen, cashier, admin)

#### **Bảng tables**
Lưu danh sách bàn, trạng thái (Trống, Có khách, Gộp), sức chứa

#### **Bảng menu_items**
Lưu danh sách sản phẩm, giá, hình ảnh (Cloudinary), tính khả dụng

#### **Bảng orders**
Lưu đơn hàng: bàn, nhân viên tạo, trạng thái, phương thức thanh toán, tổng tiền

#### **Bảng order_items**
Lưu chi tiết từng sản phẩm trong đơn: số lượng, giá, trạng thái (waiting, preparing, completed)

#### **Bảng transactions**
Lưu giao dịch thanh toán: phương thức, trạng thái, mã tham chiếu từ MoMo/VietQR

---

## 3.6. SƠ ĐỒ LUỒNG HOẠT ĐỘNG

### 3.6.1. Class Diagram

**[Sơ đồ Class Diagram sẽ được bổ sung tại đây]**

---

### 3.6.2. Sequence Diagram - Gọi Món

**[Sơ đồ Sequence - Gọi Món sẽ được bổ sung tại đây]**

---

### 3.6.3. Activity Diagram - Thanh Toán

**[Sơ đồ Activity - Thanh Toán sẽ được bổ sung tại đây]**

---

### 3.6.4. State Diagram - Order Status

**[Sơ đồ State - Order Status sẽ được bổ sung tại đây]**

---

## 3.7. CẤU TRÚC MÃ NGUỒN

### 3.7.1. Cấu Trúc Thư Mục

```
my-expo-app/
├── src/
│   ├── screens/
│   │   ├── Staff/
│   │   │   ├── TablesScreen.tsx          # Chọn bàn
│   │   │   ├── MenuScreen.tsx            # Duyệt menu
│   │   │   ├── CartScreen.tsx            # Giỏ hàng
│   │   │   └── OrderListScreen.tsx       # Lịch sử
│   │   ├── Cashier/
│   │   │   ├── PendingPaymentScreen.tsx  # Chờ thanh toán
│   │   │   ├── PaymentMethodScreen.tsx   # Chọn phương thức
│   │   │   └── InvoiceScreen.tsx         # In hóa đơn
│   │   ├── Kitchen/
│   │   │   ├── KDSScreen.tsx             # KDS main
│   │   │   └── OrderDetailScreen.tsx     # Chi tiết đơn
│   │   └── Admin/
│   │       ├── DashboardScreen.tsx       # Dashboard
│   │       ├── ProductScreen.tsx         # Quản lý sản phẩm
│   │       ├── OrderScreen.tsx           # Quản lý đơn
│   │       └── ReportScreen.tsx          # Báo cáo
│   ├── components/
│   │   ├── OrderCard.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── TableGrid.tsx
│   │   ├── PaymentModal.tsx
│   │   └── KDSOrderItem.tsx
│   ├── services/
│   │   ├── supabase.ts                   # Supabase client
│   │   ├── orderService.ts               # Order API
│   │   ├── menuService.ts                # Menu API
│   │   ├── paymentService.ts             # Payment logic
│   │   └── authService.ts                # Auth logic
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth hook
│   │   ├── useOrders.ts                  # Orders query
│   │   ├── useRealtimeListener.ts        # Realtime listener
│   │   └── usePayment.ts                 # Payment hook
│   ├── types/
│   │   └── index.ts                      # TypeScript types
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── navigation/
│       ├── RootNavigator.tsx             # Root navigator
│       ├── StaffNavigator.tsx            # Staff tab
│       ├── KitchenNavigator.tsx          # Kitchen tab
│       ├── CashierNavigator.tsx          # Cashier tab
│       └── AdminNavigator.tsx            # Admin tab
├── supabase/
│   ├── functions/
│   │   ├── create-momo-payment/          # MoMo payment
│   │   ├── momo-ipn-handler/             # MoMo webhook
│   │   └── generate-invoice/             # Invoice PDF
│   └── migrations/
│       └── 001_init_schema.sql           # DB schema
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── sounds/
└── package.json
```

### 3.7.2. Các Service Chính

**OrderService**: Quản lý API liên quan đến đơn hàng (tạo, cập nhật, hủy)
**MenuService**: Lấy danh sách sản phẩm, chi tiết sản phẩm
**PaymentService**: Xử lý thanh toán (MoMo, VietQR, tiền mặt)
**AuthService**: Đăng nhập, đăng xuất, phân quyền

---

## 3.8. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG

### 3.8.1. Design System

#### **Color Palette**
```
Primary:      #A60067 (MoMo Pink)
Secondary:    #6B7280 (Gray)
Success:      #16A34A (Green)
Warning:      #F59E0B (Orange)
Error:        #DC2626 (Red)
Background:   #F9FAFB (Off White)
Surface:      #FFFFFF (White)
```

#### **Typography**
```
Display:      48px, Bold
Heading 1:    32px, Bold
Heading 2:    24px, Semibold
Heading 3:    20px, Semibold
Body:         16px, Regular
Caption:      14px, Regular
```

#### **Spacing**
```
xs: 4px,    sm: 8px,     md: 16px
lg: 24px,   xl: 32px,    2xl: 48px
```

### 3.8.2. Wireframe - Staff: Order Entry Screen

**[Wireframe sẽ được bổ sung tại đây]**

---

### 3.8.3. Wireframe - Kitchen: KDS Display

**[Wireframe sẽ được bổ sung tại đây]**

---

### 3.8.4. Wireframe - Cashier: Payment Screen

**[Wireframe sẽ được bổ sung tại đây]**

---

### 3.8.5. Nguyên Tắc Thiết Kế UI/UX

1. **Mobile First**: Thiết kế cho điện thoại trước, tối ưu cho thao tác cảm ứng
2. **Accessibility**: Font size đủ lớn, contrast tốt, easy to tap
3. **Performance**: Lazy loading, optimized images từ Cloudinary
4. **Consistency**: Sử dụng component library thống nhất
5. **Realtime Feedback**: Thông báo tức thời khi có thay đổi

---

## TÓM TẮT CHƯƠNG 3

Chương 3 trình bày chi tiết quá trình thiết kế hệ thống TableFlow, bao gồm:

| Mục | Nội Dung |
|-----|---------|
| **3.1** | Tổng quan thiết kế, kiến trúc client-server, công nghệ sử dụng |
| **3.2** | Sitemap cho 4 vai trò: Staff, Kitchen, Cashier, Admin |
| **3.3** | Use Case chi tiết: Gọi Món, KDS, Thanh Toán, Quản Lý |
| **3.4** | Phân quyền RBAC, RLS Policies theo role |
| **3.5** | Thiết kế database PostgreSQL với 6 bảng chính |
| **3.6** | Sơ đồ luồng: Class, Sequence, Activity, State diagrams |
| **3.7** | Cấu trúc mã nguồn React Native + Supabase |
| **3.8** | Design System, Wireframes, nguyên tắc UI/UX |

---

**Phiên Bản**: 3.0 (Final - Hoàn chỉnh cho báo cáo)  
**Cập Nhật**: 2025-11-14  
**Author**: TableFlow Team

---

## 📎 PHỤ LỤC

*[Các tài liệu tham khảo và phụ lục sẽ được thêm vào tùy theo nhu cầu]*
