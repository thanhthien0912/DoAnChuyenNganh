const mongoose = require('mongoose');
const topupRequestRepository = require('../repositories/topupRequestRepository');
const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const { formatTopupRequest } = require('../utils/formatters');

class AdminTopupService {
  /**
   * Get all topup requests with filters and pagination
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
   * @param {string} options.userId - Filter by user ID
   * @param {Date} options.startDate - Filter from date
   * @param {Date} options.endDate - Filter to date
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   */
  async getAllTopupRequests({ status, userId, startDate, endDate, page = 1, limit = 20 } = {}) {
    try {
      const result = await topupRequestRepository.getAllRequests({
        status,
        userId,
        startDate,
        endDate,
        page,
        limit
      });

      return {
        requests: result.requests.map(request => formatTopupRequest(request, { includeUser: true })),
        pagination: result.pagination,
        stats: {
          pending: await topupRequestRepository.getPendingCount()
        }
      };
    } catch (error) {
      logger.error('Get all topup requests error:', error.message);
      throw error;
    }
  }

  /**
   * Approve a topup request
   * Creates a transaction and updates wallet balance
   * @param {string} requestId - Topup request ID
   * @param {string} adminId - Admin user ID who approves
   */
  async approveTopupRequest(requestId, adminId) {
    let createdTransaction = null;

    try {
      // 1. Get and validate topup request
      const topupRequest = await topupRequestRepository.findById(requestId);
      
      if (!topupRequest) {
        throw new Error('Topup request not found');
      }

      if (topupRequest.status !== 'PENDING') {
        throw new Error(`Cannot approve request with status ${topupRequest.status}`);
      }

      // 2. Get user and wallet
      const [user, wallet] = await Promise.all([
        userRepository.findById(topupRequest.userId),
        walletRepository.findById(topupRequest.walletId)
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      if (!wallet || !wallet.isActive) {
        throw new Error('Wallet not found or inactive');
      }

      // 3. Create completed transaction
      // Generate referenceNumber manually
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const referenceNumber = `TXN${timestamp}${random}`;

      const transaction = transactionRepository.createDocument({
        userId: topupRequest.userId,
        walletId: wallet._id,
        type: 'TOPUP',
        amount: topupRequest.amount,
        status: 'COMPLETED',
        description: `Nạp tiền thủ công - ${topupRequest.method} - Ref: ${topupRequest.referenceNumber}`,
        referenceNumber: referenceNumber,
        metadata: {
          topupRequestId: topupRequest._id,
          approvedBy: adminId,
          method: topupRequest.method,
          notes: topupRequest.note || ''
        },
        processedBy: adminId,
        processedAt: new Date()
      });

      await transactionRepository.save(transaction);
      createdTransaction = transaction;

      // 4. Update wallet balance
      const currentBalance = parseFloat(wallet.balance.toString());
      const topupAmount = parseFloat(topupRequest.amount.toString());
      wallet.balance = currentBalance + topupAmount;
      await walletRepository.save(wallet);

      // 5. Update topup request status
      topupRequest.status = 'APPROVED';
      topupRequest.processedBy = adminId;
      topupRequest.processedAt = new Date();
      await topupRequestRepository.save(topupRequest);

      logger.info(`Topup request approved: ${topupRequest.referenceNumber} - ${topupAmount} VND by admin ${adminId}`);

      return {
        topupRequest: formatTopupRequest(topupRequest, { includeUser: true }),
        transaction: {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          amount: parseFloat(transaction.amount.toString()),
          status: transaction.status
        },
        wallet: {
          id: wallet._id,
          newBalance: parseFloat(wallet.balance.toString()),
          currency: wallet.currency
        }
      };
    } catch (error) {
      // Manual rollback: Delete created transaction if wallet update failed
      if (createdTransaction) {
        try {
          await transactionRepository.model.deleteOne({ _id: createdTransaction._id });
          logger.warn(`Rolled back transaction ${createdTransaction.referenceNumber} due to error`);
        } catch (rollbackError) {
          logger.error('Rollback failed:', rollbackError.message);
        }
      }
      
      logger.error('Approve topup request error:', error.message);
      throw error;
    }
  }

  /**
   * Reject a topup request
   * @param {string} requestId - Topup request ID
   * @param {string} adminId - Admin user ID who rejects
   * @param {string} reason - Rejection reason
   */
  async rejectTopupRequest(requestId, adminId, reason) {
    try {
      // 1. Get and validate topup request
      const topupRequest = await topupRequestRepository.findById(requestId);
      
      if (!topupRequest) {
        throw new Error('Topup request not found');
      }

      if (topupRequest.status !== 'PENDING') {
        throw new Error(`Cannot reject request with status ${topupRequest.status}`);
      }

      // 2. Update topup request status
      topupRequest.status = 'REJECTED';
      topupRequest.processedBy = adminId;
      topupRequest.processedAt = new Date();
      topupRequest.rejectionReason = reason || 'Không đủ điều kiện';
      
      await topupRequestRepository.save(topupRequest);

      logger.info(`Topup request rejected: ${topupRequest.referenceNumber} by admin ${adminId}`);

      return {
        topupRequest: formatTopupRequest(topupRequest, { includeUser: true })
      };
    } catch (error) {
      logger.error('Reject topup request error:', error.message);
      throw error;
    }
  }

  /**
   * Get pending topup requests count
   */
  async getPendingCount() {
    try {
      return await topupRequestRepository.getPendingCount();
    } catch (error) {
      logger.error('Get pending count error:', error.message);
      throw error;
    }
  }
}

module.exports = new AdminTopupService();
