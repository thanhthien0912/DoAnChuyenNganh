const mongoose = require('mongoose');

const favoriteTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  categoryKey: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POSItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: [0, 'Amount must be positive'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

favoriteTransactionSchema.index({ userId: 1, createdAt: -1 });
favoriteTransactionSchema.index({ userId: 1, categoryKey: 1 });

module.exports = mongoose.model('FavoriteTransaction', favoriteTransactionSchema);
