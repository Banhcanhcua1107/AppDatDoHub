# 🔍 PHÂN TÍCH CHI TIẾT: OrderConfirmationScreen Load Liên Tục

## ❌ CÁC VẤN ĐỀ TÌM THẤY

### 1. **setActiveOrderId trong fetchAllData** ⚠️ NGHIÊM TRỌNG

**Vị trí:** Line 307-313

```typescript
if (foundOrder?.id) {
  orderIdToFetch = foundOrder.id;
  if (!activeOrderId) setActiveOrderId(orderIdToFetch); // ❌ GÂY RE-RENDER
}
```

**Vấn đề:**
- `setActiveOrderId` được gọi trong `fetchAllData`
- `activeOrderId` nằm trong dependency array của `fetchAllData`
- Khi `activeOrderId` thay đổi → `fetchAllData` bị tạo lại
- Điều này CÓ THỂ trigger các component khác re-render

**Vòng lặp:**
```
fetchAllData() 
  → setActiveOrderId() 
    → activeOrderId thay đổi
      → fetchAllData callback tạo lại
        → (Có thể) trigger re-render
          → fetchAllData() lại...
```

### 2. **Realtime Channel Filter với activeOrderId động** ⚠️ NGHIÊM TRỌNG

**Vị trí:** Line 626

```typescript
const channel = supabase
  .channel(`orders_channel:${channelId}`)
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'orders',
    filter: `id=eq.${activeOrderId}` // ❌ SỬ DỤNG BIẾN ĐỘNG
  }, ...)
```

**Vấn đề:**
- `filter` sử dụng `activeOrderId` nhưng `activeOrderId` KHÔNG có trong dependency array
- Khi `activeOrderId` thay đổi:
  - Channel cũ vẫn lắng nghe với filter cũ
  - Channel mới KHÔNG được tạo
  - Callback vẫn reference `activeOrderId` mới
- **Kết quả:** Mất đồng bộ giữa filter và activeOrderId thực tế

**Ví dụ:**
```
1. activeOrderId = "order-1"
2. Setup channel với filter "id=eq.order-1"
3. activeOrderId thay đổi thành "order-2"
4. Channel vẫn filter "id=eq.order-1"
5. Nhưng callback sử dụng "order-2"
6. ❌ Mismatch!
```

### 3. **setCurrentTables với reference mới mỗi lần** ⚠️ TRUNG BÌNH

**Vị trí:** Line 346

```typescript
freshTables = orderDetails.order_tables.map(...).filter(Boolean);
if (freshTables.length > 0) setCurrentTables(freshTables); // ❌ LUÔN TẠO ARRAY MỚI
```

**Vấn đề:**
- `.map()` luôn tạo array mới (reference mới)
- React so sánh reference → Luôn khác nhau
- Trigger re-render không cần thiết mặc dù data giống nhau

**Ví dụ:**
```javascript
const table1 = [{ id: '1', name: 'Bàn 1' }];
const table2 = [{ id: '1', name: 'Bàn 1' }];
console.log(table1 === table2); // false ← React thấy khác nhau!
```

---

## ✅ CÁC GIẢI PHÁP ĐÃ ÁP DỤNG

### Fix 1: Giới hạn setActiveOrderId chỉ lần đầu

```typescript
// ✅ MỚI
const isInitialMount = useRef(true);

const fetchAllData = useCallback(
  async (isInitialLoad = true) => {
    // ...
    if (!activeOrderId && isInitialMount.current) {
      setActiveOrderId(orderIdToFetch);
      isInitialMount.current = false; // Đánh dấu đã set lần đầu
    }
  },
  [activeOrderId, initialTableId]
);
```

**Lợi ích:**
- `setActiveOrderId` CHỈ gọi 1 lần duy nhất
- Không trigger re-render sau đó
- Tránh vòng lặp

### Fix 2: Loại bỏ filter động trong Realtime Channel

```typescript
// ❌ CŨ
filter: `id=eq.${activeOrderId}` // Sử dụng biến động

// ✅ MỚI
// Không dùng filter, lắng nghe tất cả updates rồi filter trong callback
const channel = supabase
  .channel(`orders_channel:${channelId}`)
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'orders'
    // Không có filter
  }, (payload) => {
    console.log('[Realtime] Cập nhật orders:', payload);
    fetchAllData(false);
  })
```

**Lý do:**
- Channel được setup 1 lần khi mount
- Lắng nghe TẤT CẢ updates của bảng `orders`
- Filter logic được xử lý trong `fetchAllData` (đã có sẵn)
- Không còn mismatch giữa filter và activeOrderId

