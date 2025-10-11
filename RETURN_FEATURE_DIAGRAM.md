# Sơ đồ Luồng Chức năng Trả Món

## 1. Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  order_items         │  │  return_notifications    │   │
│  │  - id                │  │  - id                    │   │
│  │  - order_id          │  │  - order_id              │   │
│  │  - status            │  │  - table_name            │   │
│  │  - customizations    │  │  - item_names[]          │   │
│  │  - quantity          │  │  - status                │   │
│  └──────────────────────┘  │  - created_at            │   │
│           ↕ Realtime       │  - acknowledged_at       │   │
│                            └──────────────────────────┘   │
│                                     ↕ Realtime             │
└─────────────────────────────────────────────────────────────┘
           ↕                                  ↕
    ┌──────────────┐                  ┌──────────────┐
    │   KITCHEN    │                  │    STAFF     │
    │   (Bếp)      │                  │  (Nhân viên) │
    └──────────────┘                  └──────────────┘
```

## 2. Luồng Trả Món Chi Tiết

```
┌──────────────┐
│   KITCHEN    │
│ DisplayScreen│
└──────┬───────┘
       │
       │ 1. Bấm nút "TRẢ MÓN"
       │
       ↓
┌──────────────────┐
│  handleReturnOrder│
│  - Show Alert     │
│  - Confirm?       │
└──────┬────────────┘
       │ Yes
       │ 2. Insert vào return_notifications
       ↓
┌──────────────────────────┐
│  SUPABASE                │
│  return_notifications    │
│  {                       │
│    order_id: "...",      │
│    table_name: "Bàn 1",  │
│    item_names: [...],    │
│    status: "pending"     │
│  }                       │
└──────┬───────────────────┘
       │
       │ 3. Realtime broadcast
       │
       ↓
┌──────────────────────────┐
│  ReturnNotificationScreen│ ← STAFF
│  - Nhận event mới        │
│  - fetchNotifications()   │
│  - previousCount < newCount?│
│    → Vibration.vibrate() │
│  - Hiển thị thông báo    │
└──────┬───────────────────┘
       │
       │ 4. Staff xử lý
       │
       ↓
┌──────────────────┐
│ Bấm "Đã xử lý"   │
│ handleAcknowledge │
└──────┬───────────┘
       │
       │ 5. Update status = 'acknowledged'
       │
       ↓
┌──────────────────────┐
│  SUPABASE UPDATE     │
│  status: "acknowledged"│
│  acknowledged_at: NOW()│
└──────────────────────┘
```

## 3. Auto-hide Order Khi Hoàn Thành

```
┌──────────────────┐
│  order_items     │
│  status changes  │
└──────┬───────────┘
       │
       │ Realtime update
       │
       ↓
┌────────────────────────┐
│ KitchenDisplayScreen   │
│ fetchKitchenOrders()   │
└────────┬───────────────┘
         │
         │ Filter orders
         │
         ↓
    ┌───────────────────────┐
    │ Kiểm tra mỗi order:   │
    │ allServed = items.every│
    │   (item => status === │
    │    'served')          │
    └────────┬──────────────┘
             │
        ┌────┴────┐
        │         │
    allServed? allServed?
    = true    = false
        │         │
        ↓         ↓
    ┌──────┐  ┌──────┐
    │ Ẩn   │  │ Hiện │
    │ order│  │ order│
    └──────┘  └──────┘
```

## 4. Luồng Phục Vụ Món (ServeStatusScreen)

```
┌──────────────────┐
│ ServeStatusScreen│
│ - Hiện danh sách │
│   món theo status│
└──────┬───────────┘
       │
       │ Mỗi món có status:
       │
       ├─→ waiting → Icon time (gray)
       │
       ├─→ in_progress → Icon flame (orange)
       │
       ├─→ completed → Nút "PHỤC VỤ" (green)
       │              │
       │              │ Bấm
       │              ↓
       │         ┌─────────────────┐
       │         │ handleMarkAsServed│
       │         │ Update status =  │
       │         │   'served'       │
       │         └────────┬─────────┘
       │                  │
       └─→ served → Icon checkmark-done (blue)
                          │
                          │
           ┌──────────────┴──────────────┐
           │ Kiểm tra: Tất cả món served?│
           └──────────────┬──────────────┘
                          │ Yes
                          │
                          ↓
                    ┌──────────┐
                    │ Alert +  │
                    │ Go Back  │
                    └──────────┘
```

## 5. Badge Thông Báo

```
┌───────────────────────────┐
│  return_notifications     │
│  Filter: status='pending' │
└────────────┬──────────────┘
             │
             │ Count
             │
             ↓
        ┌────────┐
        │ Count  │
        │  > 0?  │
        └───┬────┘
            │
     ┌──────┴──────┐
     │             │
    Yes           No
     │             │
     ↓             ↓
┌─────────┐   ┌─────────┐
│ Hiện    │   │ Ẩn     │
│ Badge   │   │ Badge  │
│ [số]    │   │        │
└─────────┘   └─────────┘
```

## 6. Các Trạng Thái Món

```
waiting → in_progress → completed → served
  (Chờ)    (Đang làm)    (Sẵn sàng)  (Đã phục vụ)
    │          │             │            │
    │          │             │            └─→ Order tự động ẩn
    │          │             │                (khi tất cả món served)
    │          │             │
    │          │             └─→ Có thể TRẢ MÓN
    │          │
    │          └─→ Có thể TRẢ MÓN
    │
    └─→ Có thể TRẢ MÓN
```

## 7. Màn hình Kitchen và Actions

```
┌─────────────────────────────────────────────────┐
│         KitchenDisplayScreen                    │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  OrderTicketCard (Bàn 1)          │          │
│  │  ┌─────────────────────────────┐ │          │
│  │  │ Header: Table Name + Time   │ │          │
│  │  ├─────────────────────────────┤ │          │
│  │  │ Body: Order Info + Items    │ │          │
│  │  ├─────────────────────────────┤ │          │
│  │  │ Actions:                    │ │          │
│  │  │  [CHẾ BIẾN] [TRẢ MÓN]      │ │          │
│  │  │   (Orange)   (Green)        │ │          │
│  │  └─────────────────────────────┘ │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  OrderTicketCard (Bàn 2)          │          │
│  │  ...                              │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘

        Bấm "TRẢ MÓN"
             ↓
┌─────────────────────────────────────────────────┐
│         ReturnNotificationScreen                │
│                                                 │
│  🔔 Thông báo trả món              [Badge: 2]  │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │ 🔴 Bàn 1              5 phút trước│          │
│  │ Món cần trả:                      │          │
│  │  • Cà phê sữa (x2)               │          │
│  │  • Trà đào (x1)                   │          │
│  │                                   │          │
│  │  [✓ Đã xử lý]     [🗑️]           │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │ ✅ Bàn 3              2 giờ trước│          │
│  │ Món cần trả:                      │          │
│  │  • Sinh tố bơ (x1)               │          │
│  │                                   │          │
│  │  [✓ Đã xử lý]     [🗑️]           │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

## 8. Tóm tắt Events

```
EVENT                    SOURCE              TARGET              ACTION
─────────────────────────────────────────────────────────────────────────
Bấm "TRẢ MÓN"           Kitchen             Supabase            INSERT
Realtime broadcast      Supabase            Staff App           NOTIFY + VIBRATE
Bấm "Đã xử lý"          Staff               Supabase            UPDATE
Món served              Server              Supabase            UPDATE
All served              Supabase            Kitchen             HIDE ORDER
```
