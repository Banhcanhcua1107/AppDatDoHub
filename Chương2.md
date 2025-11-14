# CHƯƠNG 2 - CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. TỔNG QUAN VỀ ỨNG DỤNG QUẢN LÝ NHÀ HÀNG DI ĐỘNG

Ứng dụng quản lý nhà hàng/quán ăn (Restaurant Management System - RMS) là nền tảng di động cho phép quản lý các hoạt động hàng ngày của nhà hàng, bao gồm quản lý bàn, đơn hàng, thanh toán, và báo cáo doanh số. TableFlow là một giải pháp RMS toàn diện, được thiết kế cho nhiều vai trò (Nhân viên phục vụ, Bếp, Thu ngân, Quản lý) với giao diện và chức năng riêng biệt cho từng role [1], [2].

Ứng dụng cung cấp các chức năng chính như:

- **Quản lý bàn**: Hiển thị trạng thái bàn (trống, có khách, thanh toán), cho phép bàn hợp nhất hoặc chia tách.
- **Gọi món**: Nhân viên phục vụ duyệt menu, tùy chỉnh sản phẩm, thêm vào giỏ hàng, xác nhận đơn hàng.
- **Hệ thống hiển thị bếp (KDS)**: Bếp nhìn thấy các đơn hàng mới, cập nhật trạng thái, và nhân viên được thông báo khi đơn hàng hoàn tất.
- **Thanh toán đa phương thức**: Hỗ trợ tiền mặt, chuyển khoản ngân hàng, ví MoMo, VietQR, với khả năng hoàn trả từng mục hàng.
- **Báo cáo tài chính**: Hôm nay, tuần, tháng với thống kê doanh số, lợi nhuận, chi phí, hàng tồn kho.
- **Hệ thống thông báo**: Thông báo real-time cho phù hợp với vai trò (Bếp nhận thông báo đơn hàng mới, Nhân viên được thông báo khi đơn hoàn tất).

Ứng dụng được thiết kế theo mô hình **ứng dụng di động hybrid** (React Native), cho phép hoạt động trên iOS và Android từ một codebase duy nhất, mang lại trải nghiệm gần như native, tốc độ cao, và hỗ trợ offline cơ bản [3], [4]. Khác với SPA web, TableFlow có thể sử dụng các tính năng thiết bị (camera, âm thanh, vibration) và có khả năng hoạt động với kết nối mạng yếu hoặc không có [5].

---

## 2.2. MÔ HÌNH KIẾN TRÚC ỨNG DỤNG

Ứng dụng quản lý nhà hàng được xây dựng dựa trên mô hình client-server, bao gồm bốn thành phần chính: Frontend (Ứng dụng di động), Backend (Server), Database, và Cloud Services. Các thành phần này phối hợp để cung cấp một hệ thống hoàn chỉnh, đáp ứng nhu cầu của cả nhân viên và quản lý.

### 2.2.1. Frontend - Ứng dụng Di Động (React Native)

Frontend là phần tương tác trực tiếp với người dùng (nhân viên phục vụ, bếp, thu ngân, quản lý), hiển thị các màn hình như chọn bàn, menu, đơn hàng, thanh toán, báo cáo. Frontend được xây dựng bằng **React Native**, một framework JavaScript cho phép xây dựng ứng dụng di động cross-platform từ một codebase [3].

**React Native & Expo:**

React Native là thư viện JavaScript được phát triển bởi Facebook, cho phép xây dựng giao diện di động native từ JSX. Ứng dụng sử dụng **Expo**, một nền tảng xây dựng ứng dụng React Native, cung cấp:

- Công cụ phát triển nhanh (Expo CLI, dev client)
- Build & deployment tự động cho iOS/Android
- Hỗ trợ hot reload, giúp phát triển nhanh hơn

