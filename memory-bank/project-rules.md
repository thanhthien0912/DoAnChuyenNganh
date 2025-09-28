# Project Rules: Nền tảng Ví điện tử Sinh viên

## Tổng quan
Tài liệu này phác thảo các quy tắc, tiêu chuẩn phát triển và quy trình làm việc cho dự án "Nền tảng Ví điện tử Sinh viên". Hệ thống quy tắc này đảm bảo các hoạt động phát triển được diễn ra một cách nhất quán, chất lượng và hiệu quả, đồng thời định nghĩa các mục tiêu, chức năng và công nghệ bắt buộc phải tuân thủ.

## Cấu trúc "Memory Bank"
Dự án sẽ triển khai một hệ thống "Memory Bank" (Ngân hàng bộ nhớ) toàn diện, đóng vai trò là nền tảng kiến thức cho mọi hoạt động phát triển:
memory-bank/
├── projectbrief.md      # Tài liệu nền tảng - phạm vi và yêu cầu dự án
├── productContext.md    # Bối cảnh sản phẩm, vấn đề cần giải quyết
├── activeContext.md     # Công việc đang tập trung và các thay đổi gần đây
├── systemPatterns.md    # Kiến trúc hệ thống và các mẫu thiết kế
├── techContext.md       # Công nghệ, thiết lập, và các ràng buộc
├── progress.md          # Những gì đã hoạt động, những gì còn lại cần xây dựng
└── project-rules.md     # Chính là tệp này - tài liệu về các quy tắc dự án

## Quy trình Phát triển (Development Workflows)

### Quy trình Lập kế hoạch (Plan Mode)
Khi bắt đầu một công việc phát triển mới:
1.  **Đọc Memory Bank**: Xem lại tất cả các tệp trong memory bank để hiểu trạng thái hiện tại.
2.  **Xác minh Bối cảnh**: Đảm bảo tất cả các tệp đều đầy đủ và được cập nhật.
3.  **Xây dựng Chiến lược**: Tạo ra phương pháp tiếp cận dựa trên bối cảnh hiện tại.
4.  **Trình bày Phương pháp**: Ghi lại chiến lược vào công cụ chat hoặc quản lý dự án.

### Quy trình Thực thi (Act Mode)
Khi triển khai các tính năng:
1.  **Kiểm tra Memory Bank**: Xem lại tài liệu hiện có liên quan đến tác vụ.
2.  **Cập nhật Tài liệu**: Giữ cho memory bank luôn được cập nhật song song với quá trình code.
3.  **Thực thi Tác vụ**: Triển khai tính năng theo các tiêu chuẩn đã được ghi lại.
4.  **Ghi lại Thay đổi**: Cập nhật memory bank với kết quả và các thay đổi đã thực hiện.

## Mục Tiêu & Mục Đích Dự Án
* **Mục tiêu (Goal):** Xây dựng thành công một nền tảng số hóa hợp nhất bao gồm Ứng dụng di động cho Sinh viên và Cổng thông tin Quản trị Web.
* **Mục đích (Purpose):** Hiện đại hóa trải nghiệm sinh viên bằng cách giải quyết các bất tiện trong thanh toán hàng ngày, tạo ra một hệ sinh thái tiện lợi và không dùng tiền mặt.

## Tiêu Chuẩn Phát Triển

### Tiêu chuẩn Chất lượng Mã nguồn
* **Node.js (Backend)**: Tuân thủ quy tắc của ESLint/Prettier để đảm bảo code sạch và nhất quán. Sử dụng cấu trúc thư mục MVC (Models, Views, Controllers) hoặc tương tự.
* **Kotlin (Android)**: Tuân thủ theo hướng dẫn về phong cách code chính thức của Kotlin. Sử dụng các thành phần kiến trúc Android (ViewModel, LiveData, Coroutines).
* **React (Frontend)**: Ưu tiên sử dụng Functional Components và Hooks. Chia nhỏ components để dễ tái sử dụng.
* **Database (MongoDB)**: Thiết kế schema rõ ràng, sử dụng Mongoose (hoặc ODM tương tự) để định nghĩa models.

