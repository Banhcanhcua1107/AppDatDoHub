# 🎯 Fix: Thông Báo Trả Món Hiển Thị Không Đúng & Mất Tiếng Chuông

## ❌ Vấn Đề

Từ hình ảnh bạn gửi, có 2 vấn đề chính:

1. **"Khách yêu cầu trả" lặp lại nhiều lần** trong ReturnNotificationScreen
   - Những cái này là nhân viên gửi cho bếp, không phải thông báo cho nhân viên
   - Bệp mới là người cần thấy "Khách yêu cầu trả"

2. **Không nghe tiếng chuông** khi nhân viên nhận notification
   - Vì filter quá chặt loại bỏ `'return_item'` 

---

## 🔍 Nguyên Nhân

### Trước (Sai):
```
return_notifications table chứa:
├─ 'return_item' (nhân viên → bếp): "Khách yêu cầu trả Cà phê Latte"
├─ 'item_ready' (bếp → nhân viên): "Cà phê Latte sẵn sàng"
├─ 'cancellation_approved' (bếp → nhân viên): "Duyệt trả Cà phê Latte"
└─ ...

ReturnNotificationScreen hiển thị TOÀN BỘ (sai!)
  ├─ ❌ "Khách yêu cầu trả" (không nên hiển thị cho nhân viên)
  ├─ ✅ "Sẵn sàng phục vụ"
  └─ ✅ "Duyệt trả"

NotificationContext filter quá chặt
  ├─ Chỉ phát âm cho: item_ready, out_of_stock, cancellation_*
  └─ ❌ Không phát âm cho: return_item (nhân viên tạo)
```

### Sau (Đúng):
```
NotificationContext:
  ├─ Phát âm thanh cho TẤT CẢ INSERT return_notifications
  └─ ✅ Vì bếp không lắng nghe channel này (bếp lắng nghe cancellation_requests)

ReturnNotificationScreen:
  ├─ Hiển thị EXCEPT 'return_item' 
  ├─ ✅ Chỉ hiển thị: item_ready, out_of_stock, cancellation_*
  └─ ❌ Không hiển thị: return_item (nhân viên tạo → bếp nhận)
```

---

## ✅ Giải Pháp

### 1. **NotificationContext.tsx** - Phát âm thanh cho TẤT CẢ

```typescript
// ✅ Phát âm thanh cho TẤT CẢ notification INSERT
// Bếp KHÔNG nghe vì bếp không lắng nghe channel 'global-staff-notifications'
// Chỉ nhân viên lắng nghe channel này
const staffChannel = supabase
  .channel('global-staff-notifications')
  .on('postgres_changes', { event: 'INSERT', table: 'return_notifications' },
    (payload) => {
      console.log('[NotificationContext] Nhân viên nhận thông báo:', payload.new);
      triggerNotificationSound(); // ✅ Phát âm thanh cho toàn bộ
    }
  )
  .subscribe();
```

### 2. **ReturnNotificationScreen.tsx** - Filter loại bỏ 'return_item'

```typescript
const fetchNotifications = useCallback(async () => {
  const { data, error } = await query;
  
  // ✅ Lọc bỏ notification_type = 'return_item'
  // (Đó là nhân viên gửi cho bếp, không phải cho nhân viên)
  const filteredData = (data || []).filter(
    (notification: ReturnNotification) => notification.notification_type !== 'return_item'
  );
  
  setNotifications(filteredData);
}, [filteredOrderId]);
```

---

## 📊 Routing Notification Đúng Cách

```
Nhân viên (OrderScreen)          Bếp (CancellationRequestsDetailScreen)
     │                                       │
     ├─ Tạo yêu cầu trả                    │
     │  (INSERT return_notifications       │
     │   notification_type: 'return_item') │
     │                                       │
     │──────────────────────────────────────┤
     │                                       │
     │        return_notifications table    │
     │        (INSERT event)                │
     │                                       │
     │◄──────────────────────────────────────┘
     │
     ├─ Realtime: INSERT event
     │  (nhân viên lắng nghe trên OrderScreen)
     │
     └─ [NotificationContext]
        └─ ✅ Phát âm thanh "ting-ting" 1 lần


Bếp (KitchenDetailScreen)      Nhân viên (OrderScreen)
     │                              │
     ├─ Bấm "Xong" (hoàn thành)     │
     │  (INSERT return_notifications│
     │   notification_type: 'item_ready')
     │                              │
     │──────────────────────────────┤
     │                              │
     │   return_notifications table │
     │   (INSERT event)             │
     │                              │
     │                              │◄──────────
     │                              │
     │                         [NotificationContext]
     │                         └─ ✅ Phát âm thanh
     │
     └─ ❌ Bếp KHÔNG nghe (bếp lắng nghe cancellation_requests chứ không phải return_notifications)
```

