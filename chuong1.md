# CHƯƠNG 1 - TỔNG QUAN VỀ ỨNG DỤNG

## 1.1. TỔNG QUAN VỀ ĐỀ TÀI

### 1.1.1. Hiện Trạng Ngành F&B và Nhu Cầu Chuyển Đổi Số tại Việt Nam

Trong những năm gần đây, ngành dịch vụ ăn uống (F&B - Food & Beverage) tại Việt Nam phát triển mạnh mẽ cả về quy mô lẫn hình thức kinh doanh. Cà phê, đồ uống và ẩm thực nhanh đã trở thành một phần không thể thiếu trong đời sống người dân, đặc biệt tại các thành phố lớn. Bên cạnh các thương hiệu chuỗi nổi tiếng, nhiều quán ăn, nhà hàng và quán cà phê quy mô nhỏ và vừa cũng liên tục ra đời nhằm đáp ứng nhu cầu thưởng thức và trải nghiệm đa dạng của khách hàng.

Sự thay đổi trong thói quen tiêu dùng đã thúc đẩy quá trình chuyển đổi số trong ngành F&B. Người tiêu dùng hiện nay có xu hướng tìm kiếm sự tiện lợi, nhanh chóng và minh bạch trong quá trình gọi món, thanh toán và nhận dịch vụ. Các nhà hàng không chỉ cần phục vụ món ăn ngon, mà còn phải đảm bảo quy trình vận hành chuyên nghiệp và trải nghiệm khách hàng mượt mà. Chính vì vậy, việc áp dụng các giải pháp công nghệ thông tin trong quản lý hoạt động và phục vụ khách hàng trở thành xu hướng tất yếu.

Tuy nhiên, thực tế cho thấy nhiều cơ sở kinh doanh F&B quy mô nhỏ và vừa vẫn còn duy trì mô hình quản lý thủ công, như:
- Ghi order bằng giấy, tính tiền bằng máy tính cầm tay
- Trao đổi thông tin giữa nhân viên phục vụ và bếp qua lời nói
- Không có sự đồng bộ dữ liệu giữa các bộ phận (phục vụ, bếp, thanh toán)

Cách làm này tuy đơn giản nhưng dễ dẫn đến sai sót, nhầm lẫn và thiếu sự phối hợp giữa các bộ phận. Khi lượng khách hàng tăng cao, việc phục vụ chậm trễ hoặc ghi nhận sai đơn hàng thường xuyên xảy ra, ảnh hưởng trực tiếp đến trải nghiệm của khách hàng và hiệu quả hoạt động của quán.

Bên cạnh đó, việc phụ thuộc vào các nền tảng trung gian như ứng dụng giao đồ ăn (GrabFood, ShopeeFood) hay kênh bán hàng bên thứ ba cũng khiến nhiều cửa hàng gặp khó khăn. Dù giúp tiếp cận khách hàng nhanh hơn, nhưng những nền tảng này thường yêu cầu mức phí cao (20-30% trên mỗi đơn) và không cho phép cửa hàng chủ động quản lý dữ liệu khách hàng hay triển khai chương trình chăm sóc riêng.

Từ thực tế đó, nhu cầu về một giải pháp công nghệ độc lập, chi phí hợp lý và dễ sử dụng trở nên rõ ràng. Một hệ thống cho phép quản lý toàn diện gọi món, bếp, thu ngân và thanh toán ngay tại bàn - tích hợp realtime - sẽ giúp các nhà hàng, quán ăn quy mô nhỏ và vừa tự động hóa quy trình phục vụ, giảm sai sót, nâng cao trải nghiệm khách hàng và tối ưu hiệu quả kinh doanh.

### 1.1.2. Giới Thiệu Đề Tài

Đề tài **"Xây dựng ứng dụng gọi món và thanh toán tại bàn – TableFlow"** được lựa chọn nhằm phát triển một giải pháp công nghệ toàn diện hỗ trợ các nhà hàng, quán ăn, quán cà phê quản lý toàn bộ hoạt động gọi món, phục vụ, bếp, và thanh toán trong cùng một hệ thống duy nhất.

**Ứng dụng được thiết kế đa vai trò, bao gồm bốn nhóm người dùng chính:**

