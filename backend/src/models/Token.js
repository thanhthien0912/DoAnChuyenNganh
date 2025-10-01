const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['access', 'refresh'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  blacklisted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Token', tokenSchema);
