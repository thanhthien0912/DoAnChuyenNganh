# Nền tảng Ví điện tử Sinh viên 💳

## Giới thiệu dự án

Dự án xây dựng một nền tảng ví điện tử toàn diện dành riêng cho sinh viên tại Đại học Công nghệ TP.HCM, bao gồm Ứng dụng di động Flutter và Cổng thông tin Quản trị Web tích hợp.

### Mục tiêu
- Hiện đại hóa trải nghiệm thanh toán cho sinh viên trong khuôn viên trường
- Giảm thiểu sự phụ thuộc vào tiền mặt trong các giao dịch hàng ngày
- Tạo hệ sinh thái thanh toán tiện lợi, an toàn và nhanh chóng
- Cung cấp công cụ quản lý hiệu quả cho nhà trường và các đơn vị kinh doanh

### Các module chính
1. **Ứng dụng Sinh viên (Flutter)**: Ví điện tử, thanh toán NFC, quản lý tài khoản, lịch sử giao dịch
2. **Cổng thông tin Quản trị (Web)**: Dashboard thống kê, quản lý sinh viên, quản lý giao dịch
3. **Backend API**: Xử lý nghiệp vụ, quản lý dữ liệu, tích hợp NFC, bảo mật JWT

## Công nghệ sử dụng

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18
- **Database**: MongoDB v7.5 với Mongoose ODM
- **Authentication**: JWT (jsonwebtoken v9.0)
- **Security**: 
  - Helmet v7.0 (HTTP headers security)
  - Express Rate Limit v6.10 (DDoS protection)
  - bcryptjs v2.4 (Password hashing)
  - CORS v2.8 (Cross-origin resource sharing)
- **Validation**: Joi v17.9 + Express Validator v7.0
- **Documentation**: Swagger UI Express v5.0
- **Logging**: Winston v3.10 + Morgan v1.10
- **File Upload**: Multer v1.4
- **Caching**: Redis v4.6

### Frontend Web
- **Framework**: React v18.2
- **Build Tool**: Vite v4.4
- **UI Framework**: Material-UI v5.14
  - @mui/material (Core components)
  - @mui/icons-material (Icon set)
  - @mui/x-data-grid (Advanced tables)
  - @mui/x-charts (Data visualization)
- **Routing**: React Router DOM v6.15
- **State Management**: React Context API
- **Forms**: React Hook Form v7.45 + Yup v1.3 validation
- **HTTP Client**: Axios v1.4
- **Charts**: Recharts v2.8
- **Notifications**: Notistack v3.0
- **Date Handling**: date-fns v2.30

### Mobile App
- **Platform**: Flutter (Cross-platform - Android & iOS)
- **Language**: Dart
- **Architecture**: Clean Architecture with MVVM pattern
- **State Management**: hooks_riverpod
- **Navigation**: Go Router (Declarative routing)
- **HTTP Client**: Dio (with interceptors)
- **Storage**: Flutter Secure Storage (Token management)
- **NFC**: flutter_nfc_kit (Host Card Emulation)
- **Forms**: Flutter Hooks + Form validation

