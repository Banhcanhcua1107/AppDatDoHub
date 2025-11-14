# LỜI MỞ ĐẦU

## 1. LÝ DO CHỌN ĐỀ TÀI

Trong bối cảnh chuyển đổi số và cuộc cách mạng công nghiệp 4.0, ngành dịch vụ ăn uống (F&B - Food & Beverage) đang chứng kiến sự thay đổi sâu sắc trong mô hình quản lý và phương thức phục vụ khách hàng. Việc áp dụng công nghệ thông tin đã trở thành xu hướng tất yếu giúp các nhà hàng, quán ăn, quán cà phê nâng cao hiệu quả hoạt động, giảm thiểu sai sót trong quá trình phục vụ và nâng cao trải nghiệm người dùng [1].

**Nhận thức hiện tại của khách hàng**: Người tiêu dùng ngày nay ưu tiên tính tiện lợi, nhanh chóng và minh bạch trong việc đặt món, thanh toán và theo dõi đơn hàng. Chính vì vậy, việc xây dựng một hệ thống quản lý gọi món thông minh không chỉ giúp tối ưu hóa vận hành mà còn góp phần nâng cao năng lực cạnh tranh cho doanh nghiệp.

**Tình trạng hiện nay**: Tại Việt Nam, phần lớn các cơ sở F&B quy mô vừa và nhỏ vẫn đang duy trì mô hình quản lý truyền thống, phụ thuộc vào việc ghi chép thủ công hoặc trao đổi đơn hàng qua các ứng dụng nhắn tin như Zalo hoặc Messenger. Điều này dẫn đến nhiều hạn chế:

- Dễ xảy ra nhầm lẫn trong ghi nhận đơn hàng
- Khó khăn trong theo dõi tồn kho
- Không có cơ chế quản lý dữ liệu khách hàng hiệu quả
- Thiếu khả năng tổng hợp báo cáo doanh thu tức thời

**Những giải pháp hiện có và nhược điểm**: Việc sử dụng các nền tảng giao hàng bên thứ ba như GrabFood hay ShopeeFood tuy mang lại sự tiện lợi, nhưng lại gia tăng chi phí hoa hồng (20-30% trên mỗi đơn), giảm lợi nhuận và khiến các cửa hàng bị phụ thuộc vào nền tảng bên ngoài, không kiểm soát được dữ liệu khách hàng của riêng mình.

**Động lực của đề tài**: Xuất phát từ thực tế đó, đề tài **"Xây dựng ứng dụng gọi món và thanh toán tại bàn – TableFlow"** được lựa chọn với mục tiêu xây dựng một giải pháp công nghệ toàn diện, giúp các cơ sở F&B quản lý hiệu quả quá trình phục vụ khách hàng ngay tại chỗ.

TableFlow hướng tới việc:
- Hỗ trợ nhân viên phục vụ gọi món nhanh chóng, chính xác
- Giúp bộ phận bếp nhận đơn theo thời gian thực (realtime) qua Kitchen Display System (KDS)
- Hỗ trợ thu ngân trong khâu thanh toán, in hóa đơn với nhiều phương thức thanh toán hiện đại (MoMo, VietQR, tiền mặt)
- Cung cấp cho quản lý công cụ thống kê doanh thu và giám sát hoạt động quán

Hệ thống được thiết kế để vận hành ổn định trong cả môi trường online và offline, đảm bảo hoạt động liên tục ngay cả khi mất kết nối mạng.

**Công nghệ sử dụng**: TableFlow được phát triển dựa trên các công nghệ hiện đại:

- **React Native + Expo**: Khả năng phát triển cross-platform (iOS/Android), tương thích trên nhiều thiết bị di động
- **NativeWind + Tailwind CSS**: Tối ưu hóa giao diện người dùng, kiểu dáng hiện đại và responsive
- **TypeScript**: Tăng độ an toàn về kiểu dữ liệu, giảm lỗi lập trình
- **Supabase**: Backend mạnh mẽ với PostgreSQL, xác thực (Auth), cơ sở dữ liệu, lưu trữ tệp, và hỗ trợ realtime

