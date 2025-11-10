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
          isLocked: card.isLocked,
          linkedAt: card.linkedAt,
          lastUsedAt: card.lastUsedAt,
          lockedAt: card.lockedAt
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
      logger.info('LinkCard controller - Request body:', JSON.stringify(req.body));
      logger.info('LinkCard controller - User:', req.user._id);
      
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
      logger.error('Link card controller error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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

  async generateWriteData(req, res) {
    try {
      const data = await cardService.generateCardWriteData(req.user._id);
      res.json({
        success: true,
        message: 'Dữ liệu ghi thẻ đã được tạo',
        data
      });
    } catch (error) {
      logger.error('Generate write data error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATE_WRITE_DATA_ERROR',
          message: error.message
        }
      });
    }
  }

  async toggleCardLock(req, res) {
    try {
      const { lock, password } = req.body;
      // Convert string to boolean if needed
      const lockBoolean = typeof lock === 'string' ? lock === 'true' : lock;
      
      logger.info('Toggle card lock - userId:', req.user._id, 'cardId:', req.params.id, 'lock:', lockBoolean, 'hasPassword:', !!password);
      
      const card = await cardService.toggleCardLock(
        req.user._id,
        req.params.id,
        lockBoolean,
        password
      );
      res.json({
        success: true,
        message: lock ? 'Đã khóa thẻ' : 'Đã mở khóa thẻ',
        data: {
          id: card._id,
          uid: card.uid,
          alias: card.alias,
          status: card.status,
          isPrimary: card.isPrimary,
          isLocked: card.isLocked,
          lockedAt: card.lockedAt
        }
      });
    } catch (error) {
      logger.error('Toggle card lock controller error:', {
        message: error.message,
        stack: error.stack,
        userId: req.user._id,
        cardId: req.params.id
      });
      res.status(400).json({
        success: false,
        error: {
          code: 'TOGGLE_LOCK_ERROR',
          message: error.message || 'Lỗi không xác định'
        }
      });
    }
  }

  async deleteCard(req, res) {
    try {
      const { password } = req.body;
      const result = await cardService.deleteCard(
        req.user._id,
        req.params.id,
        password
      );
      res.json({
        success: true,
        message: 'Đã xóa thẻ thành công',
        data: result
      });
    } catch (error) {
      logger.error('Delete card error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_CARD_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new CardController();
