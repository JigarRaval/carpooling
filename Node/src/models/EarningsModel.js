const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rideId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ride', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'mobile_payment', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  commission: {
    type: Number,
    default: 0
  },
  tip: {
    type: Number,
    default: 0
  },
  deductions: [{
    reason: String,
    amount: Number
  }],
  netEarnings: {
    type: Number,
    required: true
  },
  transactionId: String,
  notes: String
}, { timestamps: true });

earningsSchema.index({ driverId: 1 });
earningsSchema.index({ date: 1 });
earningsSchema.index({ rideId: 1 });

module.exports = mongoose.model('Earnings', earningsSchema);