# Tính năng "Món không khả dụng" 

## Tổng quan
Đã implement tính năng đánh dấu món "Không khả dụng" khi bếp báo hết món rồi báo còn lại.

## Luồng hoạt động

### 1. Khi bếp báo hết món (`is_available = false`)
- Hệ thống lưu `menu_item_id` vào state `previouslyUnavailableItems`
- Món được hiển thị trong section "Món đã hết" 
- Badge đỏ "Hết món" xuất hiện
- Món không được tính vào tổng bill

### 2. Khi bếp báo còn lại (`is_available = true`)
- **Nếu món đó đã từng hết trong session hiện tại:**
  - Món được đánh dấu `isUnavailable = true`
  - Chuyển sang section "Món không khả dụng"
  - Badge cam "Không khả dụng" xuất hiện
  - Món **KHÔNG** được tính vào tổng bill
  - Món bị gạch ngang giá
  - Không thể chỉnh sửa hoặc xóa món
  
- **Nếu món chưa từng hết:**
  - Hiển thị bình thường, có thể order tiếp

### 3. Để order lại món đã hết
- Nhân viên phải vào menu và order mới
- Món mới order sẽ được tính bình thường

## Các thay đổi code

### File: `OrderConfirmationScreen.tsx`

#### 1. Interface `DisplayItem`
```typescript
interface DisplayItem {
  // ... existing fields
  isUnavailable?: boolean; // [MỚI] Món không khả dụng
}
```

#### 2. State mới
```typescript
const [previouslyUnavailableItems, setPreviouslyUnavailableItems] = useState<Set<number>>(new Set());
```
- Theo dõi các `menu_item_id` đã từng hết trong session

#### 3. Logic phân loại món trong `fetchAllData()`
```typescript
// Cập nhật danh sách món đã từng hết
const currentlyUnavailableMenuItemIds = new Set<number>();
// ... tracking logic

// Hàm kiểm tra món "không khả dụng"
const isItemUnavailable = (item: DisplayItem): boolean => {
  if (!item.menuItemId) return false;
  return previouslyUnavailableItems.has(item.menuItemId) && item.is_available === true;
};

// Phân loại món
newItems.forEach(item => {
  if (item.is_available === false) {
    outOfStockNewItems.push(item);
  } else if (isItemUnavailable(item)) {
    unavailableNewItems.push({ ...item, isUnavailable: true });
  } else {
    availableNewItems.push(item);
  }
});
```

#### 4. Section mới "Món không khả dụng"
```typescript
if (unavailableNewItems.length > 0 || unavailablePendingItems.length > 0 || 
    unavailableReturnedItems.length > 0 || unavailablePaidItems.length > 0) {
  const unavailableItems = [...unavailableNewItems, ...unavailablePendingItems, 
                             ...unavailableReturnedItems, ...unavailablePaidItems];
  sections.push({ title: 'Món không khả dụng', data: unavailableItems });
}
```

#### 5. Badge UI "Không khả dụng"
```tsx
{isUnavailable && (
  <View className="bg-orange-100 px-2 py-1 rounded-full mb-1">
    <Text className="text-orange-800 text-xs font-bold">Không khả dụng</Text>
  </View>
)}
```

#### 6. Loại trừ khỏi tổng bill
```typescript
const billableItems = allItems.filter((item) => 
  !item.isPaid && 
  !item.isReturnedItem && 
  item.is_available !== false &&
  !item.isUnavailable // [MỚI] Loại trừ món không khả dụng
);
```

#### 7. Disable actions cho món không khả dụng
- Không thể tăng/giảm số lượng
- Không thể thêm/sửa ghi chú
- Không thể hủy món
- Không thể mở action menu

## UI Components

### Badge Style
- **Màu nền:** `bg-orange-100` (#FEF3C7)
- **Màu chữ:** `text-orange-800` (#92400E)
- **Text:** "Không khả dụng"

### Item Style (khi `isUnavailable = true`)
- Nền xám: `styles.paidItem`
- Text gạch ngang: `line-through`
- Màu chữ xám: `text-gray-500`
- Giá gạch ngang
- Opacity giảm khi disabled

## Trạng thái món (Hierarchy)

1. 🟢 **Bình thường** - Món khả dụng, có thể thêm/sửa/xóa
2. 🔵 **Mới** - Món chưa gửi bếp
3. 🟠 **Đang làm** - Bếp đang chế biến
4. 🟢 **Hoàn thành** - Món đã xong, chờ phục vụ
5. 🔴 **Hết món** (tạm thời) - Bếp báo hết, không thêm được
6. 🟠 **Không khả dụng** - Đã gỡ khỏi đơn, phải order mới
7. ⚫ **Đã trả lại** - Món đã trả cho bếp
8. ⚪ **Đã thanh toán** - Món đã trả bill

## Real-time Sync

Đã có channel realtime:
```typescript
const menuItemsChannel = supabase
  .channel('public:menu_items_availability')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'menu_items' },
    (payload) => {
      fetchAllData(false);
    }
  )
  .subscribe();
```

## Testing Checklist

- [ ] Bếp báo hết món → Món xuất hiện trong "Món đã hết"
- [ ] Bếp báo còn lại → Món chuyển sang "Món không khả dụng"
- [ ] Món không khả dụng không tính vào tổng bill
- [ ] Không thể chỉnh sửa món không khả dụng
- [ ] Badge hiển thị đúng màu cam
- [ ] Order món mới từ menu vẫn hoạt động bình thường
- [ ] Real-time update khi bếp thay đổi trạng thái
- [ ] Món không khả dụng không bị gửi bếp khi bấm "Gửi bếp"

## Notes

- State `previouslyUnavailableItems` được reset khi:
  - Reload app
  - Navigate ra khỏi màn hình
  - Đóng phiên bàn
  
- Nếu muốn persist state này qua sessions, cần lưu vào AsyncStorage hoặc database

- Logic không áp dụng cho:
  - Món đã thanh toán
  - Món đã trả lại
  - Món trong cart (mới chưa gửi bếp)
