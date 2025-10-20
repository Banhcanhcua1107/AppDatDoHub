# 🍽️ AppDatDoHub - Hệ Thống Quản Lý Nhà Hàng Toàn Diện

**Phiên bản:** 1.0.0  
**Ngôn ngữ chính:** TypeScript + React Native  
**Framework:** Expo + React Native  
**Trạng thái:** 🚀 Đang phát triển

---

## 📋 Mục Lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng chính](#tính-năng-chính)
3. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
4. [Cài đặt & Thiết lập](#cài-đặt--thiết-lập)
5. [Kiến trúc ứng dụng](#kiến-trúc-ứng-dụng)
6. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
7. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
8. [API & Services](#api--services)
9. [Quản lý trạng thái](#quản-lý-trạng-thái)
10. [Hệ thống thông báo](#hệ-thống-thông-báo)
11. [Database Schema](#database-schema)
12. [Contributor](#contributor)

---

## 🎯 Giới Thiệu

**AppDatDoHub** là một ứng dụng di động toàn diện để quản lý hoạt động của nhà hàng/quán ăn. Ứng dụng hỗ trợ các vai trò khác nhau (Nhân viên phục vụ, Bếp, Thu ngân, Admin) với các tính năng tương ứng.

### Mục đích
- 📱 Quản lý đơn hàng trực tuyến
- 👨‍🍳 Hiển thị đơn hàng tại bếp
- 💳 Quản lý thanh toán
- 📊 Báo cáo doanh số
- 🔔 Hệ thống thông báo theo thời gian thực
- 📦 Quản lý kho hàng
- 🔐 Kiểm soát truy cập theo vai trò

---

## ✨ Tính Năng Chính

### 1. 🔐 Quản Lý Xác Thực
- ✅ Đăng nhập/Đăng xuất
- ✅ Đăng ký tài khoản mới
- ✅ Xác thực OTP qua email
- ✅ Quên mật khẩu & Đặt lại mật khẩu
- ✅ Quản lý phiên đăng nhập
- ✅ Lưu trữ an toàn với AsyncStorage

### 2. 🍽️ Quản Lý Menu & Đơn Hàng
- ✅ Xem danh sách menu theo danh mục
- ✅ Tùy chỉnh món ăn (ghi chú đặc biệt)
- ✅ Thêm/xóa từ giỏ hàng
- ✅ Chia đơn hàng
- ✅ Lịch sử đơn hàng
- ✅ In hóa đơn

### 3. 🏠 Bàn Phục Vụ
- ✅ Hiển thị sơ đồ bàn
- ✅ Tạo đơn hàng cho bàn cụ thể
- ✅ Chuyển bàn
- ✅ Phục vụ & đóng bàn

### 4. 👨‍🍳 Bếp - Kitchen Display System (KDS)
- ✅ Hiển thị tất cả đơn hàng cần nấu
- ✅ Cập nhật trạng thái (Chờ → Đang làm → Sẵn sàng)
- ✅ Quản lý hàng hết/không có sẵn
- ✅ Thông báo khi sẵn sàng
- ✅ Báo cáo xử lý đơn hàng
- ✅ Lịch sử trả món

### 5. 💳 Quản Lý Thanh Toán
- ✅ Tính toán hóa đơn tạm tính
- ✅ Hỗ trợ nhiều phương thức thanh toán (Tiền mặt, Ngân hàng)
- ✅ Quản lý quỹ (Quỹ tiền mặt, Quỹ ngân hàng)
- ✅ Lịch sử giao dịch
- ✅ In hóa đơn

### 6. 📊 Báo Cáo & Thống Kê
- ✅ Bảng điều khiển (Dashboard)
- ✅ Báo cáo doanh số
- ✅ Báo cáo chi phí
- ✅ Báo cáo kho hàng
- ✅ Báo cáo xử lý đơn hàng từ bếp

### 7. 🔔 Hệ Thống Thông Báo
- ✅ Thông báo monát trả
- ✅ Thông báo đơn hàng sẵn sàng
- ✅ Thông báo hàng hết
- ✅ Real-time updates với Supabase Realtime
- ✅ Lịch sử thông báo

### 8. 🌐 Quản Lý Mạng
- ✅ Phát hiện trạng thái kết nối
- ✅ Lưu trữ offline và đồng bộ khi online
- ✅ Xử lý lỗi mạng

---

## 🖥️ Yêu Cầu Hệ Thống

### Tối thiểu
- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **Expo CLI:** >= 5.x
- **Java:** >= 11 (cho Android)
- **Android Studio:** Phiên bản mới nhất (cho Android)
- **Xcode:** Phiên bản mới nhất (cho iOS)

### Khuyến nghị
- **RAM:** ≥ 4GB
- **Lưu trữ:** ≥ 2GB
- **Internet:** Kết nối ổn định

---

## 🚀 Cài Đặt & Thiết Lập

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Banhcanhcua1107/AppDatDoHub.git
cd AppDatDoHub
```

### 2️⃣ Cài Đặt Dependencies

```bash
npm install
# hoặc
yarn install
```

### 3️⃣ Cấu Hình Biến Môi Trường

Tạo file `.env` ở thư mục gốc:

```env
EXPO_PUBLIC_SUPABASE_URL=https://fbapybyjegrvmiurytnw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYXB5YnlqZWdydm1pdXJ5dG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDU4MjUsImV4cCI6MjA3MzQ4MTgyNX0.GJmeZVrBLhhUXLrMch--RizlcHXo6D1tSJfYNo58xw0
```

### 4️⃣ Chạy Ứng Dụng

#### Trên Android
```bash
npm run android
# hoặc
expo run:android
```

#### Trên iOS
```bash
npm run ios
# hoặc
expo run:ios
```

#### Trên Web (Phát triển)
```bash
npm run web
# hoặc
expo start --web
```

#### Chế độ phát triển
```bash
npm start
# Chọn platform: a (Android) hoặc i (iOS)
```

---

## 🏗️ Kiến Trúc Ứng Dụng

### Mô Hình Kiến Trúc

```
┌─────────────────────────────────────────┐
│      UI Layer (Screens & Components)    │
├─────────────────────────────────────────┤
│      State Management (Zustand/Redux)   │
├─────────────────────────────────────────┤
│      Hooks & Context (Auth, Cart, etc)  │
├─────────────────────────────────────────┤
│      Services (API, Database, Auth)     │
├─────────────────────────────────────────┤
│   Supabase (Database, Auth, Realtime)   │
└─────────────────────────────────────────┘
```

### Công Nghệ Stack

| Lớp | Công Nghệ |
|-----|-----------|
| **UI Framework** | React Native 0.79.5 |
| **Navigation** | React Navigation 7.x |
| **State Management** | Zustand 5.x + Redux Toolkit |
| **Styling** | NativeWind 4.x (Tailwind CSS) |
| **Backend** | Supabase (PostgreSQL) |
| **Real-time** | Supabase Realtime |
| **Authentication** | Supabase Auth |
| **Storage** | AsyncStorage + MMKV |
| **HTTP Client** | Axios |
| **Animation** | React Native Reanimated 3.x |
| **Dev Tools** | ESLint + Prettier |

---

## 📂 Cấu Trúc Thư Mục

```
AppDatDoHub/
├── 📱 Mobile App
│   ├── assets/                    # Tài nguyên (ảnh, icon, font, âm thanh)
│   │   ├── fonts/                 # Font tùy chỉnh
│   │   ├── icons/                 # Icon components
│   │   ├── images/                # Hình ảnh
│   │   └── sounds/                # Âm thanh thông báo
│   │
│   ├── components/                # Reusable Components
│   │   ├── ActionSheetModal.tsx   # Modal với Action Sheet
│   │   ├── BillContent.tsx        # Nội dung hóa đơn
│   │   ├── Button.tsx             # Button tùy chỉnh
│   │   ├── Card.tsx               # Card component
│   │   ├── ConfirmModal.tsx       # Xác nhận modal
│   │   ├── Container.tsx          # Container chính
│   │   ├── Input.tsx              # Input tùy chỉnh
│   │   ├── LoadingSpinner.tsx     # Loading indicator
│   │   ├── Modal.tsx              # Modal cơ bản
│   │   ├── PaymentMethodBox.tsx   # Hộp phương thức thanh toán
│   │   ├── PrimaryButton.tsx      # Primary button
│   │   ├── ReturnedItemsIndicatorCard.tsx  # Chỉ báo món trả
│   │   ├── ScreenContent.tsx      # Nội dung màn hình
│   │   └── UtilityItem.tsx        # Mục tiện ích
│   │
│   ├── screens/                   # Các màn hình chính
│   │   ├── Auth/                  # Màn hình xác thực
│   │   │   ├── LoginScreen.tsx           # Đăng nhập
│   │   │   ├── RegisterScreen.tsx        # Đăng ký
│   │   │   ├── OtpScreen.tsx            # Xác thực OTP
│   │   │   ├── OtpScreenR.tsx           # OTP đăng ký
│   │   │   ├── ForgotPasswordScreen.tsx  # Quên mật khẩu
│   │   │   ├── ResetPasswordScreen.tsx   # Đặt lại mật khẩu
│   │   │   └── ResetSuccessScreen.tsx    # Thành công
│   │   │
│   │   ├── Menu/                  # Màn hình menu & đơn hàng
│   │   │   ├── MenuScreen.tsx            # Danh sách menu
│   │   │   ├── OrderConfirmationScreen.tsx# Xác nhận đơn
│   │   │   ├── TableSelectionScreen.tsx  # Chọn bàn
│   │   │   ├── SplitOrderScreen.tsx      # Chia đơn hàng
│   │   │   ├── CustomizeItemModal.tsx    # Tùy chỉnh món
│   │   │   ├── CartDetailModal.tsx       # Chi tiết giỏ
│   │   │   └── OrderInfoBox.tsx          # Thông tin đơn
│   │   │
│   │   ├── Orders/                # Màn hình quản lý đơn hàng
│   │   │   ├── OrderScreen.tsx           # Danh sách đơn
│   │   │   ├── ServeStatusScreen.tsx     # Trạng thái phục vụ
│   │   │   ├── ProvisionalBillScreen.tsx # Tạm tính hóa đơn
│   │   │   ├── PrintPreviewScreen.tsx    # Xem trước in
│   │   │   ├── ReturnItemsScreen.tsx     # Trả món
│   │   │   ├── ReturnSelectionScreen.tsx # Chọn món trả
│   │   │   ├── ReturnNotificationScreen.tsx # Thông báo trả
│   │   │   ├── ReturnedItemsDetailScreen.tsx # Chi tiết trả
│   │   │   └── ReturnHistoryScreen.tsx   # Lịch sử trả
│   │   │
│   │   ├── Kitchen/               # Màn hình bếp (KDS)
│   │   │   ├── KitchenDisplayScreen.tsx  # Hiển thị KDS
│   │   │   ├── KitchenDetailScreen.tsx   # Chi tiết KDS
│   │   │   ├── ItemAvailabilityScreen.tsx# Tình trạng hàng
│   │   │   ├── KitchenSummaryScreen.tsx  # Tóm tắt bếp
│   │   │   ├── KitchenSummaryDetailScreen.tsx
│   │   │   ├── KitchenProcessingReportScreen.tsx
│   │   │   ├── ReturnHistoryScreen.tsx   # Lịch sử trả
│   │   │   ├── CancellationRequestsScreen.tsx
│   │   │   ├── CancellationRequestsDetailScreen.tsx
│   │   │   └── KitchenUtilitiesScreen.tsx
│   │   │
│   │   ├── Cashier/               # Màn hình thu ngân
│   │   │   ├── DashboardScreen.tsx       # Bảng điều khiển
│   │   │   ├── BankFundScreen.tsx        # Quỹ ngân hàng
│   │   │   ├── CashFundScreen.tsx        # Quỹ tiền mặt
│   │   │   ├── CashierReportScreen.tsx   # Báo cáo
│   │   │   ├── ExpensesScreen.tsx        # Chi phí
│   │   │   ├── InventoryScreen.tsx       # Kho hàng
│   │   │   ├── MenuManagementScreen.tsx  # Quản lý menu
│   │   │   ├── PromotionsScreen.tsx      # Khuyến mãi
│   │   │   ├── PurchaseScreen.tsx        # Mua hàng
│   │   │   └── CashierUtilitiesScreen.tsx# Tiện ích
│   │   │
│   │   ├── Tables/                # Màn hình bàn
│   │   │   └── HomeScreen.tsx            # Sơ đồ bàn
│   │   │
│   │   ├── Profile/               # Màn hình hồ sơ
│   │   │   └── ChangePasswordScreen.tsx  # Đổi mật khẩu
│   │   │
│   │   ├── Utilities/             # Màn hình tiện ích
│   │   │   ├── UtilitiesScreen.tsx       # Danh sách tiện ích
│   │   │   └── BillHistoryScreen.tsx     # Lịch sử hóa đơn
│   │   │
│   │   └── Placeholders/          # Màn hình placeholder
│   │
│   ├── navigation/                # Cấu hình điều hướng
│   │   ├── RootNavigator.tsx      # Navigator gốc
│   │   ├── AppNavigator.tsx        # Navigator chính
│   │   ├── AuthNavigator.tsx       # Navigator xác thực
│   │   ├── BottomTabs.tsx          # Bottom tabs (Nhân viên)
│   │   ├── CashierTabs.tsx         # Tabs của Thu ngân
│   │   ├── KitchenTabs.tsx         # Tabs của Bếp
│   │   └── types.ts                # Kiểu dữ liệu navigation
│   │
│   ├── context/                   # React Context
│   │   ├── AuthContext.tsx         # Quản lý xác thực
│   │   ├── CartContext.tsx         # Quản lý giỏ hàng
│   │   └── NetworkContext.tsx      # Quản lý mạng
│   │
│   ├── hooks/                      # Custom Hooks
│   │   ├── useAuth.ts              # Hook xác thực
│   │   ├── useOrder.ts             # Hook đơn hàng
│   │   └── useTable.ts             # Hook bàn
│   │
│   ├── store/                      # State Management (Zustand)
│   │   ├── authStore.ts            # Store xác thực
│   │   ├── orderStore.ts           # Store đơn hàng
│   │   └── tableStore.ts           # Store bàn
│   │
│   ├── services/                   # Services & API
│   │   ├── supabase.ts             # Cấu hình Supabase
│   │   ├── api.ts                  # API endpoints
│   │   ├── auth.ts                 # Dịch vụ xác thực
│   │   ├── authService.ts          # Auth service nâng cao
│   │   ├── orderService.ts         # Dịch vụ đơn hàng
│   │   ├── tableService.ts         # Dịch vụ bàn
│   │   ├── notificationService.ts  # Dịch vụ thông báo
│   │   ├── dashboardService.ts     # Dịch vụ dashboard
│   │   ├── autoReturnService.ts    # Dịch vụ trả tự động
│   │   └── OfflineManager.ts       # Quản lý offline
│   │
│   ├── constants/                  # Hằng số
│   │   ├── routes.ts               # Định tuyến
│   │   ├── config.ts               # Cấu hình
│   │   ├── colors.ts               # Màu sắc
│   │   └── menuData.ts             # Dữ liệu menu
│   │
│   ├── utils/                      # Hàm tiện ích
│   │   ├── formatCurrency.ts       # Định dạng tiền
│   │   ├── formatDate.ts           # Định dạng ngày
│   │   ├── validators.ts           # Kiểm tra dữ liệu
│   │   ├── authStorage.ts          # Lưu trữ xác thực
│   │   ├── dashboardHelpers.ts     # Hàm dashboard
│   │   └── testDashboard.ts        # Kiểm tra dashboard
│   │
│   ├── types/                      # Định nghĩa kiểu
│   │
│   ├── config/                     # Cấu hình ứng dụng
│   │   └── toastConfig.tsx         # Cấu hình Toast
│   │
│   ├── layouts/                    # Layout components
│   │   ├── AuthLayout.tsx          # Layout xác thực
│   │   └── MainLayout.ts           # Layout chính
│   │
│   ├── App.tsx                     # Component chính
│   ├── app.json                    # Cấu hình Expo
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json                # Dependencies
│   ├── babel.config.js             # Babel config
│   ├── metro.config.js             # Metro bundler config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── prettier.config.js          # Prettier config
│   ├── eslint.config.js            # ESLint config
│   └── global.css                  # Global styles
│
├── 🗄️ Database
│   ├── database_migrations.sql     # Migration scripts
│   ├── QUICK_MIGRATION.sql         # Migration nhanh
│   ├── VERIFY_MIGRATION.sql        # Kiểm tra migration
│   ├── debug_orders.sql            # Query debug
│   ├── fix_column_name.sql         # Fix cột
│   └── fix_returned_quantity.sql   # Fix quantity
│
├── 📚 Documentation
│   ├── README.md                   # Tóm tắt
│   ├── README_DETAILED.md          # Tài liệu chi tiết (file này)
│   ├── NOTIFICATION_SETUP.md       # Cài đặt thông báo
│   ├── MIGRATION_STATUS.md         # Trạng thái migration
│   └── QUICK_MIGRATION.sql         # Migration
│
├── 🔧 Configuration
│   ├── .env                        # Biến môi trường
│   ├── .env.example                # Ví dụ .env
│   ├── .gitignore                  # Git ignore rules
│   ├── .gitmessage                 # Commit message template
│   ├── .eslintrc.js                # ESLint rules
│   ├── .prettierrc.js              # Prettier rules
│   │
│   └── android/                    # Native Android config
│       ├── app/
│       │   ├── src/
│       │   │   ├── main/
│       │   │   │   ├── AndroidManifest.xml
│       │   │   │   ├── java/
│       │   │   │   ├── res/
│       │   │   │   └── assets/
│       │   │   └── debug/
│       │   ├── build.gradle
│       │   └── proguard-rules.pro
│       ├── build.gradle
│       └── gradlew
│
└── 📄 Other Files
    ├── package-lock.json           # Dependency lock
    ├── cesconfig.jsonc             # CES config
    ├── nativewind-env.d.ts         # NativeWind types
    ├── app-env.d.ts                # App types
    └── reanimated-logger-config.js # Reanimated config
```

---

## 📖 Hướng Dẫn Sử Dụng

### 1️⃣ Đăng Nhập Lần Đầu

1. Mở ứng dụng
2. Nhấn "Đăng Nhập"
3. Nhập email và mật khẩu
4. Nếu là lần đầu, chọn "Đăng Ký"
5. Nhập thông tin cần thiết
6. Nhập OTP nhận được qua email
7. Hoàn tất!

### 2️⃣ Tạo Đơn Hàng (Nhân Viên)

1. Đi tới tab **"Menu"**
2. Chọn danh mục
3. Chọn món ăn
4. Tùy chỉnh (nếu cần)
5. Thêm vào giỏ
6. Chọn bàn
7. Xác nhận đơn hàng
8. In hóa đơn (nếu cần)

### 3️⃣ Quản Lý Bếp (KDS)

1. Đăng nhập bằng tài khoản bếp
2. Vào tab **"Bếp"**
3. Xem danh sách đơn hàng
4. Chuyển trạng thái: Chờ → Đang làm → Sẵn sàng
5. Đánh dấu khi hàng hết
6. Xem báo cáo xử lý

### 4️⃣ Thanh Toán (Thu Ngân)

1. Đăng nhập bằng tài khoản thu ngân
2. Vào tab **"Bảng Điều Khiển"**
3. Chọn bàn cần thanh toán
4. Xem chi tiết hóa đơn
5. Chọn phương thức thanh toán
6. Xác nhận thanh toán
7. In biên lai

### 5️⃣ Trả Món

1. Chọn bàn có món trả
2. Vào tab **"Trả Món"**
3. Chọn các món cần trả
4. Gửi yêu cầu
5. Bếp sẽ nhận thông báo
6. Cập nhật lại tính toán hóa đơn

---

## 🔌 API & Services

### Supabase Configuration

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Order Service Example

```typescript
// services/orderService.ts
export const fetchOrders = async (status?: string) => {
  let query = supabase.from('orders').select('*');
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  
  return { data, error };
};
```

### Authentication Service

```typescript
// services/authService.ts
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};
```

---

## 🎛️ Quản Lý Trạng Thái

### Zustand Store (Auth)

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### React Context (AuthContext)

```typescript
// context/AuthContext.tsx
interface UserProfile {
  id: string;
  email: string;
  role: 'nhan_vien' | 'bep' | 'admin' | 'thu_ngan';
  full_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  login: (data: { session: any; userProfile: UserProfile }) => Promise<void>;
  logout: () => Promise<void>;
}
```

---

## 🔔 Hệ Thống Thông Báo

### Kiến Trúc Thông Báo

```
┌──────────────────────────────────┐
│    Kitchen (Bếp) - Sự kiện       │
│  - Đơn hàng sẵn sàng            │
│  - Hàng hết                      │
│  - Trả món                       │
└────────────────┬─────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Notification Table │
        │  (Database Store)  │
        └────────────┬───────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Real-time (Supabase RT)    │
        │ WebSocket Connection       │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Notification Service       │
        │ Listeners & Handlers       │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ UI Update & Toast Display  │
        │ notificationService.ts     │
        └────────────────────────────┘
```

### Notification Types

```typescript
enum NotificationType {
  RETURN_ITEM = 'return_item',      // Trả món
  ITEM_READY = 'item_ready',        // Sẵn sàng
  OUT_OF_STOCK = 'out_of_stock',    // Hàng hết
}
```

### Sử Dụng Notification Service

```typescript
// services/notificationService.ts
export const sendItemReadyNotification = async (
  orderId: string,
  itemName: string
) => {
  const { data, error } = await supabase
    .from('return_notifications')
    .insert({
      order_id: orderId,
      item_name: itemName,
      notification_type: 'item_ready',
      status: 'pending',
    });
  
  if (error) throw error;
  return data;
};

// Lắng nghe real-time
const setupNotificationListener = () => {
  supabase
    .channel('return_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'return_notifications',
      },
      (payload) => {
        Toast.show({
          type: 'success',
          text1: 'Thông báo mới',
          text2: payload.new.item_name,
        });
      }
    )
    .subscribe();
};
```

---

## 🗄️ Database Schema

### Bảng Chính

#### 1. `users` - Quản lý người dùng
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'nhan_vien',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `orders` - Quản lý đơn hàng
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  table_id UUID,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `order_items` - Chi tiết đơn hàng
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID,
  quantity INTEGER,
  price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'waiting',
  returned_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `return_notifications` - Thông báo trả/sẵn sàng
```sql
CREATE TABLE return_notifications (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT,
  table_name TEXT,
  item_name VARCHAR(255),
  notification_type VARCHAR(50) DEFAULT 'return_item',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `tables` - Bàn phục vụ
```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  capacity INTEGER,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. `menu_items` - Danh sách menu
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category_id UUID,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. `transactions` - Giao dịch/Thanh toán
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Các Lệnh Thường Dùng

### Development

```bash
# Chạy Linter
npm run lint

# Format Code
npm run format

# Prebuild (Native)
npm run prebuild

# Build Android
npm run android

# Build iOS
npm run ios

# Build Web
npm run web

# Start phát triển
npm start

# Xóa comments
npm run remove-comments
```

### Database

```bash
# Chạy migration
# (Trong Supabase SQL Editor)
-- Copy & paste từ QUICK_MIGRATION.sql

# Kiểm tra migration
-- Run VERIFY_MIGRATION.sql

# Debug orders
-- Run debug_orders.sql
```

---

## 🔐 Bảo Mật

### Tốt nhất Practices

1. **Environment Variables**
   - Không commit `.env` file
   - Sử dụng `.env.example` cho developers
   - Quản lý secrets an toàn

2. **Authentication**
   - Sử dụng Supabase Auth
   - JWT tokens được quản lý tự động
   - Session lưu trữ an toàn với AsyncStorage

3. **Database**
   - Row Level Security (RLS) được kích hoạt
   - Chỉ users đã auth mới có thể truy cập
   - Mình nhất quyền theo role

4. **API**
   - Sử dụng HTTPS cho tất cả requests
   - Validate input từ client
   - Rate limiting (nếu có)

---

## 🐛 Troubleshooting

### Vấn đề Phổ Biến

#### 1. Lỗi Supabase Connection
```
❌ Error: Cannot connect to Supabase
✅ Solution:
  - Kiểm tra .env file
  - Kiểm tra EXPO_PUBLIC_SUPABASE_URL
  - Kiểm tra EXPO_PUBLIC_SUPABASE_ANON_KEY
  - Kiểm tra kết nối internet
```

#### 2. Lỗi Authentication
```
❌ Error: Invalid credentials
✅ Solution:
  - Kiểm tra email/password
  - Kiểm tra user tồn tại trong database
  - Kiểm tra Supabase Auth settings
```

#### 3. Lỗi Migration Database
```
❌ Error: Relation already member of publication
✅ Solution:
  - Đây là warning, không ảnh hưởng
  - Ngều bảng đã có realtime enabled
  - Có thể bỏ qua
```

#### 4. Realtime Tidak Hoạt Động
```
❌ Error: Realtime updates not working
✅ Solution:
  - Kiểm tra Realtime enabled trên Supabase
  - Kiểm tra subscription
  - Kiểm tra network connection
  - Xem console logs
```

---

## 📊 Testing

### Chạy Tests

```bash
# (Nếu có test setup)
npm test

# Watch mode
npm test -- --watch
```

### Debug Dashboard

```typescript
// utils/testDashboard.ts
import { testDashboard } from './utils/testDashboard';

// Chạy tests
await testDashboard.runTests();
```

---

## 🤝 Đóng Góp

Chúng tôi chào mừng các đóng góp! Vui lòng:

1. **Fork** repository
2. **Tạo branch** mới cho feature (`git checkout -b feature/YourFeature`)
3. **Commit** changes (`git commit -m 'Add YourFeature'`)
4. **Push** to branch (`git push origin feature/YourFeature`)
5. **Mở Pull Request**

### Commit Message Convention

Theo template `.gitmessage`:

```
feat: Thêm tính năng mới
fix: Sửa lỗi
style: Thay đổi giao diện
refactor: Cải tiến code
docs: Cập nhật tài liệu
test: Thêm/sửa test
chore: Công việc khác
```

---

## 📝 Giấy Phép

Dự án này được cấp phép dưới giấy phép **MIT**. Xem file `LICENSE` để biết chi tiết.

---

## 👥 Contributors

| Vai trò | Tên | Email |
|--------|-----|-------|
| 👨‍💼 Owner | Banhcanhcua1107 | - |
| 👨‍💻 Developer | - | - |
| 🎨 Designer | - | - |

---

## 📞 Hỗ Trợ & Liên Hệ

- **GitHub Issues**: [GitHub Repository](https://github.com/Banhcanhcua1107/AppDatDoHub/issues)
- **Email**: [Liên hệ]
- **Documentation**: Xem thư mục `/docs`

---

## 📚 Tài Liệu Bổ Sung

- [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md) - Cài đặt hệ thống thông báo
- [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) - Trạng thái database migrations
- [QUICK_MIGRATION.sql](./QUICK_MIGRATION.sql) - Database migration scripts

---

## 🎯 Roadmap

### v1.0.0 (Current) ✅
- ✅ Quản lý xác thực
- ✅ Menu & Đơn hàng
- ✅ Kitchen Display System
- ✅ Thanh toán
- ✅ Hệ thống thông báo

### v1.1.0 (Planned) 🔄
- 🔄 Báo cáo chi tiết hơn
- 🔄 Analytics dashboard
- 🔄 QR code support
- 🔄 Mobile app improvements

### v2.0.0 (Future) 📋
- 📋 AI recommendations
- 📋 Advanced analytics
- 📋 Multi-language support
- 📋 Advanced permissions system

---

## 📊 Tech Stack Summary

```
Frontend:
  • React Native 0.79.5
  • TypeScript 5.8.3
  • React Navigation 7.x
  • NativeWind 4.2.1 (Tailwind CSS)
  • Zustand 5.x (State Management)
  • Redux Toolkit 2.9 (Alternative State)

Backend:
  • Supabase (PostgreSQL Database)
  • Supabase Auth (Authentication)
  • Supabase Realtime (WebSocket)
  
Storage:
  • AsyncStorage (General Storage)
  • MMKV (Fast Storage)
  
Animation:
  • React Native Reanimated 3.17.4
  • React Native Animatable 1.4.0

UI Components:
  • React Native Vector Icons
  • React Native Modal
  • React Native Toast Message

Dev Tools:
  • ESLint 9.37
  • Prettier
  • Babel 7
  • Metro Bundler
```

---

## 🎉 Lời Cảm Ơn

Cảm ơn tất cả developers, testers, và users đã giúp đỡ để hoàn thiện ứng dụng này!

---

**Last Updated:** October 20, 2025  
**Version:** 1.0.0  
**Status:** Active Development 🚀

---

*Tạo bởi GitHub Copilot - Hỗ trợ lập trình & tài liệu*
