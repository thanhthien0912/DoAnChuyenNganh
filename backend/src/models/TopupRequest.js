const mongoose = require('mongoose');

const topupRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: [1000, 'Minimum top-up amount is 1,000 VND'],
    max: [50000000, 'Maximum top-up amount is 50,000,000 VND'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  method: {
    type: String,
    enum: ['MANUAL', 'BANK_TRANSFER', 'QR_PAY', 'CARD'],
    default: 'MANUAL',
    uppercase: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
    uppercase: true
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

topupRequestSchema.pre('validate', function(next) {
  if (!this.referenceNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referenceNumber = `TPRQ${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('TopupRequest', topupRequestSchema);
