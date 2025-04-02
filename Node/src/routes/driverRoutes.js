const express = require("express");
const router = express.Router();
const {
  driverSignup,
  driverLogin,
  getDriverProfile,
  updateDriverProfile,
  getDriverStats,
  getRecentRides, 
  getDriverRides,
  getPassengerCount,
} = require("../controllers/authController");
const protectDriver = require("../middleware/auth");

router.post("/signup", driverSignup);
router.post("/login", driverLogin);

// Protected routes (require valid JWT and driver role)
router.use(protectDriver);

// Profile routes
router.get("/profile", getDriverProfile);
router.put("/profile", updateDriverProfile);

// Stats route
router.get("/rides", getDriverRides);
router.get("/stats", getDriverStats);
router.get("/rides/recent", getRecentRides); 
router.get("/passengers/count", getPassengerCount);

module.exports = router;
