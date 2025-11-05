const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminTopupController = require('../controllers/adminTopupController');
const { authenticate, adminOnly } = require('../middlewares/auth');
const { adminValidation } = require('../middlewares/validation');

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

module.exports = router;
