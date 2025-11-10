const cardService = require('../services/cardService');
const logger = require('../utils/logger');

class AdminCardController {
  async getAllCards(req, res) {
    try {
      const { page, limit, search, status, isLocked } = req.query;
      
      const result = await cardService.getAllCards({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        search,
        status,
        isLocked: isLocked === 'true' ? true : isLocked === 'false' ? false : undefined
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Admin get all cards error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CARDS_ERROR',
          message: error.message
        }
      });
    }
  }

  async deleteCard(req, res) {
    try {
      const result = await cardService.adminDeleteCard(req.params.id);
      
      res.json({
        success: true,
        message: 'Đã xóa thẻ thành công',
        data: result
      });
    } catch (error) {
      logger.error('Admin delete card error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_CARD_ERROR',
          message: error.message
        }
      });
    }
  }

  async unlockCard(req, res) {
    try {
      const card = await cardService.adminUnlockCard(req.params.id);
      
      res.json({
        success: true,
        message: 'Đã mở khóa thẻ thành công',
        data: {
          id: card._id,
          uid: card.uid,
          alias: card.alias,
          status: card.status,
          isLocked: card.isLocked,
          lockedAt: card.lockedAt
        }
      });
    } catch (error) {
      logger.error('Admin unlock card error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'UNLOCK_CARD_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new AdminCardController();