Ví dụ các components chính:
- **HomeScreen (Table Selection)**: Hiển thị danh sách bàn dạng lưới, mỗi bàn là một component có thể bấm để chọn
- **MenuScreen**: Hiển thị danh sách menu item, component cho phép tìm kiếm, lọc theo danh mục
- **OrderScreen**: Hiển thị đơn hàng hiện tại, cho phép thêm/xóa sản phẩm
- **KitchenDisplayScreen**: Hiển thị hàng đợi đơn hàng cho bếp, real-time updates
- **CashierScreen**: Giao diện thanh toán với tùy chọn phương thức thanh toán

**NativeWind + Tailwind CSS:**

Thay vì CSS web, ứng dụng di động sử dụng **NativeWind**, một thư viện giúp sử dụng Tailwind CSS utilities cho React Native [4]. NativeWind cung cấp:

- Utility-first styling cho React Native (tương tự Tailwind CSS)
- Responsive design support (xLayout khác nhau cho portrait/landscape, different screen sizes)
- Theme support (light/dark mode)

Ví dụ sử dụng NativeWind:
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold mb-4">Danh sách bàn</Text>
  <View className="grid grid-cols-2 gap-4">
    {tables.map(table => (
      <TableCard key={table.id} table={table} />
    ))}
  </View>
</View>
```

**React Navigation:**

Thư viện **React Navigation** quản lý điều hướng giữa các màn hình (stack navigation, tab navigation, drawer navigation). Ứng dụng sử dụng:

- **NativeStackNavigator**: Chồng các màn hình lên nhau (ví dụ: HomeScreen → MenuScreen → OrderScreen)
- **BottomTabNavigator**: Các tab ở dưới màn hình (ví dụ: Kitchen, Cashier, Profile)
- **DrawerNavigator**: Menu slide từ cạnh (ví dụ: Admin menu)

---

### 2.2.2. Backend - Máy Chủ & API

Backend xử lý logic nghiệp vụ, xác thực người dùng, quản lý dữ liệu, và cung cấp API cho Frontend. Hệ thống backend được xây dựng dựa trên **Supabase**, một nền tảng Backend-as-a-Service (BaaS) cung cấp:

**Supabase - Backend & Database:**

Supabase là giải pháp BaaS mã nguồn mở, cung cấp:

- **PostgreSQL Database**: Cơ sở dữ liệu quan hệ mạnh mẽ lưu trữ tất cả dữ liệu
- **Supabase Auth**: Xác thực người dùng (đăng nhập, đăng ký, OTP, mật khẩu)
- **Supabase Realtime**: Cập nhật real-time cho các thay đổi dữ liệu (đơn hàng mới, cập nhật trạng thái, thanh toán)
- **PostgreSQL Row Level Security (RLS)**: Kiểm soát truy cập dựa trên vai trò (role-based access)
- **Supabase Edge Functions**: Hàm serverless để xử lý logic phức tạp (ví dụ: tích hợp MoMo payment, VietQR)

Ví dụ các API/table chính:

- **tables**: Bảng bàn (id, number, capacity, status, created_at)
- **menu_items**: Sản phẩm trên menu (id, name, price, category_id, description, image_url)
- **orders**: Đơn hàng (id, table_id, status, total_price, payment_method, created_by, created_at)
- **order_items**: Chi tiết đơn hàng (id, order_id, menu_item_id, quantity, price, notes)
- **profiles**: Thông tin người dùng (id, email, full_name, role, created_at)
- **return_slips**: Phiếu hàng trả (id, order_id, reason, created_at)
- **transactions**: Giao dịch thanh toán (id, order_id, amount, method, status, reference_id)

**Supabase Realtime Subscriptions:**

Thay vì polling API, ứng dụng sử dụng **Supabase Realtime** để lắng nghe các thay đổi real-time:

```typescript
// Lắng nghe các đơn hàng mới
supabase
  .channel('orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
    console.log('New order:', payload.new);
    // Hiển thị thông báo, phát âm thanh
  })
  .subscribe();