- **Nhân viên phục vụ (Staff)**: Gọi món, tạo đơn hàng, theo dõi tiến độ chế biến, gửi yêu cầu thanh toán
- **Bộ phận Bếp (Kitchen)**: Nhận và cập nhật tình trạng món ăn theo thời gian thực qua hệ thống Kitchen Display System (KDS)
- **Thu ngân (Cashier)**: Quản lý hóa đơn, xác nhận thanh toán, hỗ trợ nhiều phương thức thanh toán, in biên lai
- **Quản lý (Admin)**: Giám sát hoạt động tổng thể, quản lý người dùng, sản phẩm, báo cáo doanh thu và lợi nhuận

**Công nghệ sử dụng:**

- **Frontend**: React Native + Expo + TypeScript (phát triển ứng dụng cross-platform cho iOS/Android)
- **Backend**: Supabase (PostgreSQL + Realtime + Authentication + Storage)
- **Thanh toán**: Tích hợp MoMo QR Code và VietQR cho phép khách hàng thanh toán trực tiếp tại bàn
- **Styling**: NativeWind (Tailwind CSS) cho giao diện modern và responsive

---

## 1.2. ƯU ĐIỂM VÀ HẠN CHẾ CỦA CÁC GIẢI PHÁP HIỆN NAY

### 1.2.1. Ưu Điểm của Các Giải Pháp Hiện Có

Hiện nay, trên thị trường có một số hướng tiếp cận phổ biến để quản lý nhà hàng:

**A. Các nền tảng giao hàng bên thứ ba** (GrabFood, ShopeeFood, Baemin):
- Tiếp cận nhanh với lượng người dùng lớn
- Có sẵn hệ thống giao hàng và thanh toán tích hợp
- Dễ dàng triển khai mà không cần đội kỹ thuật riêng

**B. Hệ thống riêng của các chuỗi lớn** (The Coffee House, Highlands Coffee, Phúc Long):
- Có ứng dụng di động hoặc website riêng, thiết kế mang dấu ấn thương hiệu
- Quản lý đồng bộ toàn diện giữa đặt món, thanh toán, và quản lý khách hàng
- Tự chủ hoàn toàn trong việc thu thập dữ liệu khách hàng và phát triển hệ sinh thái khách hàng thân thiết

**C. Các nền tảng quản lý F&B nội địa** (PosApp, CukCuk, KiotViet, Haravan):
- Cung cấp giải pháp quản lý bán hàng toàn diện: hóa đơn, tồn kho, báo cáo doanh thu
- Hỗ trợ nhiều mô hình F&B khác nhau
- Có khả năng tùy chỉnh giao diện và tính năng ở mức cơ bản

### 1.2.2. Hạn Chế và Vấn Đề Tồn Tại

Tuy nhiên, các giải pháp hiện tại vẫn tồn tại nhiều bất cập đối với quán ăn, quán cà phê quy mô nhỏ và vừa:

1. **Chi phí triển khai cao**: Phần mềm chuyên nghiệp hoặc nền tảng thương mại tính phí hàng tháng hoặc theo hoa hồng (20-30% trên mỗi đơn hàng), không khả thi cho quán nhỏ

2. **Phụ thuộc vào bên thứ ba**: Không kiểm soát được dữ liệu khách hàng, bị ràng buộc bởi chính sách và giá cước của nền tảng

3. **Thiếu tính linh hoạt**: Không thể điều chỉnh giao diện hoặc quy trình phục vụ theo đặc thù từng quán cụ thể

4. **Thiếu tích hợp realtime**: Dữ liệu giữa nhân viên phục vụ → bếp → thu ngân không đồng bộ tức thời, gây sai lệch, chậm trễ và nhầm lẫn

5. **Không hỗ trợ thanh toán điện tử tại bàn**: Khách hàng vẫn phải chờ nhân viên mang hóa đơn giấy hoặc chuyển tiền thủ công, không mang lại trải nghiệm tiện lợi

Những điểm yếu này cho thấy **khoảng trống thị trường rõ ràng** cho một giải pháp "ứng dụng gọi món và thanh toán tại bàn" — vừa gọn nhẹ và chi phí thấp, vừa đủ tính năng như hệ thống chuyên nghiệp, vừa có khả năng tùy chỉnh cho từng quán.

---

## 1.3. MỤC TIÊU CỦA ĐỀ TÀI

Đề tài hướng đến việc xây dựng một **ứng dụng di động gọi món và thanh toán tại bàn** mang tên **TableFlow**, cung cấp giải pháp toàn diện giúp các nhà hàng, quán ăn, quán cà phê quy mô nhỏ và vừa **chuyển đổi số hiệu quả** trong quy trình phục vụ khách hàng.

