# 🍽️ AppDatDoHub - Hệ Thống Quản Lý Nhà Hàng

[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)](https://github.com/Banhcanhcua1107/AppDatDoHub)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/Banhcanhcua1107/AppDatDoHub/releases)
[![React Native](https://img.shields.io/badge/React_Native-0.79.5-61dafb?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**AppDatDoHub** là một ứng dụng di động toàn diện và chuyên nghiệp để quản lý hoạt động của nhà hàng, quán ăn. 
Hỗ trợ các vai trò khác nhau (Nhân viên phục vụ, Bếp, Thu ngân, Quản lý) với các tính năng riêng biệt và tích hợp.

## ✨ Tính Năng Chính

### 📱 Quản Lý Xác Thực
- ✅ Đăng nhập/Đăng xuất bằng email & mật khẩu
- ✅ Đăng ký tài khoản với xác thực OTP
- ✅ Quên/Đặt lại mật khẩu
- ✅ Quản lý phiên đăng nhập an toàn
- ✅ Hỗ trợ nhiều vai trò (Role-based access)

### 🍽️ Quản Lý Menu & Đơn Hàng
- ✅ Danh sách menu phân loại theo danh mục
- ✅ Tùy chỉnh chi tiết món ăn (ghi chú, lựa chọn)
- ✅ Giỏ hàng động với cập nhật real-time
- ✅ Chia đơn hàng cho nhiều khách
- ✅ Lịch sử đơn hàng chi tiết
- ✅ In hóa đơn trực tiếp

### 🏠 Bàn Phục Vụ
- ✅ Sơ đồ bàn trực quan
- ✅ Quản lý trạng thái bàn (Trống, Có khách, Có đơn)
- ✅ Tạo đơn cho bàn cụ thể
- ✅ Chuyển/Gộp bàn
- ✅ Thanh toán bàn riêng

### 👨‍🍳 Kitchen Display System (KDS)
- ✅ Hiển thị tất cả đơn hàng cần nấu
- ✅ Cập nhật trạng thái: Chờ → Đang làm → Sẵn sàng
- ✅ Đánh dấu hàng hết/không có sẵn
- ✅ Thông báo khi sẵn sàng phục vụ
- ✅ Báo cáo xử lý đơn hàng
- ✅ Lịch sử trả món

### 💳 Quản Lý Thanh Toán
- ✅ Tính toán hóa đơn tạm tính tự động
- ✅ Hỗ trợ nhiều phương thức (Tiền mặt, Ngân hàng, ...)
- ✅ Quản lý quỹ tiền mặt & ngân hàng
- ✅ Lịch sử giao dịch chi tiết
- ✅ In biên lai thanh toán

### 📊 Báo Cáo & Thống Kê
- ✅ Bảng điều khiển (Dashboard) với thống kê real-time
- ✅ Báo cáo doanh số theo ngày/tháng
- ✅ Báo cáo chi phí & quỹ
- ✅ Báo cáo kho hàng
- ✅ Báo cáo xử lý từ bếp
- ✅ Export dữ liệu

### 🔔 Hệ Thống Thông Báo
- ✅ Thông báo món trả real-time
- ✅ Thông báo đơn hàng sẵn sàng
- ✅ Thông báo hàng hết
- ✅ Real-time updates với Supabase
- ✅ Lịch sử thông báo đầy đủ
- ✅ Hỗ trợ Push Notifications

### 🌐 Quản Lý Mạng
- ✅ Phát hiện trạng thái kết nối
- ✅ Lưu trữ offline & đồng bộ khi online
- ✅ Xử lý lỗi mạng tự động
- ✅ Retry logic thông minh

## 🚀 Quick Start

### Yêu cầu
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Expo CLI** ≥ 5.0.0

### Cài đặt

```bash
# Clone repository
git clone https://github.com/Banhcanhcua1107/AppDatDoHub.git
cd AppDatDoHub

# Cài đặt dependencies
npm install

# Cấu hình .env (xem .env.example)
cp .env.example .env

# Chạy ứng dụng
npm start

# Chọn platform:
# a - Android
# i - iOS  
# w - Web
```

### Chạy Native

```bash
# Android
npm run android
# hoặc
expo run:android

# iOS
npm run ios
# hoặc
expo run:ios
```

## 📂 Cấu Trúc Dự Án

```
AppDatDoHub/
├── assets/           # Ảnh, icon, font, âm thanh
├── components/       # Reusable components
├── screens/          # Màn hình chính
│   ├── Auth/        # Xác thực
│   ├── Menu/        # Menu & Đơn hàng
│   ├── Orders/      # Quản lý đơn
│   ├── Kitchen/     # KDS
│   ├── Cashier/     # Thu ngân
│   ├── Tables/      # Bàn
│   └── ...
├── navigation/       # React Navigation setup
├── context/          # React Context (Auth, Cart, Network)
├── hooks/            # Custom hooks
├── store/            # Zustand state management
├── services/         # API & Services
├── constants/        # Routes, colors, config
├── utils/            # Helper functions
├── types/            # TypeScript types
├── config/           # App configuration
└── layouts/          # Layout components
```

## 🛠️ Tech Stack

| Lớp | Công Nghệ |
|-----|-----------|
| **Mobile** | React Native 0.79.5 |
| **Frontend** | TypeScript, React Navigation |
| **Styling** | NativeWind (Tailwind CSS) |
| **State** | Zustand, Redux Toolkit |
| **Backend** | Supabase (PostgreSQL) |
| **Real-time** | Supabase Realtime |
| **Auth** | Supabase Auth |
| **Storage** | AsyncStorage, MMKV |

## 📖 Tài Liệu

- 📘 [Tài liệu Chi Tiết](./README_DETAILED.md) - Hướng dẫn toàn diện
- 🔔 [Cài đặt Thông báo](./NOTIFICATION_SETUP.md) - Setup hệ thống thông báo
- 🗄️ [Status Migration](./MIGRATION_STATUS.md) - Trạng thái database
- 🚀 [Quick Migration](./QUICK_MIGRATION.sql) - Database scripts

## 📝 Lệnh Thường Dùng

```bash
# Development
npm start              # Chạy phát triển
npm run lint           # Kiểm tra code
npm run format         # Format code
npm run android        # Build Android
npm run ios            # Build iOS
npm run web            # Build Web

# Database
npm run migrate        # Chạy migrations
npm run seed          # Seed dữ liệu
```

## 🔐 Bảo Mật

- ✅ Supabase Authentication & Row Level Security
- ✅ JWT Token Management
- ✅ Environment Variables cho secrets
- ✅ Role-based Access Control
- ✅ Secure storage cho sensitive data

## 🐛 Troubleshooting

### Lỗi Supabase Connection
```bash
# Kiểm tra .env file
# EXPO_PUBLIC_SUPABASE_URL=your_url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Clear Cache & Rebuild
```bash
expo start --clear
npm install --legacy-peer-deps
```

Xem [README_DETAILED.md](./README_DETAILED.md) để troubleshooting đầy đủ.

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Mở Pull Request

## 📄 Giấy Phép

MIT License - Xem [LICENSE](LICENSE) file

## 📞 Hỗ Trợ

- 🐞 [Report Issues](https://github.com/Banhcanhcua1107/AppDatDoHub/issues)
- 💬 [Discussions](https://github.com/Banhcanhcua1107/AppDatDoHub/discussions)
- 📧 [Contact](mailto:support@appdatdohub.com)

## 🎯 Roadmap

- ✅ v1.0.0 - Core features (current)
- 🔄 v1.1.0 - Advanced reports & analytics
- 📋 v2.0.0 - AI recommendations & multi-language

---

**Made with ❤️ by [Banhcanhcua1107](https://github.com/Banhcanhcua1107)**

Last Updated: October 20, 2025 | Version: 1.0.0
