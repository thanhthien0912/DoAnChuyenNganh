const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  uid: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 4,
    maxlength: 64
  },
  alias: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'LOCKED', 'PENDING'],
    default: 'ACTIVE',
    uppercase: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  lastUsedAt: {
    type: Date
  },
  linkedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    deviceModel: { type: String, trim: true },
    issuer: { type: String, trim: true }
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

cardSchema.index({ userId: 1, status: 1 });

cardSchema.statics.getUserCards = function(userId) {
  return this.find({ userId }).sort({ isPrimary: -1, linkedAt: -1 });
};

cardSchema.methods.markAsUsed = function() {
  this.lastUsedAt = new Date();
};

module.exports = mongoose.model('Card', cardSchema);
