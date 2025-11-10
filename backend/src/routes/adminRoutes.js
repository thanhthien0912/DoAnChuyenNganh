const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminTopupController = require('../controllers/adminTopupController');
const adminCardController = require('../controllers/adminCardController');
const { authenticate, adminOnly } = require('../middlewares/auth');
const { adminValidation } = require('../middlewares/validation');
const { param } = require('express-validator');
const { validate } = require('../middlewares/validation');

// Admin authentication and user management
router.post('/users', authenticate, adminOnly, adminValidation.createUser, authController.createUser);
router.get('/users', authenticate, adminOnly, authController.getAllUsers);
router.get('/users/:id', authenticate, adminOnly, authController.getUserById);
router.put('/users/:id', authenticate, adminOnly, authController.updateUser);
router.delete('/users/:id', authenticate, adminOnly, authController.deleteUser);

// Admin topup request management
router.get('/topup-requests', authenticate, adminOnly, adminTopupController.getAllTopupRequests);
router.get('/topup-requests/pending/count', authenticate, adminOnly, adminTopupController.getPendingCount);
router.put('/topup-requests/:id/approve', authenticate, adminOnly, adminTopupController.approveTopupRequest);
router.put('/topup-requests/:id/reject', authenticate, adminOnly, adminTopupController.rejectTopupRequest);

// Admin card management
router.get('/cards', authenticate, adminOnly, adminCardController.getAllCards);
router.delete(
  '/cards/:id',
  authenticate,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Valid card ID is required'),
    validate
  ],
  adminCardController.deleteCard
);
router.patch(
  '/cards/:id/unlock',
  authenticate,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Valid card ID is required'),
    validate
  ],
  adminCardController.unlockCard
);

module.exports = router;
