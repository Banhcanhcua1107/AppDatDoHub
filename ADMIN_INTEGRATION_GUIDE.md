// INTEGRATION_GUIDE.md - Hướng Dẫn Tích Hợp Admin Module

# 🔧 Hướng Dẫn Tích Hợp Admin Module

## 📋 Yêu Cầu

Module Admin đã được tạo và tích hợp tự động vào hệ thống. Tuy nhiên, bạn cần thực hiện một số bước chuẩn bị:

---

## ✅ Kiểm Tra Danh Sách

### 1. ✓ Folder Structure
```
screens/Admin/
├── AdminDashboardScreen.tsx
├── AdminMenuScreen.tsx
├── AdminOrdersScreen.tsx
├── AdminUsersScreen.tsx
├── AdminReportsScreen.tsx
└── README.md
```

### 2. ✓ Navigation Updated
- `navigation/AdminTabs.tsx` - ĐÃ TẠO
- `navigation/RootNavigator.tsx` - ĐÃ CẬP NHẬT (thêm AdminTabs)

### 3. ✓ Context Check
- `context/AuthContext.tsx` - Kiểm tra xem role có 'admin' không

---

## 🔌 Các Bước Tích Hợp

### Step 1: Cập Nhật AuthContext (Nếu Cần)

**File**: `context/AuthContext.tsx`

Đảm bảo role bao gồm 'admin':
```typescript
interface UserProfile {
  id: string;
  email: string;
  role: 'nhan_vien' | 'bep' | 'admin' | 'thu_ngan' | string;
  full_name?: string;
}
```

---

### Step 2: Tạo API Services (Tùy Chọn)

Tạo file mới nếu cần: `services/adminService.ts`

```typescript
import { supabase } from './supabase';

// Menu API
export const adminService = {
  // Menu Management
  async getMenuItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async createMenuItem(item: any) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select();
    if (error) throw error;
    return data;
  },

  async updateMenuItem(id: string, updates: any) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteMenuItem(id: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Orders API
  async getOrders(status?: string) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getOrderDetails(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Users API
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return data;
  },

  async createUser(user: any) {
    const { data, error } = await supabase
      .auth.admin.createUser(user);
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Reports API
  async getRevenueReport(period: 'week' | 'month') {
    // Logic để lấy dữ liệu báo cáo
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', calculateDateRange(period));
    if (error) throw error;
    return data;
  },
};

function calculateDateRange(period: 'week' | 'month') {
  const now = new Date();
  if (period === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
}
```

---

### Step 3: Cập Nhật AuthContext Login Logic

**File**: `context/AuthContext.tsx`

Khi người dùng đăng nhập, đảm bảo role được lưu:

```typescript
// Ví dụ đăng nhập
async function handleLogin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Lấy profile từ database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Lưu vào context
    await login({
      session: data.session,
      userProfile: {
        id: profile.id,
        email: profile.email,
        role: profile.role, // ← Ensure role được set
        full_name: profile.full_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

---

### Step 4: Cập Nhật Login Screen

**File**: `screens/Auth/LoginScreen.tsx`

Thêm tài khoản admin test:
```typescript
// Hardcoded test admin account (for development only)
const TEST_ADMIN = {
  email: 'admin@restaurant.com',
  password: 'admin123456',
};
```

---

### Step 5: Kiểm Tra Navigation

**File**: `navigation/RootNavigator.tsx`

✓ Đã cập nhật sẵn. Kiểm tra:
```typescript
let TabsComponent;

