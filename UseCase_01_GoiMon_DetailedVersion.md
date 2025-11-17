# USE CASE 1: GỌI MÓN (PLACE ORDER)

## 📌 Thông Tin Use Case

| Thuộc Tính | Giá Trị |
|-----------|--------|
| **UC ID** | UC-01 |
| **Tên Use Case** | Gọi Món (Place Order) |
| **Actor Chính** | Nhân Viên (Staff) |
| **Mô Tả Ngắn** | Nhân viên tiếp khách, ghi order, xem tạm tính, gửi bếp |
| **Loại** | Primary Use Case |
| **Độ Ưu Tiên** | Critical |

---

## 📊 Sơ Đồ Gọi Món (Use Case Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                  GỌI MÓN (PlaceOrder)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                              │
│  │  Nhân Viên   │                                              │
│  │   (Staff)    │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────────────┐                                      │
│  │    GỌI MÓN           │                                      │
│  │  (PlaceOrder)        │                                      │
│  │                      │                                      │
│  │  Main Flow           │                                      │
│  └───┬──────────────┬───┘                                      │
│      │              │                                          │
│      │              └───────────────────────────────┐          │
│      │                                             │          │
│      ▼                                             ▼          │
│ ┌─────────────────┐                        ┌─────────────┐   │
│ │ ◄◄include◄◄      │                        │ ◄◄extend◄◄  │   │
│ │ UC-01-01:       │                        │ UC-01-05:   │   │
│ │ Xem Sơ Đồ Bàn   │                        │ Thanh Toán  │   │
│ │ (ViewTableMap)  │                        │ (Payment)   │   │
│ └─────────────────┘                        └─────────────┘   │
│      │                                             ▲          │
│      └──────────────────┬────────────────────────┐ │          │
│                         │                        │ │          │
│      ┌──────────────────┴────────────────────┐   │ │          │
│      │                                       │   │ │          │
│      ▼                                       ▼   │ │          │
│ ┌──────────────────┐  ┌────────────────────┐    │ │          │
│ │ ◄◄include◄◄      │  │ ◄◄include◄◄       │    │ │          │
│ │ UC-01-02:        │  │ UC-01-03:          │    │ │          │
│ │ Xem Menu         │  │ Tùy Chỉnh Món      │    │ │          │
│ │ (ViewMenu)       │  │ (CustomizeItem)    │    │ │          │
│ └────────┬─────────┘  └────────┬───────────┘    │ │          │
│          │                     │                │ │          │
│          └─────────────────────┼────────────────┤ │          │
│                                │                │ │          │
│                                ▼                │ │          │
│                     ┌──────────────────────┐    │ │          │
│                     │ ◄◄include◄◄          │    │ │          │
│                     │ UC-01-04:            │    │ │          │
│                     │ Xem Tạm Tính        │    │ │          │
│                     │ (ViewBill)          │    │ │          │
│                     └──────────┬───────────┘    │ │          │
│                                │                │ │          │
│                                └────────────────┘ │          │
│                                                   │          │
│                                          ┌────────┘          │
│                                          │                   │
│                     ┌────────────────────┴──────────┐         │
│                     │                               │         │
│      ┌──────────────▼───────────┬──────────────────▼──┐      │
│      │                          │                     │      │
│      ▼                          ▼                     ▼      │
│ ┌─────────────┐  ┌──────────────────┐  ┌───────────────┐   │
│ │ ◄◄include◄◄ │  │ ◄◄extend◄◄       │  │ ◄◄extend◄◄    │   │
│ │ UC-01-05-01:│  │ UC-01-05-02:      │  │ UC-01-05-03:  │   │
│ │ VietQR      │  │ MoMo QR           │  │ Tiền Mặt      │   │
│ │ Payment     │  │ Payment           │  │ Payment       │   │
│ │             │  │                   │  │               │   │
│ └─────────────┘  └──────────────────┘  └───────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Chi Tiết Các Use Case Con

