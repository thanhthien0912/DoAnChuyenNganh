const mongoose = require('mongoose');
const transactionRepository = require('../repositories/transactionRepository');
const walletRepository = require('../repositories/walletRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const { formatTransaction, toPlainNumber } = require('../utils/formatters');

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  const stringValue = typeof value === 'string' ? value : value.toString?.();
  if (stringValue && mongoose.Types.ObjectId.isValid(stringValue)) {
    return new mongoose.Types.ObjectId(stringValue);
  }

  return null;
};

class PaymentService {
  // Process a payment transaction
  async processPayment(userId, amount, description, nfcData = null) {
    try {
      // Get user's wallet
      const wallet = await walletRepository.findOne({ userId, isActive: true });
      if (!wallet) {
        throw new Error('Active wallet not found');
      }

      // Check if user can spend this amount
      const canSpend = wallet.canSpend(amount);
      if (!canSpend.canSpend) {
        throw new Error(canSpend.reason);
      }

      // Create transaction
      const transaction = transactionRepository.createDocument({
        userId,
        walletId: wallet._id,
        type: 'payment',
        amount,
        description,
        nfcData
      });

      // Process the payment
      wallet.processTransaction(amount, 'payment');
      transaction.completeTransaction();

      // Save both wallet and transaction
      await Promise.all([
        walletRepository.save(wallet),
        transactionRepository.save(transaction)
      ]);

      logger.info(`Payment processed: ${transaction.referenceNumber} - ${amount} VND`);

      const transactionData = formatTransaction(transaction);
      transactionData.currency = wallet.currency;

      return {
        success: true,
        transaction: transactionData,
        wallet: {
          balance: toPlainNumber(wallet.balance),
          dailySpent: toPlainNumber(wallet.dailySpent),
          monthlySpent: toPlainNumber(wallet.monthlySpent)
        }
      };
    } catch (error) {
      logger.error('Payment processing error:', error.message);
      throw error;
    }
  }

  // Process a top-up transaction
  async processTopup(userId, amount, description) {
    try {
      // Get user's wallet
      const wallet = await walletRepository.findOne({ userId, isActive: true });
      if (!wallet) {
        throw new Error('Active wallet not found');
      }

      // Create transaction
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const referenceNumber = `TOPUP${timestamp}${random}`;

      const transaction = transactionRepository.createDocument({
        userId,
        walletId: wallet._id,
        type: 'topup',
        amount,
        description,
        referenceNumber,
        status: 'pending'
      });

      // Process the top-up
      wallet.processTransaction(amount, 'topup');
      transaction.completeTransaction();

      // Save both wallet and transaction
      await Promise.all([
        walletRepository.save(wallet),
        transactionRepository.save(transaction)
      ]);

      logger.info(`Top-up processed: ${transaction.referenceNumber} - ${amount} VND`);

      const transactionData = formatTransaction(transaction);
      transactionData.currency = wallet.currency;

      return {
        success: true,
        transaction: transactionData,
        wallet: {
          balance: toPlainNumber(wallet.balance)
        }
      };
    } catch (error) {
      logger.error('Top-up processing error:', error.message);
      throw error;
    }
  }

  // Process a refund transaction
  async processRefund(transactionId, reason) {
    try {
      // Find original transaction
      const originalTransaction = await transactionRepository.findById(transactionId);
      if (!originalTransaction || originalTransaction.status !== 'COMPLETED') {
        throw new Error('Original transaction not found or not completed');
      }

      if (originalTransaction.type === 'topup') {
        throw new Error('Cannot refund top-up transactions');
      }

      // Get user's wallet
      const wallet = await walletRepository.findById(originalTransaction.walletId);
      if (!wallet || !wallet.isActive) {
        throw new Error('Active wallet not found');
      }

      // Create refund transaction
      const refundTransaction = transactionRepository.createDocument({
        userId: originalTransaction.userId,
        walletId: wallet._id,
        type: 'refund',
        amount: originalTransaction.amount,
        description: `Refund for ${originalTransaction.referenceNumber}: ${reason}`,
        nfcData: originalTransaction.nfcData
      });

      // Process the refund
      wallet.processTransaction(originalTransaction.amount, 'refund');
      refundTransaction.completeTransaction();

      // Save both wallet and transaction
      await Promise.all([
        walletRepository.save(wallet),
        transactionRepository.save(refundTransaction)
      ]);

      logger.info(`Refund processed: ${refundTransaction.referenceNumber} - ${originalTransaction.amount} VND`);

      const transactionData = formatTransaction(refundTransaction);
      transactionData.currency = wallet.currency;

      return {
        success: true,
        transaction: transactionData,
        originalTransaction: originalTransaction.referenceNumber,
        wallet: {
          balance: toPlainNumber(wallet.balance)
        }
      };
    } catch (error) {
      logger.error('Refund processing error:', error.message);
      throw error;
    }
  }

