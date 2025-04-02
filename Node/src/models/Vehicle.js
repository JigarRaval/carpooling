const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    make: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1990,
        max: new Date().getFullYear() + 1
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    vehicleType: {
        type: String,
        enum: ['sedan', 'suv', 'van', 'luxury', 'electric'],
        default: 'sedan'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registration: {
        number: String,
        expiry: Date,
        document: String // URL to document image
    },
    insurance: {
        provider: String,
        policyNumber: String,
        expiry: Date,
        document: String // URL to document image
    }
}, {
    timestamps: true
});

// Index for faster queries
vehicleSchema.index({ driver: 1, isActive: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;