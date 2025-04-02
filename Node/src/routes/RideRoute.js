const express = require('express');
const router = express.Router();
const rideController = require('../controllers/RideController');

// Ride management routes
router.post('/', rideController.createRide);
router.get('/', rideController.getAllRides);
router.get('/available', rideController.getAvailableRides);
router.post('/:id/accept', rideController.acceptRide);

// Single ride operations
router.get('/:id', rideController.getRideById);
router.put('/:id', rideController.updateRide);
router.delete('/:id', rideController.deleteRide);

// Driver-specific rides
router.get('/driver/:id', rideController.getRidesByDriverId);

module.exports = router;