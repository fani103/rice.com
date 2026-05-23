/**
 * FANEESH RICE SHOP — Order Model
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, default: '' },
  name:       { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantity:   { type: Number, required: true },
  image:      { type: String, default: '' },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  email:   { type: String, default: '' },
  address: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: () => 'FRS-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
  },
  customer:    { type: customerSchema, required: true },
  items:       { type: [orderItemSchema], required: true },
  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total:       { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['COD', 'WHATSAPP', 'RAZORPAY', 'ONLINE'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
  },
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

// ✅ This line is what was missing — registers the model with Mongoose
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;