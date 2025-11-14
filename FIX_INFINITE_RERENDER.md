# Fix: OrderConfirmationScreen Load lại nhiều lần

## Vấn đề
`OrderConfirmationScreen` bị load lại vô hạn do vòng lặp re-render.

## Nguyên nhân

### 1. **State `previouslyUnavailableItems` trong dependency array**
```typescript
// ❌ LỖI CŨ
const [previouslyUnavailableItems, setPreviouslyUnavailableItems] = useState<Set<number>>(new Set());

const fetchAllData = useCallback(async () => {
  // ...
  setPreviouslyUnavailableItems(prev => {
    // Update state
  });
}, [activeOrderId, initialTableId, previouslyUnavailableItems]); // ← LỖI Ở ĐÂY!
```

**Vòng lặp:**
1. `fetchAllData` chạy
2. `setPreviouslyUnavailableItems` update state
3. `previouslyUnavailableItems` thay đổi
4. `fetchAllData` bị tạo lại (vì dependency thay đổi)
5. `useFocusEffect` trigger lại vì `fetchAllData` thay đổi
6. Quay lại bước 1 → **∞**

### 2. **`fetchAllData` trong dependency của `useFocusEffect`**
```typescript
// ❌ LỖI CŨ
useFocusEffect(
  useCallback(() => {
    fetchAllData(true);
    // ...
  }, [fetchAllData, activeOrderId, initialTableId, routeOrderId])
);
```

Khi `fetchAllData` thay đổi (do dependency của nó thay đổi), `useFocusEffect` chạy lại → re-render → lặp lại.

## Giải pháp

### 1. **Dùng `useRef` thay vì `useState` cho tracking**
```typescript
// ✅ FIX
const previouslyUnavailableItemsRef = useRef<Set<number>>(new Set());

const fetchAllData = useCallback(async () => {
  // ...
  // Cập nhật ref - KHÔNG trigger re-render
  currentlyUnavailableMenuItemIds.forEach(id => {
    previouslyUnavailableItemsRef.current.add(id);
  });
  
  // Sử dụng ref
  const isItemUnavailable = (item: DisplayItem): boolean => {
    return previouslyUnavailableItemsRef.current.has(item.menuItemId);
  };
}, [activeOrderId, initialTableId]); // ← Loại bỏ previouslyUnavailableItems
```

**Lợi ích:**
- `useRef` không trigger re-render khi giá trị thay đổi
- Giữ được giá trị qua các lần render
- Không nằm trong dependency array

### 2. **Loại bỏ `fetchAllData` khỏi dependency của `useFocusEffect`**
```typescript
// ✅ FIX
useFocusEffect(
  useCallback(() => {
    fetchAllData(true);
    // Setup realtime channels...
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeOrderId, initialTableId]) // ← Loại bỏ fetchAllData
);
```

**Giải thích:**
- `fetchAllData` được định nghĩa bên ngoài, stable với dependency `[activeOrderId, initialTableId]`
- `useFocusEffect` chỉ cần chạy lại khi `routeOrderId` hoặc `initialTableId` thay đổi (lần đầu mount)
- Sử dụng `eslint-disable` vì chúng ta biết mình đang làm gì

## So sánh Before/After

### Before (❌ Infinite Loop)
```
1. Component mount
2. useFocusEffect runs → fetchAllData(true)
3. fetchAllData updates setPreviouslyUnavailableItems
4. previouslyUnavailableItems changes
5. fetchAllData recreated (dependency changed)
6. useFocusEffect dependency changed
7. useFocusEffect runs again → Back to step 2
```

### After (✅ Stable)
```
1. Component mount
2. useFocusEffect runs → fetchAllData(true)
3. fetchAllData updates previouslyUnavailableItemsRef (no re-render)
4. previouslyUnavailableItemsRef.current updated (stable ref)
5. No dependency changes
6. No re-render
7. ✅ Done
```

## Debug Logs
Đã thêm console.log để theo dõi:
```typescript
console.log('[useFocusEffect] Screen focused, loading data...');
console.log('[useFocusEffect] Setting up realtime channels...');
console.log('[useFocusEffect] Cleaning up channels...');
console.log('[Realtime] Cập nhật orders:', payload);
console.log('[Realtime] Món ăn thay đổi trạng thái:', payload);
```

Nếu vẫn thấy log lặp lại → Kiểm tra lại các `useState` khác trong component.

## Kinh nghiệm rút ra

### ✅ DO's
- Sử dụng `useRef` cho giá trị cần persist nhưng không cần trigger re-render
- Giữ dependency array nhỏ gọn và stable
- Dùng functional update `setState(prev => ...)` khi cần state cũ
- Comment rõ ràng khi dùng `eslint-disable`

### ❌ DON'Ts  
- Đừng đặt state vào dependency nếu nó được update trong callback đó
- Đừng đặt callback vào dependency của `useFocusEffect` nếu không cần thiết
- Đừng update state không cần thiết trong `fetchAllData`

## Testing
Để verify fix:
1. Mở OrderConfirmationScreen
2. Kiểm tra console → Chỉ thấy `[useFocusEffect] Screen focused` **1 lần**
3. Update món từ bếp → Chỉ thấy `[Realtime]` log khi có thay đổi thực sự
4. Navigate ra rồi vào lại → Thấy log cleanup rồi setup lại 1 lần

## Files Changed
- `screens/Menu/OrderConfirmationScreen.tsx`
  - Import `useRef`
  - Thay `useState` → `useRef` cho `previouslyUnavailableItems`
  - Loại bỏ dependency trong `fetchAllData` callback
  - Loại bỏ `fetchAllData` khỏi `useFocusEffect` dependency
  - Thêm debug logs