  // Get user transaction history
  async getTransactionHistory(userId, page = 1, limit = 20, filters = {}) {
    try {
      // Build query
      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        throw new Error('Invalid user identifier');
      }

      const query = { userId: userObjectId };
      if (filters.type) query.type = filters.type.toUpperCase();
      if (filters.status) query.status = filters.status.toUpperCase();
      if (filters.category) query['metadata.category'] = filters.category;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const { transactions, pagination } = await transactionRepository.getTransactionsWithPagination(query, {
        page,
        limit,
        options: {
          populate: {
            path: 'processedBy',
            select: 'studentId profile.firstName profile.lastName'
          }
        }
      });

      let stats = {
        transactions: [],
        totalCount: 0,
        totalVolume: 0
      };

      try {
        stats = await transactionRepository.getTransactionStats(
          userObjectId,
          filters.startDate,
          filters.endDate
        );
      } catch (statsError) {
        logger.error(`Get transaction stats error: ${statsError.message}`, { stack: statsError.stack });
      }

      return {
        transactions: transactions.map(formatTransaction),
        pagination,
        stats
      };
    } catch (error) {
      logger.error(`Get transaction history error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStats(userId, startDate = null, endDate = null) {
    try {
      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        throw new Error('Invalid user identifier');
      }

      const stats = await transactionRepository.getTransactionStats(userObjectId, startDate, endDate);
      return stats;
    } catch (error) {
      logger.error(`Get transaction stats error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  // Get transaction by reference number
  async getTransactionByReference(referenceNumber, userId = null) {
    try {
      const normalizedReference = referenceNumber?.toString().trim().toUpperCase();
      if (!normalizedReference) {
        throw new Error('Transaction not found');
      }

      const transaction = await transactionRepository.findByReference(normalizedReference, {
        populate: [
          { path: 'userId', select: 'studentId email profile' },
          { path: 'walletId', select: 'balance currency' },
          { path: 'processedBy', select: 'studentId profile.firstName profile.lastName' }
        ]
      });

      if (!transaction) {
        logger.warn(`Transaction not found for reference ${normalizedReference}`);
        throw new Error('Transaction not found');
      }

      if (userId) {
        const requesterId = userId.toString();
        const ownerId = transaction.userId?._id?.toString() || transaction.userId?.toString();
        if (ownerId && ownerId !== requesterId) {
          logger.warn('Transaction ownership mismatch', {
            reference: normalizedReference,
            ownerId,
            requesterId
          });
          throw new Error('Transaction not found');
        }
      }

      const formatted = formatTransaction(transaction);
      formatted.user = {
        id: transaction.userId?._id,
        studentId: transaction.userId?.studentId,
        email: transaction.userId?.email,
        fullName: transaction.userId?.profile
          ? `${transaction.userId.profile.firstName || ''} ${transaction.userId.profile.lastName || ''}`.trim()
          : undefined
      };
      formatted.currency = transaction.walletId?.currency || formatted.currency;

      return formatted;
    } catch (error) {
      logger.error('Get transaction by reference error:', error.message);
      throw error;
    }
  }

  // Admin: Get all transactions
  async getAllTransactions(page = 1, limit = 20, filters = {}) {
    try {
      // Build query
      const query = {};

      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.userId) query.userId = filters.userId;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const { transactions, pagination } = await transactionRepository.getTransactionsWithPagination(query, {
        page,
        limit,
        options: {
          populate: [
            { path: 'userId', select: 'studentId email profile' },
            { path: 'walletId', select: 'balance currency' },
            { path: 'processedBy', select: 'studentId profile.firstName profile.lastName' }
          ]
        }
      });

      return {
        transactions: transactions.map(tx => {
          const formatted = formatTransaction(tx);
          formatted.user = {
            id: tx.userId?._id,
            studentId: tx.userId?.studentId,
            email: tx.userId?.email,
            fullName: tx.userId?.profile
              ? `${tx.userId.profile.firstName || ''} ${tx.userId.profile.lastName || ''}`.trim()
              : undefined
          };
          formatted.currency = tx.walletId?.currency || formatted.currency;
          return formatted;
        }),
        pagination
      };
    } catch (error) {
      logger.error('Get all transactions error:', error.message);
      throw error;
    }
  }

  // Admin: Process transaction status change
  async updateTransactionStatus(transactionId, status, processedBy, reason = null) {
    try {
      const transaction = await transactionRepository.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status
      transaction.status = status.toUpperCase();
      transaction.processedBy = processedBy;
      transaction.processedAt = new Date();

      if (reason) {
        transaction.failureReason = reason;
      }

      await transactionRepository.save(transaction);

      logger.info(`Transaction status updated: ${transaction.referenceNumber} -> ${status}`);

      return transaction;
    } catch (error) {
      logger.error('Update transaction status error:', error.message);
      throw error;
    }
  }

  // Admin: Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const transaction = await transactionRepository.findById(transactionId, {
        populate: [
          { path: 'userId', select: 'studentId email profile' },
          { path: 'walletId', select: 'balance currency' },
          { path: 'processedBy', select: 'studentId profile.firstName profile.lastName' }
        ]
      });

      if (!transaction) {
        return null;
      }

      const formatted = formatTransaction(transaction);
      formatted.user = {
        id: transaction.userId?._id,
        studentId: transaction.userId?.studentId,
        email: transaction.userId?.email,
        fullName: transaction.userId?.profile
          ? `${transaction.userId.profile.firstName || ''} ${transaction.userId.profile.lastName || ''}`.trim()
          : undefined
      };
      formatted.currency = transaction.walletId?.currency || formatted.currency;

      return formatted;
    } catch (error) {
      logger.error('Get transaction by ID error:', error.message);
      throw error;
    }
  }

  // Admin: Get transaction statistics for dashboard
  async getDashboardStats() {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const todayTransactions = await transactionRepository.getTodayCompletedTransactions(startOfDay, endOfDay);

      const todayStats = todayTransactions.reduce((acc, transaction) => {
        const amount = parseFloat(transaction.amount.toString());
        const type = transaction.type.toUpperCase();

        acc.totalTransactions += 1;
        acc.totalVolume += amount;

        if (type === 'PAYMENT') {
          acc.totalPayments += 1;
          acc.paymentVolume += amount;
        } else if (type === 'TOPUP') {
          acc.totalTopups += 1;
          acc.topupVolume += amount;
        }

        return acc;
      }, {
        totalTransactions: 0,
        totalVolume: 0,
        totalPayments: 0,
        paymentVolume: 0,
        totalTopups: 0,
        topupVolume: 0
      });

      const [totalUsers, totalWallets, walletStats, recentTransactions] = await Promise.all([
        userRepository.countDocuments({ isActive: true }),
        walletRepository.countDocuments({ isActive: true }),
        walletRepository.getWalletStats(),
        transactionRepository.getRecentTransactions({}, 10, {
          populate: {
            path: 'userId',
            select: 'studentId profile.firstName profile.lastName'
          }
        })
      ]);

      return {
        todayStats,
        systemStats: {
          totalUsers,
          totalWallets,
          totalBalance: walletStats.totalBalance,
          averageBalance: walletStats.averageBalance
        },
        recentTransactions: recentTransactions.map(tx => {
          const formatted = formatTransaction(tx);
          formatted.user = {
            id: tx.userId?._id,
            studentId: tx.userId?.studentId,
            fullName: tx.userId?.profile
              ? `${tx.userId.profile.firstName || ''} ${tx.userId.profile.lastName || ''}`.trim()
              : undefined
          };
          return formatted;
        })
      };
    } catch (error) {
      logger.error('Get dashboard stats error:', error.message);
      throw error;
    }
  }
}

module.exports = new PaymentService();