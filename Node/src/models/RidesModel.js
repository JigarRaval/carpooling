// const mongoose = require('mongoose');

// const rideSchema = new mongoose.Schema({
//   driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
//   departureLocation: { type: String, required: true },
//   arrivalLocation: { type: String, required: true },
//   departureTime: { type: Date, required: true },
//   arrivalTime: Date,
//   coordinates: {
//     pickup: {
//       lat: Number,
//       lng: Number
//     },
//     dropoff: {
//       lat: Number,
//       lng: Number
//     },
//     route: [[Number]]
//   },
//   distance: Number,
//   duration: Number,
//   fare: {
//     base: Number,
//     distance: Number,
//     time: Number,
//     surge: Number,
//     total: Number
//   },
//   status: {
//     type: String,
//     enum: ["pending", "accepted", "in-progress", "completed", "cancelled", "rejected"],
//     default: "pending"
//   },
//   paymentStatus: {
//     type: String,
//     enum: ["pending", "paid", "refunded", "failed"],
//     default: "pending"
//   },
//   rating: {
//     driver: {
//       value: { type: Number, min: 1, max: 5 },
//       comment: String
//     },
//     passenger: {
//       value: { type: Number, min: 1, max: 5 },
//       comment: String
//     }
//   },
//   earningsRecord: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Earnings'
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Ride', rideSchema);
const mongoose = require('mongoose');
const rideSchema = new mongoose.Schema({
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  pickupLocation: {
    address: String,
    coordinates: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  dropoffLocation: {
    address: String,
    coordinates: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  estimatedDistance: {
    type: Number, // in meters
    required: true
  },
  estimatedDuration: {
    type: Number, // in seconds
    required: true
  },
  actualDistance: Number,
  actualDuration: Number,
  fare: {
    base: {
      type: Number,
      required: true
    },
    distance: {
      type: Number,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    surge: {
      type: Number,
      default: 1.0
    },
    total: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "arrived", "in-progress", "completed", "cancelled", "rejected"],
    default: "pending"
  },
  payment: {
    method: {
      type: String,
      enum: ["cash", "card", "wallet", "voucher"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending"
    },
    transactionId: String
  },
  ratings: {
    driver: {
      value: { type: Number, min: 1, max: 5 },
      comment: String,
      timestamp: Date
    },
    passenger: {
      value: { type: Number, min: 1, max: 5 },
      comment: String,
      timestamp: Date
    }
  },
  events: [{
    type: {
      type: String,
      enum: ["requested", "accepted", "arrived", "started", "completed", "cancelled"]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number]
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ passenger: 1, status: 1 });
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

// Virtual for ride duration in minutes
rideSchema.virtual('durationMinutes').get(function () {
  return this.estimatedDuration ? Math.ceil(this.estimatedDuration / 60) : null;
});

// Virtual for ride distance in km
rideSchema.virtual('distanceKm').get(function () {
  return this.estimatedDistance ? (this.estimatedDistance / 1000).toFixed(1) : null;
});

module.exports = mongoose.model('Ride', rideSchema);