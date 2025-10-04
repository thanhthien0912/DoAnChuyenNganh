const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize, adminOnly } = require('../middlewares/auth');
const { requirePinConfirmation } = require('../middlewares/security');
const { transactionValidation, validate } = require('../middlewares/validation');

// User transaction routes
router.post('/payment', authenticate, transactionValidation.nfcTransaction, transactionController.processPayment);
router.post('/topup', authenticate, requirePinConfirmation, [
  body('amount')
    .isFloat({ min: 1000, max: 10000000 }).withMessage('Amount must be between 1,000 and 10,000,000 VND'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  validate
], transactionController.processTopup);
router.get('/history', authenticate, transactionValidation.historyFilters, transactionController.getTransactionHistory);
router.get('/stats', authenticate, transactionController.getTransactionStats);
router.get('/reference/:referenceNumber', authenticate, transactionController.getTransactionByReference);

// Admin transaction routes
router.get('/admin/dashboard-stats', authenticate, adminOnly, transactionController.getDashboardStats);
router.get('/admin/all', authenticate, adminOnly, transactionController.getAllTransactions);
router.post('/admin/refund', authenticate, adminOnly, transactionController.processRefund);
router.put('/admin/:id/status', authenticate, adminOnly, transactionController.updateTransactionStatus);
router.get('/admin/:id', authenticate, adminOnly, transactionController.getTransactionById);

module.exports = router;