# 🍽️ AppDatDoHub - Restaurant Management System<div align="center">



A comprehensive React Native restaurant management application built with Expo, designed for seamless operations across kitchen, cashier, and service staff roles.# 🍽️ AppDatDoHub

## Hệ Thống Quản Lý Nhà Hàng Toàn Diện

## ✨ Features

[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge)](https://github.com/Banhcanhcua1107/AppDatDoHub)

### 📊 Dashboard & Reports[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/Banhcanhcua1107/AppDatDoHub/releases)

- Real-time cashier report with key metrics[![React Native](https://img.shields.io/badge/React_Native-0.79.5-61dafb?style=for-the-badge&logo=react)](https://reactnative.dev)

- Interactive date picker for custom date ranges[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

- Profit, sales, inventory, and cash flow analysis[![Expo](https://img.shields.io/badge/Expo-53.0.6-000?style=for-the-badge&logo=expo)](https://expo.dev)

- Horizontal metric cards with drill-down detail screens[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)



### 🍽️ Table Management> **Ứng dụng di động quản lý nhà hàng/quán ăn chuyên nghiệp**  

- Visual table layout with real-time status> Tích hợp đơn hàng, bếp, thanh toán & báo cáo doanh số

- Quick order placement and management

- Table selection interface[🌐 Website](#) • [📖 Tài Liệu](#tài-liệu) • [🐛 Issues](https://github.com/Banhcanhcua1107/AppDatDoHub/issues) • [💬 Discussions](https://github.com/Banhcanhcua1107/AppDatDoHub/discussions)



### 🛒 Order Management</div>

- Menu browsing and item customization

- Shopping cart with split order support---

- Order confirmation workflow

- Bill generation and printing## 📌 Giới Thiệu



### 👨‍🍳 Kitchen Display System (KDS)**AppDatDoHub** là nền tảng di động **toàn diện** được xây dựng để quản lý hoạt động hàng ngày của nhà hàng, quán ăn. 

- Real-time order status updatesỨng dụng hỗ trợ **nhiều vai trò** (Nhân viên phục vụ, Bếp, Thu ngân, Quản lý) với các tính năng **riêng biệt** và **tích hợp tuyệt vời**.

- Item availability management

- Return/cancellation requests### 🎯 Mục Đích Chính

- Processing reports and analytics- 📱 Quản lý đơn hàng trực tuyến, real-time

- 👨‍🍳 Hiển thị Kitchen Display System (KDS) cho bếp

### 💳 Cashier Operations- 💳 Quản lý thanh toán & quỹ tiền

- Point of sale (POS) interface- 📊 Báo cáo doanh số & thống kê chi tiết

- Multiple payment methods- 🔔 Hệ thống thông báo theo thời gian thực

- Discounts and promotions- 📦 Quản lý kho hàng & menu

- Financial reconciliation- 🔐 Kiểm soát truy cập theo vai trò (RBAC)



### 🔔 Notification System---

- Real-time order notifications

- Sound alerts for new orders## ✨ Tính Năng Chính

- Return item notifications

- Staff notifications with vibration feedback### � Quản Lý Xác Thực & Phân Quyền



### 👤 User Authentication<table>

- Role-based access control (Manager, Cashier, Kitchen Staff, Service Staff)<tr>

- Secure login with OTP verification<td>

- Password management

- ✅ Đăng nhập/Đăng xuất an toàn

## 🛠️ Tech Stack- ✅ Đăng ký với xác thực OTP qua email

- ✅ Quên/Đặt lại mật khẩu

- **Frontend:** React Native with Expo- ✅ Quản lý phiên đăng nhập

- **State Management:** Zustand, Redux, Context API- ✅ Hỗ trợ 4 vai trò: Nhân viên, Bếp, Thu ngân, Admin

- **Navigation:** React Navigation (native-stack)

- **Database:** Supabase (PostgreSQL)</td>

- **Styling:** NativeWind (Tailwind CSS), StyleSheet<td>

- **Animations:** React Native Reanimated

- **Notifications:** Expo notifications```

- **Audio:** Expo AV (notification sounds)👤 Roles & Permissions

├── 👨‍💼 Nhân viên (Staff)

## 📂 Project Structure├── 👨‍🍳 Bếp (Kitchen)

├── 💰 Thu ngân (Cashier)

```└── ⚙️ Admin

├── screens/              # Screen components```

│   ├── Auth/            # Login, registration, OTP screens

│   ├── Cashier/         # Cashier dashboard and utilities</td>

│   ├── Kitchen/         # Kitchen display system</tr>

│   ├── Menu/            # Menu browsing and ordering</table>

│   ├── Orders/          # Order management

│   ├── Tables/          # Table management### 🍽️ Quản Lý Menu & Đơn Hàng

│   └── Profile/         # User profile

├── components/          # Reusable UI components<table>

├── services/            # API and business logic<tr>

│   ├── api.ts          # Supabase API client<td>

│   ├── reportService.ts # Report data fetching

│   ├── orderService.ts # Order operations- ✅ Menu phân loại theo danh mục

│   └── ...- ✅ Tùy chỉnh chi tiết từng món

├── hooks/               # Custom React hooks- ✅ Giỏ hàng động, real-time

├── context/             # React Context providers- ✅ Chia đơn hàng cho nhiều khách

├── store/               # State management (Zustand)- ✅ Lịch sử đơn hàng chi tiết

├── navigation/          # Navigation configuration- ✅ In hóa đơn trực tiếp

├── utils/               # Utility functions

└── constants/           # Constants and configuration</td>

```<td>



## 🚀 Getting Started```

📋 Order Workflow

### Prerequisites1. Chọn menu

- Node.js (v16 or higher)2. Tùy chỉnh (ghi chú)

- npm or yarn3. Thêm vào giỏ

- Expo CLI: `npm install -g expo-cli`4. Chọn bàn

5. Xác nhận → Bếp nhận

### Installation```



1. **Clone the repository**</td>

```bash</tr>

git clone https://github.com/Banhcanhcua1107/AppDatDoHub.git</table>

cd AppDatDoHub

```### 🏠 Bàn Phục Vụ & Quản Lý Bàn



2. **Install dependencies**<table>

```bash<tr>

npm install<td>

```

- ✅ Sơ đồ bàn trực quan

3. **Configure environment**- ✅ Trạng thái bàn: Trống → Có khách → Có đơn

Create a `.env` file with your Supabase credentials:- ✅ Tạo đơn cho bàn cụ thể

```- ✅ Chuyển/Gộp bàn

EXPO_PUBLIC_SUPABASE_URL=your_supabase_url- ✅ Thanh toán bàn riêng

EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key- ✅ Quản lý sức chứa

```

</td>

4. **Start the development server**<td>

```bash

npm start```

```🪑 Bàn Status

├── 🟢 Trống (Available)

5. **Run on platform**├── 🟡 Có khách (Occupied)

```bash├── 🔵 Có đơn (Processing)

# iOS└── 🔴 Bảo trì (Maintenance)

npm run ios```



# Android</td>

npm run android</tr>

</table>

# Web

npm run web### 👨‍🍳 Kitchen Display System (KDS)

```

<table>

## 📱 Key Screens<tr>

<td>

### Cashier Module

- **Dashboard**: Real-time metrics and key performance indicators- ✅ Hiển thị tất cả đơn hàng

- **Reports**: Detailed profit, sales, inventory, and cash flow analysis- ✅ Trạng thái: Chờ → Đang làm → Sẵn sàng

- **Utilities**: Expense management, promotions, menu management- ✅ Đánh dấu hàng hết/không có sẵn

- ✅ Thông báo tự động

### Kitchen Module- ✅ Báo cáo xử lý đơn hàng

- **KDS (Kitchen Display System)**: Real-time order display and management- ✅ Lịch sử trả món

- **Return Management**: Handle customer return requests

- **Processing Report**: Performance analytics for kitchen staff</td>

<td>

### Service Staff Module

- **Tables**: Visual table management and order placement```

- **Menu**: Browse menu items and place orders⏱️ Item Status Flow

- **Order Status**: Track order progress and delivery🟦 Waiting (Chờ)

   ↓

### Manager Module🟨 In Progress (Đang làm)

- **All Reports**: Comprehensive business analytics   ↓

- **User Management**: Staff management and role assignment🟩 Completed (Sẵn sàng)

- **System Settings**: Configuration and preferences   ↓

🟪 Served (Phục vụ)

## 🔐 Authentication```



The app supports role-based authentication with the following user types:</td>

- **Manager**: Full system access</tr>

- **Cashier**: POS and financial operations</table>

- **Kitchen Staff**: Order preparation and management

- **Service Staff**: Table service and ordering### 💳 Quản Lý Thanh Toán



## 📊 Database Schema<table>

<tr>

Key tables:<td>

- `users`: User accounts and authentication

- `orders`: Order records- ✅ Tính hóa đơn tạm tính tự động

- `order_items`: Individual items in orders- ✅ Nhiều phương thức thanh toán

- `tables`: Restaurant table configuration- ✅ Quản lý quỹ tiền mặt

- `menu_items`: Menu item catalog- ✅ Quản lý quỹ ngân hàng

- `return_notifications`: Item return notifications- ✅ Lịch sử giao dịch đầy đủ

- `transactions`: Financial records- ✅ In biên lai thanh toán



## 🔧 Configuration</td>

<td>

Key configuration files:

- `app.json`: Expo configuration```

- `tailwind.config.js`: Tailwind styling💵 Payment Methods

- `tsconfig.json`: TypeScript configuration├── 💵 Tiền mặt (Cash)

- `babel.config.js`: Babel configuration├── 🏦 Ngân hàng (Bank)

├── 💳 Thẻ (Card)

## 📚 API Services└── 📱 Điện tử (E-wallet)

```

### Available RPC Functions

- `get_sales_report()`: Fetch sales data</td>

- `get_profit_report()`: Fetch profit analysis</tr>

- `get_inventory_report()`: Fetch inventory status</table>

- `get_cash_flow_report()`: Fetch cash flow data

- `get_purchase_report()`: Fetch purchase records### 📊 Báo Cáo & Thống Kê

- `get_dashboard_data()`: Fetch dashboard metrics

<table>

## 🎨 UI/UX Highlights<tr>

<td>

- Clean, modern interface optimized for mobile devices

- Responsive design that adapts to different screen sizes- ✅ Dashboard real-time

- Smooth animations and transitions- ✅ Báo cáo doanh số theo ngày/tháng

- Intuitive navigation with bottom tab bars- ✅ Báo cáo chi phí & quỹ

- Color-coded status indicators- ✅ Báo cáo kho hàng

- ✅ Báo cáo xử lý từ bếp

## 🤝 Contributing- ✅ Export dữ liệu



Contributions are welcome! Please feel free to submit a Pull Request.</td>

<td>

## 📄 License

```

This project is proprietary software. All rights reserved.📈 Analytics

├── 💰 Revenue

## 📧 Contact├── 📉 Expenses

├── 🍽️ Orders

For questions or support, please contact the development team.├── ⏱️ Speed

└── 📦 Inventory

---```



**Last Updated:** October 22, 2025  </td>

**Version:** 1.0.0  </tr>

**Status:** Active Development</table>


### 🔔 Hệ Thống Thông Báo Real-time

<table>
<tr>
<td>

- ✅ Thông báo món trả
- ✅ Thông báo đơn hàng sẵn sàng
- ✅ Thông báo hàng hết
- ✅ Real-time với Supabase Realtime
- ✅ Lịch sử thông báo
- ✅ Push Notifications

</td>
<td>

```
🔔 Notification Types
├── 📝 Trả món (Return Item)
├── ✅ Sẵn sàng (Item Ready)
├── ❌ Hàng hết (Out of Stock)
└── ⚠️ Cảnh báo (Alert)
```

</td>
</tr>
</table>

### 🌐 Quản Lý Mạng & Offline

<table>
<tr>
<td>

- ✅ Phát hiện trạng thái kết nối
- ✅ Lưu trữ offline tự động
- ✅ Đồng bộ khi online
- ✅ Xử lý lỗi mạng thông minh
- ✅ Retry logic
- ✅ Queue management

</td>
<td>

```
🌐 Network Management
├── 🟢 Online
├── 🟠 Syncing
├── 🔴 Offline
└── ⚡ Retry
```

</td>
</tr>
</table>

---

## 🚀 Quick Start - Bắt Đầu Nhanh

### 📋 Yêu Cầu

<table>
<tr>
<td width="50%">

**Minimum Requirements**
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Expo CLI ≥ 5.0.0

</td>
<td width="50%">

**Recommended**
- RAM ≥ 4GB
- Storage ≥ 2GB
- Stable internet

</td>
</tr>
</table>

### ⚡ Cài Đặt Nhanh

```bash
# 1️⃣ Clone Repository
git clone https://github.com/Banhcanhcua1107/AppDatDoHub.git
cd AppDatDoHub

# 2️⃣ Install Dependencies
npm install

# 3️⃣ Setup Environment
cp .env.example .env
# Cập nhật biến môi trường trong .env

# 4️⃣ Run Development Server
npm start

# 5️⃣ Choose Platform
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for Web
```

### 🔧 Chạy Trên Thiết Bị Native

<table>
<tr>
<td width="50%">

**Android**
```bash
npm run android
# hoặc
expo run:android
```

</td>
<td width="50%">

**iOS**
```bash
npm run ios
# hoặc
expo run:ios
```

</td>
</tr>
</table>

---

## �️ Tech Stack - Công Nghệ Stack

<table>
<tr>
<th>Lớp</th>
<th>Công Nghệ</th>
<th>Phiên Bản</th>
<th>Mục Đích</th>
</tr>
<tr>
<td><strong>🎨 UI Framework</strong></td>
<td>React Native</td>
<td>0.79.5</td>
<td>Cross-platform mobile</td>
</tr>
<tr>
<td><strong>⚙️ Runtime</strong></td>
<td>Expo</td>
<td>53.0.6</td>
<td>Development & deployment</td>
</tr>
<tr>
<td><strong>🔤 Language</strong></td>
<td>TypeScript</td>
<td>5.8.3</td>
<td>Type safety</td>
</tr>
<tr>
<td><strong>🗺️ Navigation</strong></td>
<td>React Navigation</td>
<td>7.x</td>
<td>Screen routing</td>
</tr>
<tr>
<td><strong>🎨 Styling</strong></td>
<td>NativeWind</td>
<td>4.2.1</td>
<td>Tailwind CSS for React Native</td>
</tr>
<tr>
<td><strong>📦 State Management</strong></td>
<td>Zustand + Redux Toolkit</td>
<td>5.x + 2.9</td>
<td>Global state management</td>
</tr>
<tr>
<td><strong>🗄️ Backend</strong></td>
<td>Supabase (PostgreSQL)</td>
<td>Latest</td>
<td>Database & API</td>
</tr>
<tr>
<td><strong>🔄 Real-time</strong></td>
<td>Supabase Realtime</td>
<td>Latest</td>
<td>WebSocket updates</td>
</tr>
<tr>
<td><strong>🔐 Authentication</strong></td>
<td>Supabase Auth + JWT</td>
<td>Latest</td>
<td>User authentication</td>
</tr>
<tr>
<td><strong>💾 Storage</strong></td>
<td>AsyncStorage + MMKV</td>
<td>Latest</td>
<td>Local data persistence</td>
</tr>
<tr>
<td><strong>📡 HTTP Client</strong></td>
<td>Axios</td>
<td>1.12.2</td>
<td>API requests</td>
</tr>
<tr>
<td><strong>✨ Animation</strong></td>
<td>React Native Reanimated</td>
<td>3.17.4</td>
<td>High-performance animation</td>
</tr>
<tr>
<td><strong>📋 Form</strong></td>
<td>React Native Picker Select</td>
<td>9.3.1</td>
<td>Form selection</td>
</tr>
<tr>
<td><strong>🔧 Dev Tools</strong></td>
<td>ESLint + Prettier</td>
<td>Latest</td>
<td>Code quality</td>
</tr>
</table>

---

## 📂 Cấu Trúc Dự Án

```
AppDatDoHub/
│
├── 📱 UI Layer (Screens & Components)
│   ├── screens/
│   │   ├── Auth/              # Login, Register, OTP
│   │   ├── Menu/              # Menu, Order, Cart
│   │   ├── Orders/            # Order Management, Serve Status
│   │   ├── Kitchen/           # KDS, Item Availability
│   │   ├── Cashier/           # Dashboard, Payment
│   │   ├── Tables/            # Table Management
│   │   ├── Profile/           # User Profile
│   │   └── Utilities/         # Utilities
│   │
│   ├── components/            # Reusable UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   │
│   ├── navigation/            # React Navigation Setup
│   │   ├── RootNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── ...
│   │
│   └── layouts/               # Layout Components
│
├── 🧠 Business Logic
│   ├── context/               # React Context
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── NetworkContext.tsx
│   │
│   ├── hooks/                 # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useOrder.ts
│   │   └── useTable.ts
│   │
│   ├── store/                 # State Management (Zustand)
│   │   ├── authStore.ts
│   │   ├── orderStore.ts
│   │   └── tableStore.ts
│   │
│   └── services/              # API & Business Services
│       ├── supabase.ts        # Supabase config
│       ├── authService.ts
│       ├── orderService.ts
│       ├── notificationService.ts
│       ├── dashboardService.ts
│       ├── tableService.ts
│       ├── OfflineManager.ts
│       └── autoReturnService.ts
│
├── ⚙️ Configuration & Utilities
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── menuData.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── validators.ts
│   │   └── ...
│   │
│   ├── config/
│   │   └── toastConfig.tsx
│   │
│   ├── types/                 # TypeScript Definitions
│   └── assets/                # Images, Icons, Fonts
│
├── 🗄️ Database & Migrations
│   ├── database_migrations.sql
│   ├── QUICK_MIGRATION.sql
│   └── VERIFY_MIGRATION.sql
│
├── 📚 Documentation
│   ├── README.md
│   ├── README_DETAILED.md
│   ├── NOTIFICATION_SETUP.md
│   └── MIGRATION_STATUS.md
│
├── ⚙️ Configuration Files
│   ├── app.json                # Expo config
│   ├── tsconfig.json           # TypeScript config
│   ├── babel.config.js         # Babel config
│   ├── metro.config.js         # Metro bundler
│   ├── tailwind.config.js      # Tailwind config
│   ├── prettier.config.js      # Prettier config
│   ├── eslint.config.js        # ESLint config
│   ├── package.json
│   └── .env                    # Environment variables
│
└── 📦 Dependencies & Build
    ├── package-lock.json
    ├── node_modules/
    └── android/                # Android native config
```

---

## 📖 Tài Liệu & Hướng Dẫn

### � Tài Liệu Chính

| Tài Liệu | Mô Tả | Link |
|---------|-------|------|
| **Detailed Guide** | Hướng dẫn toàn diện cho developers | [README_DETAILED.md](./README_DETAILED.md) |
| **Notification Setup** | Cài đặt hệ thống thông báo | [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md) |
| **Migration Status** | Trạng thái database migrations | [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) |
| **Quick Migration** | Database migration scripts | [QUICK_MIGRATION.sql](./QUICK_MIGRATION.sql) |

### 🎓 Hướng Dẫn Sử Dụng Cho Từng Vai Trò

<details>
<summary><b>👨‍💼 Nhân Viên Phục Vụ (Staff)</b></summary>

```
1. Đăng nhập với tài khoản nhân viên
2. Đi tới tab "Menu"
3. Chọn danh mục & món ăn
4. Tùy chỉnh nếu cần
5. Thêm vào giỏ hàng
6. Chọn bàn phục vụ
7. Xác nhận đơn hàng
8. In hóa đơn (nếu cần)
9. Theo dõi trạng thái đơn tại bàn
```

</details>

<details>
<summary><b>👨‍🍳 Bếp (Kitchen Staff)</b></summary>

```
1. Đăng nhập với tài khoản bếp
2. Xem tab "Bếp" / KDS
3. Xem danh sách đơn hàng cần nấu
4. Thay đổi trạng thái món:
   - Bắt đầu nấu: Chờ → Đang làm
   - Hoàn tất: Đang làm → Sẵn sàng
5. Đánh dấu khi hàng hết
6. Xem báo cáo xử lý
7. Quản lý lịch sử trả món
```

</details>

<details>
<summary><b>💰 Thu Ngân (Cashier)</b></summary>

```
1. Đăng nhập với tài khoản thu ngân
2. Xem bảng điều khiển (Dashboard)
3. Chọn bàn cần thanh toán
4. Xem chi tiết hóa đơn
5. Chọn phương thức thanh toán
6. Nhập số tiền (nếu cần)
7. Xác nhận & in biên lai
8. Quản lý quỹ tiền mặt/ngân hàng
9. Xem báo cáo doanh số
```

</details>

<details>
<summary><b>⚙️ Quản Lý (Admin)</b></summary>

```
1. Đăng nhập với tài khoản admin
2. Truy cập tất cả tính năng
3. Quản lý người dùng & vai trò
4. Quản lý menu & giá cả
5. Xem báo cáo toàn hệ thống
6. Cấu hình cửa hàng
7. Quản lý quyền truy cập
8. Xuất dữ liệu
```

</details>

---

## 📝 Lệnh Thường Dùng

### 🔧 Development Commands

```bash
# Start Development Server
npm start                    # Chạy phát triển (bấm 'a' cho Android, 'i' cho iOS)

# Code Quality
npm run lint                 # Kiểm tra linting
npm run format               # Format code automatically

# Build & Run
npm run android              # Build & run on Android
npm run ios                  # Build & run on iOS
npm run web                  # Run web version
npm run prebuild             # Prebuild native project

# Utilities
npm run remove-comments      # Xóa comments trong code
```

### 🗄️ Database Commands

```bash
# Run migrations in Supabase SQL Editor
-- Copy & paste từ file:
QUICK_MIGRATION.sql          # Quick database setup

# Verify migrations
VERIFY_MIGRATION.sql         # Check if columns were added

# Debug
debug_orders.sql             # Debug order queries
```

---

## 🔐 Bảo Mật & Best Practices

### 🛡️ Security Features

<table>
<tr>
<td width="50%">

**Authentication & Authorization**
- ✅ Supabase Auth + JWT
- ✅ Row Level Security (RLS)
- ✅ Role-based Access Control
- ✅ Secure password hashing
- ✅ Email verification

</td>
<td width="50%">

**Data Protection**
- ✅ HTTPS only
- ✅ Environment variables
- ✅ No secrets in code
- ✅ Secure storage
- ✅ Data encryption

</td>
</tr>
</table>

### 📋 Security Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Set correct environment variables
- [ ] Enable RLS on Supabase
- [ ] Never commit `.env` file
- [ ] Use strong passwords
- [ ] Keep dependencies updated
- [ ] Review Supabase security policies

---

## 🐛 Troubleshooting & FAQ

### ❓ Câu Hỏi Thường Gặp

<details>
<summary><b>Q: Lỗi "Cannot connect to Supabase"</b></summary>

**A: Giải pháp:**
1. Kiểm tra file `.env`
2. Kiểm tra `EXPO_PUBLIC_SUPABASE_URL` có hợp lệ
3. Kiểm tra `EXPO_PUBLIC_SUPABASE_ANON_KEY` có hợp lệ
4. Kiểm tra kết nối internet
5. Restart development server: `npm start`

</details>

<details>
<summary><b>Q: Lỗi "Invalid credentials"</b></summary>

**A: Giải pháp:**
1. Kiểm tra email & password chính xác
2. Kiểm tra user tồn tại trên Supabase
3. Kiểm tra Supabase Auth settings
4. Reset password nếu quên
5. Check user role permissions

</details>

<details>
<summary><b>Q: Realtime notifications không hoạt động</b></summary>

**A: Giải pháp:**
1. Enable Realtime trên Supabase
2. Check table `return_notifications` là subscribed
3. Kiểm tra network connection
4. Xem browser console for errors
5. Restart app

</details>

<details>
<summary><b>Q: Build Android bị lỗi</b></summary>

**A: Giải pháp:**
```bash
# Clear cache
npm start --clear

# Clear Android build
rm -rf android/build

# Reinstall dependencies
npm install --legacy-peer-deps

# Rebuild
npm run android
```

</details>

<details>
<summary><b>Q: Database migration error</b></summary>

**A: Giải pháp:**
```sql
-- Nếu gặp "constraint already exists", đó là OK
-- Có nghĩa constraint đã tồn tại rồi
-- Run VERIFY_MIGRATION.sql để kiểm tra
SELECT * FROM information_schema.columns 
WHERE table_name = 'return_notifications';
```

</details>

<details>
<summary><b>Q: Offline mode không work</b></summary>

**A: Giải pháp:**
1. Check AsyncStorage implementation
2. Verify offline manager is initialized
3. Test network toggle
4. Check sync queue
5. Clear app cache

</details>

---

## 🚀 Deployment & Production

### 📱 Build untuk Production

```bash
# 1. Android Production Build
npm run prebuild
npm run android --release

# 2. iOS Production Build
npm run prebuild
npm run ios --release

# 3. EAS Build (Recommended)
eas build --platform android
eas build --platform ios

# 4. Submit to App Store / Play Store
eas submit --platform android
eas submit --platform ios
```

### 🌐 Environment Setup

```env
# Production .env
EXPO_PUBLIC_SUPABASE_URL=https://your-production-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_key_here
NODE_ENV=production
```

---

## 🤝 Đóng Góp (Contributing)

### 🎯 Cách Đóng Góp

```
1. Fork Repository
   ↓
2. Create Feature Branch
   git checkout -b feature/your-feature-name
   ↓
3. Make Changes
   git add .
   ↓
4. Commit with Conventional Commits
   git commit -m "feat: Add new feature"
   git commit -m "fix: Fix bug"
   git commit -m "docs: Update documentation"
   ↓
5. Push to Branch
   git push origin feature/your-feature-name
   ↓
6. Open Pull Request
   (Describe changes, link issues)
```

### � Commit Message Convention

```
feat:     Thêm tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật tài liệu
style:    Thay đổi giao diện/UI
refactor: Cải tiến code
test:     Thêm/sửa test
chore:    Công việc khác
perf:     Cải thiện hiệu suất
```

### ✅ Pull Request Checklist

- [ ] Code follows style guide
- [ ] Added tests if applicable
- [ ] Updated documentation
- [ ] No console errors/warnings
- [ ] All tests passing
- [ ] Commits are clean & descriptive

---

## 📊 Project Statistics

```
📁 Project Structure:
├── 📱 15+ Screens
├── 🧩 15+ Reusable Components
├── 🔌 10+ Services
├── 📚 8+ Documentation files
├── ⚙️ 40+ NPM Dependencies
└── 🗄️ 7+ Database Tables

📈 Code Metrics:
├── TypeScript: 95%+ Type Coverage
├── Lines of Code: 5000+
├── Components: 50+
├── Services: 10+
└── Utilities: 20+
```

---

## 📞 Support & Contact

### 📚 Tài Liệu & Liên Hệ

<table>
<tr>
<td width="50%">

**Documentation**
- 📖 [Detailed Guide](./README_DETAILED.md)
- 🔔 [Notification Setup](./NOTIFICATION_SETUP.md)
- 🗄️ [Migration Guide](./MIGRATION_STATUS.md)

</td>
<td width="50%">

**Community**
- 🐞 [Report Issues](https://github.com/Banhcanhcua1107/AppDatDoHub/issues)
- 💬 [Discussions](https://github.com/Banhcanhcua1107/AppDatDoHub/discussions)
- 📧 [Email Support](mailto:support@appdatdohub.com)

</td>
</tr>
</table>

---

## 📄 License

<div align="center">

**MIT License**

Copyright (c) 2025 AppDatDoHub Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions...

[Full License](./LICENSE)

</div>

---

## 🎯 Roadmap & Future Plans

### 📈 Version Roadmap

```
v1.0.0 ✅ (Current)
├── ✅ Core Features
├── ✅ Authentication
├── ✅ KDS System
└── ✅ Payment Management

v1.1.0 🔄 (Q1 2026)
├── 🔄 Advanced Analytics
├── 🔄 QR Code Menu
├── 🔄 Inventory Management
└── 🔄 Performance Optimization

v1.2.0 📋 (Q2 2026)
├── 📋 Mobile App Refinement
├── 📋 AI Recommendations
├── 📋 Multi-language Support
└── 📋 Advanced Reporting

v2.0.0 🚀 (Q3 2026)
├── 🚀 Web Dashboard
├── 🚀 API Public
├── 🚀 Third-party Integration
└── 🚀 Enterprise Features
```

---

## � Contributors

<div align="center">

### 🌟 Special Thanks

- **Banhcanhcua1107** - Project Owner & Lead Developer
- **React Native Community** - Framework & Tools
- **Supabase Team** - Backend Infrastructure
- **All Contributors** - Community Support

### 📊 Contribution Stats

![GitHub Commits](https://img.shields.io/badge/Commits-150+-blue?style=flat-square)
![GitHub Issues](https://img.shields.io/badge/Issues-Resolved-green?style=flat-square)
![GitHub PR](https://img.shields.io/badge/Pull%20Requests-50+-purple?style=flat-square)

</div>

---

## 💬 Feedback & Suggestions

> **Ý kiến của bạn rất quan trọng!**

Nếu bạn có:
- 💡 Ý tưởng mới
- 🐛 Báo cáo lỗi
- ✨ Cải tiến gợi ý
- ❓ Câu hỏi

👉 [Hãy tạo một Issue](https://github.com/Banhcanhcua1107/AppDatDoHub/issues/new)

---

<div align="center">

### 🎉 Made with ❤️ for Restaurant Managers

[![GitHub](https://img.shields.io/badge/GitHub-@Banhcanhcua1107-blue?style=for-the-badge&logo=github)](https://github.com/Banhcanhcua1107)

**Last Updated:** October 20, 2025  
**Version:** 1.0.0  
**Status:** 🚀 Active Development

[⬆ Back to Top](#-appdatdohub)

</div>
