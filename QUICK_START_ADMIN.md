// QUICK_START_ADMIN.md - Hướng Dẫn Nhanh Admin Module

# 🚀 Quick Start - Admin Module

## ⚡ 5 Phút Để Bắt Đầu

### 1️⃣ Xác Nhận Cài Đặt Hoàn Tất

Kiểm tra các folder đã tạo:
```bash
screens/Admin/
  ├── AdminDashboardScreen.tsx ✅
  ├── AdminMenuScreen.tsx ✅
  ├── AdminOrdersScreen.tsx ✅
  ├── AdminUsersScreen.tsx ✅
  ├── AdminReportsScreen.tsx ✅
  └── README.md ✅

navigation/
  ├── AdminTabs.tsx ✅ (NEW)
  └── RootNavigator.tsx ✅ (UPDATED)
```

---

### 2️⃣ Đăng Nhập Admin

**Test Account:**
```
Email:    admin@restaurant.com
Password: admin123456
```

**Kết quả dự kiến:**
```
✅ Hiển thị AdminTabs (5 tabs ở dưới cùng)
✅ Các tab: Trang chủ | Menu | Đơn hàng | Nhân viên | Báo cáo
```

---

### 3️⃣ Khám Phá Các Giao Diện

#### Tab 1: 🏠 Trang Chủ (AdminDashboardScreen)
```
- Xem 4 KPI chính
- Nhấn vào các menu để truy cập chức năng khác
```

#### Tab 2: 🍽️ Menu (AdminMenuScreen)
```
- Tìm kiếm sản phẩm
- Nhấn "+" để thêm sản phẩm mới
- Nhấn "✏️" để sửa
- Nhấn "✓/✕" để chuyển đổi trạng thái có sẵn/hết hàng
- Nhấn "🗑️" để xóa
```

#### Tab 3: 📋 Đơn Hàng (AdminOrdersScreen)
```
- Xem danh sách tất cả đơn hàng
- Lọc theo trạng thái (Chờ xử lý, Đang chuẩn bị, v.v.)
- Nhấn vào đơn hàng để xem chi tiết
```

#### Tab 4: 👥 Nhân Viên (AdminUsersScreen)
```
- Tìm kiếm nhân viên theo tên
- Lọc theo chức vụ
- Nhấn "+" để thêm nhân viên
- Nhấn "✏️" để sửa
- Nhấn "🔒" để khóa tài khoản
- Nhấn "🗑️" để xóa
```

#### Tab 5: 📊 Báo Cáo (AdminReportsScreen)
```
- Chọn "Theo Tuần" hoặc "Theo Tháng"
- Xem biểu đồ doanh thu
- Xem thống kê KPI
- Cuộn xuống xem chi tiết từng ngày
```

---

## 🎯 Chức Năng Chính

### ✅ Đã Có (Sử Dụng Ngay)
- ✔️ Dashboard với thống kê
- ✔️ Quản lý menu (CRUD)
- ✔️ Quản lý đơn hàng (R + Filter)
- ✔️ Quản lý nhân viên (CRUD + Lock)
- ✔️ Báo cáo doanh thu (Chart + Stats)
- ✔️ Search & Filter
- ✔️ Modal forms
- ✔️ Responsive design

### 🔜 Cần Tích Hợp (Sau)
- API thực tế (thay mock data)
- Export báo cáo (PDF/Excel)
- Real-time updates
- Notifications

---

## 💻 Development Tips

### Để Xóa Mock Data & Thêm API

**File**: `screens/Admin/AdminMenuScreen.tsx` (line ~60)

**Trước (Mock)**:
```typescript
const loadMenuItems = async () => {
  try {
    const mockData: MenuItem[] = [
      { id: '1', name: 'Phở Bò', ... },
      { id: '2', name: 'Cơm Tấm', ... },
    ];
    setMenuItems(mockData);
  } catch (error) {
    console.error('Error loading menu items:', error);
  }
};
```

**Sau (API)**:
```typescript
const loadMenuItems = async () => {
  try {
    // Gọi API thực tế
    const response = await fetch('/api/menu-items');
    const data = await response.json();
    setMenuItems(data);
  } catch (error) {
    console.error('Error loading menu items:', error);
    Alert.alert('Lỗi', 'Không thể tải dữ liệu');
  }
};
```

---

## 🧪 Testing Checklist

### Kiểm Thử Cơ Bản

