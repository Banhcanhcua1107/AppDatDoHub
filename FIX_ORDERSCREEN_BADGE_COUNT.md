# 🎯 Fix: OrderScreen Badge Notification Count Không Đúng

## ❌ Vấn Đề

### Trước Fix:
```
OrderScreen badge hiển thị: 3 thông báo
Nhân viên bấm "Yêu cầu trả" → INSERT return_item
OrderScreen badge: 4 (tăng thêm) ❌ SAI!

Vào chi tiết:
- Thấy 4 thông báo (bao gồm cả "Khách yêu cầu trả")
- Nhưng "Khách yêu cầu trả" là cho bếp, không phải cho nhân viên
- Hiển thị sai! ❌
```

## 📋 Nguyên Nhân

**Dòng này:**
```typescript
const { count } = await supabase
  .from('return_notifications')
  .select('*', { count: 'exact' })
  .eq('order_id', item.orderId)
  .eq('status', 'pending');
  // ❌ Lấy TẤT CẢ notification của order (kể cả return_item từ nhân viên)
```

**Realtime listener:**
```typescript
.on('postgres_changes', 
  { event: '*', table: 'return_notifications', filter: `order_id=eq.${item.orderId}` },
  (payload) => {
    fetchNotifications(); // ❌ TỰ ĐỘNG FETCH LẠI khi có bất kỳ notification nào
  }
)

// Khi nhân viên gửi return_item:
// ├─ INSERT return_notifications (return_item)
// ├─ Realtime trigger payload
// ├─ fetchNotifications() tự động gọi lại
// └─ Badge tăng ❌
```

---

## ✅ Giải Pháp

### 1. **Query Filter bỏ 'return_item'**

```typescript
const { count, error } = await supabase
  .from('return_notifications')
  .select('*', { count: 'exact', head: true })
  .eq('order_id', item.orderId)
  .eq('status', 'pending')
  .neq('notification_type', 'return_item'); // ✅ Lọc bỏ return_item
  
// Chỉ lấy: item_ready, out_of_stock, cancellation_approved, cancellation_rejected
```

### 2. **Realtime Listener Filter bỏ 'return_item'**

```typescript
.on('postgres_changes', 
  { event: '*', table: 'return_notifications', filter: `order_id=eq.${item.orderId}` },
  (payload) => {
    // ✅ Chỉ fetch lại nếu notification_type KHÔNG phải 'return_item'
    if (payload.new?.notification_type !== 'return_item') {
      fetchNotifications();
    }
    // Nếu là return_item → không fetch → badge không tăng
  }
)
```

---

## 📊 Logic Notification Count

| notification_type | Gửi từ | Cho ai | Hiển thị ở OrderScreen |
|------------------|--------|--------|----------------------|
| `return_item` | Nhân viên | Bếp | ❌ KHÔNG hiển thị |
| `item_ready` | Bếp | Nhân viên | ✅ Hiển thị |
| `out_of_stock` | Bếp | Nhân viên | ✅ Hiển thị |
| `cancellation_approved` | Bếp | Nhân viên | ✅ Hiển thị |
| `cancellation_rejected` | Bếp | Nhân viên | ✅ Hiển thị |

---

## 🔄 Workflow Sau Fix

### Khi Nhân Viên Yêu Cầu Trả

```
OrderScreen:
  ├─ Badge hiển thị: 2 thông báo

Nhân viên bấm "Yêu cầu trả":
  ├─ INSERT return_notifications (type: 'return_item')
  ├─ Realtime trigger
  ├─ Check: notification_type === 'return_item'? → YES
  ├─ ❌ Bỏ qua (không fetch)
  └─ Badge vẫn: 2 ✅ (không tăng)

OrderScreen vào chi tiết:
  └─ ✅ Chỉ thấy 2 thông báo từ bếp (đúng!) ✅
```

### Khi Bếp Hoàn Thành Món

```
OrderScreen:
  ├─ Badge hiển thị: 2 thông báo

Bếp bấm "Xong":
  ├─ INSERT return_notifications (type: 'item_ready')
  ├─ Realtime trigger
  ├─ Check: notification_type === 'return_item'? → NO
  ├─ ✅ Fetch lại
  ├─ Query tìm: pending + NOT return_item
  └─ Badge: 3 ✅ (tăng thêm 1)

OrderScreen vào chi tiết:
  └─ ✅ Thấy 3 thông báo từ bếp (đúng!) ✅
```

---

## 📝 Files Thay Đổi

| File | Thay Đổi |
|------|----------|
| `screens/Orders/OrderScreen.tsx` | ✏️ Thêm `.neq('notification_type', 'return_item')` vào query |
| `screens/Orders/OrderScreen.tsx` | ✏️ Thêm check `notification_type !== 'return_item'` trong realtime callback |

---

## ✨ Summary

| Vấn Đề | Sửa Thế Nào | Status |
|--------|------------|--------|
| Badge tăng khi nhân viên gửi return_item | Filter `.neq('notification_type', 'return_item')` | ✅ Fixed |
| Hiển thị notification sai ở OrderScreen | Lọc bỏ return_item khỏi count | ✅ Fixed |
| Realtime listener tự trigger khi không cần | Check notification_type trước fetch | ✅ Fixed |

---

## 🧪 Test Case

### Test 1: Badge không tăng khi gửi return_item ✅

```
Setup:
  - OrderScreen badge: 1 (có 1 thông báo từ bếp)
  - ReturnNotificationScreen: Bấm "Yêu cầu trả"

Expected:
  - Database: INSERT return_notifications (type: 'return_item')
  - OrderScreen badge: ✅ Vẫn 1 (không tăng)
  - OrderScreen chi tiết: ✅ Chỉ thấy 1 thông báo
```

### Test 2: Badge tăng khi bếp gửi item_ready ✅

```
Setup:
  - OrderScreen badge: 1
  - KitchenDetailScreen: Bấm "Xong"

Expected:
  - Database: INSERT return_notifications (type: 'item_ready')
  - OrderScreen badge: ✅ Tăng lên 2
  - OrderScreen chi tiết: ✅ Thấy 2 thông báo
```

### Test 3: Chi tiết đúng ✅

```
Vào OrderScreen → Bấm badge thông báo:
  ├─ ReturnNotificationScreen
  ├─ Thấy notification từ bếp thôi
  ├─ KHÔNG thấy "Khách yêu cầu trả"
  └─ ✅ Đúng! (return_item lọc bỏ)
```

---

## 📌 Key Points

✅ **Badge chỉ đếm notification FROM BẾP** (item_ready, out_of_stock, cancellation_*)
✅ **Lọc bỏ return_item** (nhân viên gửi cho bếp)
✅ **Realtime listener thông minh** (chỉ fetch khi cần)
✅ **Hiển thị đúng logic** (OrderScreen chỉ thấy notification cho nhân viên)

**Cập nhật:** 2025-10-24  
**Status:** ✅ Hoàn tất
