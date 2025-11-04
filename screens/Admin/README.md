// screens/Admin/README.md

# 📊 Admin Module - Quản Lý Hệ Thống

Module Admin cung cấp các công cụ quản lý toàn diện cho hệ thống nhà hàng.

## 🎯 Chức Năng Chính

### 1. **AdminDashboardScreen** - Trang Chủ Quản Lý
- **Tệp**: `AdminDashboardScreen.tsx`
- **Mô tả**: Bảng điều khiển trung tâm với các thống kê quan trọng
- **Tính năng**:
  - Hiển thị tổng số đơn hàng, doanh thu, nhân viên, sản phẩm
  - Menu nhanh để truy cập các chức năng chính
  - Giao diện trực quan với thẻ thống kê (Stats Card)

---

### 2. **AdminMenuScreen** - Quản Lý Menu & Sản Phẩm
- **Tệp**: `AdminMenuScreen.tsx`
- **Mô tả**: Quản lý danh mục sản phẩm và menu
- **Tính năng**:
  - ➕ **Thêm sản phẩm mới**: Form với tên, mô tả, giá, danh mục
  - ✏️ **Sửa sản phẩm**: Cập nhật thông tin sản phẩm
  - 🗑️ **Xóa sản phẩm**: Xóa vĩnh viễn
  - 🔄 **Chuyển đổi trạng thái**: Có sẵn/Hết hàng
  - 🔍 **Tìm kiếm**: Tìm sản phẩm theo tên hoặc danh mục
  - 📋 **Lọc theo danh mục**: Hiện tất cả hoặc danh mục cụ thể

**Data Structure**:
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}
```

---

### 3. **AdminOrdersScreen** - Quản Lý Đơn Hàng
- **Tệp**: `AdminOrdersScreen.tsx`
- **Mô tả**: Quản lý và theo dõi tất cả đơn hàng
- **Tính năng**:
  - 📋 **Danh sách đơn hàng**: Hiển thị tất cả đơn với chi tiết
  - 🔍 **Lọc theo trạng thái**:
    - Chờ xử lý (Pending)
    - Đang chuẩn bị (Preparing)
    - Hoàn thành (Completed)
    - Đã phục vụ (Served)
    - Đã hủy (Cancelled)
  - 📊 **Xem chi tiết đơn hàng**: Hiển thị tất cả sản phẩm và tổng tiền
  - ⏰ **Thời gian tạo**: Hiểu rõ thời gian đặt hàng

**Data Structure**:
```typescript
interface Order {
  id: string;
  order_number: string;
  table_number: string;
  status: 'pending' | 'preparing' | 'completed' | 'served' | 'cancelled';
  total: number;
  items: OrderItem[];
  created_at: string;
  served_at?: string;
  payment_method?: string;
  customer_name?: string;
}
```

---

### 4. **AdminUsersScreen** - Quản Lý Nhân Viên & Phân Quyền
- **Tệp**: `AdminUsersScreen.tsx`
- **Mô tả**: Quản lý tài khoản nhân viên và phân quyền
- **Tính năng**:
  - ➕ **Thêm nhân viên**: Tạo tài khoản mới với chức vụ
  - ✏️ **Sửa thông tin**: Cập nhật email, số điện thoại, chức vụ
  - 🗑️ **Xóa nhân viên**: Xóa tài khoản
  - 🔒 **Khóa/Mở khóa**: Vô hiệu hóa hoặc kích hoạt tài khoản
  - 👁️ **Xem chi tiết**: Hiển thị quyền hạn theo chức vụ
  - 🔍 **Tìm kiếm**: Tìm theo tên hoặc email
  - 📍 **Lọc theo chức vụ**: Nhân viên, Bếp, Thu ngân, Admin

**Chức vụ & Quyền Hạn**:
- **Nhân viên (nhan_vien)**:
  - Xem menu
  - Tạo đơn hàng
  - Xem đơn hàng

- **Bếp (bep)**:
  - Xem đơn hàng
  - Cập nhật trạng thái đơn
  - Xem menu

- **Thu ngân (thu_ngan)**:
  - Xem đơn hàng
  - Xử lý thanh toán
  - In hóa đơn
  - Xem báo cáo

- **Admin (admin)**:
  - Toàn bộ quyền
  - Quản lý người dùng
  - Quản lý menu
  - Xem báo cáo

**Data Structure**:
```typescript
interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'nhan_vien' | 'bep' | 'thu_ngan' | 'admin';
  status: 'active' | 'inactive';
  join_date: string;
  permissions?: string[];
}
```

---

### 5. **AdminReportsScreen** - Báo Cáo Doanh Thu
- **Tệp**: `AdminReportsScreen.tsx`
- **Mô tả**: Phân tích doanh thu theo tuần hoặc tháng
- **Tính năng**:
  - 📊 **Biểu đồ cột**: Hiển thị doanh thu hàng ngày
  - 📈 **Thống kê chính**:
    - Tổng doanh thu
    - Tổng số đơn hàng
    - Giá trị trung bình trên mỗi đơn
    - Sản phẩm bán chạy nhất
  - 🔄 **Chuyển đổi giữa**:
    - Báo cáo theo tuần
    - Báo cáo theo tháng
  - 📋 **Chi tiết từng ngày**: Danh sách doanh thu và đơn hàng
  - 📊 **Tóm tắt**: Doanh thu cao nhất, thấp nhất, trung bình

---

## 🔄 Luồng Điều Hướng (Navigation Flow)

```
RootNavigator
  ├── Login/Register (Chưa đăng nhập)
  └── user.role === 'admin'
      └── AdminTabs
          ├── AdminDashboard
          ├── AdminMenu
          ├── AdminOrders
          ├── AdminUsers
          └── AdminReports
