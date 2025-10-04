const walletService = require('../services/walletService');
const logger = require('../utils/logger');

class WalletController {
  async getHomeSummary(req, res) {
    try {
      const summary = await walletService.getHomeSummary(req.user._id);
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Get home summary error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'HOME_SUMMARY_ERROR',
          message: error.message
        }
      });
    }
  }

  async createTopupRequest(req, res) {
    try {
      const { amount, method, note } = req.body;
      const request = await walletService.requestTopup(req.user._id, amount, method, note);

      res.status(201).json({
        success: true,
        message: 'Yêu cầu nạp tiền đã được ghi nhận',
        data: request
      });
    } catch (error) {
      logger.error('Create top-up request error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'TOPUP_REQUEST_ERROR',
          message: error.message
        }
      });
    }
  }

  async getTopupRequests(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status;

      const result = await walletService.getTopupRequests(req.user._id, { page, limit, status });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get top-up requests error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_TOPUP_REQUESTS_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new WalletController();
