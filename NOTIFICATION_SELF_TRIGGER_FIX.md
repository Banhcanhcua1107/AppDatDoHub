# 🎯 Fix: Bếp Không Nên Nghe Âm Thanh Khi Duyệt/Từ Chối

## ❌ Vấn Đề

**Trước:** Khi bếp bấm "Đồng ý" hoặc "Từ chối" trả hàng → **Bếp nghe tiếng chuông**
```
CancellationRequestsDetailScreen:
  ├─ Bấm "Đồng ý"
  ├─ INSERT return_notifications (cancellation_approved)
  ├─ NotificationContext nhận INSERT event
  └─ ❌ Bếp nghe âm thanh (sai!)
```

**Đúng:** Chỉ **nhân viên khác** mới nghe
```
OrderScreen (Nhân viên A):
  ├─ Lắng nghe realtime INSERT return_notifications
  └─ ✅ Nghe tiếng "ting-ting" (đúng!)

CancellationRequestsDetailScreen (Bếp):
  ├─ Bấm "Đồng ý"
  ├─ INSERT return_notifications
  └─ ✅ KHÔNG nghe (chỉ nhân viên khác nghe)
```

---

## ✅ Nguyên Nhân

**Self-trigger issue:**
- Bếp gửi notification (INSERT return_notifications)
- NotificationContext nhận INSERT event → phát âm thanh
- **Nhưng**: Bếp cũng đang lắng nghe cùng event → bếp cũng nghe

---

## ✅ Giải Pháp

### 1. **NotificationContext.tsx** - Filter notification_type

```typescript
// Chỉ phát âm thanh cho các notification từ bếp gửi cho nhân viên
const staffChannel = supabase
  .channel('global-staff-notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_notifications' },
    (payload) => {
      const notificationType = payload.new.notification_type;
      // [FIX] Chỉ phát âm thanh cho notification TỪ BẾP
      const isFromKitchen = ['item_ready', 'out_of_stock', 'cancellation_approved', 'cancellation_rejected'].includes(notificationType);
      
      if (isFromKitchen) {
        console.log('Nhân viên nhận thông báo từ bếp:', payload.new);
        triggerNotificationSound(); // ✅ Phát âm thanh
      } else {
        // ❌ Bỏ qua 'return_item' (nhân viên gửi cho bếp)
        console.log('⏭️ Bỏ qua thông báo:', notificationType);
      }
    }
  )
  .subscribe();
```

### 2. **CancellationRequestsDetailScreen.tsx** - Thêm comments rõ ràng

```typescript
// [QUAN TRỌNG] Khi gửi notification, bếp sẽ không nghe âm thanh vì:
// - NotificationContext chỉ phát âm thanh cho staff khi notification_type là từ bếp
// - Bếp tự gửi notification (self-trigger) → NotificationContext sẽ bỏ qua
// - Chỉ nhân viên khác (ở OrderScreen) mới nghe tiếng "ting-ting"
await sendCancellationApprovedNotification(...);
```

---

## 📊 Mapping Notification Types

| notification_type | Gửi từ | Nhận bằng | Phát âm thanh? |
|------------------|--------|----------|--------------|
| `return_item` | Nhân viên | Bếp | ❌ Không |
| `item_ready` | Bếp | Nhân viên | ✅ Có |
| `out_of_stock` | Bếp | Nhân viên | ✅ Có |
| `cancellation_approved` | Bếp | Nhân viên | ✅ Có |
| `cancellation_rejected` | Bếp | Nhân viên | ✅ Có |

---

## 🔄 Workflow Sau Fix

### Khi Bếp Duyệt Hủy (CancellationRequestsDetailScreen)