## Cấu trúc dự án
```
DoAnChuyenNganh/
├── backend/                    # Node.js/Express backend API
│   ├── src/
│   │   ├── config/            # Configuration files (database, jwt, etc.)
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Custom middleware (auth, validation, etc.)
│   │   ├── models/            # Mongoose schemas (User, Wallet, Transaction)
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   ├── validators/        # Input validation schemas
│   │   └── app.js             # Express application entry point
│   ├── config/                # Environment-specific configs
│   ├── logs/                  # Application logs
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── README.md              # Backend documentation
│
├── frontend/                   # React web application (unified student + admin)
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── common/        # Shared components (buttons, forms, etc.)
│   │   │   ├── student/       # Student interface components
│   │   │   └── admin/         # Admin interface components
│   │   ├── contexts/          # React context providers (auth, theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components (routing)
│   │   ├── services/          # API service layer
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Root application component
│   │   └── main.jsx           # Application entry point
│   ├── public/                # Static assets
│   ├── assets/                # Images, fonts, etc.
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Frontend dependencies
│
├── mobile-app/                 # Flutter mobile application
│   ├── nfc_app/               # Main Flutter app
│   │   ├── lib/
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── auth/      # Authentication feature
│   │   │   │   ├── wallet/    # Wallet management
│   │   │   │   ├── transactions/ # Transaction history
│   │   │   │   ├── nfc/       # NFC payment processing
│   │   │   │   └── profile/   # User profile
│   │   │   ├── core/          # Core utilities
│   │   │   │   ├── config/    # App configuration
│   │   │   │   ├── network/   # API client (Dio)
│   │   │   │   ├── storage/   # Secure storage
│   │   │   │   └── providers/ # Riverpod providers
│   │   │   ├── router/        # Go Router navigation
│   │   │   └── main.dart      # App entry point
│   │   ├── android/           # Android-specific code
│   │   ├── ios/               # iOS-specific code
│   │   ├── windows/           # Windows-specific code (NFC support)
│   │   ├── pubspec.yaml       # Flutter dependencies
│   │   └── README.md          # Mobile app documentation
│   ├── app/                   # Legacy Android native (being migrated)
│   └── scripts/               # Build and deployment scripts
│
└── README.md                   # This file
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js**: v18.0.0 trở lên
- **MongoDB**: v7.0 trở lên (hoặc MongoDB Atlas)
- **Flutter SDK**: v3.0 trở lên (cho phát triển mobile)
- **Git**: Latest version
- **Redis**: v4.0 trở lên (optional, cho caching)

### Backend setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình các biến môi trường trong .env:
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret key cho JWT
# - JWT_EXPIRE: Token expiration time
# - PORT: Server port (default: 5000)

# Khởi chạy MongoDB (nếu local)
# mongod

# Setup database và seed data (optional)
node setup-database.js

# Chạy development server
npm run dev

# Server sẽ chạy tại http://localhost:5000
# API Documentation: http://localhost:5000/api-docs
```

### Frontend setup

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ template (nếu cần)
# VITE_API_URL=http://localhost:5000/api

# Chạy development server
npm run dev

# Application sẽ chạy tại http://localhost:5173
```

### Mobile App setup (Flutter)

```bash
# Di chuyển vào thư mục nfc_app
cd mobile-app/nfc_app

# Kiểm tra Flutter environment
flutter doctor

# Cài đặt dependencies
flutter pub get

# Cấu hình API endpoint trong lib/core/config/app_config.dart

# Chạy app trên emulator hoặc device
flutter run
flutter run --dart-define=API_BASE_URL=http://192.168.1.91:3000/api
# Theo IP thực
# Build APK cho Android
flutter build apk

