const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { authenticate } = require('../middlewares/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');

// POS Category routes
router.get('/categories', authenticate, posController.getCategories);

// POS Item routes
router.get(
  '/categories/:categoryKey/items',
  authenticate,
  [
    param('categoryKey').trim().notEmpty().withMessage('Category key is required'),
    validate
  ],
  posController.getItemsByCategory
);

// POS Transaction routes
router.post(
  '/transaction',
  authenticate,
  [
    body('itemId').isMongoId().withMessage('Valid item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('categoryKey').trim().notEmpty().withMessage('Category key is required')
      .customSanitizer(value => value.toUpperCase()),
    body('nfcData').optional().isObject().withMessage('NFC data must be an object'),
    validate
  ],
  posController.processTransaction
);

// Favorite Transaction routes
router.get('/favorites', authenticate, posController.getFavorites);

router.post(
  '/favorites',
  authenticate,
  [
    body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Name is required and cannot exceed 100 characters'),
    body('categoryKey').trim().notEmpty().withMessage('Category key is required')
      .customSanitizer(value => value.toUpperCase()),
    body('itemId').isMongoId().withMessage('Valid item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    validate
  ],
  posController.addFavorite
);

router.delete(
  '/favorites/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Valid favorite ID is required'),
    validate
  ],
  posController.deleteFavorite
);

module.exports = router;
