const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  stock: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  tag: {
    type: String,
    enum: ['Best Seller', 'Premium', 'Organic', 'New Arrival', 'Budget Pick'],
    default: 'Best Seller'
  },
  type: {
    type: String,
    enum: ['Premium', 'Organic', 'Standard'],
    default: 'Standard'
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);