Việc kết hợp các công nghệ này giúp hệ thống đạt hiệu năng cao, dễ mở rộng và bảo trì.

**Ý nghĩa của đề tài**: Đề tài không chỉ mang ý nghĩa thực tiễn trong việc hiện đại hóa hoạt động quản lý của các cơ sở kinh doanh F&B mà còn là cơ hội giúp sinh viên rèn luyện kỹ năng lập trình, thiết kế hệ thống và triển khai sản phẩm thực tế. Thông qua dự án này, sinh viên có thể kết hợp lý thuyết với kinh nghiệm thực tiễn, góp phần thúc đẩy quá trình chuyển đổi số trong lĩnh vực dịch vụ ăn uống tại Việt Nam.

---

## 2. LỊCH SỬ NGHIÊN CỨU VÀ PHÁT TRIỂN

Trong lĩnh vực công nghệ thông tin ứng dụng cho ngành dịch vụ ăn uống (F&B), nhiều nghiên cứu và giải pháp phần mềm đã được triển khai nhằm tối ưu hóa quy trình phục vụ, quản lý đơn hàng và thanh toán [2], [3].

**Ứng dụng tại các thương hiệu toàn cầu**: Các hệ thống POS (Point of Sale) hiện đại tại những thương hiệu lớn như Starbucks, McDonald's hay KFC đã chứng minh tính hiệu quả trong việc đồng bộ hoạt động giữa nhân viên phục vụ, bộ phận bếp và thu ngân. Nghiên cứu cho thấy có hơn **70% doanh nghiệp F&B trên toàn cầu** đã chuyển sang sử dụng hệ thống tự động hóa quy trình gọi món và quản lý doanh thu nhằm giảm chi phí vận hành và cải thiện tốc độ phục vụ [4].

**Tình hình tại Việt Nam**: Sự phát triển nhanh chóng của ngành F&B cùng với xu hướng tiêu dùng tiện lợi đã thúc đẩy nhiều chuỗi lớn như The Coffee House, Highlands Coffee, Phúc Long và Gong Cha đầu tư xây dựng hệ thống ứng dụng di động riêng để khách hàng có thể:
- Đặt món trước khi đến quán
- Thanh toán nhanh chóng
- Tích điểm thành viên

Những hệ thống này đã mang lại hiệu quả cao trong việc quản lý khách hàng và tăng doanh thu trực tuyến. Tuy nhiên, đối với các quán ăn, nhà hàng hoặc quán cà phê quy mô nhỏ, việc triển khai các hệ thống tương tự gặp nhiều trở ngại:
- Chi phí đầu tư cao
- Yêu cầu kỹ thuật phức tạp
- Khó khăn trong việc duy trì vận hành lâu dài

**Các giải pháp phần mềm hiện có**: Trên thị trường hiện nay, các nền tảng quản lý F&B như PosApp, CukCuk, KiotViet, Haravan cung cấp giải pháp tương đối đầy đủ nhưng vẫn còn nhiều hạn chế trong khâu tích hợp realtime hoặc thanh toán điện tử tại bàn.

**Các đồ án học thuật**: Trong môi trường học thuật, nhiều đề tài nghiên cứu và đồ án sinh viên trong lĩnh vực công nghệ phần mềm đã tập trung vào việc xây dựng các website hoặc hệ thống quản lý bán hàng cho quán cà phê, nhà hàng. Tuy nhiên, hầu hết các dự án này chỉ dừng lại ở các chức năng cơ bản như:
- Đặt món
- Xem danh mục sản phẩm
- Quản lý đơn hàng đơn lẻ

Chưa có nhiều dự án tích hợp đầy đủ các phân hệ cần thiết để hỗ trợ toàn bộ quy trình vận hành thực tế, bao gồm quản lý bàn, bếp (KDS), thanh toán realtime, và báo cáo doanh thu chi tiết.

