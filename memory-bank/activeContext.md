# Active Context: Công việc đang tập trung

## Trạng thái hiện tại (27/09/2025)

### Công việc đang tập trung
1. **Thiết lập Memory Bank**: Hoàn thiện hệ thống tài liệu dự án
2. **Chuẩn bị cấu trúc dự án**: Tạo foundation cho việc phát triển
3. **Phân tích yêu cầu**: Hiểu rõ chức năng cốt lõi cần triển khai

### Các thay đổi gần đây
- **27/09/2025**:
  - Đọc và phân tích file rule.md
  - Tạo folder memory-bank
  - Tạo các file tài liệu foundation cho dự án
  - Tạo cấu trúc folder project hoàn chỉnh
  - Thêm frontend folder cho student app
  - Cập nhật documentation và README.md
  - Hoàn thiện toàn bộ cấu trúc thư mục chuẩn
  - Điều chỉnh kiến trúc: Gộp admin functionality vào frontend folder (loại bỏ web-admin riêng)

### Milestones gần nhất
- ✅ Hoàn thành tài liệu quy tắc dự án (rule.md)
- ✅ Thiết lập cấu trúc Memory Bank
- ✅ Hoàn thành tất cả file tài liệu nền tảng
- ✅ Tạo project structure hoàn chỉnh
- ✅ Hoàn thiện cấu trúc thư mục chuẩn
- 🔄 Bắt đầu khởi tạo project thực tế

## Ưu tiên hiện tại

### High Priority (Phase 2 - Development Setup)
1. **Initialize Backend**: Setup Express.js server với package.json và dependencies
2. **Initialize Frontend Project**: Setup React project cho frontend (bao gồm cả student và admin interfaces)
3. **Setup Database**: Configure MongoDB connection và tạo basic models
4. **Git Repository**: Initialize Git repository và tạo remote repository

### Medium Priority (Phase 3 - Core Development)
1. **Authentication System**: JWT-based authentication với role-based access (student/admin)
2. **Database Models**: Complete schemas cho User, Wallet, Transaction
3. **API Endpoints**: Core endpoints cho authentication, user management, và admin operations
4. **UI Architecture**: Design frontend structure để hỗ trợ cả student và admin interfaces

## Vấn đề cần giải quyết ngắn hạn
- Setup MongoDB (local hoặc Atlas cloud)
- Install Node.js, npm/yarn trên development machine
- Cấu hình VS Code với extensions cần thiết
- Setup Android Studio cho mobile development

## Dependencies cần cài đặt
- **Node.js** (v18+): https://nodejs.org/
- **MongoDB**: Local install hoặc Atlas cloud account
- **Git**: https://git-scm.com/
- **VS Code**: https://code.visualstudio.com/
- **Android Studio**: https://developer.android.com/studio
- **Postman/Insomnia**: For API testing

## Blockers hiện tại
- Không có blockers đáng kể
- Project đã sẵn sàng để bắt đầu phát triển

## Hành động cụ thể để bắt đầu (Next Steps)

### Step 1: Backend Setup (1-2 giờ)
```bash
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon eslint prettier
```

### Step 2: Frontend Setup (1-2 giờ)
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled react-hook-form @hookform/resolvers yup
```

### Step 3: Database Setup (30 phút)
- Setup MongoDB local hoặc tạo Atlas account
- Tạo database "student_wallet"
- Test connection với backend

### Step 4: Initialize Git (15 phút)
```bash
git init
git add .
git commit -m "Initial project setup"
# Create GitHub repository and push
```

### Step 5: Create Basic Files (2-3 giờ)
- Backend: server.js, basic routes, models với role-based access
- Frontend: Authentication components, routing structure cho student/admin interfaces
- Database: User (với role field), Wallet, và Transaction models

---
*Cập nhật lần cuối: 27/09/2025*