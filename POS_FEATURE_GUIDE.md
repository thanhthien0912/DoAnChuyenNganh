# Hướng Dẫn Sử Dụng Tính Năng POS (Point of Sale)

## Tổng Quan

Tính năng POS cho phép sinh viên thanh toán trực tiếp các dịch vụ trong trường như xe buýt, căn tin, và máy bán nước tự động bằng cách quét thẻ sinh viên NFC qua điện thoại.

## Cấu Trúc Hệ Thống

### Backend (Node.js/Express/MongoDB)

#### Models
- **POSCategory** (`backend/src/models/POSCategory.js`)
  - 3 danh mục: BUS (Xe buýt), CANTEEN (Căn tin), VENDING_MACHINE (Máy bán nước)
  - Các trường: key, name, icon, description, isActive, displayOrder

- **POSItem** (`backend/src/models/POSItem.js`)
  - Sản phẩm/dịch vụ thuộc từng danh mục
  - Các trường: categoryKey, name, description, price, image, isAvailable, metadata

- **FavoriteTransaction** (`backend/src/models/FavoriteTransaction.js`)
  - Lưu trữ giao dịch yêu thích của người dùng
  - Các trường: userId, name, categoryKey, itemId, quantity, totalAmount

#### API Endpoints

**Base URL:** `/api/pos`

1. **GET /categories** - Lấy danh sách categories
   - Auth: Required
   - Response: `{ success: true, data: { categories: [...] } }`

2. **GET /categories/:categoryKey/items** - Lấy items theo category
   - Auth: Required
   - Response: `{ success: true, data: { items: [...] } }`

3. **POST /transaction** - Xử lý thanh toán POS
   - Auth: Required
   - Body:
     ```json
     {
       "itemId": "string",
       "quantity": number,
       "categoryKey": "string",
       "nfcData": {
         "deviceId": "string",
         "terminalId": "string",
         "transactionId": "string",
         "timestamp": "string"
       }
     }
     ```
   - Response: Transaction + Updated Wallet

4. **GET /favorites** - Lấy danh sách giao dịch yêu thích
   - Auth: Required
   - Response: `{ success: true, data: { favorites: [...] } }`

5. **POST /favorites** - Thêm giao dịch yêu thích
   - Auth: Required
   - Body:
     ```json
     {
       "name": "string",
       "categoryKey": "string",
       "itemId": "string",
       "quantity": number,
       "totalAmount": number
     }
     ```

6. **DELETE /favorites/:id** - Xóa giao dịch yêu thích
   - Auth: Required

### Mobile App (Flutter)

#### Cấu Trúc Thư Mục
```
lib/features/pos/
├── domain/
│   ├── pos_category.dart
│   ├── pos_item.dart
│   ├── favorite_transaction.dart
│   └── pos_transaction_request.dart
├── infrastructure/
│   └── pos_repository.dart
├── application/
│   ├── pos_controller.dart
│   └── favorite_controller.dart
└── presentation/
    ├── pos_screen.dart
    ├── pos_category_screen.dart
    ├── pos_confirmation_screen.dart
    └── favorite_transactions_screen.dart
```

#### Màn Hình

1. **POSScreen** (`/pos`)
   - Hiển thị 3 danh mục chính dưới dạng grid
   - Mỗi card có icon emoji lớn + tên + mô tả
   - Có nút truy cập "Giao dịch yêu thích" ở app bar

2. **POSCategoryScreen** (`/pos/categories/:categoryKey`)
   - Hiển thị danh sách items của category đã chọn
   - Cho phép chọn số lượng cho mỗi item
   - Bottom bar hiển thị tổng số tiền
   - Nút "Lưu làm yêu thích" (icon trái tim)
   - Nút "Thanh toán"

3. **POSConfirmationScreen** (`/pos/confirmation`)
   - Hiển thị chi tiết đơn hàng
   - Tự động khởi động NFC scanning
   - Yêu cầu người dùng đưa thẻ NFC gần điện thoại
   - Xử lý thanh toán và hiển thị kết quả
   - Điều hướng về Home sau khi thành công

4. **FavoriteTransactionsScreen** (`/pos/favorites`)
   - Hiển thị danh sách giao dịch đã lưu
   - Cho phép sử dụng lại hoặc xóa giao dịch yêu thích

## Hướng Dẫn Cài Đặt

### Backend

1. Đăng ký routes trong `src/app.js`:
   ```javascript
   const posRoutes = require('./routes/posRoutes');
   app.use('/api/pos', posRoutes);
   ```

2. Seed dữ liệu mẫu:
   ```bash
   cd backend
   node seed-pos-data.js
   ```

### Mobile

1. Các dependencies đã có sẵn trong pubspec.yaml:
   - flutter_nfc_kit: ^3.4.3
   - hooks_riverpod: ^2.5.1
   - go_router: ^14.2.0

2. Routes đã được thêm trong `lib/router/app_router.dart`

3. Quick action POS đã được thêm vào Home screen

## Flow Sử Dụng