if (userRole === 'admin') {
  TabsComponent = AdminTabs;  // ← AdminTabs được sử dụng
} else if (userRole === 'thu_ngan') {
  TabsComponent = CashierTabs;
} else {
  TabsComponent = AppTabsNavigator;
}
```

---

## 🧪 Kiểm Thử

### Test Cases

1. **Đăng nhập với role 'admin'**
   ```
   Email: admin@restaurant.com
   Password: admin123456
   Expected: Hiển thị AdminTabs
   ```

2. **Đăng nhập với role 'thu_ngan'**
   ```
   Email: cashier@restaurant.com
   Password: cashier123
   Expected: Hiển thị CashierTabs
   ```

3. **Đăng nhập với role 'nhan_vien'**
   ```
   Email: staff@restaurant.com
   Password: staff123
   Expected: Hiển thị AppTabsNavigator
   ```

---

## 🎨 Tùy Chỉnh UI

### Colors
**File**: `constants/colors.ts`

Kiểm tra đã có các màu cần thiết:
```typescript
export const COLORS = {
  primary: '#3B82F6',      // Blue
  success: '#51CF66',      // Green
  warning: '#FFA500',      // Orange
  danger: '#FF6B6B',       // Red
  info: '#4ECDC4',         // Teal
  // ... other colors
};
```

---

## 🔌 Thay Thế Mock Data Bằng API

Mỗi screen hiện đang sử dụng mock data. Thay thế như sau:

### AdminMenuScreen.tsx
```typescript
// Trước (Mock)
const loadMenuItems = async () => {
  const mockData: MenuItem[] = [ /* ... */ ];
  setMenuItems(mockData);
};

// Sau (API)
const loadMenuItems = async () => {
  try {
    const data = await adminService.getMenuItems();
    setMenuItems(data);
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể tải dữ liệu');
  }
};
```

### AdminOrdersScreen.tsx
```typescript
// Trước (Mock)
const loadOrders = async () => {
  const mockOrders: Order[] = [ /* ... */ ];
  setOrders(mockOrders);
};

// Sau (API)
const loadOrders = async () => {
  try {
    const data = await adminService.getOrders();
    setOrders(data);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
};
```

### AdminUsersScreen.tsx
```typescript
// Trước (Mock)
const loadUsers = async () => {
  const mockUsers: User[] = [ /* ... */ ];
  setUsers(mockUsers);
};

// Sau (API)
const loadUsers = async () => {
  try {
    const data = await adminService.getUsers();
    setUsers(data);
  } catch (error) {
    console.error('Error loading users:', error);
  }
};
```

---

## 🚀 Triển Khai

### Production Checklist

- [ ] Tích hợp API thực tế
- [ ] Kiểm tra tất cả chức năng CRUD
- [ ] Xử lý lỗi mạng
- [ ] Thêm loading states
- [ ] Kiểm tra quyền truy cập
- [ ] Tối ưu hóa hiệu suất
- [ ] Test trên các thiết bị khác nhau
- [ ] Kiểm tra bảo mật (xác thực API)

---

## 📝 Database Schema (Supabase)

Đảm bảo các bảng tồn tại:

### profiles (Users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'nhan_vien', -- 'nhan_vien', 'bep', 'thu_ngan', 'admin'
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  join_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### menu_items
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  table_number TEXT,
  status TEXT, -- 'pending', 'preparing', 'completed', 'served', 'cancelled'
  total DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  served_at TIMESTAMP,
  payment_method TEXT,
  customer_name TEXT
);
```

---

## 🐛 Troubleshooting

### Problem: Admin Tab không hiển thị
**Solution**: Kiểm tra:
1. `userProfile?.role === 'admin'`
2. RootNavigator import AdminTabs
3. AuthContext lưu role chính xác

### Problem: Mock data không hiển thị
**Solution**:
1. Kiểm tra imports
2. Xác định function `loadXXX` được gọi trong useEffect
3. Kiểm tra state updates

### Problem: Navigation errors
**Solution**:
1. Kiểm tra tên route đúng
2. Kiểm tra imports screen
3. Xác nhận component được export

---

## 📚 Tài Liệu Liên Quan

- [Admin Module README](./screens/Admin/README.md)
- [React Navigation Docs](https://reactnavigation.org/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/)

---

## 🎓 Ví Dụ Hoàn Chỉnh

Xem các file trong `screens/Admin/` để có ví dụ:
- ✓ Form handling (MenuScreen)
- ✓ List management (OrdersScreen)
- ✓ Search & filter (UsersScreen)
- ✓ Chart rendering (ReportsScreen)
- ✓ Modal interactions (Tất cả screens)

---

**Chúc mừng! 🎉 Admin Module đã sẵn sàng sử dụng!**

Nếu có câu hỏi, vui lòng tham khảo README.md hoặc liên hệ dev team.