Hệ thống được thiết kế nhằm:
- **Tự động hóa** các thao tác và giao tiếp giữa nhân viên phục vụ ↔ bếp ↔ thu ngân
- **Giảm sai sót** trong xử lý đơn hàng thông qua tích hợp realtime
- **Tăng tốc độ phục vụ** bằng cách loại bỏ các thao tác thủ công
- **Nâng cao trải nghiệm khách hàng** qua thanh toán nhanh, chính xác và tiện lợi

Ứng dụng không chỉ hỗ trợ quản lý gọi món và thanh toán, mà còn tích hợp các tính năng giám sát hoạt động, thống kê doanh thu, quản lý người dùng, hướng đến mục tiêu xây dựng một **hệ sinh thái quản lý F&B toàn diện trên thiết bị di động**.

### 1.3.1. Mục Tiêu Tổng Quát

- **Xây dựng ứng dụng di động đa vai trò (multi-role)** bao gồm bốn nhóm người dùng: Nhân viên phục vụ, Bếp, Thu ngân, Quản lý
  
- **Cung cấp quy trình integrated realtime** từ gọi món → chế biến → thanh toán → báo cáo, đảm bảo tất cả các vai trò hoạt động đồng bộ

- **Giúp nhà hàng giảm sai sót**, tăng tốc độ phục vụ, cải thiện hiệu quả vận hành toàn diện

- **Ứng dụng các công nghệ hiện đại** (React Native, TypeScript, Supabase, Realtime) để đảm bảo hiệu suất cao, độ ổn định và khả năng mở rộng linh hoạt

- **Tích hợp thanh toán điện tử hiện đại** (MoMo, VietQR), mang lại trải nghiệm tiện lợi, an toàn cho khách hàng

### 1.3.2. Mục Tiêu Cụ Thể

**A. Xây dựng giao diện người dùng (Frontend) hiện đại và tối ưu trải nghiệm**

- Phát triển ứng dụng trên nền tảng React Native + Expo, cho phép triển khai đa nền tảng (Android/iOS) từ một codebase duy nhất
- Thiết kế giao diện trực quan, thân thiện với người dùng nhờ sử dụng NativeWind (Tailwind CSS) với utility-first approach
- Tối ưu hiển thị trên các thiết bị di động khác nhau, đảm bảo tốc độ phản hồi nhanh trong môi trường áp lực cao của quán
- Đảm bảo quy trình thao tác liền mạch, đơn giản giữa các vai trò – từ gọi món, xác nhận đơn, đến thanh toán và in hóa đơn

**B. Phát triển hệ thống xử lý dữ liệu (Backend) mạnh mẽ và tích hợp realtime**

- Sử dụng Supabase làm nền tảng backend toàn diện, tích hợp các dịch vụ:
  - **Realtime Database**: Đồng bộ trạng thái đơn hàng, thông báo giữa các vai trò ngay lập tức
  - **Authentication**: Xác thực người dùng an toàn, phân quyền theo vai trò (RBAC - Role-Based Access Control)
  - **PostgreSQL Storage**: Lưu trữ dữ liệu đáng tin cậy với tính toàn vẹn cao
  - **Edge Functions**: Xử lý logic phức tạp liên quan đến thanh toán, thông báo, webhook từ bên thứ ba
  
- Xây dựng các API RESTful tự động từ Supabase cho giao tiếp hiệu quả giữa client và server
  
- Đảm bảo tính bảo mật (encryption, RLS), ổn định (transaction handling) và khả năng mở rộng linh hoạt

**C. Hoàn thiện các chức năng cốt lõi cho từng vai trò**

*Đối với Nhân viên phục vụ:*
- Chọn bàn, xem menu đầy đủ, tạo đơn hàng, tùy chỉnh sản phẩm
- Gửi order đến bếp theo thời gian thực
- Nhận thông báo khi món đã sẵn sàng, gửi yêu cầu thanh toán

*Đối với Bếp:*
- Nhận đơn hàng mới ngay khi nhân viên gửi (Kitchen Display System)
- Cập nhật trạng thái món (Đang chế biến / Hoàn thành)
- Gửi thông báo ngược lại cho nhân viên khi món sẵn sàng

*Đối với Thu ngân:*
- Nhận thông tin bàn cần thanh toán, hiển thị chi tiết đơn hàng
- Xử lý nhiều phương thức thanh toán (Tiền mặt, Chuyển khoản, MoMo, VietQR)
- In biên lai, xác nhận hoàn tất giao dịch
- Xem thống kê doanh thu theo thời gian thực

