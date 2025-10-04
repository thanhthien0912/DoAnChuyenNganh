const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middlewares/auth');
const { requirePinConfirmation } = require('../middlewares/security');
const { walletValidation } = require('../middlewares/validation');

router.get('/home', authenticate, walletController.getHomeSummary);
router.post('/topups', authenticate, requirePinConfirmation, walletValidation.requestTopup, walletController.createTopupRequest);
router.get('/topups', authenticate, walletValidation.topupHistoryQuery, walletController.getTopupRequests);

module.exports = router;
