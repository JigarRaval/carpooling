const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const { check } = require("express-validator");

// @route   POST /api/auth/driver/signup
// @desc    Register a new driver
// @access  Public
router.post(
  "/driver/signup",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phoneNumber", "Please include a valid phone number").isMobilePhone(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("licenseNumber", "Driver license number is required").not().isEmpty(),
  ],
  authController.driverSignup
);

// @route   POST /api/auth/driver/login
// @desc    Authenticate driver & get token
// @access  Public
router.post(
  "/driver/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.driverLogin
);

// @route   GET /api/auth/driver
// @desc    Get driver profile
// @access  Private (Driver)
router.get("/driver", auth, authController.getDriverProfile);

module.exports = router;
