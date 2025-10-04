const mongoose = require('mongoose');
const BaseRepository = require('./BaseRepository');
const Transaction = require('../models/Transaction');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class TransactionRepository extends BaseRepository {
  constructor() {
    super(Transaction);
  }

  findByReference(referenceNumber, options = {}) {
    if (!referenceNumber) {
      return Promise.resolve(null);
    }

    const normalizedReference = referenceNumber.toString().trim();
    const caseInsensitiveQuery = {
      referenceNumber: {
        $regex: `^${escapeRegex(normalizedReference)}$`,
        $options: 'i'
      }
    };

    return this.findOne(caseInsensitiveQuery, options);
  }

  async getTransactionsWithPagination(filter = {}, { page = 1, limit = 20, options = {} }) {
    const skip = (page - 1) * limit;

    const transactions = await this.find(filter, {
      ...options,
      skip,
      limit,
      sort: options.sort || { createdAt: -1 }
    });

    const total = await this.countDocuments(filter);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  getTransactionStats(userId, startDate, endDate) {
    return Transaction.getTransactionStats(userId, startDate, endDate);
  }

  getTodayCompletedTransactions(startOfDay, endOfDay) {
    return this.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'COMPLETED'
    });
  }

  getRecentTransactions(filter = {}, limit = 10, options = {}) {
    return this.find(filter, {
      ...options,
      limit,
      sort: { createdAt: -1 }
    });
  }

  getRecentTransactionsByUser(userId, limit = 5, options = {}) {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return this.getRecentTransactions({ userId: userObjectId }, limit, options);
  }

  async getUserSpendInRange(userId, startDate, endDate, types = ['PAYMENT']) {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const matchStage = {
      userId: userObjectId,
      status: 'COMPLETED'
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    if (types?.length) {
      matchStage.type = { $in: types.map(type => type.toUpperCase()) };
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        }
      }
    ]);

    if (!stats.length) {
      return { total: 0, count: 0 };
    }

    return {
      total: stats[0].total,
      count: stats[0].count
    };
  }
}

module.exports = new TransactionRepository();