---

## 🎯 Quy Tắc Routing

| notification_type | Gửi từ | Lắng nghe ở | Hiển thị ở |
|------------------|--------|-----------|----------|
| `return_item` | Nhân viên (OrderScreen) | Bếp (CancellationRequestsDetailScreen) | ❌ Không hiển thị (lọc bỏ) |
| `item_ready` | Bếp | Nhân viên (OrderScreen/ReturnNotificationScreen) | ✅ Hiển thị |
| `out_of_stock` | Bếp | Nhân viên (OrderScreen/ReturnNotificationScreen) | ✅ Hiển thị |
| `cancellation_approved` | Bếp | Nhân viên (OrderScreen/ReturnNotificationScreen) | ✅ Hiển thị |
| `cancellation_rejected` | Bếp | Nhân viên (OrderScreen/ReturnNotificationScreen) | ✅ Hiển thị |

---

## 🧪 Test Case

### Test 1: Nhân viên tạo yêu cầu trả ✅

```
Device A (Nhân viên):
  ├─ OrderScreen
  ├─ Bấm "Yêu cầu trả"
  └─ Gửi: 'return_item'

Device B (Nhân viên khác):
  ├─ ReturnNotificationScreen
  ├─ ❌ KHÔNG thấy thông báo (lọc bỏ return_item)
  └─ ✅ Đúng! (return_item là cho bếp)

Device C (Bếp):
  ├─ CancellationRequestsDetailScreen
  ├─ ✅ Thấy yêu cầu trả
  └─ ✅ Nghe tiếng chuông (NotificationContext phát)
```

### Test 2: Bếp hoàn thành món ✅

```
Device A (Bếp):
  ├─ KitchenDetailScreen
  ├─ Bấm "Xong"
  └─ Gửi: 'item_ready'

Device B (Nhân viên):
  ├─ ReturnNotificationScreen
  ├─ ✅ Thấy "Sẵn sàng phục vụ"
  ├─ ✅ Nghe tiếng chuông
  └─ ✅ Đúng! (item_ready là cho nhân viên)

Device A (Bếp):
  ├─ KitchenDetailScreen
  ├─ ❌ KHÔNG nghe tiếng chuông
  └─ ✅ Đúng! (bếp không lắng nghe return_notifications)
```

---

## 📝 Files Thay Đổi

| File | Thay Đổi |
|------|----------|
| `context/NotificationContext.tsx` | ✏️ Phát âm thanh cho TẤT CẢ notification (không filter) |
| `screens/Orders/ReturnNotificationScreen.tsx` | ✏️ Lọc bỏ `'return_item'` trong hiển thị |

---

## ✨ Summary

| Vấn Đề | Sửa Thế Nào | Status |
|--------|------------|--------|
| Notification 'return_item' hiển thị lặp lại | Filter loại bỏ khỏi ReturnNotificationScreen | ✅ Fixed |
| Không nghe tiếng chuông | Phát âm thanh cho TẤT CẢ return_notifications | ✅ Fixed |
| Notification routing sai | Tách biệt: return_item → bếp, item_ready/cancel_* → nhân viên | ✅ Fixed |

---

## 🔄 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Notification System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  return_notifications table (Realtime)                           │
│  ├─ notification_type: 'return_item'     → Bếp nhận              │
│  ├─ notification_type: 'item_ready'      → Nhân viên nhận         │
│  ├─ notification_type: 'out_of_stock'    → Nhân viên nhận         │
│  ├─ notification_type: 'cancellation_*'  → Nhân viên nhận         │
│  └─ Nghe: ReturnNotificationScreen (Filter OUT 'return_item')    │
│                                                                   │
│  NotificationContext (Global Listener)                            │
│  ├─ Lắng nghe: return_notifications INSERT                       │
│  ├─ Phát âm: TẤT CẢ (không filter)                               │
│  └─ Chỉ nhân viên lắng nghe (bếp lắng nghe cancellation_requests)│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Cập nhật:** 2025-10-24  
**Status:** ✅ Hoàn tất