---

## 3. MỤC ĐÍCH NGHIÊN CỨU, ĐỐI TƯỢNG VÀ PHẠM VI

### 3.1 Mục Đích Nghiên Cứu

Đề tài nhằm đạt các mục tiêu sau:

**A. Mục tiêu chức năng**
- Xây dựng ứng dụng di động gọi món và thanh toán tại bàn, cho phép khách hàng tự chọn món, đặt món và thanh toán trực tiếp ngay trên điện thoại, giảm tải cho nhân viên và nâng cao trải nghiệm khách hàng
- Tự động hóa quy trình phục vụ giữa nhân viên, bếp và thu ngân thông qua hệ thống đồng bộ thời gian thực (real-time)
- Đảm bảo thông tin đơn hàng chính xác, nhanh chóng và giảm sai sót trong khâu phục vụ

**B. Mục tiêu công nghệ**
- Ứng dụng các công nghệ hiện đại như React Native, Supabase, TypeScript để tạo nên hệ thống có hiệu năng cao, dễ mở rộng và thân thiện với người dùng
- Cung cấp khả năng cross-platform (iOS/Android) để tiếp cận rộng rãi

**C. Mục tiêu kinh tế-xã hội**
- Góp phần chuyển đổi số trong lĩnh vực F&B, đặc biệt cho các nhà hàng, quán ăn quy mô nhỏ và vừa muốn tối ưu quy trình vận hành
- Giúp các cơ sở F&B tiết kiệm chi phí nhân lực, tăng doanh thu và cải thiện hiệu quả kinh doanh

### 3.2 Đối Tượng Nghiên Cứu

- **Nhà hàng, quán ăn quy mô vừa và nhỏ** tại Việt Nam, đặc biệt là các mô hình kinh doanh đang muốn triển khai hệ thống gọi món tự động và thanh toán điện tử
- **Khách hàng** sử dụng ứng dụng di động để gọi món, theo dõi trạng thái đơn hàng và thanh toán nhanh chóng
- **Quy trình vận hành** trong nhà hàng, bao gồm: gọi món, xử lý đơn hàng, chế biến, phục vụ, thanh toán và báo cáo doanh thu
- **Nhân viên nhà hàng** (phục vụ, bếp, thu ngân, quản lý) với nhu cầu sử dụng ứng dụng chuyên biệt theo vai trò

### 3.3 Phạm Vi Nghiên Cứu

**Phạm vi chức năng:**
- Gọi món tại bàn (Table Ordering)
- Quản lý menu, giỏ hàng và trạng thái đơn hàng
- Hiển thị bếp (Kitchen Display System – KDS) với đồng bộ realtime
- Quản lý thanh toán đa phương thức (Tiền mặt, Chuyển khoản, MoMo, VietQR)
- Thông báo theo vai trò (nhân viên phục vụ, bếp, thu ngân, quản lý)
- Báo cáo doanh thu cơ bản và thống kê hoạt động

**Phạm vi công nghệ:**
- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Realtime + Authentication + Storage)
- **Thanh toán**: MoMo API và VietQR Integration
- **Công cụ phát triển**: Visual Studio Code, GitHub
- **Styling**: NativeWind (Tailwind CSS)

**Phạm vi địa lý:**
- Hệ thống được thiết kế phù hợp với thị trường Việt Nam
- Hỗ trợ ngôn ngữ tiếng Việt
- Tích hợp các phương thức thanh toán nội địa

**Phạm vi thời gian:**
- Đề tài được thực hiện trong khuôn khổ đồ án tốt nghiệp
- Thời gian từ tháng 08/2024 đến tháng 11/2025

---

## 4. TÓM TẮT CÁC LUẬN ĐIỂM CƠ BẢN VÀ ĐÓNG GÓP MỚI

### 4.1 Luận Điểm Cơ Bản