```

---

## 🛠️ Cách Tích Hợp

### 1. **AuthContext** - Xác thực & Lưu Trữ Role
Đảm bảo `AuthContext.tsx` có:
```typescript
interface UserProfile {
  id: string;
  email: string;
  role: 'nhan_vien' | 'bep' | 'admin' | 'thu_ngan';
  full_name?: string;
}
```

### 2. **RootNavigator** - Chuyển Hướng Dựa Trên Role
File `navigation/RootNavigator.tsx` đã được cập nhật để:
- Kiểm tra `userProfile?.role`
- Hiển thị `AdminTabs` nếu role = 'admin'
- Hiển thị `CashierTabs` nếu role = 'thu_ngan'
- Hiển thị `AppTabsNavigator` cho các role khác

---

## 📱 Thiết Kế UI/UX

### Color Scheme
- **Primary Color**: `#3B82F6` (Blue)
- **Success Color**: `#51CF66` (Green)
- **Warning Color**: `#FFA500` (Orange)
- **Danger Color**: `#FF6B6B` (Red)
- **Info Color**: `#4ECDC4` (Teal)

### Components
- **Stat Cards**: Hiển thị các KPI chính
- **Action Buttons**: Sửa, xóa, thay đổi trạng thái
- **Modal Forms**: Thêm/sửa dữ liệu
- **Filter Pills**: Lọc theo danh mục/trạng thái
- **Chart Bars**: Biểu đồ doanh thu

---

## 🚀 Hướng Phát Triển

### Tính Năng Cần Bổ Sung
- [ ] Tích hợp API thực tế
- [ ] Xuất báo cáo (PDF/Excel)
- [ ] Lịch sử thay đổi sản phẩm
- [ ] Phân tích theo khoảng thời gian tùy chỉnh
- [ ] Thông báo thời gian thực
- [ ] Quản lý nhập kho
- [ ] Phân tích khách hàng

### API Endpoints Cần Thiết
```
GET    /api/dashboard/stats          - Thống kê tổng quan
GET    /api/menu                     - Danh sách sản phẩm
POST   /api/menu                     - Thêm sản phẩm
PUT    /api/menu/:id                 - Sửa sản phẩm
DELETE /api/menu/:id                 - Xóa sản phẩm

GET    /api/orders                   - Danh sách đơn hàng
GET    /api/orders/:id               - Chi tiết đơn hàng
PUT    /api/orders/:id/status        - Cập nhật trạng thái

GET    /api/users                    - Danh sách nhân viên
POST   /api/users                    - Thêm nhân viên
PUT    /api/users/:id                - Sửa nhân viên
DELETE /api/users/:id                - Xóa nhân viên

GET    /api/reports/weekly           - Báo cáo tuần
GET    /api/reports/monthly          - Báo cáo tháng
```

---

## 📂 Cấu Trúc File

```
screens/Admin/
├── AdminDashboardScreen.tsx      (Trang chủ)
├── AdminMenuScreen.tsx           (Quản lý Menu)
├── AdminOrdersScreen.tsx         (Quản lý Đơn hàng)
├── AdminUsersScreen.tsx          (Quản lý Nhân viên)
├── AdminReportsScreen.tsx        (Báo cáo Doanh thu)
└── README.md                     (Hướng dẫn này)

navigation/
└── AdminTabs.tsx                 (Bottom Tab Navigation)
```

---

## 💡 Tips & Best Practices

1. **Đảm bảo quyền truy cập**: Kiểm tra role trước khi hiển thị tính năng
2. **Tối ưu hóa hiệu suất**: Sử dụng pagination cho danh sách dài
3. **Xử lý lỗi**: Thêm try-catch và hiển thị thông báo lỗi cho người dùng
4. **Caching**: Lưu dữ liệu tạm thời để giảm gọi API
5. **Real-time Updates**: Sử dụng WebSocket hoặc polling để cập nhật dữ liệu

---

## 🎓 Các Màn Hình Chi Tiết

### AdminDashboardScreen
```
┌─────────────────────────────┐
│  Welcome, Admin!            │ ← Header
│  Trang quản lý hệ thống     │
├─────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  │
│ │  1,250   │  │  125M đ  │  │ ← Stat Cards (2x2 grid)
│ │ Đơn Hàng │  │Doanh Thu │  │
│ └──────────┘  └──────────┘  │
│ ┌──────────┐  ┌──────────┐  │
│ │   45     │  │   80     │  │
│ │ Nhân Viên│  │Sản Phẩm  │  │
│ └──────────┘  └──────────┘  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🍽️ Quản lý Menu        │ │ ← Menu Items (Full width cards)
│ │ Thêm, sửa, xóa sản phẩm│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 📋 Quản lý Đơn hàng    │ │
│ │ Xem và quản lý tất cả  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 📞 Support & Contact

Nếu có câu hỏi hoặc vấn đề, vui lòng liên hệ với dev team.