```
AdminDashboardScreen:
  □ Hiển thị 4 stat cards
  □ Nhấn menu items chuyển tab

AdminMenuScreen:
  □ Hiển thị danh sách sản phẩm
  □ Tìm kiếm hoạt động
  □ Thêm sản phẩm mới
  □ Sửa sản phẩm
  □ Xóa sản phẩm
  □ Toggle trạng thái

AdminOrdersScreen:
  □ Hiển thị danh sách đơn hàng
  □ Lọc theo trạng thái
  □ Xem chi tiết đơn hàng

AdminUsersScreen:
  □ Hiển thị danh sách nhân viên
  □ Tìm kiếm hoạt động
  □ Lọc theo chức vụ
  □ Thêm nhân viên
  □ Sửa nhân viên
  □ Khóa/mở khóa
  □ Xem chi tiết quyền

AdminReportsScreen:
  □ Chuyển đổi Tuần/Tháng
  □ Hiển thị biểu đồ
  □ Hiển thị thống kê
  □ Hiển thị chi tiết từng ngày
  □ Hiển thị tóm tắt
```

---

## 📞 Troubleshooting

### Problem: Không thấy Admin Tab
**Solution**: 
1. Kiểm tra login account có role = 'admin'
2. Xác nhận RootNavigator có import AdminTabs
3. Restart app

### Problem: Red Errors
**Solution**:
1. Check console messages
2. Tất cả components đã được import
3. Xem ADMIN_INTEGRATION_GUIDE.md

### Problem: Mock Data Không Hiển Thị
**Solution**:
1. Kiểm tra `loadXXX()` được gọi trong useEffect
2. Kiểm tra mock data structure
3. Kiểm tra state updates

---

## 📚 Tài Liệu Liên Quan

| Tài Liệu | Nội Dung |
|----------|---------|
| README.md | Chi tiết từng giao diện |
| ADMIN_INTEGRATION_GUIDE.md | Hướng dẫn tích hợp API |
| ADMIN_MODULE_SUMMARY.md | Tóm tắt toàn bộ |
| QUICK_START_ADMIN.md | Hướng dẫn này |

---

## 🚀 Các Bước Tiếp Theo

1. **Xác minh hoạt động** (5 phút)
   - Đăng nhập admin
   - Kiểm tra 5 tabs
   - Test CRUD cơ bản

2. **Tùy chỉnh UI** (30 phút)
   - Thay đổi màu sắc
   - Thêm logo
   - Điều chỉnh layout

3. **Tích hợp API** (2-3 giờ)
   - Tạo adminService.ts
   - Thay thế mock data
   - Test với backend

4. **Deploy** (1-2 giờ)
   - Test trên device thực
   - Fix responsive issues
   - Submit

---

## 🎓 Ví Dụ Code

### Ví dụ 1: Search Menu
```typescript
const filterItems = () => {
  if (!searchQuery.trim()) {
    setFilteredItems(menuItems);
    return;
  }
  const filtered = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredItems(filtered);
};
```

### Ví dụ 2: Add MenuItem
```typescript
const handleSaveItem = async () => {
  const newItem: MenuItem = {
    id: Date.now().toString(),
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    category: formData.category,
    available: true,
  };
  
  setMenuItems([...menuItems, newItem]);
  Alert.alert('Thành công', 'Thêm sản phẩm mới thành công');
  setModalVisible(false);
};
```

### Ví dụ 3: Filter Orders by Status
```typescript
const filterOrders = () => {
  if (selectedStatus === 'all') {
    setFilteredOrders(orders);
  } else {
    setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
  }
};
```

---

## 💡 Pro Tips

1. **Performance**: Sử dụng `FlatList` thay vì `ScrollView` cho danh sách dài
2. **UX**: Thêm loading spinner khi fetch dữ liệu
3. **Error Handling**: Luôn thêm try-catch cho API calls
4. **Testing**: Sử dụng tài khoản admin test trước khi deploy
5. **Accessibility**: Thêm alt text cho images, descriptive labels

---

## 🎉 Hoàn Tất!

Bạn đã sẵn sàng:
- ✅ Admin Module hoàn toàn chức năng
- ✅ 5 giao diện quản lý chính
- ✅ Tài liệu chi tiết
- ✅ Mock data để kiểm tra

**Tiếp theo**: Đăng nhập với tài khoản admin và khám phá! 🚀

---

*Phiên bản: 1.0.0*  
*Ngày tạo: 04/11/2025*
