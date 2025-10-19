# Project Brief: Nền tảng Ví điện tử Sinh viên

## Tổng quan dự án
Dự án xây dựng một nền tảng ví điện tử toàn diện dành riêng cho sinh viên, bao gồm Ứng dụng di động Android và Cổng thông tin Quản trị Web.

## Phạm vi dự án

### Module 1: Ứng dụng Sinh viên (Android)
- **Ví điện tử**: Quản lý số dư, xem lịch sử giao dịch
- **Thanh toán NFC**: Hỗ trợ thanh toán không tiếp xúc tại cơ sở vật chất
- **Quản lý tài khoản**: Đăng nhập, đăng ký, quản lý thông tin cá nhân

### Module 2: Cổng thông tin Quản trị (Web)
- **Dashboard**: Thống kê tổng quan về giao dịch và doanh thu
- **Quản lý sinh viên**: CRUD toàn diện cho tài khoản sinh viên
- **Lịch sử giao dịch**: Xem và lọc toàn bộ giao dịch hệ thống

## Mục tiêu chính
- Hiện đại hóa trải nghiệm thanh toán cho sinh viên
- Giảm thiểu sự phụ thuộc vào tiền mặt
- Tạo hệ sinh thái thanh toán tiện lợi, an toàn
- Cung cấp công cụ quản lý hiệu quả cho nhà trường

## Người dùng mục tiêu
- **Sinh viên**: Người dùng cuối của ứng dụng di động
- **Quản trị viên**: Nhân viên nhà trường quản lý hệ thống
- **Cơ sở vật chất**: Điểm bán hàng chấp nhận thanh toán

## Yêu cầu kỹ thuật
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Mobile**: Flutter (Cross-platform)
- **Frontend**: React.js + Vite
- **API**: RESTful API với Swagger documentation
- **Bảo mật**: Xác thực JWT, rate limiting, helmet middleware
- **State Management**: React Context API, Riverpod (Flutter)
- **UI Framework**: Material-UI (React), Material Design (Flutter)

## Ràng buộc thời gian
- Phát triển theo từng giai đoạn
- Ưu tiên chức năng thanh toán NFC
- Đảm bảo tính ổn định và bảo mật

## Tiêu chí thành công
- Ứng dụng hoạt động ổn định trên Android
- Thanh toán NFC hoạt động chính xác
- Hệ thống quản lý dễ sử dụng
- Đáp ứng nhu cầu thanh toán thực tế

---
*Cập nhật lần cuối: 27/09/2025*