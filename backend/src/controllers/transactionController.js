const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class TransactionController {
  // Process payment
  async processPayment(req, res) {
    try {
      const { amount, description, nfcData } = req.body;
      const result = await paymentService.processPayment(
        req.user._id,
        amount,
        description,
        nfcData
      );

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Payment processing error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: error.message
        }
      });
    }
  }

  // Process top-up
  async processTopup(req, res) {
    try {
      const { amount, description } = req.body;
      const result = await paymentService.processTopup(
        req.user._id,
        amount,
        description
      );

      res.json({
        success: true,
        message: 'Top-up processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Top-up processing error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'TOPUP_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get user transaction history
  async getTransactionHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        type: req.query.type,
        status: req.query.status,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const userId = req.user?._id?.toString();
      const result = await paymentService.getTransactionHistory(
        userId,
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Get transaction history error: ${error.message}`, { stack: error.stack });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TRANSACTIONS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get transaction by reference number
  async getTransactionByReference(req, res) {
    try {
      const { referenceNumber } = req.params;
      const userId = req.user?._id?.toString();
      const transaction = await paymentService.getTransactionByReference(referenceNumber, userId);

      res.json({
        success: true,
        data: {
          transaction
        }
      });
    } catch (error) {
      logger.error(`Get transaction by reference error: ${error.message}`, { stack: error.stack });
      res.status(404).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: error.message
        }
      });
    }
  }

  // Get transaction statistics
  async getTransactionStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user?._id?.toString();
      const stats = await paymentService.getTransactionStats(
        userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      logger.error(`Get transaction stats error: ${error.message}`, { stack: error.stack });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STATS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Get all transactions
  async getAllTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        type: req.query.type,
        status: req.query.status,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await paymentService.getAllTransactions(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all transactions error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ALL_TRANSACTIONS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Process refund
  async processRefund(req, res) {
    try {
      const { transactionId, reason } = req.body;
      const result = await paymentService.processRefund(transactionId, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Refund processing error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'REFUND_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Update transaction status
  async updateTransactionStatus(req, res) {
    try {
      const { status, reason } = req.body;
      const result = await paymentService.updateTransactionStatus(
        req.params.id,
        status,
        req.user._id,
        reason
      );

      res.json({
        success: true,
        message: 'Transaction status updated successfully',
        data: {
          transaction: result
        }
      });
    } catch (error) {
      logger.error('Update transaction status error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_TRANSACTION_STATUS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Get transaction by ID
  async getTransactionById(req, res) {
    try {
      const transaction = await paymentService.getTransactionById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          transaction
        }
      });
    } catch (error) {
      logger.error('Get transaction by ID error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TRANSACTION_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Get transaction statistics for dashboard
  async getDashboardStats(req, res) {
    try {
      const stats = await paymentService.getDashboardStats();

      res.json({
        success: true,
        data: {
          todayStats: stats.todayStats,
          systemStats: stats.systemStats,
          recentTransactions: stats.recentTransactions
        }
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DASHBOARD_STATS_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new TransactionController();