### **UC-01-01: Xem Sơ Đồ Bàn (ViewTableMap)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Nhân viên xem layout bàn, trạng thái từng bàn (Trống, Có khách, Chờ thanh toán, Gộp bàn) |
| **Actors** | Nhân Viên |
| **Preconditions** | - Nhân viên đã đăng nhập<br/>- Hệ thống hiển thị giao diện chính |
| **Postconditions** | - Hiển thị danh sách bàn với trạng thái realtime<br/>- Nhân viên có thể chọn bàn để tiếp tục |
| **Main Flow** | 1. Hệ thống GET /api/tables từ database<br/>2. Hiển thị grid layout bàn (UI NativeWind)<br/>3. Mỗi bàn hiển thị: số hiệu, sức chứa, trạng thái (màu sắc)<br/>4. Update realtime khi có thay đổi trạng thái |
| **Include/Extend** | - |
| **Alternative Flows** | - Nếu không có bàn: Hiển thị thông báo "Tất cả bàn đều có khách" |
| **Exception Flows** | - Nếu lỗi GET API: Hiển thị toast "Lỗi kết nối, vui lòng thử lại" |

---

### **UC-01-02: Xem Menu (ViewMenu)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Nhân viên xem danh sách sản phẩm (Menu), có thể tìm kiếm, lọc theo danh mục |
| **Actors** | Nhân Viên |
| **Preconditions** | - Nhân viên chọn bàn thành công<br/>- Hệ thống chuyển sang màn hình Menu |
| **Postconditions** | - Hiển thị danh sách Menu items<br/>- Nhân viên có thể chọn sản phẩm |
| **Main Flow** | 1. Nhân viên chọn bàn → Chuyển sang Menu<br/>2. Hệ thống GET /api/menu_items<br/>3. Hiển thị: ảnh (Cloudinary), tên, giá, mô tả ngắn<br/>4. Phân loại theo danh mục (tabs: Cà phê, Trà, Ăn vặt...)<br/>5. Tìm kiếm: nhân viên gõ từ khóa → filter realtime |
| **Include/Extend** | - |
| **Alternative Flows** | - Lọc theo danh mục: chọn tab → hiển thị sản phẩm của danh mục đó<br/>- Tìm kiếm: gõ từ khóa → hiển thị sản phẩm khớp |
| **Exception Flows** | - Nếu không có sản phẩm: Hiển thị "Menu rỗng"<br/>- Nếu lỗi API: Hiển thị toast error |

---

### **UC-01-03: Tùy Chỉnh Sản Phẩm (CustomizeItem)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Nhân viên chọn sản phẩm, tùy chỉnh (nước, đường, thêm topping...), nhập ghi chú |
| **Actors** | Nhân Viên |
| **Preconditions** | - Nhân viên xem Menu<br/>- Nhân viên chọn 1 sản phẩm |
| **Postconditions** | - Sản phẩm kèm tùy chỉnh được thêm vào giỏ<br/>- Xem lại Menu hoặc Tạm Tính |
| **Main Flow** | 1. Nhân viên chọn sản phẩm → Hiển thị modal Tùy Chỉnh<br/>2. Hiển thị Option Groups (nước, đường, topping)<br/>3. Nhân viên chọn Option Choices (e.g., "Đá", "Không đường")<br/>4. Nhập Ghi Chú tùy chỉnh (e.g., "Ít ngọt")<br/>5. Nhập Số Lượng (default = 1)<br/>6. Bấm "Thêm Vào Giỏ" → Lưu vào state cart (Redux/Context) |
| **Include/Extend** | - |
| **Alternative Flows** | - Nếu sản phẩm không có Option: bỏ qua bước 2-3<br/>- Sản phẩm có multiple options: chọn từng group |
| **Exception Flows** | - Nếu số lượng < 1: Hiển thị "Số lượng phải >= 1" |

---

### **UC-01-04: Xem Tạm Tính (ViewBill)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Nhân viên xem chi tiết giỏ hàng hiện tại, có thể sửa số lượng, xóa sản phẩm |
| **Actors** | Nhân Viên |
| **Preconditions** | - Nhân viên thêm ít nhất 1 sản phẩm vào giỏ |
| **Postconditions** | - Hiển thị danh sách sản phẩm, tổng tiền<br/>- Nhân viên có thể xác nhận order hoặc quay lại menu |
| **Main Flow** | 1. Nhân viên bấm "Xem Tạm Tính" / icon "🛒"<br/>2. Hiển thị list Order Items:<br/>   - Tên sản phẩm<br/>   - Tùy chỉnh (ghi chú)<br/>   - Số lượng (có nút +/- để sửa)<br/>   - Giá từng item<br/>   - Nút xóa ❌<br/>3. Tính Tổng Tiền = SUM(Số lượng × Giá)<br/>4. Hiển thị 2 nút: "Quay Lại Menu" | "Xác Nhận Order" |
| **Include/Extend** | - |
| **Alternative Flows** | - Sửa số lượng: nhân viên bấm +/- → cập nhật giỏ<br/>- Xóa sản phẩm: bấm ❌ → xóa khỏi giỏ<br/>- Quay lại Menu: bấm "Quay Lại" → tiếp tục thêm sản phẩm |
| **Exception Flows** | - Giỏ rỗng: "Chưa có sản phẩm, vui lòng chọn" |

