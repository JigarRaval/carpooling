const Driver = require("../models/Driver");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Driver Signup
exports.driverSignup = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phoneNumber,
      licenseNumber,
      vehicleDetails,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        field: "email",
      });
    }

    // Create user
    const user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      name,
      phoneNumber,
      role: "driver",
    });

    await user.save();

    // Create driver
    const driver = new Driver({
      user: user._id,
      licenseNumber,
      vehicleDetails,
    });

    await driver.save();

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      userId: user._id,
      driverId: driver._id,
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.code === 11000) {
      if (err.keyPattern?.licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "License number already exists",
          field: "licenseNumber",
        });
      }
      if (err.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
          field: "email",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Driver Login
exports.driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email, role: "driver" });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get driver profile
    const driver = await Driver.findOne({ user: user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      driverId: driver._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("user", "name email phoneNumber")
      .select("-__v");

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Driver Profile
exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate("user", "name email phoneNumber")
      .select("-__v");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
