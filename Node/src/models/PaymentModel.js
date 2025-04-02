const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'wallet'], required: true },
  amount: { type: Number, required: true },
  transactionTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], required: true }
});

module.exports = mongoose.model('Payment', paymentSchema);
