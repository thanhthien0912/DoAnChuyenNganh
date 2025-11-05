const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticate } = require('../middlewares/auth');
const { cardValidation } = require('../middlewares/validation');

router.get('/', authenticate, cardController.getCards);
router.get('/generate-write-data', authenticate, cardController.generateWriteData);
router.post('/', authenticate, cardValidation.linkCard, cardController.linkCard);
router.patch('/:id/status', authenticate, cardValidation.updateStatus, cardController.updateStatus);
router.patch('/:id/primary', authenticate, cardValidation.setPrimary, cardController.setPrimary);

module.exports = router;