```

**Authentication & RBAC (Role-Based Access Control):**

Supabase cung cấp xác thực qua JWT tokens. Ứng dụng hỗ trợ 4 vai trò:
- **Staff** (Nhân viên phục vụ): Chỉ có quyền gọi món, xem trạng thái đơn hàng
- **Kitchen** (Bếp): Chỉ có quyền xem KDS, cập nhật trạng thái món
- **Cashier** (Thu ngân): Quyền thanh toán, xem báo cáo tài chính
- **Admin** (Quản lý): Toàn quyền quản lý

---

### 2.2.3. Database - PostgreSQL

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ tất cả dữ liệu ứng dụng. Supabase cung cấp PostgreSQL được quản lý hoàn toàn (managed PostgreSQL).

**Schema & Tables:**

Ứng dụng sử dụng các bảng chính:

- **profiles**: Người dùng (id, email, full_name, phone, role, avatar_url, is_active, created_at)
- **tables**: Bàn (id, number, capacity, status, notes, created_at)
- **categories**: Danh mục sản phẩm (id, name, description, image_url, sort_order)
- **menu_items**: Sản phẩm (id, name, price, category_id, description, image_url, is_available, created_at)
- **option_groups**: Nhóm tùy chỉnh (id, name, is_required)
- **option_choices**: Lựa chọn trong nhóm (id, group_id, name, price_modifier)
- **orders**: Đơn hàng (id, table_id, status, total_price, discount, payment_method, created_by, notes, created_at)
- **order_items**: Chi tiết đơn hàng (id, order_id, menu_item_id, quantity, price, customization_notes)
- **return_slips**: Phiếu hàng trả (id, order_id, created_by, reason, created_at)
- **return_slip_items**: Chi tiết hàng trả (id, slip_id, order_item_id, quantity, reason)
- **transactions**: Giao dịch thanh toán (id, order_id, amount, method, status, reference_id, created_at)

**Row Level Security (RLS):**

PostgreSQL RLS kiểm soát truy cập dựa trên vai trò:

```sql
-- Nhân viên chỉ có thể xem bàn
CREATE POLICY "staff_can_view_tables" ON tables
  FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

