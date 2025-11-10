const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  currency: {
    type: String,
    required: true,
    default: 'VND',
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency must be a valid 3-letter code (e.g., VND, USD)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dailyLimit: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 10000000, // 10,000,000 VND default daily limit
    min: [0, 'Daily limit cannot be negative'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  monthlyLimit: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 100000000, // 100,000,000 VND default monthly limit
    min: [0, 'Monthly limit cannot be negative'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  dailySpent: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  monthlySpent: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  lastTransactionDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Note: Daily/monthly counter reset is handled in processTransaction method and controllers
walletSchema.pre('save', function(next) {
  next();
});

// Instance methods
walletSchema.methods.canSpend = function(amount) {
  const balanceNum = parseFloat(this.balance.toString());
  const dailyLimitNum = parseFloat(this.dailyLimit.toString());
  const monthlyLimitNum = parseFloat(this.monthlyLimit.toString());
  const dailySpentNum = parseFloat(this.dailySpent.toString());
  const monthlySpentNum = parseFloat(this.monthlySpent.toString());

  return {
    canSpend: balanceNum >= amount &&
              (dailySpentNum + amount) <= dailyLimitNum &&
              (monthlySpentNum + amount) <= monthlyLimitNum,
    reason: this._getSpendingLimitReason(amount)
  };
};

walletSchema.methods._getSpendingLimitReason = function(amount) {
  const balanceNum = parseFloat(this.balance.toString());
  const dailyLimitNum = parseFloat(this.dailyLimit.toString());
  const monthlyLimitNum = parseFloat(this.monthlyLimit.toString());
  const dailySpentNum = parseFloat(this.dailySpent.toString());
  const monthlySpentNum = parseFloat(this.monthlySpent.toString());

  if (balanceNum < amount) {
    return 'Insufficient balance';
  }
  if ((dailySpentNum + amount) > dailyLimitNum) {
    return 'Daily limit exceeded';
  }
  if ((monthlySpentNum + amount) > monthlyLimitNum) {
    return 'Monthly limit exceeded';
  }
  return '';
};

walletSchema.methods.processTransaction = function(amount, type) {
  const amountNum = parseFloat(amount.toString());
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (type === 'payment' || type === 'transfer') {
    this.balance = parseFloat(this.balance.toString()) - amountNum;
    
    // Handle daily/monthly spent with reset logic
    if (this.lastTransactionDate) {
      const lastTxDate = new Date(this.lastTransactionDate);
      
      // Reset daily counter if it's a new day
      if (lastTxDate < todayStart) {
        this.dailySpent = amountNum;
      } else {
        this.dailySpent = parseFloat(this.dailySpent.toString()) + amountNum;
      }

      // Reset monthly counter if it's a new month
      if (lastTxDate < monthStart) {
        this.monthlySpent = amountNum;
      } else {
        this.monthlySpent = parseFloat(this.monthlySpent.toString()) + amountNum;
      }
    } else {
      // First transaction
      this.dailySpent = amountNum;
      this.monthlySpent = amountNum;
    }
    
    this.lastTransactionDate = now;
  } else if (type === 'topup' || type === 'refund') {
    this.balance = parseFloat(this.balance.toString()) + amountNum;
    this.lastTransactionDate = now;
  }
};

// Static methods
walletSchema.statics.getActiveWallets = function() {
  return this.find({ isActive: true }).populate('userId', 'studentId email profile');
};

walletSchema.statics.getWalletStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        activeWallets: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalBalance: { $sum: { $toDouble: '$balance' } },
        averageBalance: { $avg: { $toDouble: '$balance' } }
      }
    }
  ]);

  return stats[0] || {
    totalWallets: 0,
    activeWallets: 0,
    totalBalance: 0,
    averageBalance: 0
  };
};

module.exports = mongoose.model('Wallet', walletSchema);