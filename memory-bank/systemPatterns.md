# System Patterns: Kiến trúc và Mẫu thiết kế

## Kiến trúc hệ thống tổng thể

### High-level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │   Web Frontend  │    │   NFC Reader    │
│   (Kotlin)      │    │   (React)       │    │   (Hardware)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │           (Student & Admin)                 │                      
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Backend API          │
                    │     (Node.js/Express)     │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Database             │
                    │       (MongoDB)           │
                    └───────────────────────────┘
```

### Components Architecture

#### Backend Layer
```
Backend/
├── Controllers/          # Xử lý request logic
│   ├── authController.js
│   ├── transactionController.js
│   ├── studentController.js
│   └── adminController.js
├── Models/              # Database schemas
│   ├── User.js
│   ├── Transaction.js
│   ├── Wallet.js
│   └── Session.js
├── Services/            # Business logic
│   ├── authService.js
│   ├── paymentService.js
│   ├── nfcService.js
│   └── emailService.js
├── Middlewares/         # Authentication & validation
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── Routes/              # API endpoints
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   ├── studentRoutes.js
│   └── adminRoutes.js
└── Utils/               # Helper functions
    ├── crypto.js
    ├── logger.js
    └── constants.js
```

#### Mobile App Architecture (Android)
```
Android App/
├── Presentation/
│   ├── Activities/      # Main screens
│   ├── Fragments/       # UI components
│   ├── ViewModels/      # MVVM pattern
│   └── Adapters/        # RecyclerView adapters
├── Domain/
│   ├── UseCases/        # Business logic
│   ├── Models/          # Data models
│   └── Repositories/    # Repository interfaces
├── Data/
│   ├── Repositories/    # Repository implementations
│   ├── DataSource/      # API/Local data sources
│   └── Database/        # Local storage
└── Core/
    ├── Network/         # Retrofit/OkHttp
    ├── NFC/            # NFC handling
    └── Utils/          # Shared utilities
```

#### Web Frontend Architecture (React)
```
Frontend/
├── Components/
│   ├── Common/         # Reusable components
│   ├── Student/        # Student-facing components
│   │   ├── Wallet/
│   │   ├── Transactions/
│   │   └── Profile/
│   ├── Admin/          # Admin components
│   │   ├── Dashboard/
│   │   ├── StudentManagement/
│   │   └── TransactionManagement/
│   └── Auth/           # Authentication components
├── Pages/
│   ├── Student/        # Student pages
│   ├── Admin/          # Admin pages
│   └── Shared/         # Shared pages (Login, etc.)
├── Services/           # API services
├── Store/              # State management (Context/Redux)
├── Hooks/              # Custom hooks
├── Utils/              # Helper functions
└── Assets/             # Static files
```

## Data Flow Patterns

### Authentication Flow
1. **Login**: Client → API → Database → JWT Token
2. **Authorization**: Middleware → Token Validation → Route Access
3. **Session Management**: Token refresh → Logout → Session cleanup

### Payment Flow (NFC)
1. **Initiation**: App → NFC Controller → Backend Validation
2. **Processing**: Payment Service → Database Update → Transaction Record
3. **Confirmation**: Response → App UI → Receipt Generation

### Data Synchronization
- **Real-time updates**: WebSocket connection for live dashboard
- **Offline support**: Local storage with sync when online
- **Conflict resolution**: Last-write-wins strategy

## Security Patterns

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Student vs Admin permissions
- **Session Management**: Token expiration and refresh

### Data Protection
- **Encryption**: Sensitive data encryption at rest
- **HTTPS**: All communications encrypted
- **Input Validation**: Sanitize all user inputs

### API Security
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin restrictions
- **Headers**: Security headers implementation

## Database Patterns

### Schema Design
```
User Collection
- _id: ObjectId
- studentId: String (unique)
- email: String (unique)
- password: String (hashed)
- role: Enum ['student', 'admin']
- profile: Object
- createdAt: Date
- updatedAt: Date

Wallet Collection
- _id: ObjectId
- userId: ObjectId (ref: User)
- balance: Number
- currency: String
- isActive: Boolean
- createdAt: Date
- updatedAt: Date

Transaction Collection
- _id: ObjectId
- userId: ObjectId (ref: User)
- walletId: ObjectId (ref: Wallet)
- type: Enum ['topup', 'payment', 'refund']
- amount: Number
- status: Enum ['pending', 'completed', 'failed']
- description: String
- nfcData: Object (optional)
- createdAt: Date
- updatedAt: Date
```

### Indexing Strategy
- **User**: email (unique), studentId (unique)
- **Wallet**: userId (unique)
- **Transaction**: userId, createdAt, status

## Error Handling Patterns

### Standardized Error Response
```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable error",
    details: {} // Optional additional context
  }
}
```

### Error Types
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

## Performance Patterns

### Caching Strategy
- **Redis**: Session storage and frequent data
- **In-memory cache**: Application-level caching
- **Database indexing**: Optimized queries

### API Optimization
- **Pagination**: Large dataset responses
- **Lazy loading**: On-demand data loading
- **Compression**: Response compression

## Monitoring & Logging

### Logging Strategy
- **Structured logging**: JSON format for easy parsing
- **Log levels**: Error, Warn, Info, Debug
- **Request tracing**: Correlation IDs for debugging

### Monitoring
- **Health checks**: Service status monitoring
- **Performance metrics**: Response times, error rates
- **Business metrics**: Transaction volume, success rates

---
*Cập nhật lần cuối: 27/09/2025*