### 1. Thanh Toán Thông Thường

```
Home → Nhấn "POS" 
  → Chọn Category (VD: Căn tin)
  → Chọn items + số lượng
  → Nhấn "Thanh toán"
  → Đưa thẻ NFC gần điện thoại
  → Xác nhận thành công
  → Về Home (số dư đã được cập nhật)
```

### 2. Sử Dụng Giao Dịch Yêu Thích

```
Home → Nhấn "POS"
  → Nhấn icon trái tim ở app bar
  → Chọn giao dịch yêu thích
  → Nhấn menu → "Sử dụng"
  → Đưa thẻ NFC gần điện thoại
  → Xác nhận thành công
```

### 3. Lưu Giao Dịch Yêu Thích

```
POS → Chọn Category
  → Chọn items + số lượng
  → Nhấn icon trái tim (favorite)
  → Nhập tên giao dịch
  → Nhấn "Lưu"
```

## Xử Lý Lỗi

### Backend
- **Insufficient balance**: Không đủ tiền trong ví
- **Item not found**: Sản phẩm không tồn tại
- **Item not available**: Sản phẩm tạm ngưng bán
- **Active wallet not found**: Không tìm thấy ví đang hoạt động

### Mobile
- **NFC timeout**: Quá 30s không phát hiện thẻ
- **NFC error**: Lỗi đọc thẻ NFC
- **Network error**: Lỗi kết nối API
- **Transaction failed**: Lỗi xử lý giao dịch từ backend

## Dữ Liệu Mẫu

### Categories
1. 🚍 Xe buýt
2. 🍱 Căn tin
3. 🥤 Máy bán nước

### Items (Examples)

**Xe buýt:**
- Vé 1 lượt: 7,000 VND
- Vé tuần: 70,000 VND
- Vé tháng: 200,000 VND

**Căn tin:**
- Cơm sườn: 35,000 VND
- Phở bò: 40,000 VND
- Bánh mì thịt: 20,000 VND
- Cơm gà: 38,000 VND
- Hủ tiếu: 35,000 VND
- Bún bò Huế: 42,000 VND

**Máy bán nước:**
- Nước suối: 5,000 VND
- Coca Cola: 10,000 VND
- Pepsi: 10,000 VND
- Trà xanh: 8,000 VND
- Sting: 12,000 VND
- Number 1: 10,000 VND
- Cà phê sữa: 12,000 VND
- Sữa tươi: 8,000 VND

## Tính Năng Nổi Bật

1. ✅ **NFC Payment**: Thanh toán nhanh chóng bằng thẻ sinh viên NFC
2. ✅ **Multiple Categories**: Hỗ trợ nhiều loại dịch vụ khác nhau
3. ✅ **Favorite Transactions**: Lưu và tái sử dụng giao dịch thường dùng
4. ✅ **Real-time Balance Update**: Cập nhật số dư ngay lập tức
5. ✅ **Transaction History**: Lịch sử giao dịch được lưu trữ đầy đủ
6. ✅ **Daily/Monthly Limits**: Kiểm soát chi tiêu theo ngày/tháng
7. ✅ **Pull to Refresh**: Làm mới dữ liệu bằng cách kéo xuống
8. ✅ **Error Handling**: Xử lý lỗi đầy đủ và thông báo rõ ràng

## Bảo Mật

1. **Authentication**: Tất cả endpoints yêu cầu JWT token
2. **NFC Validation**: Xác thực thẻ NFC trước khi xử lý
3. **Balance Check**: Kiểm tra số dư trước khi trừ tiền
4. **Transaction Lock**: Sử dụng MongoDB session để đảm bảo tính nhất quán
5. **Daily/Monthly Limits**: Ngăn chặn chi tiêu quá mức

## Cải Tiến Tương Lai

- [ ] Hỗ trợ thanh toán nhiều items trong một giao dịch (hiện tại chỉ ghi nhận item đầu tiên)
- [ ] Thêm hình ảnh cho items
- [ ] QR Code payment backup (khi NFC không khả dụng)
- [ ] Push notification khi thanh toán thành công
- [ ] Thống kê chi tiêu theo category
- [ ] Discount/Promotion codes
- [ ] Offline mode với sync sau
- [ ] Split payment (chia đơn)

## Troubleshooting

### Backend không seed được data
```bash
# Kiểm tra MongoDB connection
node backend/test-db-connection.js

# Chạy lại seed script
cd backend
node seed-pos-data.js
```

### Mobile app không kết nối được API
1. Kiểm tra `lib/core/config/app_config.dart`
2. Đảm bảo baseUrl đúng (thường là `http://10.0.2.2:3000` cho Android emulator)
3. Kiểm tra backend đang chạy: `curl http://localhost:3000/health`

### NFC không hoạt động
1. Đảm bảo device hỗ trợ NFC
2. Bật NFC trong Settings
3. Kiểm tra permissions trong AndroidManifest.xml
4. Test với NFC screen trước (`/nfc`)

## Liên Hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.
