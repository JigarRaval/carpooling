const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: String
});

module.exports = mongoose.model('Rating', ratingSchema);
