const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middlewares/auth');
const { userValidation, adminValidation } = require('../middlewares/validation');

// Public routes
router.post('/register', userValidation.register, authController.register);
router.post('/login', userValidation.login, authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, userValidation.updateProfile, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

// Admin routes
router.post('/admin/create-user', authenticate, adminOnly, adminValidation.createUser, authController.createUser);
router.get('/admin/users', authenticate, adminOnly, authController.getAllUsers);
router.get('/admin/users/:id', authenticate, adminOnly, authController.getUserById);
router.put('/admin/users/:id', authenticate, adminOnly, authController.updateUser);
router.put('/admin/users/:id/deactivate', authenticate, adminOnly, authController.deactivateUser);

module.exports = router;