**Trade-off:**
- Nhận nhiều event hơn (tất cả orders, không chỉ order hiện tại)
- Nhưng `fetchAllData` đã có logic filter đúng order
- Performance impact nhỏ, đổi lại tránh được bug nghiêm trọng

### Fix 3: So sánh deep trước khi setCurrentTables

```typescript
// ✅ MỚI
setCurrentTables(prev => {
  // Kiểm tra xem có thay đổi không
  const hasChanged = prev.length !== freshTables.length || 
    prev.some((t, i) => t.id !== freshTables[i]?.id);
  return hasChanged ? freshTables : prev; // Giữ reference cũ nếu không đổi
});
```

**Lợi ích:**
- Chỉ update state khi data thực sự khác
- Tránh re-render không cần thiết
- Giữ reference cũ nếu data giống nhau

---

## 📊 TRƯỚC VÀ SAU KHI FIX

### ❌ TRƯỚC (Vòng lặp vô hạn)

```
[Component Mount]
  ↓
[useFocusEffect runs]
  ↓
[fetchAllData(true)]
  ↓
[setActiveOrderId("order-123")] ← Lần 1
  ↓
[activeOrderId thay đổi]
  ↓
[fetchAllData callback tạo lại]
  ↓
[Channel filter mismatch với activeOrderId mới]
  ↓
[setCurrentTables(newArray)] ← Reference mới
  ↓
[Re-render]
  ↓
[fetchAllData chạy lại]
  ↓
[setActiveOrderId lại?] ← Lần 2, 3, 4...
  ↓
[∞ LOOP]
```

### ✅ SAU (Stable)

```
[Component Mount]
  ↓
[useFocusEffect runs]
  ↓
[fetchAllData(true)]
  ↓
[setActiveOrderId("order-123")] ← CHỈ 1 LẦN (isInitialMount check)
  ↓
[isInitialMount.current = false]
  ↓
[setCurrentTables với deep compare] ← Giữ reference nếu không đổi
  ↓
[Realtime channel stable] ← Không dùng activeOrderId trong filter
  ↓
✅ DONE - Không có re-render không cần thiết
```

---

## 🔍 CÁCH DEBUG

### Console Logs đã thêm:

```typescript
console.log('[fetchAllData] START - isInitialLoad:', isInitialLoad, 'activeOrderId:', activeOrderId);
console.log('[fetchAllData] END - Sections count:', sections.length);
console.log('[useFocusEffect] Screen focused, loading data...');
console.log('[useFocusEffect] Setting up realtime channels...');
console.log('[useFocusEffect] Channel ID:', channelId);
console.log('[useFocusEffect] Cleaning up channels...');
console.log('[Realtime] Cập nhật orders:', payload);
console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
```

### Kiểm tra vòng lặp:

**Nếu VẪN bị loop:**
```
[fetchAllData] START - isInitialLoad: true activeOrderId: null
[fetchAllData] START - isInitialLoad: false activeOrderId: order-123
[fetchAllData] START - isInitialLoad: false activeOrderId: order-123
[fetchAllData] START - isInitialLoad: false activeOrderId: order-123
...
```
→ Vẫn có vấn đề

**Nếu ĐÃ FIX:**
```
[useFocusEffect] Screen focused, loading data...
[useFocusEffect] Setting up realtime channels...
[fetchAllData] START - isInitialLoad: true activeOrderId: null
[fetchAllData] END - Sections count: 3
```
→ Chỉ chạy 1 lần, OK!

---

## 📋 CHECKLIST KHI VẪN BỊ LOOP

### 1. Kiểm tra console logs
- [ ] Có thấy `[fetchAllData] START` liên tục?
- [ ] `activeOrderId` có đổi liên tục?
- [ ] `isInitialLoad` có đổi giữa true/false?

### 2. Kiểm tra state updates
- [ ] `setDisplayedSections` có gọi nhiều lần?
- [ ] `setCurrentTables` có gọi nhiều lần?
- [ ] Có setState nào khác trong `fetchAllData` không?

### 3. Kiểm tra dependencies
- [ ] `fetchAllData` dependency array: `[activeOrderId, initialTableId]` - OK?
- [ ] `useFocusEffect` dependency array: `[routeOrderId, initialTableId]` - OK?
- [ ] Có dependency nào động khác không?

### 4. Kiểm tra Realtime channels
- [ ] Channel có cleanup đúng không?
- [ ] Có nhiều channel trùng ID không?
- [ ] `fetchAllData` trong callback có stable không?

---

## 🎯 CÁC VẤN ĐỀ TIỀM ẨN KHÁC (Cần kiểm tra nếu vẫn loop)

### A. Component bên ngoài force re-render