---

### **UC-01-05: Thanh Toán (Payment)** ◄◄extend (Optional)

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Nhân viên hoàn tất order, chọn phương thức thanh toán, xử lý giao dịch |
| **Actors** | Nhân Viên (hoặc Thu Ngân) |
| **Preconditions** | - Có giỏ hàng không rỗng<br/>- Nhân viên bấm "Xác Nhận Order" → Gửi bếp thành công |
| **Postconditions** | - Order được tạo, gửi đến bếp<br/>- Bàn chuyển sang "Có khách"<br/>- KDS nhận thông báo order mới |
| **Main Flow** | 1. Nhân viên bấm "Xác Nhận Order"<br/>2. Hệ thống POST /api/orders<br/>3. Tạo bản ghi Order (status: pending)<br/>4. Tạo OrderItems cho từng sản phẩm<br/>5. Cập nhật Table status → "Có khách"<br/>6. Broadcast realtime event → Kitchen (KDS)<br/>7. Hiển thị toast "Đã gửi bếp"<br/>8. Quay lại màn hình Bàn |
| **Include/Extend** | - UC-01-05-01: VietQR Payment (extend)<br/>- UC-01-05-02: MoMo QR Payment (extend)<br/>- UC-01-05-03: Tiền Mặt Payment (extend) |
| **Alternative Flows** | - Nhân viên có thể gửi order mà chưa thanh toán (COD mode) |
| **Exception Flows** | - Nếu lỗi POST API: Hiển thị "Lỗi gửi order, vui lòng thử lại" |

---

### **UC-01-05-01: Thanh Toán VietQR (PaymentVietQR)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Xử lý thanh toán qua VietQR (chuyển khoản ngân hàng) |
| **Actors** | Nhân Viên (hoặc Thu Ngân) |
| **Preconditions** | - Order đã được tạo<br/>- Nhân viên chọn phương thức "VietQR" |
| **Postconditions** | - Hiển thị QR code chuyển khoản<br/>- Chờ xác nhận thanh toán từ webhook |
| **Main Flow** | 1. Hệ thống gọi Edge Function `/vietqr/create-payment`<br/>2. VietQR API trả về QR code<br/>3. Hiển thị modal QR code lớn<br/>4. Hiển thị: Số tiền, Nội dung chuyển khoản, QR code<br/>5. Khách quét QR → Chuyển tiền<br/>6. Webhook callback từ ngân hàng → Backend cập nhật status<br/>7. Frontend lắng nghe realtime → Tự động xác nhận "Thanh toán thành công"<br/>8. In hóa đơn |
| **Include/Extend** | - |
| **Alternative Flows** | - Nếu QR hết hạn: nhân viên bấm "Tạo lại QR" |
| **Exception Flows** | - Webhook timeout (> 5 phút): "Thanh toán quá hạn, vui lòng thử lại" |

---

### **UC-01-05-02: Thanh Toán MoMo QR (PaymentMoMo)** ◄◄include

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Xử lý thanh toán qua MoMo QR |
| **Actors** | Nhân Viên (hoặc Thu Ngân) |
| **Preconditions** | - Order đã được tạo<br/>- Nhân viên chọn phương thức "MoMo" |
| **Postconditions** | - Hiển thị QR code MoMo<br/>- Chờ IPN callback từ MoMo |
| **Main Flow** | 1. Hệ thống gọi Edge Function `/momo/create-payment`<br/>2. MoMo API trả về QR code URL<br/>3. Hiển thị modal QR code<br/>4. Khách quét QR bằng MoMo app → Xác nhận thanh toán<br/>5. MoMo gửi IPN callback → `/momo/ipn-handler`<br/>6. Backend kiểm tra resultCode (0 = thành công)<br/>7. Cập nhật Transaction (status: completed)<br/>8. Broadcast realtime → Frontend tự động xác nhận<br/>9. In hóa đơn |
| **Include/Extend** | - |
| **Alternative Flows** | - Nhân viên bấm "Tạo lại QR": Gọi lại API |
| **Exception Flows** | - Nếu MoMo API error: Hiển thị "Lỗi tạo QR, thử lại" |