-- Bếp chỉ có thể xem các đơn hàng (không thể xóa)
CREATE POLICY "kitchen_can_view_orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'role' = 'kitchen');
```

---

### 2.2.4. Cloud Services & External APIs

**MoMo Payment Integration:**

Ứng dụng tích hợp thanh toán MoMo, cho phép khách hàng thanh toán qua ví MoMo:

- **MoMo API**: Tạo QR code thanh toán, kiểm tra trạng thái giao dịch
- **Supabase Edge Function**: Xử lý callback từ MoMo, cập nhật trạng thái thanh toán
- **Realtime Listener**: Frontend lắng nghe cập nhật thanh toán real-time

**VietQR Integration:**

Tương tự MoMo, VietQR cho phép chuyển khoản ngân hàng:

- **VietQR API**: Tạo QR code chuyển khoản
- **Webhook Handler**: Xử lý thông báo giao dịch từ ngân hàng
- **Status Tracking**: Theo dõi trạng thái thanh toán

**Cloudinary (Optional):**

Nếu cần upload hình ảnh sản phẩm:

- **Cloudinary API**: Upload, tối ưu hóa, phân phối hình ảnh
- **URL Transformation**: Cắt, nén, thay đổi kích thước hình ảnh

---

## 2.3. QUY TRÌNH HOẠT ĐỘNG CỦA ỨNG DỤNG

Dưới đây mô tả quy trình hoạt động của ứng dụng từ khi nhân viên đăng nhập đến khi thanh toán:

### 2.3.1. Quy Trình Gọi Món

1. **Đăng nhập**: Nhân viên mở ứng dụng, nhập email/mật khẩu. Frontend gửi yêu cầu POST /auth/login đến Supabase Auth, nhận JWT token.
2. **Chọn bàn**: Nhân viên thấy danh sách bàn, bấm chọn bàn trống. Frontend hiển thị menu.
3. **Duyệt menu**: Nhân viên xem danh sách sản phẩm theo danh mục. Frontend lấy dữ liệu từ bảng menu_items via Supabase.
4. **Tùy chỉnh sản phẩm**: Nhân viên chọn sản phẩm, tùy chỉnh (ví dụ: cà phê + đá, không đường). Frontend hiển thị option_groups, nhân viên chọn option_choices.
5. **Thêm vào giỏ hàng**: Frontend lưu sản phẩm vào state cart (không gửi server ngay).
6. **Xác nhận đơn hàng**: Nhân viên bấm "Confirm Order". Frontend gửi POST request tạo:
   - Bản ghi mới trong bảng **orders** (status = "pending")
   - Bản ghi mới trong bảng **order_items** (chi tiết từng sản phẩm)
   - Cập nhật **tables** (status = "occupied")

### 2.3.2. Thông Báo cho Bếp (Kitchen Display System)

1. **Realtime Notification**: Supabase Realtime phát hiện INSERT mới trong bảng **orders**
2. **KitchenDisplayScreen**: Bếp thấy đơn hàng mới (nếu ứng dụng đang mở)
3. **Sound Alert**: Phát âm thanh cảnh báo (sử dụng `expo-av`)
4. **Vibration**: Điện thoại rung (sử dụng `react-native` Vibration API)
5. **Bếp cập nhật trạng thái**: Bếp chọn các sản phẩm đã nấu, bấm "Mark as Done"
6. **Backend Update**: Frontend gửi PATCH request cập nhật **order_items** (item_status = "prepared")

### 2.3.3. Thông Báo cho Nhân Viên & Thanh Toán

1. **Realtime Update**: Supabase Realtime phát hiện UPDATE trong **order_items** (status = "prepared")
2. **Staff Notification**: Nhân viên phục vụ được thông báo "Bàn X, sản phẩm Y đã sẵn sàng"
3. **Phục vụ**: Nhân viên đem sản phẩm ra bàn, cập nhật trạng thế trong ứng dụng
4. **Yêu cầu thanh toán**: Khách hàng yêu cầu thanh toán. Nhân viên bấm "Request Bill"
5. **Chọn phương thức thanh toán**: Thu ngân xem bill, chọn phương thức (Cash, Bank, MoMo, VietQR)

### 2.3.4. Thanh Toán

**Thanh toán tiền mặt:**
- Thu ngân nhập số tiền khách đưa, ứng dụng tính tiền thối
- Frontend cập nhật **orders** (status = "paid", payment_method = "cash")
- Tạo bản ghi **transactions** (method = "cash", status = "completed")

**Thanh toán MoMo:**
- Frontend gọi Supabase Edge Function `/create-momo-payment`, nhận QR code
- Frontend hiển thị QR code, khách quét bằng MoMo
- MoMo gửi callback webhook tới Supabase Edge Function
- Backend cập nhật **transactions** (status = "completed")
- Frontend lắng nghe Realtime update, tự động chuyển sang màn hình "Payment Success"
- Cập nhật **orders** (status = "paid")

**Thanh toán VietQR:**
- Tương tự MoMo, hiển thị QR code chuyển khoản
- Webhook từ ngân hàng xác nhận giao dịch

### 2.3.5. Hoàn Trả Hàng

1. **Nhân viên báo lỗi sản phẩm**: Bấm "Return Item", chọn sản phẩm, lý do
2. **Tạo Return Slip**: Frontend tạo bản ghi trong **return_slips**, chi tiết trong **return_slip_items**
3. **Thông báo Bếp**: Bếp được thông báo có sản phẩm cần làm lại
4. **Cập nhật Hóa Đơn**: Tùy theo chính sách, tính toán lại giá (hoàn toàn hoặc không)

---

## 2.4. CÁC CÔNG NGHỆ SỬ DỤNG

Các công nghệ được lựa chọn dựa trên khả năng cross-platform, hiệu suất, tính phổ biến, hỗ trợ offline, và tích hợp real-time, phù hợp với yêu cầu của ứng dụng quản lý nhà hàng di động.

### 2.4.1. React Native & Expo

**React Native:**

React Native là framework cho phép xây dựng ứng dụng di động native từ JavaScript/JSX, được phát triển bởi Facebook. Thay vì viết code riêng cho iOS (Swift) và Android (Kotlin), React Native cho phép một codebase chạy trên cả hai nền tảng [3].

Ưu điểm:
- **Cross-platform**: Một codebase cho iOS + Android
- **Component-based**: Tái sử dụng component, giảm thời gian phát triển
- **Hot Reload**: Cập nhật code mà không cần rebuild toàn bộ
- **JavaScript**: Sử dụng ngôn ngữ web, dễ học cho web developers
- **Performance**: Bridge giữa JS và native APIs, hiệu suất gần native

Khuyết điểm:
- **Native Modules**: Một số tính năng phức tạp vẫn cần native code
- **File Size**: Bundle size lớn hơn native app
- **Bridge Performance**: JS-Native bridge có overhead

Lý do chọn: React Native cho phép xây dựng ứng dụng cross-platform nhanh chóng từ một codebase, tối ưu chi phí phát triển.

**Expo:**

Expo là nền tảng xây dựng ứng dụng React Native, cung cấp:

- **Managed Workflow**: Expo CLI xử lý build, deployment mà không cần Xcode/Android Studio
- **Expo Go App**: Test trực tiếp trên phone qua Expo Go
- **OTA Updates**: Over-the-air updates (cập nhật app mà không cần submit App Store)
- **Push Notifications**: Hỗ trợ push notifications
- **Plugins & Modules**: Thư viện 300+ modules (camera, sensor, etc.)

Ưu điểm:
- **Phát triển nhanh**: Không cần setup native development environment
- **EAS Build**: Build cloud-based, không cần máy tính mạnh
- **Dev Client**: Development environment tối ưu

Khuyết điểm:
- **Limited Customization**: Managed workflow hạn chế tùy chỉnh
- **Dependency**: Phụ thuộc vào Expo infrastructure

Lý do chọn: Expo giúp phát triển nhanh, deploy dễ dàng, phù hợp cho startup/dự án có deadline gấp.

### 2.4.2. TypeScript

TypeScript là superset của JavaScript, thêm static type checking, giúp phát hiện lỗi sớm [5].

Ưu điểm:
- **Type Safety**: Phát hiện lỗi tại compile-time, không runtime
- **IDE Support**: IntelliSense tốt hơn, hỗ trợ refactoring
- **Documentation**: Type hints tự động là tài liệu code
- **Maintainability**: Code dễ bảo trì, tái cấu trúc an toàn

Khuyết điểm:
- **Learning Curve**: Cần học TypeScript syntax
- **Compilation Time**: Thêm bước compile, build chậm hơn

Lý do chọn: TypeScript giúp giảm bugs, tăng code quality, đặc biệt trong dự án lớn.

### 2.4.3. Supabase & PostgreSQL

**Supabase:**

Supabase là Backend-as-a-Service (BaaS) mã nguồn mở, cung cấp:

- **PostgreSQL Database**: Cơ sở dữ liệu mạnh mẽ với RLS, JSON support, full-text search
- **Realtime**: WebSocket-based real-time subscriptions
- **Auth**: JWT-based authentication, hỗ trợ OAuth, email/password
- **Edge Functions**: Serverless functions để xử lý logic phức tạp
- **Storage**: File storage cho hình ảnh, video
- **Vector Support**: Embedding support cho AI features

Ưu điểm:
- **Không cần backend team**: BaaS giảm cần xây dựng backend từ đầu
- **Realtime**: Real-time subscriptions built-in, không cần websocket library
- **PostgreSQL**: Mạnh mẽ, reliable, hỗ trợ JSON, arrays, full-text search
- **RLS**: Bảo mật row-level, không cần backend validation
- **Pricing**: Free tier hao phí cho dự án nhỏ

Khuyết điểm:
- **Vendor Lock-in**: Phụ thuộc vào Supabase, khó migrate
- **Limited Customization**: Một số logic phức tạp cần Edge Functions
- **Cold Start**: Edge Functions có cold start latency

Lý do chọn: Supabase cung cấp backend hoàn chỉnh, real-time support, giúp team tập trung vào frontend.

**PostgreSQL:**

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, mạnh mẽ, reliable.

Ưu điểm:
- **Advanced Features**: JSON, arrays, full-text search, geospatial
- **Performance**: Tối ưu cho các query phức tạp
- **ACID Compliance**: Đảm bảo dữ liệu consistent
- **Extensibility**: Có thể viết stored procedures, custom functions

Khuyết điểm:
- **Learning Curve**: Complex queries cần kiến thức SQL
- **Scaling**: Horizontal scaling khó hơn so với NoSQL

Lý do chọn: PostgreSQL phù hợp cho ứng dụng quản lý, cần tính toàn vẹn dữ liệu cao, hỗ trợ query phức tạp.

### 2.4.4. NativeWind + Tailwind CSS

**NativeWind:**

NativeWind là thư viện giúp sử dụng Tailwind CSS utilities trong React Native [4].

Ưu điểm:
- **Tailwind Utilities**: Tái sử dụng kiến thức Tailwind CSS từ web
- **Consistency**: Giao diện consistent giữa web và mobile
- **Responsive**: Hỗ trợ responsive design cho mobile screens
- **Performance**: Tối ưu CSS, không load toàn bộ

Khuyết điểm:
- **Limited**: Một số Tailwind features không support (transitions, hover states)
- **Learning**: Cần học cách sử dụng Tailwind cho mobile

Lý do chọn: NativeWind cho phép styling nhanh chóng, consistent với Tailwind, giảm thời gian design.

### 2.4.5. React Navigation

React Navigation là thư viện routing cho React Native, quản lý điều hướng giữa các màn hình.

Ưu điểm:
- **Flexible**: Stack, Tab, Drawer navigation
- **Gesture Support**: Swipe-back on iOS, back button on Android
- **Deep Linking**: Hỗ trợ deep linking (ứng dụng có thể mở từ URL)
- **Params Passing**: Truyền dữ liệu giữa màn hình dễ dàng

Khuyết điểm:
- **Complex Setup**: Cấu hình khá verbose
- **Performance**: Lẹ hơn native navigation nhưng không cực kỳ tối ưu

Lý do chọn: React Navigation là standard de facto cho React Native navigation.

### 2.4.6. Zustand & Redux Toolkit

**Zustand:**

Zustand là thư viện state management nhẹ, đơn giản.

Ưu điểm:
- **Lightweight**: Minimal boilerplate
- **Simple API**: `create` hook dễ sử dụng
- **TypeScript**: Full TypeScript support
- **Middleware Support**: Logger, persist middleware

Khuyết điểm:
- **Limited DevTools**: Không có dev tools tốt như Redux

Lý do chọn: Zustand phù hợp cho ứng dụng không quá phức tạp, cần state management đơn giản.

**Redux Toolkit:**

Redux Toolkit là phiên bản simplified của Redux, cung cấp boilerplate less API [5].

Ưu điểm:
- **DevTools**: Redux DevTools extension tuyệt vời
- **Middleware**: Hỗ trợ async thunks, listener middleware
- **Immer Integration**: Có thể mutate state, Immer sẽ handle immutability

Lý do chọn: Redux Toolkit cho state management complex, ứng dụng lớn cần debugging tốt.

### 2.4.7. React Navigation Stack, Tab, Drawer

Ứng dụng sử dụng:

- **NativeStackNavigator**: Stack các màn hình (MenuScreen → OrderScreen → PaymentScreen)
- **BottomTabNavigator**: Tab ở dưới (Kitchen, Cashier, Admin)
- **DrawerNavigator**: Menu slide từ cạnh (Admin menu)

Ví dụ:
```tsx
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tables" component={HomeScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="Payment" component={OrderScreen} />
    </Stack.Navigator>
  );
}
```

### 2.4.8. Async Storage & MMKV

**Async Storage:**

Thư viện lưu trữ dữ liệu cục bộ (local storage) cho React Native [6].

Ưu điểm:
- **Persistent**: Dữ liệu tồn tại sau khi app tắt
- **Async**: Không block UI thread

Khuyết điểm:
- **Performance**: Chậm hơn MMKV
- **Size Limit**: Giới hạn kích thước (tùy điện thoại)

**MMKV:**

MMKV là thư viện lưu trữ nhanh, hiệu suất cao.

Ưu điểm:
- **Performance**: 10x nhanh hơn Async Storage
- **Encryption**: Hỗ trợ encryption

Lý do chọn: MMKV cho offline cache, MMKV cho token storage (vì cần truy cập nhanh).

### 2.4.9. React Native Reanimated

React Native Reanimated là thư viện animation native-driven, hiệu suất cao [6].

Ưu điểm:
- **60fps**: Smooth animations không drop frames
- **Native Driven**: Animation chạy trên native thread, không block JS
- **Gesture Handling**: Tích hợp tốt với gesture

Lý do chọn: Reanimated cho animation mượt mà, không lag, cải thiện user experience.

### 2.4.10. React Native Toast Message

React Native Toast Message cho hiển thị thông báo (toast) [6].

Ưu điểm:
- **Customizable**: Config toàn bộ giao diện
- **Position**: Top, bottom, center positioning
- **Duration**: Tự động dismiss hoặc manual

Lý do chọn: Hiển thị feedback cho người dùng (success, error, warning messages).

### 2.4.11. Cloudinary (Optional)

Nếu cần upload hình ảnh sản phẩm:

- **Upload**: Người dùng chụp hình, upload lên Cloudinary
- **Optimization**: Cloudinary tự động tối ưu hóa (nén, resize)
- **Delivery**: Hình ảnh được deliver qua CDN, nhanh hơn

Lý do chọn: Quản lý hình ảnh tập trung, tối ưu hóa tự động, giảm storage cần thiết.

---

## 2.5. KIẾN TRÚC STATE MANAGEMENT

Ứng dụng sử dụng kết hợp:

- **Zustand**: Cho global state (user, cart, tables)
- **Redux Toolkit**: Cho complex state (orders, transactions) nếu cần advanced middleware
- **React Context**: Cho AuthContext, NetworkContext (provider-level state)
- **Async Storage**: Lưu persistent data (token, user info)
- **MMKV**: Cache nhanh cho dữ liệu frequently accessed

Ví dụ flow:
```
User Login → AuthContext (auth state) → Supabase Auth (JWT token)
           → MMKV/AsyncStorage (persist token)
           → Zustand authStore (global user state)