1. **Chuyển đổi số là xu hướng tất yếu**: Chuyển đổi số trong ngành F&B không phải là lựa chọn mà là xu hướng tất yếu, đặc biệt với các nhà hàng và quán ăn tại Việt Nam trong bối cảnh khách hàng ưu tiên trải nghiệm nhanh, tiện lợi và tự phục vụ.

2. **Vấn đề của quản lý thủ công**: Các nhà hàng quy mô nhỏ và vừa gặp khó khăn trong việc quản lý quy trình gọi món, phục vụ, thanh toán thủ công — dễ dẫn đến sai sót, chậm trễ và giảm hiệu quả vận hành.

3. **Công nghệ di động giải quyết vấn đề**: Việc ứng dụng công nghệ di động và thanh toán điện tử giúp tối ưu hóa quy trình từ đặt món → chế biến → thanh toán, giảm gánh nặng cho nhân viên và tăng sự hài lòng của khách hàng.

4. **Hệ thống đa vai trò là cần thiết**: Một ứng dụng di động đa vai trò (multi-role system) là giải pháp thực tiễn, cho phép nhân viên phục vụ, bếp, thu ngân và quản lý tương tác liền mạch trên cùng một nền tảng.

5. **Công nghệ Stack phù hợp**: Sử dụng React Native, Supabase và TypeScript giúp xây dựng hệ thống hiệu năng cao, cập nhật thời gian thực (real-time), đồng thời tiết kiệm chi phí phát triển và dễ dàng mở rộng.

### 4.2 Đóng Góp Mới

**Về chức năng:**
- ✨ Xây dựng ứng dụng "Gọi món và thanh toán tại bàn" toàn diện, hỗ trợ cả khách hàng và nhân viên nhà hàng trên nền tảng di động (Android/iOS)
- ✨ Tích hợp đầy đủ các quy trình thực tế của một nhà hàng hiện đại: gọi món → chế biến → phục vụ → thanh toán

**Về hệ thống:**
- 🔄 Triển khai Kitchen Display System (KDS) cho phép đồng bộ đơn hàng real-time giữa nhân viên và bếp
- 🔄 Xây dựng hệ thống thông báo phân vai trò (Role-Based Notification System) — đảm bảo thông tin được gửi đúng người, đúng thời điểm
- 🔄 Áp dụng Supabase Realtime để đảm bảo toàn bộ hoạt động diễn ra tức thời, mô phỏng sát môi trường vận hành thực tế

**Về thanh toán:**
- 💳 Triển khai thanh toán điện tử qua MoMo API và VietQR, cho phép khách hàng thanh toán trực tiếp tại bàn
- 💳 Tự động xác nhận giao dịch thông qua webhook và realtime listener (hiếm thấy trong các đồ án sinh viên cùng chủ đề)

**Về giao diện:**
- 🎨 Thiết kế giao diện hiện đại, trực quan, thân thiện, sử dụng NativeWind + Tailwind CSS
- 🎨 Tối ưu cho trải nghiệm thực tế tại quán ăn, giúp nhân viên thao tác nhanh trong môi trường áp lực cao

**Về quản lý:**
- 📊 Cung cấp trang quản lý và báo cáo doanh thu chi tiết
- 📊 Hỗ trợ quản lý nhà hàng theo dõi kết quả hoạt động, thống kê lợi nhuận, chi phí và ra quyết định kinh doanh chính xác hơn

---

## 5. PHƯƠNG PHÁP NGHIÊN CỨU

Đề tài sử dụng các phương pháp nghiên cứu sau để đảm bảo tính khoa học và khả thi:

### 5.1 Phương Pháp Phân Tích Tài Liệu

Thu thập và nghiên cứu các tài liệu liên quan đến:
- Chuyển đổi số trong ngành F&B
- Hệ thống quản lý nhà hàng (POS, KDS, Table Ordering)
- Thanh toán điện tử và các API thanh toán Việt Nam (MoMo, VietQR)