---

### **UC-01-05-03: Thanh Toán Tiền Mặt (PaymentCash)** ◄◄extend

| Thông Tin | Chi Tiết |
|-----------|---------|
| **Mô Tả** | Xử lý thanh toán bằng tiền mặt (truyền thống) |
| **Actors** | Nhân Viên (hoặc Thu Ngân) |
| **Preconditions** | - Order đã được tạo<br/>- Nhân viên chọn phương thức "Tiền Mặt" |
| **Postconditions** | - Nhân viên nhập tiền khách đưa<br/>- Hệ thống tính tiền thối<br/>- In hóa đơn, ghi nhận giao dịch |
| **Main Flow** | 1. Nhân viên chọn "Tiền Mặt"<br/>2. Hiển thị form: "Tổng Tiền" (read-only), "Tiền Khách Đưa" (input)<br/>3. Nhân viên nhập số tiền (VND)<br/>4. Hệ thống tính: Tiền Thối = Tiền Khách - Tổng Tiền<br/>5. Hiển thị "Tiền Thối" (nếu > 0)<br/>6. Nhân viên xác nhận → POST /api/transactions<br/>7. Cập nhật Transaction (status: completed)<br/>8. In hóa đơn |
| **Include/Extend** | - |
| **Alternative Flows** | - Tiền khách < Tổng tiền: Hiển thị "Tiền không đủ"<br/>- Tiền khách = Tổng tiền: Không có tiền thối |
| **Exception Flows** | - Nếu form không hợp lệ: Hiển thị validation error |

---

## 🔄 Mối Quan Hệ Include/Extend

### **Include (Bắt Buộc)**
Các use case này **LUÔN LUÔN** được thực hiện khi UC-01 xảy ra:

- **UC-01-01** (Xem Sơ Đồ Bàn): Bắt buộc - nhân viên phải chọn bàn trước
- **UC-01-02** (Xem Menu): Bắt buộc - sau khi chọn bàn, hiển thị menu
- **UC-01-04** (Xem Tạm Tính): Được gọi khi nhân viên xem giỏ

### **Extend (Tùy Chọn)**
Các use case này được thực hiện tùy theo điều kiện:

- **UC-01-05** (Thanh Toán): Không bắt buộc (có thể gửi order mà chưa thanh toán)
- **UC-01-05-01/02/03**: Tùy theo phương thức thanh toán nhân viên chọn

---

## 📋 Bảng Tóm Tắt

| UC ID | Tên | Actor | Include | Extend | Bắt Buộc |
|-------|-----|-------|---------|--------|----------|
| UC-01 | Gọi Món | Staff | ✓ | ✓ | ✓ |
| UC-01-01 | Xem Sơ Đồ Bàn | Staff | - | - | ✓ |
| UC-01-02 | Xem Menu | Staff | - | - | ✓ |
| UC-01-03 | Tùy Chỉnh Sản Phẩm | Staff | - | - | Tùy |
| UC-01-04 | Xem Tạm Tính | Staff | - | - | ✓ |
| UC-01-05 | Thanh Toán | Staff/Cashier | ✓ | ✓ | Không |
| UC-01-05-01 | VietQR Payment | Staff/Cashier | - | - | Tùy |
| UC-01-05-02 | MoMo QR Payment | Staff/Cashier | - | - | Tùy |
| UC-01-05-03 | Tiền Mặt Payment | Staff/Cashier | - | - | Tùy |

---

## 🎨 Sơ Đồ Luồng (Flow Chart)

