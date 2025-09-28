# Nền tảng Ví điện tử Sinh viên

## Giới thiệu dự án

Dự án xây dựng một nền tảng ví điện tử toàn diện dành riêng cho sinh viên, bao gồm Ứng dụng di động Android và Cổng thông tin Quản trị Web.

### Mục tiêu
- Hiện đại hóa trải nghiệm thanh toán cho sinh viên
- Giảm thiểu sự phụ thuộc vào tiền mặt
- Tạo hệ sinh thái thanh toán tiện lợi, an toàn
- Cung cấp công cụ quản lý hiệu quả cho nhà trường

### Các module chính
1. **Ứng dụng Sinh viên (Android)**: Ví điện tử, thanh toán NFC, quản lý tài khoản
2. **Cổng thông tin Quản trị (Web)**: Dashboard, quản lý sinh viên, lịch sử giao dịch
3. **Backend API**: Xử lý nghiệp vụ, quản lý dữ liệu, tích hợp NFC

## Công nghệ sử dụng

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT

### Frontend Web
- **Framework**: React.js
- **State Management**: React Context API
- **UI Framework**: Material-UI
- **Build Tool**: Vite

### Mobile App
- **Platform**: Android Native
- **Language**: Kotlin
- **Architecture**: MVVM
- **NFC**: Host Card Emulation (HCE)

## Cấu trúc dự án
```
DoAnChuyenNganh/
├── backend/              # Node.js/Express backend
│   ├── src/             # Source code
│   ├── config/          # Configuration files
│   ├── tests/           # Test files
│   ├── logs/            # Log files
│   └── uploads/         # File uploads
├── frontend/            # React frontend admin portal
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── assets/          # Project assets
│   └── tests/           # Test files
├── mobile-app/          # Android app
│   ├── app/             # App source code
│   ├── gradle/          # Gradle build files
│   └── scripts/         # Build scripts
├── shared/              # Shared resources
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Shared utilities
│   └── constants/       # Shared constants
├── memory-bank/         # Project documentation
├── scripts/             # Build and deployment scripts
├── .claude/             # Claude configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (v18+)
- MongoDB (v5+)
- Android Studio (cho phát triển mobile)
- Git

### Backend setup
```bash
cd backend
npm install
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### Mobile App setup
1. Mở project trong Android Studio
2. Sync Gradle
3. Run app trên emulator hoặc device

## Tính năng chính

### Ứng dụng Sinh viên
- Đăng ký/Đăng nhập
- Xem số dư ví
- Lịch sử giao dịch
- Thanh toán NFC
- Quản lý thông tin cá nhân

### Cổng Quản trị
- Dashboard thống kê
- Quản lý tài khoản sinh viên
- Xem lịch sử giao dịch
- Báo cáo và phân tích

## Quy trình phát triển

### Memory Bank System
Dự án sử dụng hệ thống "Memory Bank" để quản lý kiến thức:
- `memory-bank/projectbrief.md`: Phạm vi và yêu cầu
- `memory-bank/productContext.md`: Bối cảnh sản phẩm
- `memory-bank/systemPatterns.md`: Kiến trúc hệ thống
- `memory-bank/techContext.md`: Công nghệ và thiết lập
- `memory-bank/progress.md`: Tiến độ dự án
- `memory-bank/project-rules.md`: Quy tắc phát triển

### Development Workflow
1. **Plan Mode**: Đọc Memory Bank, xây dựng chiến lược
2. **Act Mode**: Triển khai tính năng, cập nhật tài liệu

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Giấy phép

Dự án được phát triển cho mục đích học tập tại Đại học Bách Khoa TP.HCM.

## Liên hệ

- **Team**: Đồ án chuyên ngành HK10 2025
- **Repository**: [GitHub Repository]
- **Documentation**: Xem folder `memory-bank/`






