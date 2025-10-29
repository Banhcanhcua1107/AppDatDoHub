# 🍽️ AppDatDoHub - Restaurant Management System

<div align="center">

[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge)](https://github.com/Banhcanhcua1107/AppDatDoHub)
[![Version](https://img.shields.io/badge/Version-1.1.0-blue?style=for-the-badge)](https://github.com/Banhcanhcua1107/AppDatDoHub/releases)
[![React Native](https://img.shields.io/badge/React_Native-0.79.5-61dafb?style=for-the-badge&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Expo](https://img.shields.io/badge/Expo-53.0.6-000?style=for-the-badge&logo=expo)](https://expo.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Ứng dụng di động quản lý nhà hàng/quán ăn chuyên nghiệp**

Tích hợp đơn hàng, bếp, thanh toán & báo cáo doanh số

[🌐 Website](#) • [📖 Tài Liệu](#tài-liệu) • [🐛 Issues](https://github.com/Banhcanhcua1107/AppDatDoHub/issues) • [💬 Discussions](https://github.com/Banhcanhcua1107/AppDatDoHub/discussions)

</div>

---

## 📌 Giới Thiệu

**AppDatDoHub** là nền tảng di động **toàn diện** được xây dựng để quản lý hoạt động hàng ngày của nhà hàng, quán ăn.

Ứng dụng hỗ trợ **nhiều vai trò** (Nhân viên phục vụ, Bếp, Thu ngân, Quản lý) với các tính năng **riêng biệt** và **tích hợp tuyệt vời**.

### 🎯 Mục Đích Chính

- 📱 Quản lý đơn hàng trực tuyến, real-time
- 👨‍🍳 Hiển thị Kitchen Display System (KDS) cho bếp
- 💳 Quản lý thanh toán & quỹ tiền (Cash, Bank, MoMo, VietQR)
- 📊 Báo cáo doanh số & thống kê chi tiết
- 🔔 Hệ thống thông báo theo thời gian thực (với role-based routing)
- 📦 Quản lý kho hàng & menu
- 🔐 Kiểm soát truy cập theo vai trò (RBAC)

---

## ✨ Tính Năng Chính v1.1.0

### 🆕 Tính Năng Mới (v1.1.0)

#### 💳 MoMo QR Code Payment Integration
- ✅ **Màn hình thanh toán MoMo chuyên biệt** (`MoMoQRCodeScreen.tsx`)
- ✅ QR code generation từ MoMo API
- ✅ Real-time payment detection via Supabase Realtime
- ✅ Auto-navigation sau thanh toán thành công
- ✅ Error handling & loading states
- ✅ Transaction history tracking
- 📚 **9 Documentation files** cho MoMo integration

#### 🔔 Notification Role-Based Routing (Fixed)
- ✅ Thông báo chỉ gửi đến role phù hợp
- ✅ Bếp không nghe thông báo từ chính bếp (self-trigger fix)
- ✅ Nhân viên chỉ nghe thông báo khi bếp hoàn tất
- ✅ Hệ thống phân định rõ ràng notification recipients
- ✅ Real-time role-based filtering

#### 🎨 Date Picker UI Improvement
- ✅ Inline row design (Tháng/Ngày/Năm) thay vì calendar grid
- ✅ Giảm độ phức tạp từ 60% → 35% screen height
- ✅ Up/down arrow controls cho dễ sử dụng
- ✅ Live date preview

### 📊 Dashboard & Reports
- ✅ Real-time cashier report with key metrics
- ✅ Interactive date picker for custom date ranges
- ✅ Profit, sales, inventory, and cash flow analysis
- ✅ Horizontal metric cards with drill-down detail screens

### 🍽️ Table Management
- ✅ Visual table layout with real-time status
- ✅ Quick order placement and management
- ✅ Table selection interface
- ✅ Table merging & splitting capabilities

### 🛒 Order Management
- ✅ Menu browsing and item customization
- ✅ Shopping cart with split order support
- ✅ Order confirmation workflow
- ✅ Bill generation and printing
- ✅ Order history & tracking

### 👨‍🍳 Kitchen Display System (KDS)
- ✅ Real-time order status updates
- ✅ Item availability management
- ✅ Return/cancellation request handling
- ✅ Processing reports and analytics
- ✅ Priority queue management

### 💳 Cashier Operations
- ✅ Point of sale (POS) interface
- ✅ Multiple payment methods:
  - 💵 Tiền mặt (Cash)
  - 🏦 Ngân hàng (Bank Transfer)
  - 💳 Thẻ (Card)
  - 📱 MoMo E-wallet
  - 🇻🇳 VietQR
- ✅ Discounts and promotions
- ✅ Financial reconciliation
- ✅ Fund management (Cash & Bank)

### 🔔 Notification System
- ✅ Real-time order notifications
- ✅ Sound alerts for new orders
- ✅ Return item notifications with role routing
- ✅ Staff notifications with vibration feedback
- ✅ Out-of-stock alerts
- ✅ Push notifications
- ✅ Notification history & archiving

### 🌐 Quản Lý Mạng & Offline
- ✅ Phát hiện trạng thái kết nối
- ✅ Lưu trữ offline tự động
- ✅ Đồng bộ khi online
- ✅ Xử lý lỗi mạng thông minh
- ✅ Retry logic
- ✅ Queue management

### 👤 User Authentication & Authorization
- ✅ Đăng nhập/Đăng xuất an toàn
- ✅ Đăng ký với xác thực OTP qua email
- ✅ Quên/Đặt lại mật khẩu
- ✅ Quản lý phiên đăng nhập
- ✅ Hỗ trợ 4 vai trò: Nhân viên, Bếp, Thu ngân, Admin
- ✅ Role-based access control (RBAC)

---

## 🛠️ Tech Stack

| Lớp | Công Nghệ | Phiên Bản | Mục Đích |
|-----|-----------|----------|----------|
| **🎨 UI Framework** | React Native | 0.79.5 | Cross-platform mobile |
| **⚙️ Runtime** | Expo | 53.0.6 | Development & deployment |
| **🔤 Language** | TypeScript | 5.8.3 | Type safety |
| **🗺️ Navigation** | React Navigation | 7.x | Screen routing |
| **🎨 Styling** | NativeWind + Tailwind CSS | 4.2.1 | Mobile-optimized styling |
| **📦 State Management** | Zustand + Redux Toolkit | 5.x + 2.9 | Global state management |
| **🗄️ Backend** | Supabase (PostgreSQL) | Latest | Database & API |
| **🔄 Real-time** | Supabase Realtime | Latest | WebSocket updates |
| **🔐 Authentication** | Supabase Auth + JWT | Latest | User authentication |
| **💾 Storage** | AsyncStorage + MMKV | Latest | Local data persistence |
| **📡 HTTP Client** | Axios | 1.12.2 | API requests |
| **✨ Animation** | React Native Reanimated | 3.17.4 | High-performance animation |
| **📋 Form** | React Native Picker Select | 9.3.1 | Form selection |
| **🔧 Dev Tools** | ESLint + Prettier | Latest | Code quality |

---

## 📂 Project Structure

```
AppDatDoHub/
│
├── 📱 UI Layer (Screens & Components)
│   ├── screens/
│   │   ├── Auth/              # Login, Register, OTP, Password Reset
│   │   ├── Menu/              # Menu, Order, Customization
│   │   ├── Orders/            # Order Mgmt, MoMo Payment, VietQR, Print
│   │   ├── Kitchen/           # KDS, Return Management
│   │   ├── Cashier/           # Dashboard, Reports, Payment
│   │   ├── Tables/            # Table Management
│   │   ├── Profile/           # User Profile & Settings
│   │   ├── Utilities/         # Utilities & Admin
│   │   └── Placeholders/      # Placeholder screens
│   │
│   ├── components/            # Reusable UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── MoMoQRModal.tsx
│   │   ├── VietQRModal.tsx
│   │   └── ...
│   │
│   ├── navigation/            # React Navigation Setup
│   │   ├── RootNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── BottomTabs.tsx
│   │   └── types.ts
│   │
│   └── layouts/               # Layout Components
│
├── 🧠 Business Logic
│   ├── context/               # React Context
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── NetworkContext.tsx
│   │   └── NotificationContext.tsx
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
│       ├── supabase.ts
│       ├── authService.ts
│       ├── orderService.ts
│       ├── notificationService.ts (role-based routing)
│       ├── dashboardService.ts
│       ├── tableService.ts
│       ├── OfflineManager.ts
│       ├── autoReturnService.ts
│       └── api.ts
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
│   │   ├── soundManager.ts
│   │   ├── validators.ts
│   │   └── dateUtils.ts
│   │
│   ├── config/
│   │   └── toastConfig.tsx
│   │
│   ├── types/                 # TypeScript Definitions
│   └── assets/                # Images, Icons, Fonts, Sounds
│
├── 🗄️ Database
│   └── supabase/              # Database backups & migrations
│
├── 📚 Documentation
│   ├── README.md              # Main documentation
│   ├── START_HERE.md          # MoMo payment integration guide
│   ├── NOTIFICATION_ROLE_BASED_ROUTING.md
│   ├── NOTIFICATION_SELF_TRIGGER_FIX.md
│   ├── QUICK_START.txt
│   └── ...
│
├── ⚙️ Configuration Files
│   ├── app.json               # Expo config
│   ├── tsconfig.json          # TypeScript config
│   ├── babel.config.js        # Babel config
│   ├── metro.config.js        # Metro bundler
│   ├── tailwind.config.js     # Tailwind config
│   ├── prettier.config.js     # Prettier config
│   ├── eslint.config.js       # ESLint config
│   ├── package.json
│   └── .env                   # Environment variables
│
└── 📦 Dependencies & Build
    ├── package-lock.json
    ├── node_modules/
    └── android/               # Android native config
```

---

## 🚀 Quick Start - Bắt Đầu Nhanh

### 📋 Yêu Cầu

| Yêu Cầu | Phiên Bản |
|---------|----------|
| **Node.js** | ≥ 18.0.0 |
| **npm** | ≥ 9.0.0 |
| **Expo CLI** | ≥ 5.0.0 |
| **RAM** | ≥ 4GB (recommended) |
| **Storage** | ≥ 2GB (recommended) |

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
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# 4️⃣ Run Development Server
npm start

# 5️⃣ Choose Platform
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for Web
```

### 🔧 Chạy Trên Thiết Bị Native

#### Android
```bash
npm run android
# hoặc
expo run:android
```

#### iOS
```bash
npm run ios
# hoặc
expo run:ios
```

---

## 💳 MoMo Payment Integration (v1.1.0)

### ✨ Tính Năng
- QR code generation từ MoMo API v2
- Real-time payment detection via Supabase Realtime
- Auto-navigation sau thanh toán
- Transaction history & tracking
- Comprehensive error handling

### 📱 Quy Trình Thanh Toán
```
1. OrderConfirmationScreen
   ↓ User clicks "Thanh toán"
2. PaymentMethodBox appears
   ↓ User selects "MoMo"
3. Navigation → MoMoQRCodeScreen
   ↓ Screen generates QR from MoMo API
4. Display QR + Instructions
   ↓ User scans with MoMo app
5. User clicks "Xác nhận thanh toán"
   ↓ Update order status = 'paid'
6. Realtime listener detects change
   ↓ Auto-navigate to PrintPreviewScreen
7. Display & Print Invoice
```

### 📚 Documentation
- [START_HERE.md](./START_HERE.md) - Quick start guide
- [MOMO_PAYMENT_FLOW.md](./MOMO_PAYMENT_FLOW.md) - Complete flow
- More docs available in supabase/supabaseMomo/

### 🧪 Testing
```bash
# 1. Create new order
# 2. Click "Thanh toán" → "MoMo"
# 3. Scan QR with MoMo app
# 4. Confirm payment
# 5. Auto-navigate to print screen
```

---

## 🔔 Notification Role-Based Routing (v1.1.0)

### ✅ Fixed Issues
- ✅ Bếp không nghe thông báo từ chính bếp (self-trigger)
- ✅ Nhân viên chỉ nghe thông báo từ bếp
- ✅ Bếp chỉ nghe thông báo từ nhân viên
- ✅ Admin nghe tất cả notifications

### 🔄 Routing Logic
```
notification_type → Gửi từ → Gửi đến → Role nên nghe
────────────────────────────────────────────────────
return_item         nhân viên → bếp      → 'bep' ✅
item_ready          bếp → nhân viên      → 'nhan_vien' ✅
out_of_stock        bếp → nhân viên      → 'nhan_vien' ✅
cancellation_approved bếp → nhân viên    → 'nhan_vien' ✅
```

### 📖 Documentation
- [NOTIFICATION_ROLE_BASED_ROUTING.md](./NOTIFICATION_ROLE_BASED_ROUTING.md)
- [NOTIFICATION_SELF_TRIGGER_FIX.md](./NOTIFICATION_SELF_TRIGGER_FIX.md)

---

## 📖 Tài Liệu & Hướng Dẫn

### 📚 Tài Liệu Chính

| Tài Liệu | Mô Tả | Loại |
|---------|-------|------|
| [START_HERE.md](./START_HERE.md) | MoMo Payment Integration | 🆕 v1.1.0 |
| [NOTIFICATION_ROLE_BASED_ROUTING.md](./NOTIFICATION_ROLE_BASED_ROUTING.md) | Notification Fixes | 🆕 v1.1.0 |
| [NOTIFICATION_SELF_TRIGGER_FIX.md](./NOTIFICATION_SELF_TRIGGER_FIX.md) | Self-Trigger Fix | 🆕 v1.1.0 |
| [QUICK_START.txt](./QUICK_START.txt) | Quick setup guide | 📖 General |
| [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) | Detailed installation | 📖 General |

### 🎓 Hướng Dẫn Sử Dụng Theo Vai Trò

<details>
<summary><b>👨‍💼 Nhân Viên Phục Vụ (Staff)</b></summary>

```
1. Đăng nhập với tài khoản nhân viên
2. Chọn bàn từ sơ đồ bàn (Tables)
3. Xem menu & chọn món ăn
4. Tùy chỉnh chi tiết nếu cần
5. Thêm vào giỏ hàng
6. Xác nhận đơn hàng
7. Theo dõi trạng thái đơn tại Orders
8. Nhận thông báo khi bếp sẵn sàng
9. Thanh toán & In hóa đơn
```

</details>

<details>
<summary><b>👨‍🍳 Bếp (Kitchen Staff)</b></summary>

```
1. Đăng nhập với tài khoản bếp
2. Xem Kitchen Display System (KDS)
3. Xem danh sách đơn hàng cần nấu
4. Thay đổi trạng thái:
   - "Chờ" → "Đang làm" (start cooking)
   - "Đang làm" → "Sẵn sàng" (done)
5. Đánh dấu nếu hàng hết (out of stock)
6. Quản lý trả món (return requests)
7. Xem báo cáo xử lý đơn
8. Nghe thông báo từ nhân viên (role-based)
```

</details>

<details>
<summary><b>💰 Thu Ngân (Cashier)</b></summary>

```
1. Đăng nhập với tài khoản thu ngân
2. Xem bảng điều khiển (Dashboard)
3. Xem danh sách bàn cần thanh toán
4. Chọn bàn & xem chi tiết hóa đơn
5. Chọn phương thức thanh toán:
   - Tiền mặt (Cash)
   - Ngân hàng (Bank)
   - MoMo QR
   - VietQR
6. Xác nhận & in biên lai
7. Quản lý quỹ tiền mặt
8. Xem báo cáo doanh số
9. Export dữ liệu nếu cần
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
7. Quản lý quyền truy cập (RLS)
8. Xuất dữ liệu & backup
9. Nghe tất cả notifications
```

</details>

---

## 📝 Lệnh Thường Dùng

### 🔧 Development Commands

```bash
# Start Development Server
npm start                    # Chạy phát triển

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
QUICK_MIGRATION.sql          # Quick database setup
VERIFY_MIGRATION.sql         # Check if columns were added
```

---

## 🔐 Bảo Mật & Best Practices

### 🛡️ Security Features

| Tính Năng | Mô Tả |
|----------|-------|
| **Supabase Auth + JWT** | Xác thực an toàn |
| **Row Level Security** | Kiểm soát dữ liệu theo role |
| **Role-based Access Control** | Phân quyền chi tiết |
| **Secure Password Hashing** | Mã hóa mật khẩu |
| **Email Verification** | Xác nhận email |
| **HTTPS Only** | Kết nối được mã hóa |
| **Environment Variables** | Bí mật an toàn |
| **Secure Storage** | AsyncStorage + MMKV |

### 📋 Security Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Set correct environment variables
- [ ] Enable RLS on Supabase
- [ ] Never commit `.env` file
- [ ] Use strong passwords
- [ ] Keep dependencies updated
- [ ] Review Supabase security policies
- [ ] Test role-based access

---

## 🐛 Troubleshooting & FAQ

<details>
<summary><b>Q: Lỗi "Cannot connect to Supabase"</b></summary>

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại
2. Kiểm tra `EXPO_PUBLIC_SUPABASE_URL` có hợp lệ
3. Kiểm tra `EXPO_PUBLIC_SUPABASE_ANON_KEY` có hợp lệ
4. Kiểm tra kết nối internet
5. Restart development server: `npm start`

</details>

<details>
<summary><b>Q: MoMo Payment không hoạt động</b></summary>

**Giải pháp:**
1. Kiểm tra credentials trong `MoMoQRCodeScreen.tsx`
2. Kiểm tra API endpoint (sandbox vs production)
3. Xác nhận IPN URL
4. Kiểm tra Supabase Realtime enabled
5. Xem [START_HERE.md](./START_HERE.md) để debug

</details>

<details>
<summary><b>Q: Notifications không hoạt động đúng role</b></summary>

**Giải pháp:**
1. Kiểm tra `notificationService.ts` có filter role
2. Xác nhận user role trong AsyncStorage
3. Enable Realtime trên Supabase
4. Kiểm tra network connection
5. Xem [NOTIFICATION_ROLE_BASED_ROUTING.md](./NOTIFICATION_ROLE_BASED_ROUTING.md)

</details>

<details>
<summary><b>Q: Build Android bị lỗi</b></summary>

**Giải pháp:**
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
<summary><b>Q: Realtime notifications không cập nhật</b></summary>

**Giải pháp:**
1. Enable Realtime trên Supabase
2. Kiểm tra table subscriptions
3. Xác nhận network connection
4. Xem browser/app console for errors
5. Restart app

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

### ✅ Pre-Deployment Checklist

- [ ] Update all credentials (MoMo, VietQR, etc.)
- [ ] Enable HTTPS
- [ ] Test all payment methods
- [ ] Verify notification routing
- [ ] Run full test suite
- [ ] Update database backups
- [ ] Monitor IPN webhooks
- [ ] Set up monitoring & logging

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
   ↓
4. Commit với Conventional Commits
   git commit -m "feat: Add new feature"
   ↓
5. Push to Branch
   git push origin feature/your-feature-name
   ↓
6. Open Pull Request
```

### 📝 Commit Message Convention

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

---

## 📊 Project Statistics

```
📁 Project Structure:
├── 📱 20+ Screens
├── 🧩 18+ Reusable Components
├── 🔌 12+ Services
├── 📚 15+ Documentation files
├── ⚙️ 45+ NPM Dependencies
└── 🗄️ 10+ Database Tables

📈 Code Metrics:
├── TypeScript: 95%+ Type Coverage
├── Lines of Code: 6000+
├── Components: 50+
├── Services: 12+
└── Utilities: 25+
```

---

## 🎯 Roadmap v1.1.0 → v2.0.0

### v1.1.0 ✅ (Current - October 2025)
- ✅ MoMo QR Code Payment Integration
- ✅ Notification Role-Based Routing Fix
- ✅ Self-Trigger Notification Fix
- ✅ Date Picker UI Improvement

### v1.2.0 🔄 (Q1 2026)
- 🔄 Advanced Analytics Dashboard
- 🔄 QR Code Menu (for customers)
- 🔄 Inventory Forecasting
- 🔄 Performance Optimization

### v2.0.0 🚀 (Q2 2026)
- 🚀 Web Dashboard
- 🚀 Public API
- 🚀 Third-party Integration
- 🚀 Enterprise Features

---

## 📞 Support & Contact

### 📚 Resources

| Resource | Link |
|----------|------|
| **GitHub Repository** | [Banhcanhcua1107/AppDatDoHub](https://github.com/Banhcanhcua1107/AppDatDoHub) |
| **Issues** | [Report Issues](https://github.com/Banhcanhcua1107/AppDatDoHub/issues) |
| **Discussions** | [Community Discussion](https://github.com/Banhcanhcua1107/AppDatDoHub/discussions) |
| **Documentation** | [View Docs](./README.md) |

### 💬 Feedback

Nếu bạn có:
- 💡 Ý tưởng mới
- 🐛 Báo cáo lỗi
- ✨ Cải tiến gợi ý
- ❓ Câu hỏi

👉 [Tạo Issue mới](https://github.com/Banhcanhcua1107/AppDatDoHub/issues/new)

---

## 📄 License

<div align="center">

**MIT License**

Copyright (c) 2025 AppDatDoHub Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.

[Full License](./LICENSE)

</div>

---

## 👥 Contributors

<div align="center">

### 🌟 Special Thanks

- **Banhcanhcua1107** - Project Owner & Lead Developer
- **React Native Community** - Framework & Tools
- **Supabase Team** - Backend Infrastructure
- **All Contributors** - Community Support

### 📊 Contribution Stats

![Commits](https://img.shields.io/badge/Commits-200+-blue?style=flat-square)
![Issues](https://img.shields.io/badge/Issues-Resolved-green?style=flat-square)
![PR](https://img.shields.io/badge/Pull%20Requests-60+-purple?style=flat-square)

</div>

---

<div align="center">

### 🎉 Made with ❤️ for Restaurant Managers

[![GitHub](https://img.shields.io/badge/GitHub-@Banhcanhcua1107-blue?style=for-the-badge&logo=github)](https://github.com/Banhcanhcua1107)

**Last Updated:** October 29, 2025  
**Version:** 1.1.0  
**Status:** 🚀 Active Development

[⬆ Back to Top](#-appdatdohub)

</div>