```
START
  │
  ├─► [Xem Sơ Đồ Bàn] UC-01-01 ◄◄include
  │
  ├─► [Chọn Bàn]
  │        │
  │        ├─► [Xem Menu] UC-01-02 ◄◄include
  │        │        │
  │        │        ├─► [Chọn Sản Phẩm]
  │        │        │        │
  │        │        │        ├─► [Tùy Chỉnh Món] UC-01-03 ◄◄include
  │        │        │        │        │
  │        │        │        │        └─► [Thêm Vào Giỏ]
  │        │        │        │
  │        │        │        ├─? [Thêm Tiếp?] ── NO
  │        │        │        │                      │
  │        │        │        └─ YES ────────┐       │
  │        │        │                       │       │
  │        │        └───────────────────────┘       │
  │        │                                        │
  │        ├─► [Xem Tạm Tính] UC-01-04 ◄◄include ◄─┘
  │        │        │
  │        │        ├─► [Sửa/Xóa Sản Phẩm]
  │        │        │        │
  │        │        │        └─? [Quay Lại Menu?] ─ YES ─┐
  │        │        │                              NO    │
  │        │        │                               │    │
  │        │        └─────────────────────────────┐ │    │
  │        │                                      │ │    │
  │        └──────────────────────────────────────┘ │    │
  │                   │                             │    │
  │                   └────────────────────────┬────┘    │
  │                                            │         │
  │        ┌─ YES ◄─ [Xác Nhận Order?] ◄──────┘    ────┘
  │        │
  │        ├─► [POST /api/orders]
  │        │        │
  │        │        ├─► [Tạo Order]
  │        │        ├─► [Tạo OrderItems]
  │        │        ├─► [Cập nhật Table Status → "Có khách"]
  │        │        └─► [Broadcast → Kitchen KDS]
  │        │
  │        ├─► [Thanh Toán?] UC-01-05 ◄◄extend
  │        │        │
  │        │        ├─? [Phương Thức]
  │        │        │
  │        │        ├─► [VietQR] UC-01-05-01 ─┐
  │        │        ├─► [MoMo QR] UC-01-05-02 ─┤
  │        │        └─► [Tiền Mặt] UC-01-05-03 ─┤
  │        │                                      │
  │        │                                      ▼
  │        │                         [In Hóa Đơn]
  │        │                                      │
  │        └──────────────────────────────────────┘
  │
  └─► END
```

---

## 📱 Màn Hình Giao Diện (UI Flow)

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Login Screen   │      │   Table Map      │      │   Menu Screen    │
│                  │  ──► │   (UC-01-01)     │  ──► │   (UC-01-02)     │
│  [Đăng Nhập]     │      │                  │      │                  │
└──────────────────┘      │  🟩 Bàn 1 Trống  │      │  [☕ Cà Phê]    │
                          │  🔴 Bàn 2 Có KH  │      │  [🥤 Trà]       │
                          │  🟥 Bàn 3 Chờ TT │      │  [🍪 Ăn Vặt]   │
                          └──────────────────┘      └──────────────────┘
                                                            │
                                                            ▼
                          ┌──────────────────┐      ┌──────────────────┐
                          │ Customize Screen │      │   Cart Screen    │
                          │ (UC-01-03)       │  ◄── │  (UC-01-04)      │
                          │                  │      │                  │
                          │ 🍵 Trà Đá        │      │ 🛒 Giỏ Hàng (2)  │
                          │ Nước: [Đá][Ấm]  │      │                  │
                          │ Đường: [Vừa]    │      │ 1. Cà Phê Đen x1 │
                          │ Ghi Chú: Ít ngọt│      │    49.000đ       │
                          │ SL: [1]          │      │ 2. Trà Đá x1     │
                          │ [Thêm Vào Giỏ]  │      │    39.000đ       │
                          └──────────────────┘      │                  │
                                                    │ Tổng: 88.000đ    │
                                                    │                  │
                                                    │ [Quay Lại Menu]  │
                                                    │ [Xác Nhận Order] │
                                                    └──────────────────┘
                                                            │
                                    ┌───────────────────────┼───────────────────────┐
                                    │                       │                       │
                                    ▼                       ▼                       ▼
                          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                          │  VietQR Payment  │  │  MoMo QR Payment │  │  Cash Payment    │
                          │ (UC-01-05-01)    │  │ (UC-01-05-02)    │  │ (UC-01-05-03)    │
                          │                  │  │                  │  │                  │
                          │   ████  ████     │  │   ████  ████     │  │ Tổng: 88.000đ    │
                          │   ████  ████  ◄ QR │ │   ████  ████  ◄ QR │ [Tiền Khách: __] │
                          │   ████  ████     │  │   ████  ████     │  │ Tiền Thối: 12.0k │
                          │   ████  ████     │  │   ████  ████     │  │                  │
                          │                  │  │                  │  │ [Xác Nhận]       │
                          │ Chờ xác nhận...  │  │ Chờ xác nhận...  │  └──────────────────┘
                          └──────────────────┘  └──────────────────┘
                                    │                       │
                                    └───────────────────────┼───────────────────────┘
                                                            │
                                                            ▼
                                          ┌──────────────────────────────┐
                                          │  Invoice Screen              │
                                          │  (In Hóa Đơn)               │
                                          │                             │
                                          │  Nhà Hàng XYZ              │
                                          │  Bàn: 2                     │
                                          │  Giờ: 14:30                 │
                                          │  ─────────────────────      │
                                          │  Cà Phê Đen x1: 49.000đ    │
                                          │  Trà Đá x1: 39.000đ        │
                                          │  ─────────────────────      │
                                          │  Tổng: 88.000đ             │
                                          │  TT: MoMo QR                │
                                          │                             │
                                          │  Cảm ơn quý khách!         │
                                          │  [In] [Quay Lại]            │
                                          └──────────────────────────────┘
