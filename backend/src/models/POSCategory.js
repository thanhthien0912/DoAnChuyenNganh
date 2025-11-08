const mongoose = require('mongoose');

const posCategorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    enum: ['BUS', 'CANTEEN', 'VENDING_MACHINE']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

posCategorySchema.index({ key: 1 }, { unique: true });
posCategorySchema.index({ displayOrder: 1 });

module.exports = mongoose.model('POSCategory', posCategorySchema);
