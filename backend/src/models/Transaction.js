const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['TOPUP', 'PAYMENT', 'REFUND', 'TRANSFER'],
    uppercase: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: [1000, 'Minimum transaction amount is 1,000 VND'],
    max: [10000000, 'Maximum transaction amount is 10,000,000 VND'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    uppercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  nfcData: {
    deviceId: { type: String, trim: true },
    terminalId: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now }
  },
  metadata: {
    merchantName: { type: String, trim: true },
    category: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    notes: { type: String, trim: true }
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Generate unique reference number before saving
transactionSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referenceNumber = `TXN${timestamp}${random}`;
  }
  next();
});

// Index for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ referenceNumber: 1 }, { unique: true });

// Instance methods
transactionSchema.methods.completeTransaction = function(processedBy = null) {
  this.status = 'COMPLETED';
  this.processedAt = new Date();
  if (processedBy) {
    this.processedBy = processedBy;
  }
};

transactionSchema.methods.failTransaction = function(reason) {
  this.status = 'FAILED';
  this.processedAt = new Date();
  this.failureReason = reason;
};

transactionSchema.methods.cancelTransaction = function() {
  this.status = 'CANCELLED';
  this.processedAt = new Date();
};

// Static methods
transactionSchema.statics.getUserTransactions = function(userId, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('walletId', 'balance currency')
    .populate('processedBy', 'studentId profile.firstName profile.lastName');
};

transactionSchema.statics.getTransactionsByStatus = function(status, limit = 50, skip = 0) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'studentId email profile')
    .populate('processedBy', 'studentId profile.firstName profile.lastName');
};

transactionSchema.statics.getTransactionStats = async function(userId, startDate, endDate) {
  const matchStage = {};
  if (userId) {
    const idString = userId instanceof mongoose.Types.ObjectId ? userId.toString() : userId;
    if (!idString || !mongoose.Types.ObjectId.isValid(idString)) {
      throw new Error('Invalid user ID for transaction stats');
    }

    matchStage.userId = new mongoose.Types.ObjectId(idString);
  }
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: { $toDouble: '$amount' } },
        averageAmount: { $avg: { $toDouble: '$amount' } }
      }
    },
    {
      $group: {
        _id: null,
        transactions: {
          $push: {
            type: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            averageAmount: '$averageAmount'
          }
        },
        totalCount: { $sum: '$count' },
        totalVolume: { $sum: '$totalAmount' }
      }
    }
  ]);

  return stats[0] || {
    transactions: [],
    totalCount: 0,
    totalVolume: 0
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);