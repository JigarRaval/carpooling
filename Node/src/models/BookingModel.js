const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  bookingTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: Boolean, default: false }
});

module.exports = mongoose.model('Booking', bookingSchema);
