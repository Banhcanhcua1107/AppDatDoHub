# Hướng dẫn Sử dụng Role Thu Ngân

## Tổng quan
Đã thêm role **Thu Ngân** (`thu_ngan`) với giao diện riêng biệt so với role **Nhân viên** (`nhan_vien`).

## Cấu trúc File

### 1. Màn hình Thu Ngân
- **`screens/Cashier/CashierUtilitiesScreen.tsx`**: Màn hình Tiện ích dành cho thu ngân với các chức năng mở rộng
- **`screens/Cashier/CashierReportScreen.tsx`**: Báo cáo
- **`screens/Cashier/PurchaseScreen.tsx`**: Mua hàng
- **`screens/Cashier/InventoryScreen.tsx`**: Kho
- **`screens/Cashier/CashFundScreen.tsx`**: Quỹ tiền mặt
- **`screens/Cashier/BankFundScreen.tsx`**: Quỹ tiền gửi
- **`screens/Cashier/ExpensesScreen.tsx`**: Chi phí
- **`screens/Cashier/PromotionsScreen.tsx`**: Khuyến mãi
- **`screens/Cashier/MenuManagementScreen.tsx`**: Thực đơn

### 2. Navigation
- **`navigation/CashierTabs.tsx`**: Bottom Tab Navigator cho Thu ngân (giống Staff nhưng tab Tiện ích khác)
- **`navigation/AppNavigator.tsx`**: Đã cập nhật để xử lý role `thu_ngan`

## Chức năng

### Thu Ngân có TẤT CẢ chức năng của Nhân viên PLUS:

#### Phần Tiện ích của Nhân viên:
- Thay đổi mật khẩu
- Đăng xuất
- Thiết lập máy in
- Đồng bộ dữ liệu
- Kiểm tra kết nối
- Lịch sử hóa đơn
- Thiết lập QR thanh toán

#### Phần Quản lý Thu ngân (MỚI):
- **Báo cáo**: Báo cáo doanh thu, chi phí, lợi nhuận
- **Mua hàng**: Quản lý đơn đặt hàng, nhà cung cấp
- **Kho**: Quản lý tồn kho, xuất nhập kho
- **Quỹ tiền mặt**: Quản lý thu chi tiền mặt
- **Quỹ tiền gửi**: Quản lý tài khoản ngân hàng
- **Chi phí**: Quản lý các khoản chi phí
- **Khuyến mãi**: Tạo và quản lý chương trình khuyến mãi
- **Thực đơn**: Quản lý thực đơn, món ăn, giá cả

## Cách hoạt động

### 1. Xác thực & Phân quyền
Khi đăng nhập, hệ thống kiểm tra `userProfile.role` từ `AuthContext`:
- Nếu role = `'thu_ngan'` → Hiển thị `CashierNavigator`
- Nếu role = `'nhan_vien'` → Hiển thị `MainAppStack`
- Nếu role = `'bep'` → Hiển thị `KitchenNavigator`

### 2. Bottom Tabs
Thu ngân có 5 tabs giống nhân viên:
1. **Sơ đồ** - Quản lý bàn
2. **Order** - Đặt món
3. **Trả món** - Trả món về bếp
4. **Tạm tính** - Xem hóa đơn tạm tính
5. **Tiện ích** - Sử dụng `CashierUtilitiesScreen` (khác với Staff)

### 3. Navigation Stack
```typescript
CashierStack:
├── CashierRoot (CashierTabs)
├── CashierReport
├── Purchase
├── Inventory
├── CashFund
├── BankFund
├── Expenses
├── Promotions
├── MenuManagement
├── ChangePassword
└── BillHistory
```

## Triển khai trong Database

Đảm bảo trong bảng `profiles` của Supabase có column `role` với giá trị:
- `'nhan_vien'` - Nhân viên
- `'thu_ngan'` - Thu ngân
- `'bep'` - Bếp
- `'admin'` - Quản trị viên

## Các màn hình placeholder

Hiện tại các màn hình quản lý thu ngân đều là **placeholder** (chưa có logic thực tế):
- Hiển thị icon và text mô tả
- Thông báo "Chức năng này đang được phát triển"
- Sẵn sàng để implement logic nghiệp vụ

## Tiếp theo cần làm

1. Implement logic cho từng màn hình quản lý
2. Kết nối với database (Supabase)
3. Tạo các API endpoints cần thiết
4. Thêm quyền truy cập chi tiết hơn (permissions)
5. Test đầy đủ cho mỗi chức năng

## Lưu ý

- Thu ngân có thể truy cập TẤT CẢ chức năng của nhân viên (Order, Trả món, Tạm tính, etc.)
- Chỉ khác biệt ở phần **Tiện ích** với các chức năng quản lý mở rộng
- Tất cả các màn hình mới đều có header với title tương ứng