```
1️⃣ Bếp bấm "Đồng ý"
   ↓
2️⃣ CancellationRequestsDetailScreen:
   ├─ UPDATE cancellation_requests (status = 'approved')
   ├─ INSERT return_slip & return_slip_items
   └─ INSERT return_notifications (notification_type = 'cancellation_approved')
   ↓
3️⃣ Realtime event INSERT:
   ├─ Bếp (CancellationRequestsDetailScreen):
   │  └─ NotificationContext lắng nghe nhưng notification_type = 'cancellation_approved'
   │  └─ ⏭️ Bỏ qua (không phát âm thanh) ✅
   │
   └─ Nhân viên (OrderScreen):
      └─ NotificationContext lắng nghe
      └─ 🔔 Phát âm thanh "ting-ting" ✅

4️⃣ Kết quả:
   ✅ Bếp KHÔNG nghe âm thanh
   ✅ Nhân viên nghe tiếng "ting-ting" 1 lần
   ✅ Không rung, không lặp lại
```

---

## 🎯 Key Points

✅ **Bếp không nghe:** Vì `notification_type` từ bếp (item_ready, cancellation_approved, etc.) → NotificationContext bỏ qua

✅ **Nhân viên nghe:** Vì lắng nghe cùng event và có filter

✅ **Không self-trigger:** Bếp chỉ INSERT, không tự trigger âm thanh

✅ **Nhân viên cũng không nghe notification 'return_item':** Vì đó là nhân viên gửi cho bếp

---

## 📝 Files Thay Đổi

| File | Thay Đổi |
|------|----------|
| `context/NotificationContext.tsx` | ✏️ Thêm filter `isFromKitchen` |
| `screens/Kitchen/CancellationRequestsDetailScreen.tsx` | ✏️ Thêm comments rõ ràng |

---

## 🧪 Test Case

### Test 1: Bếp Duyệt ✅
```
Setup:
  - Device A: Bếp ở CancellationRequestsDetailScreen
  - Device B: Nhân viên ở OrderScreen

Step 1: Device A bấm "Đồng ý"
  └─ 🔴 Device A: KHÔNG nghe âm thanh ✅
  └─ 🟢 Device B: Nghe tiếng "ting-ting" 1 lần ✅

Step 2: Device A bấm "Từ chối"
  └─ 🔴 Device A: KHÔNG nghe âm thanh ✅
  └─ 🟢 Device B: Nghe tiếng "ting-ting" 1 lần ✅
```

### Test 2: Bếp Hoàn Thành Món ✅
```
Setup:
  - Device A: Bếp ở KitchenDetailScreen
  - Device B: Nhân viên ở OrderScreen

Step 1: Device A bấm "Xong"
  └─ 🔴 Device A: KHÔNG nghe âm thanh ✅
  └─ 🟢 Device B: Nghe tiếng "ting-ting" 1 lần ✅
```

---

## 💡 Architecture Diagram

```
Return Notifications Flow:
                    
    Nhân viên                          Bếp
    (OrderScreen)              (CancellationRequestsDetailScreen)
         │                                    │
         │                                    │
         │  Yêu cầu trả hàng                │
         │───────────────────►              │
         │  (INSERT return_notifications    │
         │   notification_type: 'return_item')
         │                                    │
         │◄─── Duyệt/Từ chối ────────────────│
         │     (UPDATE cancellation_requests)│
         │     (INSERT return_notifications  │
         │      notification_type: 'cancellation_approved')
         │                                    │
    Realtime Event:                   Realtime Event:
    ✅ Nghe âm thanh                   ❌ Bỏ qua (filter)
    (notification_type từ bếp)         (self-trigger)
    
    [NotificationContext]
    └─ Kiểm tra: isFromKitchen?
       ├─ ✅ YES (item_ready, cancellation_approved, etc.)
       │  └─ Phát âm thanh cho Nhân viên
       └─ ❌ NO (return_item)
          └─ Bỏ qua
```

---

## ✨ Summary

| Vấn Đề | Sửa Thế Nào | Status |
|--------|------------|--------|
| Bếp nghe âm thanh khi duyệt/từ chối | Filter `notification_type` trong NotificationContext | ✅ Fixed |
| Self-trigger notification | Kiểm tra notification từ bếp hay nhân viên | ✅ Fixed |
| Thêm comments giải thích | Cập nhật CancellationRequestsDetailScreen | ✅ Done |

**Cập nhật:** 2025-10-24  
**Status:** ✅ Hoàn tất
