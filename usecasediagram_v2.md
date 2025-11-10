# Use Case Diagram - Hệ Thống Quản Lý Nhà Hàng (AppDatDoHub)
**Phiên bản:** 2.0 | **Ngày cập nhật:** 10/11/2025

---

## 📋 Mục Lục
1. [Sơ Đồ Tổng Quát](#sơ-đồ-tổng-quát)
2. [Phân Tích Actor](#phân-tích-actor)
3. [Use Case Chi Tiết Cho Nhân Viên](#use-case-chi-tiết-cho-nhân-viên)
4. [Use Case Chi Tiết Cho Thu Ngân](#use-case-chi-tiết-cho-thu-ngân)
5. [Use Case Chi Tiết Cho Admin](#use-case-chi-tiết-cho-admin)
6. [Use Case Chi Tiết Cho Bếp](#use-case-chi-tiết-cho-bếp)
7. [Hướng Dẫn Vẽ Sơ Đồ](#hướng-dẫn-vẽ-sơ-đồ)

---

## 🎯 Sơ Đồ Tổng Quát (General Use Case Diagram)

### Sơ Đồ Tương Tác Chính Của Các Actors Với Hệ Thống

**Mô tả:** Đây là sơ đồ tổng quát thể hiện các chức năng chính mà mỗi Actor tương tác với hệ thống. Giống với hình 2 (Front-end Blog) trong tài liệu tham khảo.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     AppDatDoHub System                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐              │
│  │  Nhân      │      │   Thu      │      │   Admin    │              │
│  │  Viên      │      │   Ngân     │      │            │              │
│  └──────┬─────┘      └──────┬─────┘      └──────┬─────┘              │
│         │                   │                   │                    │
│         ├───────────┬───────┼───────────┬───────┤                    │
│         │           │       │           │       │                    │
│         ▼           ▼       ▼           ▼       ▼                    │
│       ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐        │
│       │ 1.Xem So │ │ 2.Ghi    │ │ 3.Xem DB   │ │ 4.Xem    │        │
│       │ Do Ban   │ │ Order &  │ │ Tai Chinh  │ │ Dashboard│        │
│       │          │ │ Ban      │ │            │ │ Admin    │        │
│       └──────────┘ └──────────┘ └────────────┘ └───────────┘        │
│            │            │            │             │                 │
│            │            │            │             │                 │
│       ┌────┴────────────┴────────────┴─────────────┴──┐              │
│       │                                               │              │
│       ▼                                               ▼              │
│    ┌────────────┐                            ┌──────────────┐       │
│    │ 5. Thanh   │                            │ 6. Xem & Xem │       │
│    │ Toan & Tra │                            │ Xu Li Order  │       │
│    │ Mon        │                            │              │       │
│    └────────────┘                            └──────────────┘       │
│         │                                        │                   │
│         └────────────────────┬────────────────────┘                   │
│                              │                                        │
│                   ┌──────────┴─────────┐                             │
│                   │                    │                             │
│              ┌────▼────────┐      ┌────▼──────────┐                │
│              │ 7. Xem Lich │      │ 8. Quan Ly   │                │
│              │ Su Hoa Don   │      │ Tong He      │                │
│              │              │      │ Thong        │                │
│              └───────────────┘      └───────────────┘               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Danh Sách 8 Chức Năng Chính

| # | Chức Năng | Nhân Viên | Thu Ngân | Admin | Bếp | Mô Tả |
|---|---|:---:|:---:|:---:|:---:|---|
| 1 | Xem Sơ Đồ Bàn | ✓ | ✓ | - | - | Xem layout các bàn trong nhà hàng |
| 2 | Ghi Order & Quản Lý Bàn | ✓ | ✓ | - | - | Ghi order cho bàn, quản lý các order |
| 3 | Xem Dashboard Tài Chính | - | ✓ | - | - | Xem tổng doanh thu, lợi nhuận, số order |
| 4 | Xem Dashboard Admin | - | - | ✓ | - | Xem thống kê tổng hệ thống |
| 5 | Thanh Toán & Trả Món | ✓ | ✓ | - | - | Xử lý thanh toán, ghi nhận trả món |
| 6 | Xem & Xử Lý Order | - | - | ✓ | ✓ | Admin: Quản lý đơn hàng; Bếp: Xem order cần làm |
| 7 | Xem Lịch Sử Hóa Đơn | ✓ | ✓ | - | - | Xem các hóa đơn đã thanh toán |
| 8 | Quản Lý Tổng Hệ Thống | - | ✓ | ✓ | ✓ | Báo cáo, tồn kho, quỹ, nhân viên (tuỳ role) |

---

## 👥 Phân Tích Actor

### 1. **Nhân Viên (Nhan_Vien)** 
- **Vai trò chính:** Tiếp khách, ghi order, phục vụ, trả món
- **Màn hình chính:** Sơ đồ bàn → Order → Tạm tính → Thanh toán
- **Quyền truy cập:** Dashboard tài chính, quỹ, báo cáo (LIMITED - cùng interface với Thu Ngân nhưng không thấy)

### 2. **Thu Ngân (Thu_Ngan)**
- **Vai trò chính:** Quản lý tài chính, doanh thu, chi phí, hàng tồn
- **Màn hình chính:** Dashboard → Quỹ/Chi phí → Báo cáo → Tồn kho
- **Quyền truy cập:** TẤT CẢ chức năng của Nhân Viên + Dashboard tài chính + Quỹ + Báo cáo
- **Ghi chú:** Dùng chung interface với Nhân Viên nhưng role khác nhau

### 3. **Admin (Admin)**
- **Vai trò chính:** Quản lý toàn bộ hệ thống
- **Màn hình chính:** Dashboard Admin → Quản lý Order → Tiện ích Admin
- **Quyền truy cập:** TẤT CẢ chức năng

### 4. **Bếp (Kitchen)**
- **Vai trò chính:** Xử lý order, làm món ăn, quản lý tồn kho
- **Màn hình chính:** Màn hình chính → Tóm tắt món → Quản lý tồn kho
- **Quyền truy cập:** Chỉ xem order cần làm, tồn kho, khả dụng món

---

## 📋 Use Case Chi Tiết Cho Nhân Viên

### Sơ Đồ Chi Tiết: Ghi Order (Giống hình 3 - Grab/ATM)

```
┌──────────────────────────────────────────────────────────────┐
│              Ghi Order (PlaceOrder)                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │ Nhân Viên  │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Ghi Order    │                                           │
│  │(PlaceOrder)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼────────────────────────┐                        │
│    │    │                        │                        │
│    ▼    ▼                        ▼                        │
│ ┌──────────┐  ┌─────────────┐  ┌──────────────┐           │
│ │ ◄◄inc◄◄  │  │ ◄◄include◄│  │ ◄◄include◄◄ │           │
│ │ 1. Chọn  │  │ 2. Xem     │  │ 3. Tùy      │           │
│ │    Bàn   │  │    Menu    │  │    Chỉnh    │           │
│ │(SelTable)│  │(ViewMenu)  │  │    Món      │           │
│ │          │  │            │  │(Customize)  │           │
│ └──────────┘  └─────────────┘  └──────────────┘           │
│      │              │              │                      │
│      └──────────────┼──────────────┘                      │
│                     │                                     │
│                     ▼                                     │
│           ┌──────────────────┐                           │
│           │ ◄◄include◄◄      │                           │
│           │ 4. Xem Tạm Tính │                           │
│           │    (ViewBill)    │                           │
│           └──────────────────┘                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Sơ Đồ Chi Tiết: Thanh Toán

```
┌──────────────────────────────────────────────────────────────┐
│               Thanh Toán (Payment)                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │ Nhân Viên  │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │  Thanh Toán  │                                           │
│  │ (Payment)    │                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼──────────────────┐                              │
│    │    │                  │                              │
│    ▼    ▼                  ▼                              │
│ ┌──────────────┐  ┌────────────────┐  ┌──────────┐       │
│ │ ◄◄include◄◄  │  │ ◄◄include◄◄   │  │ ◄◄extend │       │
│ │ 1. VietQR    │  │ 2. MoMo QR     │  │ 3. Tiền  │       │
│ │(PaymentVQR)  │  │(PaymentMoMo)   │  │ Mặt      │       │
│ └──────────────┘  └────────────────┘  └──────────┘       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Bảng Use Case Nhân Viên

| UC ID | Chức Năng | Mô Tả |
|---|---|---|
| UC-NV-01 | Xác Thực | Đăng nhập vào hệ thống |
| UC-NV-02 | Xem Sơ Đồ Bàn | Xem layout các bàn, trạng thái (trống, có khách, chờ thanh toán) |
| UC-NV-03 | Chọn Bàn | Chọn bàn để phục vụ |
| UC-NV-04 | Xem Menu | Xem danh sách món ăn, giá, ảnh, mô tả |
| UC-NV-05 | Ghi Order | Chọn món, số lượng, tùy chỉnh → Xem tạm tính → Gửi bếp |
| UC-NV-06 | Tùy Chỉnh Món | Chọn option group, option choice |
| UC-NV-07 | Xem Tạm Tính | Xem chi tiết order hiện tại, tổng tiền |
| UC-NV-08 | Thanh Toán | Chọn phương thức (VietQR, MoMo, Tiền mặt) → In hóa đơn |
| UC-NV-09 | Xử Lý Trả Món | Chọn món trả, ghi nhận, gửi bếp hoặc hoàn tiền |
| UC-NV-10 | Xem Lịch Sử Hóa Đơn | Xem hóa đơn đã thanh toán, lọc theo ngày |

---

## 📋 Use Case Chi Tiết Cho Thu Ngân

### Sơ Đồ Chi Tiết: Quản Lý Quỹ

```
┌──────────────────────────────────────────────────────────────┐
│            Quản Lý Quỹ (FundManagement)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │  Thu Ngân  │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Quản Lý Quỹ  │                                           │
│  │(FundMgmt)    │                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼──────────────────────┐                          │
│    │    │                      │                          │
│    ▼    ▼                      ▼                          │
│ ┌──────────┐  ┌─────────────┐  ┌──────────────┐           │
│ │ ◄◄inc◄◄  │  │ ◄◄include◄│  │ ◄◄include◄◄ │           │
│ │ 1. Quỹ   │  │ 2. Quỹ      │  │ 3. Ghi      │           │
│ │    Tiền  │  │    Ngân     │  │    Nhận Quỹ │           │
│ │    Mặt   │  │    Hàng     │  │             │           │
│ │(CashFund)│  │(BankFund)   │  │             │           │
│ └──────────┘  └─────────────┘  └──────────────┘           │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Sơ Đồ Chi Tiết: Quản Lý Báo Cáo

```
┌──────────────────────────────────────────────────────────────┐
│            Quản Lý Báo Cáo (ReportManagement)               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │  Thu Ngân  │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Quản Lý      │                                           │
│  │ Báo Cáo      │                                           │
│  │(ReportMgmt)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼────────────────────┐                            │
│    │    │                    │                            │
│    ▼    ▼                    ▼                            │
│ ┌──────────┐  ┌────────────┐  ┌──────────────┐            │
│ │ ◄◄inc◄◄  │  │ ◄◄include◄│  │ ◄◄include◄◄ │            │
│ │ 1. Báo   │  │ 2. Báo    │  │ 3. Top      │            │
│ │    Cáo   │  │    Cáo    │  │    Sản      │            │
│ │    Doanh │  │    Lợi    │  │    Phẩm     │            │
│ │    Thu   │  │    Nhuận  │  │             │            │
│ │(SalesRpt)│  │(ProfitRpt)│  │             │            │
│ └──────────┘  └────────────┘  └──────────────┘            │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Bảng Use Case Thu Ngân

| UC ID | Chức Năng | Mô Tả |
|---|---|---|
| UC-TN-01 | Xem Dashboard | Xem tổng doanh thu, lợi nhuận, số order hôm nay |
| UC-TN-02 | Quỹ Tiền Mặt | Quản lý, rút/nạp tiền, lịch sử giao dịch |
| UC-TN-03 | Quỹ Ngân Hàng | Quản lý chuyển khoản, lịch sử giao dịch |
| UC-TN-04 | Báo Cáo Doanh Thu | Xem chi tiết bán hàng theo thời gian, phương thức |
| UC-TN-05 | Báo Cáo Lợi Nhuận | Xem chi tiết lợi nhuận, lợi nhuận ròng |
| UC-TN-06 | Quản Lý Tồn Kho | Xem, tìm kiếm, chi tiết từng SKU |
| UC-TN-07 | Tạo Đơn Mua | Tạo đơn mua hàng từ nhà cung cấp |
| UC-TN-08 | Ghi Nhận Chi Phí | Ghi nhận chi phí hoạt động hàng ngày |
| UC-TN-09 | Quản Lý Khuyến Mãi | Tạo, kích hoạt, sửa khuyến mãi |
| UC-TN-10 | Top Sản Phẩm | Xem sản phẩm bán chạy nhất |
| UC-TN-11 | Lịch Sử Hoạt Động | Xem log toàn bộ hoạt động hệ thống |

---

## 📋 Use Case Chi Tiết Cho Admin

### Sơ Đồ Chi Tiết: Quản Lý Đơn Hàng

```
┌──────────────────────────────────────────────────────────────┐
│           Quản Lý Đơn Hàng (ManageOrders)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │   Admin    │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Quản Lý      │                                           │
│  │ Đơn Hàng     │                                           │
│  │(ManageOrders)│                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼──────────────────────┐                           │
│    │    │                      │                           │
│    ▼    ▼                      ▼                           │
│ ┌──────────┐  ┌─────────────┐  ┌──────────────┐            │
│ │ ◄◄inc◄◄  │  │ ◄◄include◄│  │ ◄◄include◄◄ │            │
│ │ 1. Xem   │  │ 2. Xem Chi │  │ 3. Lọc      │            │
│ │    Danh  │  │    Tiết    │  │    Đơn      │            │
│ │    Sách  │  │(ViewDetail)│  │(Filter)     │            │
│ │(ViewList)│  │            │  │             │            │
│ └──────────┘  └─────────────┘  └──────────────┘            │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Bảng Use Case Admin

| UC ID | Chức Năng | Mô Tả |
|---|---|---|
| UC-AD-01 | Xem Dashboard | Xem tổng quan hệ thống, doanh thu, order, nhân viên online |
| UC-AD-02 | Xem Danh Sách Order | Xem tất cả order, trạng thái, lọc theo status |
| UC-AD-03 | Xem Chi Tiết Order | Xem thông tin chi tiết từng order |
| UC-AD-04 | Lọc Order | Lọc order theo trạng thái, thời gian, bàn, phương thức TT |
| UC-AD-05 | Xem Báo Cáo Tổng Hợp | Xem doanh thu tổng, lợi nhuận, chi phí, tồn kho |
| UC-AD-06 | Quản Lý Hệ Thống | Thay đổi mật khẩu, cấu hình menu, quản lý người dùng (future) |

---

## 📋 Use Case Chi Tiết Cho Bếp

### Sơ Đồ Chi Tiết: Xem Màn Hình Chính

```
┌──────────────────────────────────────────────────────────────┐
│        Xem Màn Hình Chính (KitchenDisplay)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐                                             │
│  │   Bếp      │                                             │
│  └─────┬──────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Màn Hình     │                                           │
│  │ Chính        │                                           │
│  │(KitchenDispl)│                                           │
│  └──────┬───────┘                                           │
│         │                                                  │
│    ┌────┼──────────────────────┐                          │
│    │    │                      │                          │
│    ▼    ▼                      ▼                          │
│ ┌──────────┐  ┌─────────────┐  ┌──────────────┐            │
│ │ ◄◄inc◄◄  │  │ ◄◄include◄│  │ ◄◄include◄◄ │            │
│ │ 1. Xem   │  │ 2. Xem Chi │  │ 3. Cập      │            │
│ │    Danh  │  │    Tiết    │  │    Nhật     │            │
│ │    Sách  │  │(ViewDetail)│  │    Trạng    │            │
│ │(ViewList)│  │            │  │(UpdateStat) │            │
│ └──────────┘  └─────────────┘  └──────────────┘            │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Bảng Use Case Bếp

| UC ID | Chức Năng | Mô Tả |
|---|---|---|
| UC-BP-01 | Xác Thực | Đăng nhập vào hệ thống |
| UC-BP-02 | Xem Màn Hình Chính | Xem danh sách order cần làm, sắp xếp theo ưu tiên |
| UC-BP-03 | Xem Chi Tiết Order | Xem chi tiết một order (bàn, món, số lượng, tùy chỉnh) |
| UC-BP-04 | Cập Nhật Trạng Thái | Đánh dấu món đang làm, hoàn thành, gửi thông báo front |
| UC-BP-05 | Xem Tóm Tắt Món | Xem tổng hợp tất cả món cần làm (category, số lượng, ưu tiên) |
| UC-BP-06 | Xem Chi Tiết Tóm Tắt | Xem chi tiết từng món trong tóm tắt (danh sách bàn cần) |
| UC-BP-07 | Quản Lý Tồn Kho | Quản lý số lượng nguyên liệu, ghi nhận hết/cấp cứu |
| UC-BP-08 | Quản Lý Khả Dụng | Bật/tắt món trong menu, thông báo cho front |
| UC-BP-09 | Xem Báo Cáo Xử Lý | Xem hiệu suất (tốc độ làm trung bình, order quá hạn) |
| UC-BP-10 | Xem Lịch Sử Trả | Xem các món bị trả, lý do, người trả, thời gian |

---

## 🎨 Hướng Dẫn Vẽ Sơ Đồ

### **Cách 1: Sử Dụng Draw.io/Diagrams.net (NÊN DÙNG)**

#### Bước 1: Vẽ Sơ Đồ Tổng Quát

1. Vào [https://www.diagrams.net](https://www.diagrams.net)
2. Chọn **New** → **Blank Diagram** → **UML**
3. **Kéo thả các thành phần từ thanh bên trái:**
   - Actor (hình người) → Đặt ở bên trái
   - Use Case (hình oval) → Đặt ở giữa
   - System Boundary (hình chữ nhật nét đứt) → Bao quanh use cases

4. **Kết nối:**
   - Actor → Use Case: Đường thẳng (Association)
   - Use Case → Use Case: Đường nét đứt có nhãn `<<include>>` hoặc `<<extend>>`

5. **Thêm màu sắc:**
   - Actors: Xanh lam
   - Use Cases cơ bản: Xanh lục
   - Use Cases mở rộng: Vàng
   - Đơn vị chức năng: Hồng

#### Bước 2: Vẽ Sơ Đồ Chi Tiết Cho Từng Role

Lặp lại quy trình cho 4 role:
- **Nhân Viên:** PlaceOrder, Payment, ReturnItems
- **Thu Ngân:** FundManagement, ReportManagement, InventoryManagement
- **Admin:** ManageOrders, AdminReports
- **Bếp:** KitchenDisplay, KitchenSummary

#### Bước 3: Export & Lưu

- **Export thành PNG** cho báo cáo, Powerpoint
- **Lưu file .xml** trên Google Drive để chỉnh sửa sau
- **Chia sẻ link** diagrams.net để collaborators có thể sửa

---

### **Tóm Tắt Ký Hiệu Use Case**

| Ký Hiệu | Ý Nghĩa | Ví Dụ |
|---|---|---|
| → | Actor sử dụng Use Case | Nhân Viên → Ghi Order |
| `<<include>>` | Bắt buộc phải thực hiện | Ghi Order ← include → Xem Menu |
| `<<extend>>` | Có thể xảy ra, không bắt buộc | Thanh Toán ← extend → MoMo Payment |
| ▲← | Quan hệ cha-con | User → Nhân Viên, Thu Ngân |

---

## 📊 Danh Sách Chi Tiết Chức Năng Của Từng Role

### **1. NHÂN VIÊN (Nhan_Vien)**

**Các chức năng chính:**
- ✅ Xác thực & Đăng nhập
- ✅ Xem Sơ Đồ Bàn (layout các bàn trong nhà hàng)
- ✅ Chọn Bàn để phục vụ
- ✅ Xem Menu (danh sách món ăn)
- ✅ Ghi Order (tạo order mới)
  - Chọn món ăn
  - Nhập số lượng
  - Tùy chỉnh chi tiết món (option groups, option choices)
  - Xem tạm tính
  - Xác nhận gửi bếp
- ✅ Xem Tạm Tính (chi tiết order hiện tại, tổng tiền)
- ✅ Thanh Toán
  - Phương thức VietQR (QR Việt)
  - Phương thức MoMo QR
  - Phương thức Tiền mặt
  - In hóa đơn
- ✅ Xử Lý Trả Món
  - Chọn món cần trả
  - Ghi nhận ghi chú
  - Chọn lý do trả
  - Hoàn tiền hoặc gửi bếp làm lại
- ✅ Xem Lịch Sử Hóa Đơn (các hóa đơn đã thanh toán, lọc theo ngày)
- ✅ Xem Thông Báo (đơn hàng trả, thanh toán, etc.)

**Không có quyền truy cập:**
- ❌ Dashboard tài chính (doanh thu, lợi nhuận)
- ❌ Quản lý quỹ tiền
- ❌ Báo cáo tài chính
- ❌ Quản lý hàng tồn kho
- ❌ Quản lý khuyến mãi
- ❌ Quản lý người dùng
- ❌ Cấu hình hệ thống

---

### **2. THU NGÂN (Thu_Ngan)**

**Các chức năng chính (bao gồm TẤT CẢ chức năng của Nhân Viên PLUS):**

**Phần Nhân Viên (tất cả):**
- ✅ Xác thực & Đăng nhập
- ✅ Xem Sơ Đồ Bàn
- ✅ Chọn Bàn
- ✅ Xem Menu
- ✅ Ghi Order
- ✅ Xem Tạm Tính
- ✅ Thanh Toán
- ✅ Xử Lý Trả Món
- ✅ Xem Lịch Sử Hóa Đơn
- ✅ Xem Thông Báo

**Phần Thu Ngân (THÊM MỚI):**
- ✅ Xem Dashboard Tài Chính
  - Tổng doanh thu hôm nay
  - Tổng lợi nhuận
  - Số lượng order
  - Biểu đồ doanh thu
  - Lọc theo ngày/tháng/năm
- ✅ Quản Lý Quỹ Tiền Mặt
  - Xem số dư hiện tại
  - Ghi nhận rút tiền
  - Ghi nhận nạp tiền
  - Xem lịch sử giao dịch
  - Export báo cáo
- ✅ Quản Lý Quỹ Ngân Hàng
  - Xem số dư
  - Ghi nhận chuyển khoản đến
  - Ghi nhận chuyển khoản đi
  - Xem lịch sử giao dịch
  - Export báo cáo
- ✅ Xem Báo Cáo Doanh Thu Chi Tiết
  - Chọn khoảng thời gian
  - Danh sách order (phương thức TT, giảm giá, tổng tiền)
  - Lọc theo danh mục
  - Export Excel/PDF
- ✅ Xem Báo Cáo Lợi Nhuận Chi Tiết
  - Doanh thu
  - Giá vốn
  - Chi phí
  - Lợi nhuận ròng
  - Biểu đồ so sánh
  - Export báo cáo
- ✅ Quản Lý Tồn Kho
  - Xem danh sách hàng
  - Xem số lượng từng SKU
  - Lọc, tìm kiếm
  - Xem chi tiết từng SKU
  - Xem lịch sử mua hàng
- ✅ Tạo Đơn Mua Hàng
  - Chọn nhà cung cấp
  - Chọn hàng cần mua
  - Nhập số lượng
  - Xem tổng tiền
  - Xác nhận tạo đơn
  - Gửi nhà cung cấp
- ✅ Ghi Nhận Chi Phí Hoạt Động
  - Chọn loại chi phí
  - Nhập số tiền
  - Ghi chú chi phí
  - Lưu chi phí
  - Cập nhật quỹ
- ✅ Quản Lý Khuyến Mãi
  - Tạo khuyến mãi mới
  - Chọn món ăn
  - Nhập % giảm hoặc giá giảm
  - Chọn khoảng thời gian
  - Kích hoạt/Vô hiệu hóa
  - Sửa, xóa khuyến mãi
- ✅ Xem Top Sản Phẩm Bán Chạy
  - Chọn khoảng thời gian
  - Hiển thị top 10, 20, 50 sản phẩm
  - Xem số lượng bán
  - Biểu đồ trực quan
- ✅ Xem Lịch Sử Hoạt Động Toàn Hệ Thống
  - Lọc theo loại hoạt động
  - Lọc theo ngày
  - Xem chi tiết từng hoạt động
  - Export log

**Không có quyền truy cập:**
- ❌ Quản lý người dùng
- ❌ Cấu hình hệ thống
- ❌ Quản lý menu sâu (chỉ xem)
- ❌ Admin dashboard (tổng hệ thống)

---

### **3. ADMIN (Admin)**

**Các chức năng chính:**

- ✅ Xác thực & Đăng nhập (Admin account)
- ✅ Xem Dashboard Admin
  - Tổng doanh thu
  - Số order hôm nay
  - Số nhân viên online
  - Các chỉ số KPI khác
  - Thống kê tổng quát
  - Biểu đồ xu hướng
  - Lọc theo ngày/tháng/năm
- ✅ Xem Danh Sách Đơn Hàng
  - Xem tất cả order trong hệ thống
  - Hiển thị trạng thái (chờ thanh toán, đã thanh toán, hoàn thành, đã đóng, hủy)
  - Lọc order theo trạng thái
  - Tap vào chi tiết xem thêm
- ✅ Xem Chi Tiết Đơn Hàng
  - Thời gian
  - Số bàn
  - Danh sách món
  - Phương thức thanh toán
  - Ghi chú
  - Thông tin nhân viên làm việc
  - Xem lịch sử order
- ✅ Lọc Đơn Hàng
  - Lọc theo trạng thái
  - Lọc theo khoảng thời gian
  - Lọc theo phương thức thanh toán
  - Lọc theo bàn
- ✅ Xem Báo Cáo Tổng Hợp
  - Doanh thu tổng
  - Lợi nhuận tổng
  - Chi phí tổng
  - Tồn kho hiện tại
  - Xuất PDF/Excel
- ✅ Quản Lý Hệ Thống
  - Thay đổi mật khẩu
  - Cấu hình menu (future)
  - Quản lý người dùng (future)
  - Cấu hình hệ thống (future)

**Quyền truy cập:**
- ✅ TẤT CẢ chức năng của hệ thống (full access)

**Ghi chú:**
- Admin có thể xem nhất, chỉnh sửa nhất, nhưng không trực tiếp phục vụ khách hàng như Nhân Viên hoặc Bếp

---

### **4. BẾP (Kitchen)**

**Các chức năng chính:**

- ✅ Xác thực & Đăng nhập (Kitchen account)
- ✅ Xem Màn Hình Chính
  - Danh sách order cần làm
  - Số bàn
  - Danh sách món
  - Trạng thái từng order
  - Thời gian nhận order
  - Sắp xếp theo ưu tiên
  - Lọc order theo trạng thái
- ✅ Xem Chi Tiết Order
  - Số bàn
  - Danh sách món
  - Số lượng
  - Tùy chỉnh/ghi chú từ khách
  - Thời gian nhận order
  - Xem lịch sử order
- ✅ Cập Nhật Trạng Thái Làm Món
  - Đánh dấu "Đang làm"
  - Đánh dấu "Hoàn thành"
  - Gửi thông báo cho front-end (app/loa/display)
  - Cập nhật trạng thái trong hệ thống
- ✅ Xem Tóm Tắt Món
  - Danh sách tất cả món cần làm
  - Tổng số lượng từng món
  - Phân loại theo category
  - Xác định ưu tiên
  - Biểu đồ/thống kê trực quan
- ✅ Xem Chi Tiết Tóm Tắt Món
  - Chọn một món trong tóm tắt
  - Số lượng từng bàn
  - Danh sách bàn nào cần món này
  - Ghi chú thêm
  - Link sang đơn cụ thể
- ✅ Quản Lý Tồn Kho Nguyên Liệu
  - Xem danh sách nguyên liệu
  - Xem số lượng hiện tại
  - Ghi nhận hết nguyên liệu (gửi cấp cứu)
  - Ghi nhận cấp cứu (thêm hàng tạm thời)
  - Lọc, tìm kiếm
- ✅ Quản Lý Khả Dụng Món Ăn
  - Xem danh sách menu
  - Toggle bật/tắt từng món
  - Lưu thay đổi
  - Thông báo front-end (cập nhật menu display)
- ✅ Xem Báo Cáo Xử Lý Order
  - Tốc độ làm trung bình
  - Số order quá hạn
  - Hiệu suất xử lý
  - Lọc theo ngày
  - Biểu đồ thống kê
- ✅ Xem Lịch Sử Trả Món
  - Danh sách các món bị trả
  - Lý do trả
  - Tên người trả (nhân viên)
  - Thời gian trả
  - Lọc, tìm kiếm theo các tiêu chí
- ✅ Xem Thông Báo & Alert
  - Món trả
  - Order bị hủy
  - Nguyên liệu hết
  - Yêu cầu khác từ front

**Không có quyền truy cập:**
- ❌ Tài chính (doanh thu, lợi nhuận)
- ❌ Thanh toán
- ❌ Quản lý người dùng
- ❌ Báo cáo tài chính
- ❌ Admin dashboard
- ❌ Các bàn không phải bếp

---

## 📱 Tóm Tắt So Sánh Quyền Hạn Của 4 Role

| Chức Năng | Nhân Viên | Thu Ngân | Admin | Bếp |
|---|:---:|:---:|:---:|:---:|
| Xem Sơ Đồ Bàn | ✅ | ✅ | - | - |
| Ghi Order | ✅ | ✅ | - | - |
| Thanh Toán | ✅ | ✅ | - | - |
| Xử Lý Trả Món | ✅ | ✅ | - | - |
| Xem Menu | ✅ | ✅ | - | - |
| Dashboard Tài Chính | - | ✅ | ✅ | - |
| Quỹ Tiền Mặt | - | ✅ | ✅ | - |
| Báo Cáo Doanh Thu | - | ✅ | ✅ | - |
| Quản Lý Tồn Kho | - | ✅ | ✅ | ✅ |
| Xem Order Chi Tiết | - | - | ✅ | ✅ |
| Cập Nhật Trạng Thái Món | - | - | - | ✅ |
| Xem Màn Hình Chính Bếp | - | - | - | ✅ |
| Quản Lý Khả Dụng Món | - | - | - | ✅ |
| Quản Lý Hệ Thống | - | - | ✅ | - |

---

**Tạo bởi:** GitHub Copilot | **Ngày:** 10/11/2025 | **Phiên bản:** 2.0
