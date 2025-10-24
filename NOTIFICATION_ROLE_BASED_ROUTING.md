# 🎯 Fix: Notification Routing Logic Theo Role

## ❌ Vấn Đề Cũ

**Trước khi fix:**
```
Nhân viên bấm "Yêu cầu trả" → INSERT return_item
  ├─ ❌ Nhân viên nghe tiếng (SAIT!)
  └─ ✅ Bếp nghe tiếng (đúng)

Bếp bấm "Đồng ý" → INSERT cancellation_approved
  ├─ ❌ Bếp nghe tiếng (SAI!)
  └─ ✅ Nhân viên nghe tiếng (đúng)

Bếp bấm "Hoàn thành" → INSERT item_ready
  ├─ ❌ Bếp nghe tiếng (SAI!)
  └─ ✅ Nhân viên nghe tiếng (đúng)
```

**Nguyên nhân:** NotificationContext phát âm thanh cho **TẤT CẢ mọi người**, không kiểm tra role user hiện tại.

---

## ✅ Logic Đúng

```
notification_type → Gửi từ → GỬI ĐỂN → Role NÊN NGHE
───────────────────────────────────────────────────────
return_item         nhân viên → bếp      → 'bep' ✅
item_ready          bếp → nhân viên      → 'nhan_vien' ✅
out_of_stock        bếp → nhân viên      → 'nhan_vien' ✅
cancellation_approved bếp → nhân viên    → 'nhan_vien' ✅
cancellation_rejected bếp → nhân viên    → 'nhan_viên' ✅
```

---

## ✅ Giải Pháp

### 1. **Lấy role user hiện tại**

```typescript
// Từ AsyncStorage (lưu khi login)
const profileJson = await AsyncStorage.getItem('user_profile');
const profile = JSON.parse(profileJson);
const userRole = profile.role; // 'nhan_vien', 'bep', 'admin', etc.
```

### 2. **NotificationContext.tsx** - Filter theo role

```typescript
// Channel cho nhân viên
const staffChannel = supabase
  .channel('global-staff-notifications')
  .on('postgres_changes', { event: 'INSERT', table: 'return_notifications' },
    (payload) => {
      const notificationType = payload.new.notification_type;
      
      // [FIX] Chỉ phát âm nếu user là nhân viên VÀ notification không phải từ chính user
      if (userRole === 'nhan_vien' && notificationType !== 'return_item') {
        // ✅ item_ready, out_of_stock, cancellation_* từ bếp
        triggerNotificationSound();
      }
    }
  )
  .subscribe();

// Channel cho bếp - cancellation_requests
const kitchenChannel = supabase
  .channel('global-kitchen-notifications')
  .on('postgres_changes', { event: 'INSERT', table: 'cancellation_requests' },
    (payload) => {
      // [FIX] Chỉ phát âm nếu user là bếp
      if (userRole === 'bep') {
        // ✅ Nhân viên yêu cầu hủy
        triggerNotificationSound();
      }
    }
  )
  .subscribe();

// Channel cho bếp - return_item notification
const returnItemChannel = supabase
  .channel('global-return-item-notifications')
  .on('postgres_changes', 
    { event: 'INSERT', table: 'return_notifications', filter: "notification_type=eq.return_item" },
    (payload) => {
      // [FIX] Chỉ phát âm nếu user là bếp
      if (userRole === 'bep') {
        // ✅ Nhân viên yêu cầu trả
        triggerNotificationSound();
      }
    }
  )
  .subscribe();
```

---

## 📊 Workflow Sau Fix

### ✅ Khi Nhân Viên Yêu Cầu Trả Món

```
Nhân viên (OrderScreen):
  ├─ Bấm "Yêu cầu trả"
  ├─ INSERT return_notifications (type: 'return_item')
  └─ ❌ Nhân viên KHÔNG nghe (user role = 'nhan_vien', notification_type = 'return_item' → bỏ qua) ✅
     
Bếp (KitchenDetailScreen hoặc ở bất kỳ screen):
  ├─ Realtime event INSERT
  ├─ NotificationContext kiểm tra: userRole = 'bep' ✅
  ├─ 🔔 Phát âm thanh "ting-ting" 1 lần
  └─ ✅ Bếp nghe ✅
```

### ✅ Khi Bếp Hoàn Thành Món

```
Bếp (KitchenDetailScreen):
  ├─ Bấm "Xong"
  ├─ INSERT return_notifications (type: 'item_ready')
  └─ ❌ Bếp KHÔNG nghe (user role = 'bep', notification không match channel) ✅

Nhân viên (OrderScreen hoặc ở bất kỳ screen):
  ├─ Realtime event INSERT
  ├─ NotificationContext kiểm tra: userRole = 'nhan_vien' ✅
  ├─ notification_type = 'item_ready' !== 'return_item' ✅
  ├─ 🔔 Phát âm thanh "ting-ting" 1 lần
  └─ ✅ Nhân viên nghe ✅
```

### ✅ Khi Bếp Duyệt Hủy