*Đối với Quản lý:*
- Giám sát hoạt động quán theo thời gian thực
- Quản lý người dùng và phân quyền theo vai trò
- Quản lý menu, giá sản phẩm và cấu hình hệ thống
- Xem báo cáo doanh thu, lợi nhuận, chi phí, tồn kho chi tiết

**D. Tích hợp hệ thống thông báo theo vai trò (Role-based Notification System)**

- Xây dựng cơ chế thông báo realtime giữa các vai trò, đảm bảo thông tin truyền tải kịp thời
- Mỗi vai trò chỉ nhận thông báo phù hợp (ví dụ: Bếp chỉ nhận thông báo từ nhân viên, không nhận từ thu ngân)
- Tích hợp âm thanh, rung, popup nhằm đảm bảo thông báo được chú ý

**E. Tích hợp thanh toán điện tử an toàn và nhanh chóng**

- Tích hợp MoMo API và VietQR cho phép thanh toán tại bàn bằng quét mã QR
- Hệ thống tự động xác nhận giao dịch thành công thông qua Supabase Realtime Listener
- Tự động cập nhật trạng thái hóa đơn và điều hướng đến trang in biên lai sau khi thanh toán hoàn tất

---

## 1.4. PHẠM VI CÔNG NGHỆ

Để đảm bảo tính khả thi trong khuôn khổ đồ án, hệ thống được giới hạn trong phạm vi chức năng, công nghệ và đối tượng cụ thể như sau:

### 1.4.1. Phạm Vi Chức Năng

Ứng dụng TableFlow bao gồm bốn nhóm vai trò chính và các chức năng tương ứng:

**A. Nhân viên phục vụ (Staff)**
- Xem sơ đồ bàn và chọn bàn phục vụ
- Duyệt menu, tìm kiếm, lọc sản phẩm
- Tạo đơn hàng, tùy chỉnh sản phẩm
- Gửi order đến bếp theo thời gian thực
- Theo dõi tiến độ chế biến
- Gửi yêu cầu thanh toán

**B. Bếp (Kitchen Display System – KDS)**
- Nhận đơn hàng mới từ nhân viên theo thời gian thực
- Xem chi tiết đơn hàng trên màn hình KDS
- Cập nhật trạng thái món (Đang chế biến, Hoàn thành)
- Gửi thông báo cho nhân viên phục vụ khi món sẵn sàng

**C. Thu ngân (Cashier)**
- Nhận danh sách bàn cần thanh toán
- Xem chi tiết đơn hàng và tính toán tổng tiền
- Xử lý thanh toán qua nhiều phương thức (Tiền mặt, Chuyển khoản, MoMo, VietQR)
- In hóa đơn, biên lai
- Xem thống kê doanh thu theo ngày/tuần/tháng

**D. Quản lý (Admin)**
- Xem thống kê doanh thu, lợi nhuận, chi phí toàn quán
- Quản lý người dùng (thêm, sửa, xóa, phân quyền)
- Quản lý menu (thêm sản phẩm, cập nhật giá, ảnh)
- Quản lý danh sách bàn
- Cấu hình hệ thống

### 1.4.2. Phạm Vi Công Nghệ

**1. Nền tảng phát triển**
- **Công nghệ**: React Native kết hợp Expo
- **Chức năng chính**: Phát triển ứng dụng di động đa nền tảng (Android + iOS) từ một mã nguồn duy nhất, giúp tiết kiệm thời gian triển khai và dễ dàng kiểm thử trên nhiều thiết bị

**2. Ngôn ngữ lập trình**
- **Công nghệ**: TypeScript
- **Chức năng chính**: Cung cấp kiểm tra kiểu dữ liệu tĩnh (type-checking), giúp phát hiện lỗi sớm, tăng hiệu suất phát triển và đảm bảo tính ổn định

**3. Hệ thống Backend**
- **Công nghệ**: Supabase (PostgreSQL + Realtime + Auth + Storage + Edge Functions)
- **Chức năng chính**:
  - Quản lý cơ sở dữ liệu quan hệ (PostgreSQL)
  - Xác thực và phân quyền người dùng (RBAC)
  - Tích hợp realtime giữa các vai trò
  - Lưu trữ hình ảnh và tệp tin
  - Cung cấp API RESTful tự động
  - Xử lý logic phức tạp via Edge Functions

**4. Styling & Giao diện**
- **Công nghệ**: NativeWind (Tailwind CSS)
- **Chức năng chính**:
  - Sử dụng utility-first CSS cho phát triển nhanh
  - Đảm bảo giao diện thống nhất, hiện đại
  - Hỗ trợ responsive design trên nhiều kích thước màn hình
  - Dễ tùy chỉnh theme và styling

