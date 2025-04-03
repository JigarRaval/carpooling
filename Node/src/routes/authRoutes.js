const express = require("express");
const router = express.Router();
const {
  driverSignup,
  driverLogin,
  // getDriverProfile,
  // updateDriverProfile,
  // getDriverStats,
  // getRecentRides,
  // getDriverRides,
  // getPassengerCount,
  // cancelRide,
} = require("../controllers/authController");
const protectDriver = require("../middleware/auth");

// Public routes
router.post("/signup", driverSignup);
router.post("/login", driverLogin);

// Protected routes
// router.get("/profile", protectDriver, getDriverProfile);
// router.put("/profile", protectDriver, updateDriverProfile);
// router.get("/rides", protectDriver, getDriverRides);
// router.put("/rides/:id/cancel", protectDriver, cancelRide);
// router.get("/stats", protectDriver, getDriverStats);
// router.get("/rides/recent", protectDriver, getRecentRides);
// router.get("/passengers/count", protectDriver, getPassengerCount);

module.exports = router;