**Kiểm tra:**
```typescript
// Trong parent component (navigation stack)
// Có prop nào truyền vào thay đổi liên tục không?
<OrderConfirmationScreen 
  route={...}  // ← Có đổi không?
  navigation={...}  // ← Có đổi không?
/>
```

### B. Context providers gây re-render

**Kiểm tra:**
```typescript
// NetworkContext, AuthContext, CartContext
// Có value nào thay đổi liên tục không?
const { isOnline } = useNetwork(); // ← Có flip liên tục?
```

### C. Route params thay đổi

**Kiểm tra:**
```typescript
const { tableId, tableName, orderId } = route.params;
// Params có đổi sau mỗi navigation không?
```

---

## 💡 BEST PRACTICES RÚT RA

### ✅ DO's

1. **Sử dụng `useRef` cho giá trị không cần trigger re-render**
   ```typescript
   const isInitialMount = useRef(true);
   const previouslyUnavailableItemsRef = useRef<Set<number>>(new Set());
   ```

2. **Deep compare trước khi setState với object/array**
   ```typescript
   setState(prev => {
     const hasChanged = /* compare logic */;
     return hasChanged ? newValue : prev;
   });
   ```

3. **Giữ dependency array nhỏ gọn và stable**
   ```typescript
   useCallback(() => {
     // ...
   }, [id, name]); // Chỉ primitive values
   ```

4. **Tránh setState trong callback có dependency chứa state đó**
   ```typescript
   const fetchData = useCallback(() => {
     setMyState(newValue); // ❌ Nếu myState trong dependency
   }, [myState]); // ← Vòng lặp!
   ```

### ❌ DON'Ts

1. **Đừng set state trong useCallback nếu state đó trong dependency**
2. **Đừng dùng biến động trong Realtime filter mà không có trong dependency**
3. **Đừng tạo object/array mới mỗi lần nếu data không đổi**
4. **Đừng bỏ qua console logs khi debug infinite loop**

---

## 📝 FILES CHANGED

- `screens/Menu/OrderConfirmationScreen.tsx`
  - Import thêm `useRef`
  - Thêm `isInitialMount` ref
  - Fix `setActiveOrderId` chỉ chạy 1 lần
  - Fix Realtime channel loại bỏ filter động
  - Fix `setCurrentTables` với deep compare
  - Thêm debug logs

---

## 🧪 TESTING

### Test Case 1: Mount lần đầu
**Expected:**
- `[fetchAllData]` chạy 1 lần
- `setActiveOrderId` chỉ 1 lần
- Không có log lặp lại

### Test Case 2: Navigate ra rồi vào lại
**Expected:**
- `[useFocusEffect] Cleaning up channels`
- `[useFocusEffect] Screen focused, loading data...`
- `[fetchAllData]` chạy 1 lần
- Không loop

### Test Case 3: Realtime update từ bếp
**Expected:**
- `[Realtime] Món ăn thay đổi trạng thái`
- `[fetchAllData] START - isInitialLoad: false`
- Chỉ 1 lần, không loop

### Test Case 4: Update món trong cart
**Expected:**
- `handleUpdateQuantity` chạy
- `fetchAllData` chạy 1 lần
- Không trigger useFocusEffect

---

## 🚀 NEXT STEPS NẾU VẪN BỊ

1. **Mở Chrome DevTools → React DevTools**
   - Xem component nào re-render nhiều
   - Profiler để track performance

2. **Thêm breakpoint trong fetchAllData**
   - Xem call stack
   - Xác định ai gọi fetchAllData

3. **Tạm comment realtime channels**
   - Xem có còn loop không
   - Nếu hết → Vấn đề ở realtime
   - Nếu vẫn → Vấn đề ở state management

4. **Kiểm tra navigation stack**
   - Có navigate lại chính nó không?
   - Có params thay đổi không?

---

## 📞 DEBUG CHECKLIST NHANH

```bash
# 1. Xóa node_modules và cache
rm -rf node_modules
npm install
npx expo start -c

# 2. Kiểm tra console
# Mở app → Vào OrderConfirmationScreen
# Đếm số lần "[fetchAllData] START" xuất hiện
# - Nếu > 2 lần → Vẫn bị loop
# - Nếu = 1-2 lần → OK

# 3. Test navigation
# Navigate ra → Vào lại
# Xem có "[useFocusEffect] Cleaning up" không

# 4. Test realtime
# Từ bếp báo hết món
# Xem console có spam không
```

---

**Tóm lại:** Đã fix 3 vấn đề chính:
1. ✅ `setActiveOrderId` chỉ chạy 1 lần
2. ✅ Realtime channel không dùng filter động
3. ✅ `setCurrentTables` deep compare

Nếu vẫn bị loop → Check console logs và báo lại pattern cụ thể!