**Nguồn tài liệu:**
- Báo cáo thị trường từ Nielsen, Statista, McKinsey về hành vi tiêu dùng và xu hướng gọi món trực tuyến
- Tài liệu kỹ thuật từ React Native, Supabase, MoMo API, VietQR
- Các bài viết học thuật liên quan đến hệ thống real-time trong dịch vụ ăn uống

**Kết quả:** Xác định xu hướng công nghệ, nhu cầu thực tế, và chuẩn mực thiết kế

### 5.2 Phương Pháp Khảo Sát Thực Tế

Tiến hành khảo sát tại một số nhà hàng, quán ăn, quán cà phê quy mô vừa và nhỏ tại TP.HCM để nắm rõ:
- Quy trình hiện tại của việc gọi món, chuyển món cho bếp, thanh toán
- Những vấn đề thường gặp (sai sót khi ghi order, chậm trễ trong phục vụ, quản lý bàn khó khăn)
- Mong muốn của chủ quán về giải pháp công nghệ

### 5.3 Phương Pháp Phân Tích Hệ Thống

Phân tích các mô hình hệ thống quản lý nhà hàng phổ biến (The Coffee House App, PosApp, CukCuk) nhằm:
- Xác định ưu điểm (giao diện trực quan, đồng bộ real-time)
- Chỉ ra hạn chế (chi phí cao, không phù hợp quán nhỏ, không hỗ trợ vai trò riêng biệt)

### 5.4 Phương Pháp Thiết Kế và Phát Triển Phần Mềm

Áp dụng quy trình phát triển phần mềm theo mô hình **Agile**, bao gồm các giai đoạn:
- **Lập kế hoạch**: Xác định yêu cầu, tính năng
- **Thiết kế**: Sitemap, Wireframe, ERD, Database Schema
- **Phát triển**: Frontend (React Native), Backend (Supabase)
- **Kiểm thử**: Unit testing, integration testing, UAT
- **Triển khai**: Build APK, iOS app

**Công cụ hỗ trợ:** Figma (thiết kế giao diện), Supabase (cơ sở dữ liệu), GitHub (quản lý mã nguồn)

### 5.5 Phương Pháp Thử Nghiệm

**A. Kiểm thử chức năng:**
- Kiểm tra từng module (gọi món, thanh toán, thông báo, quản lý bàn, KDS)
- Đảm bảo hoạt động đúng yêu cầu

**B. Kiểm thử tích hợp:**
- Đảm bảo dữ liệu đồng bộ xuyên suốt giữa người dùng, bếp, thu ngân, quản lý
- Kiểm tra real-time sync

**C. Kiểm thử trải nghiệm người dùng (UAT):**
- Cho nhân viên và chủ quán thử nghiệm thực tế
- Đánh giá độ thân thiện, tốc độ phản hồi, tính tiện dụng

**D. Kiểm thử hiệu năng:**
- Kiểm tra độ trễ (latency) trong xử lý real-time
- Khả năng chịu tải với nhiều đơn hàng đồng thời
- Thử nghiệm offline mode

---

## KẾT LUẬN

TableFlow là một giải pháp toàn diện, được xây dựng dựa trên nhu cầu thực tế của các nhà hàng, quán ăn Việt Nam. Bằng cách tích hợp công nghệ hiện đại (React Native, Supabase, Realtime), ứng dụng không chỉ tự động hóa quy trình phục vụ mà còn nâng cao trải nghiệm khách hàng, giảm sai sót, tăng hiệu quả kinh doanh toàn diện.

---

## TÀI LIỆU THAM KHẢO

[1] "Xu hướng chuyển đổi số trong ngành F&B 2024" - McKinsey & Company  
[2] "Restaurant Management System Overview" - Statista, 2023  
[3] "Real-time Data Processing in Service Industry" - IEEE Xplore, 2023  
[4] "POS System Adoption Rate" - Nielsen Retail Index, 2024  
