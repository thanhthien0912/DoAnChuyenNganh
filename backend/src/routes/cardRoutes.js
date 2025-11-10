const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticate } = require('../middlewares/auth');
const { cardValidation } = require('../middlewares/validation');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');

router.get('/', authenticate, cardController.getCards);
router.get('/generate-write-data', authenticate, cardController.generateWriteData);
router.post('/', authenticate, cardValidation.linkCard, cardController.linkCard);
router.patch('/:id/status', authenticate, cardValidation.updateStatus, cardController.updateStatus);
router.patch('/:id/primary', authenticate, cardValidation.setPrimary, cardController.setPrimary);
router.put(
  '/:id/toggle-lock',
  authenticate,
  [
    param('id').isMongoId().withMessage('Valid card ID is required'),
    body('lock')
      .custom((value) => {
        // Allow boolean or string 'true'/'false'
        if (typeof value === 'boolean') return true;
        if (value === 'true' || value === 'false') return true;
        throw new Error('Lock must be boolean or string "true"/"false"');
      })
      .withMessage('Lock must be boolean'),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ],
  cardController.toggleCardLock
);

router.delete(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Valid card ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  cardController.deleteCard
);

module.exports = router;
