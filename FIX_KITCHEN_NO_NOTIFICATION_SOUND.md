# 🎯 Fix: Bếp Không Nghe Âm Thanh Thông Báo

## ❌ Vấn Đề

**Bếp không nghe tiếng "ting-ting" khi nhân viên gửi yêu cầu trả hoặc có thay đổi notification**

```
Nhân viên: Bấm "Yêu cầu trả"
  ├─ INSERT return_notifications (type: 'return_item')
  └─ Bếp: ❌ KHÔNG nghe tiếng

Bếp: ❌ Không nhận thông báo
```

---

## 🔍 Nguyên Nhân

### Root Cause: userRole không được set đúng

**Lỗi trong code cũ:**

```typescript
useEffect(() => {
  let userRole: string = '';  // ❌ Local variable - bị reset mỗi re-render
  
  const getUserRole = async () => {
    const profileJson = await AsyncStorage.getItem('user_profile');
    const profile = JSON.parse(profileJson);
    userRole = profile.role;  // ❌ Set value vào local variable
  };
  
  getUserRole();  // ❌ Async chạy, nhưng không await
  
  // Channels được setup ngay lập tức (async chưa hoàn thành)
  const kitchenChannel = supabase
    .on('postgres_changes', ...,
      (payload) => {
        if (userRole === 'bep') {  // ❌ userRole vẫn là '' (empty string)
          triggerNotificationSound();
        }
      }
    );
});
```

**Timeline vấn đề:**

```
Time 0ms: useEffect chạy
Time 1ms: getUserRole() gọi (async)
Time 2ms: channels được setup (userRole vẫn = '')
Time 3ms: notification đến
Time 4ms: Check: userRole === 'bep'? → '' === 'bep'? → FALSE → ❌ Không phát âm
Time 100ms: getUserRole() hoàn thành, set userRole = 'bep' (quá muộn!)
```

---

## ✅ Giải Pháp

### Sử dụng useRef để lưu userRole

```typescript
// [FIX] useRef thay vì local variable
const userRoleRef = React.useRef<string>('');

useEffect(() => {
  // Lấy role (async)
  const initializeUserRole = async () => {
    const profileJson = await AsyncStorage.getItem('user_profile');
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      userRoleRef.current = profile.role;  // ✅ Set vào ref
      console.log(`[NotificationContext] User role: ${userRoleRef.current}`);
    }
  };
  
  initializeUserRole();
  
  // Channels được setup
  const kitchenChannel = supabase
    .on('postgres_changes', ...,
      (payload) => {
        if (userRoleRef.current === 'bep') {  // ✅ Đọc từ ref
          triggerNotificationSound();
        }
      }
    );
});
```

**Tại sao useRef hiệu quả:**

1. **Persistent:** Giá trị không bị reset khi re-render
2. **Mutable:** Có thể update `.current` bất kỳ lúc nào
3. **Accessible:** Callback có thể truy cập giá trị mới nhất
4. **Timing agnostic:** Không quan tâm async hoàn thành lúc nào

---

## 📊 Workflow Sau Fix

```
Time 0ms: useEffect chạy
Time 1ms: initializeUserRole() gọi (async)
Time 2ms: channels được setup (userRoleRef.current = '')
Time 3ms: notification đến
Time 4ms: Check: userRoleRef.current === 'bep'? → '' === 'bep'? → FALSE (ok, chưa load role)
Time 100ms: initializeUserRole() hoàn thành, set userRoleRef.current = 'bep'
Time 200ms: Notification khác đến
Time 201ms: Check: userRoleRef.current === 'bep'? → 'bep' === 'bep'? → TRUE ✅ Phát âm!
```

---

## 📝 Files Thay Đổi

| File | Thay Đổi |
|------|----------|
| `context/NotificationContext.tsx` | ✏️ Thêm `userRoleRef = useRef<string>('')` |
| `context/NotificationContext.tsx` | ✏️ Rename `getUserRole()` → `initializeUserRole()` |
| `context/NotificationContext.tsx` | ✏️ Thay tất cả `userRole` → `userRoleRef.current` |

---

## 🧪 Test Case

