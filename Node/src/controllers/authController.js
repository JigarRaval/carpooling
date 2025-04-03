const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const Ride = require("../models/RidesModel");

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ user: { id: userId, role } }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "24h",
  });
};

// @desc    Register a new driver
exports.driverSignup = async (req, res) => {
  const { name, email, phoneNumber, password, licenseNumber, vehicleDetails } =
    req.body;

  try {
    // Validate input
    if (!name || !email || !phoneNumber || !password || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create driver user
    user = new User({
      name,
      email,
      phoneNumber,
      password,
      role: "driver",
      driverDetails: {
        licenseNumber,
        vehicleDetails: {
          make: vehicleDetails?.make || "",
          model: vehicleDetails?.model || "",
          year: vehicleDetails?.year || "",
          color: vehicleDetails?.color || "",
          licensePlate: vehicleDetails?.licensePlate || "",
        },
        status: "approved", // Changed from pending_verification to active
      },
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      driver: {
        licenseNumber: user.driverDetails.licenseNumber,
        vehicleDetails: user.driverDetails.vehicleDetails,
      },
    });
  } catch (err) {
    console.error("Driver signup error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: err.message,
    });
  }
};

// @desc    Authenticate driver & get token
exports.driverLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Check if user exists and is a driver
    const user = await User.findOne({ email });
    if (!user || user.role !== "driver") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or not a driver account",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token with proper expiration
    const token = jwt.sign(
      { user: { id: user.id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "24h" }
    );

    // Set cookie if using cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return response with token
    res.json({
      success: true,
      token, // Still return token for localStorage if needed
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      driver: {
        licenseNumber: user.driverDetails.licenseNumber,
        vehicleDetails: user.driverDetails.vehicleDetails,
      },
    });
  } catch (err) {
    console.error("Driver login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
};
