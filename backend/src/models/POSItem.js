const mongoose = require('mongoose');

const posItemSchema = new mongoose.Schema({
  categoryKey: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: ['BUS', 'CANTEEN', 'VENDING_MACHINE']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: [0, 'Price must be positive'],
    set: val => parseFloat(val).toFixed(2),
    get: val => parseFloat(val.toString())
  },
  image: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    route: { type: String, trim: true },
    location: { type: String, trim: true },
    capacity: { type: Number },
    ingredients: [{ type: String, trim: true }]
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

posItemSchema.index({ categoryKey: 1, displayOrder: 1 });
posItemSchema.index({ categoryKey: 1, isAvailable: 1 });

module.exports = mongoose.model('POSItem', posItemSchema);