# Build iOS app (chỉ trên macOS)
flutter build ios
```

### Scripts có sẵn

#### Backend
```bash
npm start          # Chạy production server
npm run dev        # Chạy development server với nodemon
npm test           # Chạy unit tests
npm run test:watch # Chạy tests ở watch mode
npm run lint       # Kiểm tra code style
npm run lint:fix   # Tự động fix code style issues
```

#### Frontend
```bash
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview production build
npm run lint       # Kiểm tra code style
npm run lint:fix   # Tự động fix code style issues
```

#### Mobile (Flutter)
```bash
flutter run                # Chạy app
flutter build apk          # Build Android APK
flutter build ios          # Build iOS app
flutter test               # Chạy tests
flutter analyze            # Analyze code
flutter clean              # Clean build artifacts
```

## Tính năng chính

### Ứng dụng Sinh viên (Mobile - Flutter)

#### Xác thực và Bảo mật
- ✅ Đăng ký tài khoản với email sinh viên
- ✅ Đăng nhập với JWT authentication
- ✅ Auto-refresh state khi switch user (fix stale data)
- 🔄 Xác thực sinh trắc học (Face ID, Fingerprint)
- 🔄 Quên mật khẩu và reset qua email

#### Quản lý Ví
- ✅ Xem số dư ví thời gian thực
- ✅ Home dashboard với thông tin tổng quan
- 🔄 **Đã chi hôm nay/tháng này** - Hiển thị tổng chi tiêu đã cộng dồn đúng
- 🔄 Lịch sử giao dịch chi tiết với bộ lọc
- 🔄 **Không có chức năng nạp tiền/thanh toán** trên web (chỉ xem thông tin)

#### Ghi thẻ NFC (NEW - ✅ Hoàn thành)
- ✅ **Tự động ghi thẻ sinh viên** không cần admin
- ✅ Generate dữ liệu thẻ với HMAC-SHA256 signature
- ✅ Ghi NDEF record lên thẻ NFC
- ✅ Auto-link thẻ với tài khoản sau khi ghi
- ✅ Bảo mật: Signature verification để chống giả mạo
- ✅ UI: Tự động load thông tin, button to rõ ràng

#### Thanh toán NFC
- 🔄 Thanh toán không tiếp xúc tại các điểm bán hàng
- 🔄 Xác nhận giao dịch với PIN/sinh trắc học
- 🔄 Nhận thông báo giao dịch ngay lập tức
- 🔄 Hỗ trợ Windows NFC (testing)

#### Quản lý Thông tin
- ✅ Xem và cập nhật thông tin cá nhân
- ✅ Profile screen với navigation đến Write Card
- 🔄 Thay đổi mật khẩu
- 🔄 Cài đặt thông báo
- 🔄 Quản lý thiết bị đăng nhập

### Cổng Quản trị (Web - React)

#### Dashboard Thống kê
- ✅ **Giao diện hiện đại** với gradient backgrounds và hover effects
- ✅ Tổng quan người dùng, giao dịch hôm nay, doanh thu
- ✅ **Doanh thu tháng này** - Tính toán tự động dựa trên doanh thu trung bình
- ✅ **Thống kê giao dịch hôm nay** - Phân loại thanh toán/nạp tiền với progress bars
- ✅ **Phân loại giao dịch** - Visual breakdown với colors và percentages
- 🔄 Biểu đồ xu hướng theo thời gian
- 🔄 Top sinh viên giao dịch nhiều nhất
- 🔄 Thống kê theo danh mục

#### Quản lý Sinh viên
- ✅ Danh sách sinh viên với tìm kiếm và lọc
- ✅ Thêm, sửa tài khoản sinh viên
- ✅ **Xóa người dùng** (hard delete với cascade: Wallet, Transaction, TopupRequest, Token)
- 🔄 Xem chi tiết ví và lịch sử giao dịch
- 🔄 Khóa/mở khóa tài khoản
- 🔄 Reset mật khẩu

#### Quản lý Giao dịch
- ✅ Xem toàn bộ lịch sử giao dịch
- 🔄 Lọc theo loại, trạng thái, thời gian
- 🔄 Xuất báo cáo Excel/PDF
- 🔄 Xử lý hoàn tiền (refund)
- 🔄 Phát hiện giao dịch bất thường

#### Quản lý Hệ thống
- 🔄 Cấu hình giới hạn giao dịch
- 🔄 Quản lý người dùng admin
- 🔄 Xem logs hệ thống
- 🔄 Backup và restore dữ liệu

### Backend API

#### RESTful Endpoints
- ✅ `/api/auth/*` - Authentication (login, register, refresh token)
- ✅ `/api/wallet/*` - Wallet management (balance, limits, topup)
- ✅ `/api/transactions/*` - Transaction processing (payment, history, stats)
- ✅ `/api/cards/*` - Card management (register, update, delete)
  - ✅ `GET /api/cards/generate-write-data` - Generate card write data với signature
  - ✅ `POST /api/cards` - Link card to user account
- ✅ `/api/admin/*` - Admin operations (user management, topup approval)
  - ✅ `DELETE /api/admin/users/:id` - Hard delete user với cascade
- 🔄 `/api/users/*` - User management (profile, settings)

#### Security Features
- ✅ JWT-based authentication với refresh tokens
- ✅ Role-based access control (student, admin, manager)
- ✅ Password hashing với bcrypt
- ✅ Rate limiting để chống DDoS
- ✅ Helmet middleware cho HTTP security
- ✅ Input validation và sanitization
- ✅ **HMAC-SHA256 signature** cho NFC card security
- ✅ **CORS configuration** hỗ trợ mobile development
- ✅ Request logging với Winston
- 🔄 Advanced fraud detection

#### Database Models
- ✅ User: Thông tin người dùng với role-based authentication
- ✅ Wallet: Số dư và giới hạn chi tiêu
- ✅ Transaction: Lịch sử giao dịch với metadata đầy đủ
- ✅ Card: Thông tin thẻ NFC
- 🔄 Merchant: Thông tin điểm bán hàng
- 🔄 Category: Danh mục giao dịch

**Recent Updates (10/11/2025):**
- ✅ Daily/Monthly Spent Fix - Logic cộng dồn chi tiêu hoạt động đúng
- ✅ Student Interface Simplification - Xóa chức năng nạp tiền/thanh toán web sinh viên
- ✅ Admin Dashboard Enhancement - Giao diện đẹp với gradients, thêm doanh thu tháng
- ✅ UI/UX Improvements - Xóa giới hạn hiển thị, hiện số tiền cụ thể
- ✅ Previous Updates (05/11/2025) - NFC Card Write, State Management, User Hard Delete, CORS

**Chú thích:**
- ✅ = Đã hoàn thành
- 🔄 = Đang phát triển
- ⏳ = Chưa bắt đầu

## Kiến trúc hệ thống

### Backend Architecture
```
┌─────────────────────────────────────────────────────┐
│                  Express.js Server                  │
├─────────────────────────────────────────────────────┤
│  Middleware Layer (Auth, Validation, Error Handle)  │
├─────────────────────────────────────────────────────┤
│              Routes → Controllers                   │
├─────────────────────────────────────────────────────┤
│                   Services Layer                     │
│         (Business Logic & Processing)                │
├─────────────────────────────────────────────────────┤
│              Repositories Layer                      │
│            (Data Access & Queries)                   │
├─────────────────────────────────────────────────────┤
│               MongoDB (Mongoose)                     │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture (React)
```
┌─────────────────────────────────────────────────────┐
│                React Components                      │
│         (Student Pages + Admin Pages)                │
├─────────────────────────────────────────────────────┤
│          Context API (Auth, Theme)                   │
├─────────────────────────────────────────────────────┤
│         React Router (Protected Routes)              │
├─────────────────────────────────────────────────────┤
│         API Service Layer (Axios)                    │
├─────────────────────────────────────────────────────┤
│              Backend REST API                        │
└─────────────────────────────────────────────────────┘
```

### Mobile Architecture (Flutter)
```
┌─────────────────────────────────────────────────────┐
│            UI Layer (Flutter Widgets)                │
├─────────────────────────────────────────────────────┤
│         Riverpod State Management                    │
├─────────────────────────────────────────────────────┤
│              Feature Modules                         │
│   (Auth, Wallet, Transactions, NFC, Profile)         │
├─────────────────────────────────────────────────────┤
│         Core Services (Network, Storage)             │
├─────────────────────────────────────────────────────┤
│         Repositories & Data Sources                  │
├─────────────────────────────────────────────────────┤
│          Backend REST API + NFC HCE                  │
└─────────────────────────────────────────────────────┘
```

## API Documentation

API documentation được tự động sinh bằng Swagger và có thể truy cập tại:
```
http://localhost:3000/api-docs
```

### Key API Guides
- **NFC_CARD_WRITE_GUIDE.md** - Hướng dẫn chi tiết về tính năng ghi thẻ NFC
- **MOBILE_DEBUG_GUIDE.md** - Debug guide cho mobile app development
- **STATE_MANAGEMENT_FIX.md** - Technical documentation về state management fixes

## Quy trình phát triển

### Memory Bank System
Dự án sử dụng hệ thống "Memory Bank" để quản lý kiến thức và tiến độ:
- **`projectbrief.md`**: Phạm vi và yêu cầu dự án
- **`productContext.md`**: Bối cảnh sản phẩm và vấn đề cần giải quyết
- **`systemPatterns.md`**: Kiến trúc hệ thống và design patterns
- **`techContext.md`**: Công nghệ, công cụ và thiết lập
- **`progress.md`**: Tiến độ dự án và roadmap
- **`current-state.md`**: Trạng thái hiện tại của hệ thống
- **`project-rules.md`**: Quy tắc và conventions phát triển

### Development Workflow
1. **Plan Mode**: Đọc Memory Bank, phân tích yêu cầu, xây dựng chiến lược
2. **Act Mode**: Triển khai tính năng theo plan, cập nhật documentation
3. **Review Mode**: Testing, code review, cập nhật progress tracking
4. **Deploy Mode**: Build, test, deploy lên production

### Git Workflow
```bash
# Tạo branch mới cho feature
git checkout -b feature/ten-tinh-nang

# Commit changes với message rõ ràng
git commit -m "feat: Thêm tính năng thanh toán NFC"

# Push lên remote
git push origin feature/ten-tinh-nang

# Tạo Pull Request để review
```

### Coding Standards
- **Backend**: Follow Express.js best practices, sử dụng ESLint
- **Frontend**: Follow React best practices, sử dụng ESLint + Prettier
- **Mobile**: Follow Flutter/Dart style guide
- **Commits**: Sử dụng Conventional Commits format
- **Testing**: Viết unit tests cho business logic
