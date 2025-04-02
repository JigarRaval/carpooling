const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/EarningController');

// Earnings recording and retrieval
router.post('/', earningsController.recordEarning);
router.get('/driver/:driverId', earningsController.getDriverEarnings);
router.get('/driver/:driverId/summary', earningsController.getEarningsSummary);

module.exports = router;