const adminTopupService = require('../services/adminTopupService');
const logger = require('../utils/logger');

class AdminTopupController {
  /**
   * Get all topup requests (admin only)
   * Query params: status, userId, startDate, endDate, page, limit
   */
  async getAllTopupRequests(req, res) {
    try {
      const { status, userId, startDate, endDate } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await adminTopupService.getAllTopupRequests({
        status,
        userId,
        startDate,
        endDate,
        page,
        limit
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Admin get topup requests error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_TOPUP_REQUESTS_ERROR',
          message: error.message
        }
      });
    }
  }

  /**
   * Approve a topup request (admin only)
   */
  async approveTopupRequest(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user._id;

      const result = await adminTopupService.approveTopupRequest(id, adminId);

      res.json({
        success: true,
        message: 'Yêu cầu nạp tiền đã được xác nhận',
        data: result
      });
    } catch (error) {
      logger.error('Admin approve topup request error:', error.message);
      
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'APPROVE_TOPUP_ERROR',
          message: error.message
        }
      });
    }
  }

  /**
   * Reject a topup request (admin only)
   */
  async rejectTopupRequest(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user._id;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REASON',
            message: 'Vui lòng nhập lý do từ chối'
          }
        });
      }

      const result = await adminTopupService.rejectTopupRequest(id, adminId, reason);

      res.json({
        success: true,
        message: 'Yêu cầu nạp tiền đã bị từ chối',
        data: result
      });
    } catch (error) {
      logger.error('Admin reject topup request error:', error.message);
      
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'REJECT_TOPUP_ERROR',
          message: error.message
        }
      });
    }
  }

  /**
   * Get pending topup requests count (admin only)
   */
  async getPendingCount(req, res) {
    try {
      const count = await adminTopupService.getPendingCount();

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      logger.error('Get pending count error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_PENDING_COUNT_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new AdminTopupController();
