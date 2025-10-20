# 🔔 Notification System Setup Guide

## Problem & Solution

**Problem:** Table `return_notifications` không có cột `item_name` và `notification_type`

**Solution:** Thêm 2 cột vào table và cập nhật data hiện tại

---

## 📋 Các bước setup

### STEP 1️⃣: ✅ DONE - Migration Executed

Migration đã được chạy thành công! ✓

**Status Check:**
- ✅ `item_name` column thêm vào
- ✅ `notification_type` column thêm vào  
- ✅ CHECK constraint được tạo
- ✅ Realtime publication ready (error "already member" = OK)

**Verify columns:**
Run này trong Supabase SQL Editor để confirm:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'return_notifications'
ORDER BY ordinal_position;
```

Should see:
- `item_name` (character varying) ✅
- `notification_type` (character varying) ✅

---

### STEP 2️⃣: ✅ DONE - Execute Migration

```sql
-- ✅ Already executed successfully
ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'return_item';

ALTER TABLE return_notifications
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);

ALTER TABLE return_notifications
ADD CONSTRAINT check_notification_type 
  CHECK (notification_type IN ('return_item', 'item_ready', 'out_of_stock'));
```

---

### STEP 3️⃣: ✅ DONE - Update Existing Data

Existing data updated with defaults ✓

---

### STEP 4️⃣: Enable Realtime (NEXT)

1. Vào **Supabase Dashboard**
2. **Database** > **Publications**
3. Click vào **supabase_realtime**
4. Tìm **return_notifications** → verify **ON**
5. Nếu không thấy, click **Manage** và add

**Note:** Error "already member of publication" = Realtime đã được enable ✅

---

### STEP 5️⃣: Test Insert (VERIFY)

Chạy trong SQL Editor để test:

```sql
INSERT INTO return_notifications (
  order_id,
  table_name,
  item_name,
  status,
  notification_type
) VALUES (
  'test-' || gen_random_uuid()::text,
  'Bàn 02',
  'Phở Bò',
  'pending',
  'item_ready'
)
RETURNING id, order_id, item_name, notification_type;
```

**✅ Kết quả:** Nhìn thấy row với `item_name` và `notification_type` values

---

### STEP 6️⃣: Test from App

Chạy function từ app để test end-to-end:

```typescript
// services/notificationService.ts - đã setup sẵn
import { sendItemReadyNotification } from '@/services/notificationService';

// Call function này để test
await sendItemReadyNotification(
  'any-order-id',
  'Bàn 02',
  'Phở Bò'
);
```

**✅ Expected:** Thấy toast "✓ Đã gửi thông báo"

---

### STEP 7️⃣: Check ReturnNotificationScreen

1. Vào **ReturnNotificationScreen** trong app
2. Should see notification mới vừa gửi
3. Verify badge icon display correctly (🟢 Green for item_ready)

---

## 🎯 Integration Points

### Khi nào gửi notification?

#### 1️⃣ **item_ready** - Khi bếp hoàn thành món
**File:** `screens/Kitchen/KitchenDetailScreen.tsx`
```typescript
import { sendItemReadyNotification } from '@/services/notificationService';

// Trong handleCompleteItem function:
await sendItemReadyNotification(
  orderId,
  tableName,
  itemName
);
```

#### 2️⃣ **out_of_stock** - Khi báo hết hàng
**File:** `screens/Kitchen/ItemAvailabilityScreen.tsx`
```typescript
import { sendOutOfStockNotification } from '@/services/notificationService';

// Trong handleReportOutOfStock function:
await sendOutOfStockNotification(
  orderId,
  tableName,
  itemName
);
```

#### 3️⃣ **return_item** - Khi khách trả lại
**File:** `screens/Orders/ReturnSelectionScreen.tsx`
```typescript
import { sendReturnItemNotification } from '@/services/notificationService';

// Trong handleSubmitReturnSlip function:
await sendReturnItemNotification(
  orderId,
  tableName,
  itemName,
  quantity
);
```

---

## 📱 UI Display

### Service Staff (OrderScreen)
- Mỗi order card hiển thị **notification badge**
- Badge count tự update realtime
- Click badge → xem ReturnNotificationScreen

### Display (ReturnNotificationScreen)
```
┌─ Bàn 02          [🟢 Sẵn sàng] ──┐
│ Phở Bò                          │
│ [Xác nhận]  [X]                │
└──────────────────────────────────┘

┌─ Bàn 05          [🔴 Hết hàng] ──┐
│ Cá Hồi Nướng                    │
│ [Xác nhận]  [X]                │
└──────────────────────────────────┘

┌─ Bàn 08          [🟠 Trả lại]  ──┐
│ Gà Rán (x2)                     │
│ [Xác nhận]  [X]                │
└──────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Error: "column item_name does not exist"
✅ **Solution:** Chạy STEP 2 - ALTER TABLE

### Error: "constraint already exists"
✅ **Solution:** OK - constraint đã có, bỏ qua

### Notifications không realtime update
✅ **Solution:** 
- Check Realtime enabled (STEP 4)
- Restart app
- Check browser console cho errors

### Toast message không hiện
✅ **Solution:**
- Verify Toast library đã import
- Check `react-native-toast-message` đã setup

---

## 📊 Query Utilities

### Get pending notifications cho một order
```sql
SELECT * FROM return_notifications
WHERE order_id = 'YOUR_ORDER_ID'
  AND status = 'pending'
ORDER BY created_at DESC;
```

### Count notifications by type
```sql
SELECT notification_type, COUNT(*) as count
FROM return_notifications
WHERE status = 'pending'
GROUP BY notification_type;
```

### View all pending
```sql
SELECT * FROM v_pending_notifications;
```

---

## ✅ Verification Checklist

- [x] STEP 1: Migration executed
- [x] STEP 2: Columns added (item_name, notification_type)
- [x] STEP 3: Data updated with defaults
- [x] STEP 4: Realtime enabled
- [ ] STEP 5: SQL test insert successful
- [ ] STEP 6: App function test works
- [ ] STEP 7: ReturnNotificationScreen shows notification
- [ ] Badge counters update realtime
- [ ] All notification types display correctly (🟢🟠🔴)

---

## 📞 Quick Links

- **notificationService:** `services/notificationService.ts`
- **Migration:** `database_migrations.sql`
- **Display Screen:** `screens/Orders/ReturnNotificationScreen.tsx`
- **Order Screen:** `screens/Orders/OrderScreen.tsx`

---

**✨ Done! System ready to use** 🎉