### Tiêu chuẩn Xử lý Lỗi
* **API Response**: Định nghĩa cấu trúc phản hồi JSON nhất quán cho các trường hợp thành công và thất bại.
* **Client-Side**: Cung cấp phản hồi xác thực (validation feedback) ngay lập tức cho người dùng trên cả web và mobile.

### Tiêu chuẩn Hiệu suất
* **Tối ưu Truy vấn**: Sử dụng indexing trong MongoDB cho các truy vấn thường xuyên để tăng tốc độ.
* **Hoạt động bất đồng bộ**: Tận dụng tối đa bản chất bất đồng bộ của Node.js để tránh chặn I/O.
* **Quản lý State**: Sử dụng các giải pháp quản lý state hiệu quả trong React (Context API, Redux) để tránh re-render không cần thiết.

## Tích hợp với Dự án Nền tảng Ví điện tử Sinh viên

### Các quy tắc cốt lõi của dự án

#### 1. Quy Tắc về Chức Năng Cốt Lõi (Feature Rules)
* **Module 1: Ứng dụng Sinh viên (Android)**
    * **Ví điện tử**: Phải có chức năng Ví điện tử, cho phép người dùng xem số dư và lịch sử giao dịch.
    * **Thanh toán không tiếp xúc (NFC)**: Phải triển khai tính năng thanh toán bằng công nghệ Host Card Emulation (HCE).
        - Cho phép điện thoại mô phỏng thẻ chip, truyền dữ liệu giao dịch qua NFC tới thiết bị đọc. Đảm bảo bảo mật bằng xác thực backend và token hóa giao dịch.
    * **Quản lý Tài khoản**: Phải cho phép người dùng thực hiện các thao tác cơ bản: đăng nhập, đăng ký, xem thông tin cá nhân.
* **Module 2: Cổng thông tin Quản trị (Web)**
    * **Dashboard**: Phải cung cấp trang dashboard để Quản trị viên theo dõi các số liệu thống kê chính (tổng giao dịch, doanh thu...).
    * **Quản lý Sinh viên**: Phải có đầy đủ các chức năng CRUD (Thêm, Xem, Sửa, Xóa) để quản lý tài khoản sinh viên.
    * **Lịch sử Giao dịch**: Phải cho phép xem và lọc lịch sử của tất cả các giao dịch trong hệ thống.

#### 2. Quy Tắc về Công Nghệ Sử Dụng (Technology Rules)
* **Backend**: Node.js và framework Express.js.
* **Cơ sở dữ liệu**: MongoDB.
* **Ứng dụng di động**: Kotlin (Native Android) để đảm bảo hiệu năng và khả năng tương thích tốt nhất với NFC/HCE.
* **Frontend Web**: Thư viện React.js.
* **Giao tiếp**: Toàn bộ giao tiếp giữa client và server phải thông qua RESTful API.

## Lợi Ích của Việc Tích Hợp Quy Tắc
1.  **Nhất quán**: Chuẩn hóa các hoạt động phát triển trong toàn bộ dự án.
2.  **Rõ ràng**: Tài liệu hóa toàn diện kiến thức dự án, giúp thành viên mới dễ dàng tiếp cận.
3.  **Chất lượng**: Thực thi các tiêu chuẩn về chất lượng mã nguồn và bảo mật.
4.  **Hiệu quả**: Hợp lý hóa quy trình làm việc và giảm thiểu các quyết định tùy hứng.
5.  **Khả năng bảo trì**: Các mẫu thiết kế và tài liệu rõ ràng giúp cho việc phát triển trong tương lai dễ dàng hơn.

## Các Cải Tiến trong Tương Lai
* **Kiểm thử Tự động**: Tích hợp các framework kiểm thử (vd: Jest cho Backend/Frontend, Espresso cho Android).
* **CI/CD**: Xây dựng quy trình tích hợp và triển khai liên tục.
* **Giám sát (Monitoring)**: Tích hợp các công cụ giám sát hiệu suất và lỗi.
* **Mở rộng nền tảng**: Lên kế hoạch phát triển ứng dụng cho nền tảng iOS.

---
*Tài liệu này là một phần của hệ thống "Memory Bank" của dự án và cần được cập nhật mỗi khi có sự thay đổi về quy tắc hoặc tiêu chuẩn phát triển.*