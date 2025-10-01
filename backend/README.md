# Student Wallet Backend API

Backend API for Student Wallet Platform - A comprehensive e-wallet solution for students with NFC payment capabilities.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Wallet Management**: Create, manage, and monitor student wallets
- **Payment Processing**: Secure payment processing with transaction history
- **NFC Integration**: NFC payment support for contactless transactions
- **Admin Dashboard**: Complete admin interface for user and transaction management
- **Security**: Rate limiting, input validation, and secure password hashing
- **Logging**: Comprehensive logging and monitoring
- **API Documentation**: Swagger/OpenAPI documentation

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4+)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi & Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration

3. **Set up MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongosh database-setup.js
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/student_wallet

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` to access the interactive API documentation.

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Transactions
- `POST /api/transactions/payment` - Process payment
- `POST /api/transactions/topup` - Process top-up
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/stats` - Get transaction statistics

### Admin
- `GET /api/auth/admin/users` - Get all users
- `POST /api/auth/admin/create-user` - Create user (admin)
- `GET /api/transactions/admin/all` - Get all transactions
- `GET /api/transactions/admin/dashboard-stats` - Get dashboard statistics

## Database Schema

### Users
- `studentId`: Unique student identifier
- `email`: User email address
- `password`: Hashed password
- `role`: User role (student/admin)
- `profile`: User profile information
- `isActive`: Account status

### Wallets
- `userId`: Reference to user
- `balance`: Current balance
- `currency`: Currency type (VND)
- `dailyLimit`: Daily spending limit
- `monthlyLimit`: Monthly spending limit
- `dailySpent`: Amount spent today
- `monthlySpent`: Amount spent this month

### Transactions
- `userId`: Reference to user
- `walletId`: Reference to wallet
- `type`: Transaction type (topup/payment/refund/transfer)
- `amount`: Transaction amount
- `status`: Transaction status (pending/completed/failed/cancelled)
- `description`: Transaction description
- `referenceNumber`: Unique reference number
- `nfcData`: NFC transaction data

## Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Stateless authentication with expiration
- **Rate Limiting**: Prevents abuse and brute force attacks
- **Input Validation**: Comprehensive validation for all inputs
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express.js
- **Role-based Access**: Different access levels for students and admins

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Authentication & validation
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── app.js           # Main application file
├── tests/               # Test files
├── logs/                # Application logs
├── uploads/             # File uploads
└── package.json
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional context
  }
}
```

## Logging

The application uses Winston for structured logging:
- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Available in development mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests to ensure they pass
6. Submit a pull request

## License

This project is licensed under the MIT License.