### Test 1: Bếp Nghe Thông Báo Khi Nhân Viên Yêu Cầu Trả ✅

```
Setup:
  - Device A: Bếp (role = 'bep')
  - Device B: Nhân viên (role = 'nhan_vien')

Step 1: Device B bấm "Yêu cầu trả"
  ├─ INSERT return_notifications (type: 'return_item')
  └─ Realtime event

Step 2: Device A (Bếp):
  ├─ kitchenChannel nhận INSERT event
  ├─ Check: userRoleRef.current === 'bep'? → TRUE ✅
  ├─ 🔔 Phát âm thanh "ting-ting"
  └─ ✅ Bếp nghe tiếng

Expected:
  ✅ Bếp nghe tiếng "ting-ting"
```

### Test 2: Bếp Nghe Khi Nhân Viên Yêu Cầu Hủy (cancellation_requests) ✅

```
Setup:
  - Device A: Bếp ở bất kỳ screen nào (Kitchen, CancellationDetail, etc.)
  - Device B: Nhân viên ở OrderScreen

Step 1: Device B bấm "Yêu cầu hủy đơn"
  ├─ INSERT cancellation_requests
  └─ Realtime event

Step 2: Device A (Bếp):
  ├─ kitchenChannel nhận INSERT event
  ├─ Check: userRoleRef.current === 'bep'? → TRUE ✅
  ├─ 🔔 Phát âm thanh "ting-ting"
  └─ ✅ Bếp nghe tiếng

Expected:
  ✅ Bếp nghe tiếng "ting-ting" ở bất kỳ screen nào
```

### Test 3: Nhân Viên Không Nghe Thông Báo Từ Nhân Viên Khác ✅

```
Setup:
  - Device A: Nhân viên A
  - Device B: Nhân viên B

Step 1: Device B bấm "Yêu cầu trả"
  ├─ INSERT return_notifications (type: 'return_item')
  └─ Realtime event

Step 2: Device A (Nhân viên A):
  ├─ staffChannel nhận INSERT event
  ├─ Check: userRoleRef.current === 'nhan_vien'? → TRUE ✅
  ├─ Check: notification_type !== 'return_item'? → FALSE ❌
  └─ ❌ Bỏ qua (không phát âm) ✅

Expected:
  ✅ Nhân viên A không nghe (return_item là cho bếp)
```

---

## 🔄 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│       NotificationContext (Global Listener)          │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 1. useRef để lưu userRole (persistent):            │
│    const userRoleRef = useRef<string>('')          │
│                                                      │
│ 2. Async lấy role từ AsyncStorage:                 │
│    await AsyncStorage.getItem('user_profile')      │
│    userRoleRef.current = profile.role              │
│                                                      │
│ 3. Channels được setup (không chờ async):           │
│    - staffChannel (return_notifications)           │
│    - kitchenChannel (cancellation_requests)        │
│    - returnItemChannel (return_item notifications) │
│                                                      │
│ 4. Callback truy cập userRoleRef.current:          │
│    if (userRoleRef.current === 'bep') → ✅        │
│                                                      │
│ 5. Phát âm thanh "ting-ting" (debounce 1.5s)      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Key Insights

✅ **useRef vs useState:**
- useState → re-render → local variables reset
- useRef → không re-render → persistent, always accessible

✅ **Async timing issue:**
- Callbacks cần truy cập giá trị mới nhất
- useRef.current được update in-place, không cần await

✅ **Notification routing:**
- Bếp nghe: cancellation_requests + return_item
- Nhân viên nghe: item_ready, out_of_stock, cancellation_* (NOT return_item)

---

## ✨ Summary

| Vấn Đề | Nguyên Nhân | Sửa |
|--------|-----------|-----|
| Bếp không nghe | userRole là local variable + async timing | useRef để persistent |
| userRole = '' | getUserRole() chạy async, channels setup trước | initializeUserRole() vẫn async nhưng useRef fix |
| Notification routing sai | Không kiểm tra role đúng | Check userRoleRef.current |

---

**Cập nhật:** 2025-10-24  
**Status:** ✅ Hoàn tất