**5. Điều hướng & Navigation**
- **Công nghệ**: React Navigation
- **Chức năng chính**:
  - Quản lý navigation giữa các màn hình
  - Hỗ trợ Stack, Tab, Drawer navigation
  - Deep linking support

**6. Quản lý State**
- **Công nghệ**: Zustand, Redux Toolkit (tùy mức độ phức tạp)
- **Chức năng chính**: Quản lý global state (user, cart, orders) hiệu quả

**7. Animation & Performance**
- **Công nghệ**: React Native Reanimated
- **Chức năng chính**: Animation 60fps mượt mà, không drop frame

**8. Thông báo**
- **Công nghệ**: React Native Toast Message, Sound alerts (expo-av)
- **Chức năng chính**: Hiển thị feedback cho người dùng, phát âm thanh cảnh báo

**9. Lưu trữ Local**
- **Công nghệ**: Async Storage + MMKV
- **Chức năng chính**: Lưu persistent data, cache nhanh cho offline mode

**10. Thanh toán điện tử**
- **Công nghệ**: MoMo API, VietQR
- **Chức năng chính**:
  - Tạo QR code thanh toán
  - Xác nhận giao dịch thông qua webhook
  - Cập nhật realtime trạng thái thanh toán

**11. Công cụ phát triển**
- **Visual Studio Code**: Môi trường soạn thảo mã nguồn nhẹ, hỗ trợ mở rộng, gỡ lỗi hiệu quả
- **GitHub**: Quản lý mã nguồn, theo dõi phiên bản, hỗ trợ làm việc nhóm, đảm bảo quy trình phát triển minh bạch và an toàn

**12. Kiểm thử & Triển khai**
- **Expo Go**: Chạy và kiểm thử ứng dụng trực tiếp trên thiết bị thật mà không cần build phức tạp
- **Android Studio**: Giả lập thiết bị, kiểm thử sâu, tạo bản build APK phục vụ triển khai chính thức
- **EAS Build** (Expo Application Services): Build cloud-based cho iOS/Android

### 1.4.3. Đối Tượng Sử Dụng

Ứng dụng TableFlow hướng đến ba nhóm người dùng chính:

**1. Nhân viên nhà hàng (Operations Staff)**
- Bao gồm: Nhân viên phục vụ, Bếp, Thu ngân
- Những người trực tiếp sử dụng hệ thống trong quá trình vận hành quán hàng ngày

**2. Chủ quán / Quản lý (Management)**
- Có quyền truy cập toàn bộ dữ liệu, chức năng quản lý
- Giám sát hoạt động, thống kê doanh thu, cấu hình hệ thống

**3. Nhà phát triển / IT Support** (ngoài phạm vi UI, nhưng cần cho deployment và maintenance)
- Đảm bảo ứng dụng hoạt động ổn định
- Hỗ trợ kỹ thuật cho người dùng

---

## LIÊN KẾT VỚI CHƯƠNG 2

Chương 1 đã đặt nền tảng về **nhu cầu, mục tiêu và phạm vi công nghệ** của ứng dụng. **Chương 2** sẽ đi sâu vào:

- **Cơ sở lý thuyết**: Kiến trúc ứng dụng (Frontend, Backend, Database)
- **Chi tiết công nghệ**: Cách React Native + Expo + Supabase hoạt động
- **Quy trình realtime**: Cách dữ liệu đồng bộ tức thời giữa các vai trò
- **Tích hợp thanh toán**: Cơ chế MoMo, VietQR, webhook handling

Các khái niệm được giới thiệu trong Chương 1 (Kitchen Display System, Role-based Notification, Realtime, RBAC) sẽ được giải thích chi tiết và minh họa trong Chương 2.

---

## KẾT LUẬN CHƯƠNG 1

TableFlow được xây dựng với **mục tiêu rõ ràng**: cung cấp giải pháp quản lý nhà hàng toàn diện, chi phí hợp lý, dễ sử dụng và đủ mạnh mẽ cho các quán ăn quy mô nhỏ-vừa. 

Bằng cách tích hợp các công nghệ hiện đại (React Native, Supabase, Realtime, Thanh toán điện tử), ứng dụng không chỉ tự động hóa quy trình phục vụ mà còn nâng cao trải nghiệm khách hàng, giảm sai sót, tăng hiệu quả kinh doanh toàn diện.