Select Table → CartContext (cart items) → Zustand orderStore (if complex)
             → Submit → Supabase (create order) → Realtime listener

Receive Payment Notification → Realtime listener (supabase channel)
                             → Redux middleware (log transaction)
                             → Toast notification (UI feedback)
```

---

## TỔNG KẾT

Ứng dụng quản lý nhà hàng AppDatDoHub sử dụng **React Native + Expo** cho frontend cross-platform, **Supabase + PostgreSQL** cho backend & database, **NativeWind** cho styling, và các công nghệ hiện đại khác để tạo một hệ thống toàn diện, real-time, hỗ trợ multiple roles, và hỗ trợ offline cơ bản. Kiến trúc này cho phép phát triển nhanh, bảo trì dễ dàng, và đáp ứng nhu cầu quản lý nhà hàng hiệu quả.

---

## TÀI LIỆU THAM KHẢO

[1] "React Native Official Documentation" - https://reactnative.dev
[2] "Expo Documentation" - https://docs.expo.dev
[3] "React Navigation Documentation" - https://reactnavigation.org
[4] "NativeWind Documentation" - https://www.nativewind.dev
[5] "TypeScript Handbook" - https://www.typescriptlang.org/docs
[6] "React Native Async Storage" - https://react-native-async-storage.github.io
[7] "Supabase Documentation" - https://supabase.com/docs
[8] "PostgreSQL Official Documentation" - https://www.postgresql.org/docs
[9] "Redux Toolkit Documentation" - https://redux-toolkit.js.org