```
Bếp (CancellationRequestsDetailScreen):
  ├─ Bấm "Đồng ý"
  ├─ INSERT return_notifications (type: 'cancellation_approved')
  └─ ❌ Bếp KHÔNG nghe (user role = 'bep', notification không match staffChannel) ✅

Nhân viên (OrderScreen hoặc ở bất kỳ screen):
  ├─ Realtime event INSERT
  ├─ NotificationContext kiểm tra: userRole = 'nhan_vien' ✅
  ├─ notification_type = 'cancellation_approved' !== 'return_item' ✅
  ├─ 🔔 Phát âm thanh "ting-ting" 1 lần
  └─ ✅ Nhân viên nghe ✅
```

---

## 🎯 Notification Routing Matrix

| User Role | return_item | item_ready | out_of_stock | cancellation_* |
|-----------|-----------|-----------|------------|---------------|
| **nhan_vien** | ❌ Bỏ qua | ✅ **Nghe** | ✅ **Nghe** | ✅ **Nghe** |
| **bep** | ✅ **Nghe** | ❌ Bỏ qua | ❌ Bỏ qua | ❌ Bỏ qua |
| **admin** | ❌ Bỏ qua | ❌ Bỏ qua | ❌ Bỏ qua | ❌ Bỏ qua |
| **thu_ngan** | ❌ Bỏ qua | ❌ Bỏ qua | ❌ Bỏ qua | ❌ Bỏ qua |

---

## 📝 Files Thay Đổi

| File | Thay Đổi |
|------|----------|
| `context/NotificationContext.tsx` | ✏️ Thêm logic lấy user role từ AsyncStorage |
| `context/NotificationContext.tsx` | ✏️ Filter staffChannel theo role 'nhan_vien' |
| `context/NotificationContext.tsx` | ✏️ Filter kitchenChannel theo role 'bep' |
| `context/NotificationContext.tsx` | ✏️ Thêm returnItemChannel cho 'return_item' notifications |

---

## 🧪 Test Cases

### Test 1: Nhân viên Yêu Cầu Trả ✅
```
Device A (Nhân viên):
  ├─ UserProfile.role = 'nhan_vien'
  ├─ Bấm "Yêu cầu trả"
  ├─ INSERT return_notifications (type: 'return_item')
  └─ ❌ Device A KHÔNG nghe (bỏ qua) ✅

Device B (Bếp):
  ├─ UserProfile.role = 'bep'
  ├─ Realtime event INSERT
  ├─ 🔔 Phát âm thanh "ting-ting"
  └─ ✅ Device B nghe ✅
```

### Test 2: Bếp Hoàn Thành Món ✅
```
Device A (Bếp):
  ├─ UserProfile.role = 'bep'
  ├─ Bấm "Xong"
  ├─ INSERT return_notifications (type: 'item_ready')
  └─ ❌ Device A KHÔNG nghe (bỏ qua) ✅

Device B (Nhân viên):
  ├─ UserProfile.role = 'nhan_vien'
  ├─ Realtime event INSERT
  ├─ 🔔 Phát âm thanh "ting-ting"
  └─ ✅ Device B nghe ✅
```

### Test 3: Bếp Duyệt Hủy ✅
```
Device A (Bếp):
  ├─ UserProfile.role = 'bep'
  ├─ Bấm "Đồng ý"
  ├─ INSERT return_notifications (type: 'cancellation_approved')
  └─ ❌ Device A KHÔNG nghe (bỏ qua) ✅

Device B (Nhân viên):
  ├─ UserProfile.role = 'nhan_vien'
  ├─ Realtime event INSERT
  ├─ 🔔 Phát âm thanh "ting-ting"
  └─ ✅ Device B nghe ✅
```

---

## ✨ Summary

| Vấn Đề | Sửa Thế Nào | Status |
|--------|------------|--------|
| Nhân viên nghe âm thanh khi tự tạo yêu cầu | Filter theo role + notification_type | ✅ Fixed |
| Bếp nghe âm thanh khi tự duyệt/hoàn thành | Filter theo role | ✅ Fixed |
| Notification routing logic sai | Áp dụng routing matrix theo role | ✅ Fixed |

---

## 🔄 Architecture

```
┌────────────────────────────────────────────────────────┐
│         NotificationContext (Global Listener)          │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Lấy userProfile từ AsyncStorage                    │
│    ├─ user.role = 'nhan_vien' | 'bep' | ...           │
│                                                         │
│ 2. Lắng nghe 4 channel realtime:                       │
│    ├─ staffChannel (return_notifications)             │
│    ├─ kitchenChannel (cancellation_requests)          │
│    ├─ returnItemChannel (return_item notifications)   │
│    └─ (menu_items, return_slips channels)             │
│                                                         │
│ 3. Filter với role:                                    │
│    ├─ Nhân viên nghe: item_ready, out_of_stock, ...  │
│    ├─ Bếp nghe: cancellation_requests, return_item   │
│    └─ Không nghe: self-triggered notifications        │
│                                                         │
│ 4. Phát âm thanh "ting-ting" (1 lần, debounce 1.5s)  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Cập nhật:** 2025-10-24  
**Status:** ✅ Hoàn tất
