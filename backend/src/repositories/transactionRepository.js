const BaseRepository = require('./BaseRepository');
const Transaction = require('../models/Transaction');

class TransactionRepository extends BaseRepository {
  constructor() {
    super(Transaction);
  }

  findByReference(referenceNumber, options = {}) {
    return this.findOne({ referenceNumber }, options);
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

  getRecentTransactions(limit = 10, options = {}) {
    return this.find({}, {
      ...options,
      limit,
      sort: { createdAt: -1 }
    });
  }
}

module.exports = new TransactionRepository();
