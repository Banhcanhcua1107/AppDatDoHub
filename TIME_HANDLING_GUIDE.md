# HƯỚNG DẪN XỬ LÝ THỜI GIAN CHUẨN

## 🕐 Tổng quan

Supabase lưu trữ thời gian theo chuẩn **ISO 8601 (UTC timezone)**:
```
"2025-01-15T08:30:00.000Z"
```

JavaScript tự động convert sang **local timezone** khi parse:
```javascript
new Date("2025-01-15T08:30:00.000Z")
// Nếu ở Việt Nam (UTC+7) → hiển thị: 15:30 (VN time)
```

## ✅ Các cải tiến đã thực hiện

### 1. **Validation & Error Handling**
```typescript
// Kiểm tra input null/undefined
if (!dateString) {
  return 'Không xác định';
}

// Kiểm tra date hợp lệ
if (isNaN(date.getTime())) {
  return 'Thời gian không hợp lệ';
}

// Xử lý thời gian tương lai (lỗi đồng bộ clock)
if (diffInMs < 0) {
  return 'Vừa xong';
}
```

### 2. **Thời gian tương đối chính xác**

| Khoảng thời gian | Hiển thị |
|------------------|----------|
| < 30 giây | "Vừa xong" |
| < 1 phút | "45 giây trước" |
| < 60 phút | "15 phút trước" |
| < 24 giờ | "5 giờ trước" |
| < 7 ngày | "3 ngày trước" |
| >= 7 ngày | "15/01/2025 15:30" |

### 3. **Các hàm utility mới**

#### `formatDate(dateString)` - Thời gian tương đối
```typescript
formatDate("2025-01-15T08:30:00.000Z")
// → "2 giờ trước"
```

#### `formatFullDate(dateString)` - Ngày giờ đầy đủ
```typescript
formatFullDate("2025-01-15T08:30:00.000Z")
// → "15/01/2025 15:30"
```

#### `formatShortDate(dateString)` - Chỉ ngày
```typescript
formatShortDate("2025-01-15T08:30:00.000Z")
// → "15/01/2025"
```

#### `formatTime(dateString)` - Chỉ giờ
```typescript
formatTime("2025-01-15T08:30:00.000Z")
// → "15:30"
```

## 🔍 Cách kiểm tra thời gian chính xác

### Test 1: Kiểm tra timezone
```javascript
// Chạy trong console hoặc component
const testDate = "2025-01-15T08:30:00.000Z";
console.log('UTC Time:', testDate);
console.log('Local Time:', new Date(testDate).toString());
console.log('Formatted:', formatDate(testDate));
```

**Expected output (VN timezone):**
```
UTC Time: 2025-01-15T08:30:00.000Z
Local Time: Wed Jan 15 2025 15:30:00 GMT+0700 (Indochina Time)
Formatted: X giờ trước
```

### Test 2: Kiểm tra độ chính xác
```javascript
// Test các khoảng thời gian khác nhau
const now = new Date();

// 5 phút trước
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
console.log('5 min ago:', formatDate(fiveMinAgo.toISOString()));
// → "5 phút trước"

// 2 giờ trước
const twoHourAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
console.log('2 hours ago:', formatDate(twoHourAgo.toISOString()));
// → "2 giờ trước"

// 3 ngày trước
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
console.log('3 days ago:', formatDate(threeDaysAgo.toISOString()));
// → "3 ngày trước"
```

### Test 3: Kiểm tra trong Supabase
```sql
-- Kiểm tra format thời gian trong database
SELECT 
  id,
  table_name,
  created_at,
  created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as vn_time,
  NOW() - created_at as time_diff
FROM return_notifications
ORDER BY created_at DESC
LIMIT 5;
```

## 🐛 Xử lý các vấn đề thường gặp

### Vấn đề 1: Thời gian sai lệch vài giờ
**Nguyên nhân:** Device không đặt đúng timezone

**Giải pháp:**
```javascript
// Kiểm tra timezone của device
console.log('Current Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
// Nên là: "Asia/Ho_Chi_Minh" hoặc "Asia/Bangkok"

// Kiểm tra offset
console.log('Timezone Offset (minutes):', new Date().getTimezoneOffset());
// Việt Nam (UTC+7) nên là: -420 (7 giờ x 60 phút)
```

