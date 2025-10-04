const cardService = require('../services/cardService');
const logger = require('../utils/logger');

class CardController {
  async getCards(req, res) {
    try {
      const cards = await cardService.listUserCards(req.user._id);
      res.json({
        success: true,
        data: cards.map(card => ({
          id: card._id,
          uid: card.uid,
          alias: card.alias,
          status: card.status,
          isPrimary: card.isPrimary,
          linkedAt: card.linkedAt,
          lastUsedAt: card.lastUsedAt
        }))
      });
    } catch (error) {
      logger.error('Get cards error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CARDS_ERROR',
          message: error.message
        }
      });
    }
  }

  async linkCard(req, res) {
    try {
      const card = await cardService.linkCard(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Liên kết thẻ thành công',
        data: {
          id: card._id,
          uid: card.uid,
          alias: card.alias,
          status: card.status,
          isPrimary: card.isPrimary,
          linkedAt: card.linkedAt
        }
      });
    } catch (error) {
      logger.error('Link card error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'LINK_CARD_ERROR',
          message: error.message
        }
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const card = await cardService.updateStatus(req.user._id, req.params.id, status);
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thẻ thành công',
        data: {
          id: card._id,
          status: card.status,
          isPrimary: card.isPrimary
        }
      });
    } catch (error) {
      logger.error('Update card status error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_CARD_STATUS_ERROR',
          message: error.message
        }
      });
    }
  }

  async setPrimary(req, res) {
    try {
      const card = await cardService.setPrimary(req.user._id, req.params.id);
      res.json({
        success: true,
        message: 'Đã đặt thẻ làm thẻ chính',
        data: {
          id: card._id,
          status: card.status,
          isPrimary: true
        }
      });
    } catch (error) {
      logger.error('Set primary card error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'SET_PRIMARY_CARD_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new CardController();