```

---

## ✅ Tiêu Chí Hoàn Thành Use Case

Use Case này được coi là **hoàn thành thành công** khi:

1. ✓ Nhân viên chọn bàn thành công (UC-01-01)
2. ✓ Nhân viên xem Menu (UC-01-02)
3. ✓ Nhân viên thêm ít nhất 1 sản phẩm vào giỏ (UC-01-03)
4. ✓ Nhân viên xem tạm tính (UC-01-04)
5. ✓ Nhân viên xác nhận order → Gửi bếp thành công
6. ✓ Order xuất hiện trên KDS (Kitchen)
7. ✓ Bàn chuyển sang "Có khách"

**Ghi chú**: Bước 5-7 xảy ra **bắt buộc**, còn phần Thanh Toán (UC-01-05) là **tùy chọn** - có thể gửi order mà chưa thanh toán (COD mode).

---

## 🐛 Trường Hợp Lỗi & Exception

| Lỗi | Nguyên Nhân | Xử Lý |
|-----|-----------|-------|
| API Error khi GET /tables | Mất kết nối, server down | Toast: "Lỗi kết nối, vui lòng thử lại" + Retry button |
| API Error khi GET /menu_items | Database lỗi | Hiển thị cached menu (nếu có) hoặc thông báo error |
| Sản phẩm hết hàng | is_available = false | Hiển thị xám, disabled, hiển thị "Hết hàng" |
| Giỏ rỗng | Không có sản phẩm | Hiển thị "Chưa có sản phẩm, vui lòng chọn" |
| API Error POST /orders | Server error, validation fail | Toast error + Retry |
| MoMo/VietQR API Error | Payment gateway down | Toast: "Lỗi tạo QR, vui lòng thử lại hoặc chọn phương thức khác" |
| Webhook timeout | QR hết hạn (> 5 phút) | Toast: "Thanh toán quá hạn, vui lòng tạo lại QR" |
| Nhân viên quay lại Menu | Người dùng thay đổi ý định | Giỏ vẫn được lưu, có thể tiếp tục |
| Nhân viên thoát app | Dữ liệu được lưu trong Redux/Context | Khi quay lại: Giỏ vẫn tồn tại |

---

## 📖 Ghi Chú Thiết Kế

1. **Realtime Updates**: Sử dụng Supabase Realtime để:
   - Cập nhật trạng thái bàn (Table status)
   - Broadcast order mới đến Kitchen (KDS)
   - Lắng nghe payment callback (MoMo/VietQR)

2. **State Management**: Sử dụng Redux/Context API để:
   - Lưu giỏ hàng (cart items)
   - Lưu bàn được chọn (selectedTable)
   - Lưu user authentication

3. **Performance**:
   - Lazy load menu images từ Cloudinary
   - Cache menu items để giảm API calls
   - Optimize re-renders bằng React.memo

4. **Security**:
   - JWT authentication cho tất cả API calls
   - RLS Policies trên Supabase để kiểm soát truy cập
   - Validation input trên client + server

5. **UX Best Practices**:
   - Toast notifications cho mọi action
   - Loading spinner khi API call
   - Confirmation dialog trước khi xác nhận order
   - Undo/Redo capability cho giỏ hàng

---

**Phiên Bản**: 1.0  
**Cập Nhật**: 2025-11-14  
**Author**: TableFlow Design Team