### Vấn đề 2: "X giây trước" thay đổi liên tục
**Nguyên nhân:** Component re-render liên tục

**Giải pháp:** Sử dụng `useMemo` hoặc cache
```typescript
const timeAgo = useMemo(() => formatDate(item.created_at), [item.created_at]);
```

### Vấn đề 3: Hiển thị "Vừa xong" cho thời gian trong tương lai
**Nguyên nhân:** Clock không đồng bộ giữa client và server

**Giải pháp:** Đã xử lý trong code
```typescript
if (diffInMs < 0) {
  console.warn('[formatDate] Future date detected:', dateString);
  return 'Vừa xong'; // Treat as current time
}
```

## 📱 Test trong ReturnHistoryScreen

### Scenario 1: Món mới trả (< 1 phút)
```
Card hiển thị:
┌─────────────────────────────────┐
│ 🍴 Bàn A04        [Chờ xử lý]   │
├─────────────────────────────────┤
│ Món bị trả:                      │
│ ⊖ Cà phê Latte                  │
├─────────────────────────────────┤
│ ⏱ Vừa xong                      │
└─────────────────────────────────┘
```

### Scenario 2: Món trả 2 giờ trước (acknowledged)
```
Card hiển thị:
┌─────────────────────────────────┐
│ 🍴 Bàn B03        [Đã xử lý]    │
├─────────────────────────────────┤
│ Món bị trả:                      │
│ ⊖ Trà Sữa Trân Châu             │
├─────────────────────────────────┤
│ ⏱ 2 giờ trước                   │
│ ✓ Xử lý: 22 giờ trước           │
└─────────────────────────────────┘
```

### Scenario 3: Món trả 10 ngày trước
```
Card hiển thị:
┌─────────────────────────────────┐
│ 🍴 Bàn C12        [Đã xử lý]    │
├─────────────────────────────────┤
│ Món bị trả:                      │
│ ⊖ Bánh Mì Chảo                  │
├─────────────────────────────────┤
│ ⏱ 05/01/2025 14:30              │
│ ✓ Xử lý: 05/01/2025 14:45       │
└─────────────────────────────────┘
```

## 🧪 Code test thực tế

Thêm đoạn code này vào màn hình để test:

```typescript
// Thêm vào ReturnHistoryScreen.tsx (debug mode)
useEffect(() => {
  if (__DEV__) {
    console.log('=== TIME DEBUG ===');
    console.log('Device Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('Timezone Offset:', new Date().getTimezoneOffset(), 'minutes');
    
    // Test với dữ liệu thật
    if (returnHistory.length > 0) {
      const firstItem = returnHistory[0];
      console.log('Raw created_at:', firstItem.created_at);
      console.log('Parsed date:', new Date(firstItem.created_at).toString());
      console.log('Formatted:', formatDate(firstItem.created_at));
    }
  }
}, [returnHistory]);
```

## ✅ Checklist kiểm tra

- [x] Supabase lưu timestamp dạng ISO 8601 với UTC timezone
- [x] JavaScript tự động convert UTC → Local timezone
- [x] Hàm `formatDate()` validate input trước khi xử lý
- [x] Xử lý edge cases (null, invalid, future time)
- [x] Hiển thị thời gian tương đối chính xác (giây/phút/giờ/ngày)
- [x] Format ngày đầy đủ cho dữ liệu cũ (> 7 ngày)
- [x] Có error handling với console.warn/error
- [x] Code có documentation rõ ràng

## 🎯 Kết luận

**Hệ thống xử lý thời gian hiện tại:**

1. ✅ **Chuẩn xác** - Supabase (UTC) → JavaScript (Local) → Hiển thị đúng
2. ✅ **An toàn** - Validate input, handle errors, không crash app
3. ✅ **Linh hoạt** - 4 hàm utility cho các trường hợp khác nhau
4. ✅ **User-friendly** - Hiển thị tiếng Việt, dễ hiểu

**Nếu vẫn gặp vấn đề về thời gian:**

1. Kiểm tra timezone của device: Settings → Date & Time → Auto timezone
2. Kiểm tra Supabase timestamp: Run SQL query ở trên
3. Kiểm tra console logs để debug
4. Đảm bảo device có internet để sync time

---

**Tạo:** 15/01/2025
**Test trên:** React Native (Expo), iOS + Android
**Status:** ✅ Production Ready
