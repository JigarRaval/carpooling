const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/VehicalController');

// Vehicle registration and management
router.post('/', vehicleController.registerVehicle);
router.get('/:id', vehicleController.getVehicle);
router.put('/:id', vehicleController.updateVehicle);

// Driver's vehicle
router.get('/driver/:driverId', vehicleController.getDriverVehicle);

module.exports = router;