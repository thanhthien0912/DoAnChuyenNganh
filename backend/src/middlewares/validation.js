const { validationResult, body, query } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware factory
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', JSON.stringify({
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      errors: errors.array()
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

// User validation schemas
const userValidation = {
  register: [
    body('studentId')
      .notEmpty().withMessage('Student ID is required'),

    body('email')
      .notEmpty().withMessage('Email is required')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),

    body('profile.firstName')
      .optional(),

    body('profile.lastName')
      .optional(),

    body('profile.phone')
      .optional(),

    validate
  ],

  login: [
    body('login')
      .notEmpty().withMessage('Email or Student ID is required'),

    body('password')
      .notEmpty().withMessage('Password is required'),

    validate
  ],

  updateProfile: [
    body('profile.firstName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('First name can only contain letters and spaces'),

    body('profile.lastName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Last name can only contain letters and spaces'),

    body('profile.phone')
      .optional()
      .matches(/^(0|\+84)[0-9]{9,10}$/).withMessage('Please provide a valid Vietnamese phone number'),

    validate
  ]
};

// Wallet validation schemas
const walletValidation = {
  updateLimits: [
    body('dailyLimit')
      .isFloat({ min: 0 }).withMessage('Daily limit must be a positive number'),

    body('monthlyLimit')
      .isFloat({ min: 0 }).withMessage('Monthly limit must be a positive number'),

    body('currency')
      .optional()
      .matches(/^[A-Z]{3}$/).withMessage('Currency must be a valid 3-letter code'),

    validate
  ],

  requestTopup: [
    body('amount')
      .isFloat({ min: 1000, max: 50000000 }).withMessage('Số tiền nạp phải từ 1.000 đến 50.000.000 VND'),

    body('method')
      .optional()
      .isIn(['manual', 'bank_transfer', 'qr_pay', 'card', 'MANUAL', 'BANK_TRANSFER', 'QR_PAY', 'CARD'])
      .withMessage('Phương thức nạp không hợp lệ'),

    body('note')
      .optional()
      .isLength({ max: 200 }).withMessage('Ghi chú tối đa 200 ký tự'),

    validate
  ],

  topupHistoryQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Giới hạn phải từ 1 đến 100'),

    query('status')
      .optional()
      .isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'pending', 'approved', 'rejected', 'cancelled'])
      .withMessage('Trạng thái không hợp lệ'),

    validate
  ]
};

const cardValidation = {
  linkCard: [
    body('uid')
      .notEmpty().withMessage('UID của thẻ là bắt buộc')
      .isLength({ min: 4, max: 64 }).withMessage('UID phải từ 4 đến 64 ký tự')
      .trim(),

    body('alias')
      .optional()
      .isLength({ max: 50 }).withMessage('Tên gợi nhớ tối đa 50 ký tự'),

    body('makePrimary')
      .optional()
      .isBoolean().withMessage('Giá trị makePrimary phải là boolean'),

    body('metadata')
      .optional()
      .isObject().withMessage('Metadata phải là object'),

    body('metadata.deviceModel')
      .optional()
      .isString().withMessage('deviceModel phải là chuỗi'),

    body('metadata.issuer')
      .optional()
      .isString().withMessage('issuer phải là chuỗi'),

    validate
  ],

  updateStatus: [
    body('status')
      .isIn(['ACTIVE', 'LOCKED', 'active', 'locked']).withMessage('Trạng thái thẻ không hợp lệ'),
    validate
  ],

  setPrimary: [
    validate
  ]
};

// Transaction validation schemas
const transactionValidation = {
  createTransaction: [
    body('type')
      .isIn(['topup', 'payment', 'refund', 'transfer']).withMessage('Invalid transaction type'),

    body('amount')
      .isFloat({ min: 1000, max: 10000000 }).withMessage('Amount must be between 1,000 and 10,000,000 VND'),

    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    validate
  ],

  nfcTransaction: [
    body('nfcData.deviceId')
      .notEmpty().withMessage('NFC device ID is required'),

    body('nfcData.terminalId')
      .notEmpty().withMessage('NFC terminal ID is required'),

    body('nfcData.transactionId')
      .notEmpty().withMessage('NFC transaction ID is required'),

    body('amount')
      .isFloat({ min: 1000, max: 10000000 }).withMessage('Amount must be between 1,000 and 10,000,000 VND'),

    validate
  ],

  historyFilters: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Trang phải lớn hơn 0'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Giới hạn phải từ 1 đến 100'),

    query('type')
      .optional()
      .isIn(['TOPUP', 'PAYMENT', 'REFUND', 'TRANSFER', 'topup', 'payment', 'refund', 'transfer'])
      .withMessage('Loại giao dịch không hợp lệ'),

    query('status')
      .optional()
      .isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Trạng thái giao dịch không hợp lệ'),

    query('category')
      .optional()
      .isLength({ max: 50 }).withMessage('Danh mục tối đa 50 ký tự'),

    query('startDate')
      .optional()
      .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),

    query('endDate')
      .optional()
      .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),

    validate
  ]
};

// Admin validation schemas
const adminValidation = {
  createUser: [
    body('studentId')
      .notEmpty().withMessage('Student ID is required')
      .isLength({ min: 3, max: 20 }).withMessage('Student ID must be between 3 and 20 characters')
      .matches(/^[A-Z0-9]+$/i).withMessage('Student ID can only contain letters and numbers'),

    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('role')
      .isIn(['student', 'user', 'admin', 'manager']).withMessage('Role must be student, user, admin hoặc manager'),

    body('profile.firstName')
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),

    body('profile.lastName')
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),

    body('profile.phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^(0|\+84)[0-9]{9,10}$/).withMessage('Please provide a valid Vietnamese phone number'),

    validate
  ]
};

// General validation helpers
const idValidation = [
  body('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  validate
];

module.exports = {
  validate,
  userValidation,
  walletValidation,
  transactionValidation,
  adminValidation,
  idValidation,
  paginationValidation,
  cardValidation
};