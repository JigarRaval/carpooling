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
        status: "active", // Changed from pending_verification to active
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

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
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
    console.error("Driver login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
};

// @desc    Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user || user.role !== "driver") {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        licenseNumber: user.driverDetails?.licenseNumber,
        vehicleDetails: user.driverDetails?.vehicleDetails,
        status: user.driverDetails?.status,
      },
    });
  } catch (err) {
    console.error("Get driver profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching driver profile",
      error: err.message,
    });
  }
};

// @desc    Update driver profile
exports.updateDriverProfile = async (req, res) => {
  try {
    const { name, phoneNumber, licenseNumber, vehicleDetails } = req.body;

    // Prepare updates
    const updates = {};
    if (name) updates.name = name;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    // Add driver-specific updates
    updates.$set = {};
    if (licenseNumber)
      updates.$set["driverDetails.licenseNumber"] = licenseNumber;
    if (vehicleDetails) {
      updates.$set["driverDetails.vehicleDetails"] = {
        make: vehicleDetails.make || "",
        model: vehicleDetails.model || "",
        year: vehicleDetails.year || "",
        color: vehicleDetails.color || "",
        licensePlate: vehicleDetails.licensePlate || "",
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        licenseNumber: updatedUser.driverDetails?.licenseNumber,
        vehicleDetails: updatedUser.driverDetails?.vehicleDetails,
        status: updatedUser.driverDetails?.status,
      },
    });
  } catch (err) {
    console.error("Update driver profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: err.message,
    });
  }
};

// @desc    Get driver statistics

// @desc    Get recent rides for driver
exports.getRecentRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('passenger', 'name');

    const formattedRides = rides.map(ride => ({
      id: ride._id,
      from: ride.pickupLocation.address,
      to: ride.dropoffLocation.address,
      date: ride.createdAt.toLocaleDateString(),
      passengers: ride.passengerCount || 1,
      fare: ride.fare?.total || 0,
      passengerName: ride.passenger?.name || 'Anonymous'
    }));

    res.json({
      success: true,
      rides: formattedRides
    });
  } catch (err) {
    console.error("Get recent rides error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching recent rides",
      error: err.message,
    });
  }
};

// @desc    Get passenger count for driver
exports.getPassengerCount = async (req, res) => {
  try {
    const result = await Ride.aggregate([
      { $match: { driver: req.user.id } },
      { $group: { _id: null, count: { $sum: "$passengerCount" } } }
    ]);

    const passengerCount = result[0]?.count || 0;

    res.json({
      success: true,
      count: passengerCount
    });
  } catch (err) {
    console.error("Get passenger count error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching passenger count",
      error: err.message,
    });
  }
};

// Update the existing getDriverStats to include upcoming rides
exports.getDriverStats = async (req, res) => {
  try {
    const stats = {
      totalRides: await Ride.countDocuments({ driver: req.user.id }),
      completedRides: await Ride.countDocuments({
        driver: req.user.id,
        status: "completed",
      }),
      upcomingRides: await Ride.countDocuments({
        driver: req.user.id,
        status: { $in: ["pending", "accepted", "arrived", "in-progress"] },
      }),
      earnings: 0,
      averageRating: 0,
    };

    // Calculate earnings
    const earningsResult = await Ride.aggregate([
      { $match: { driver: req.user.id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fare.total" } } },
    ]);
    stats.earnings = earningsResult[0]?.total || 0;

    // Calculate average rating
    const ratingResult = await Ride.aggregate([
      {
        $match: {
          driver: req.user.id,
          "ratings.passenger.value": { $exists: true },
        },
      },
      { $group: { _id: null, average: { $avg: "$ratings.passenger.value" } } },
    ]);
    stats.averageRating = ratingResult[0]?.average || 0;

    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Get driver stats error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching driver stats",
      error: err.message,
    });
  }
};
// @desc    Get all rides for a driver
exports.getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id })
      .sort({ createdAt: -1 })
      .populate('passenger', 'name email phoneNumber')
      .lean();

    const formattedRides = rides.map(ride => ({
      id: ride._id,
      origin: ride.pickupLocation?.address || 'Not specified',
      destination: ride.dropoffLocation?.address || 'Not specified',
      date: ride.createdAt.toLocaleDateString(),
      time: ride.pickupTime || 'Not specified',
      status: ride.status,
      fare: ride.fare?.total || 0,
      passengerCount: ride.passengerCount || 1,
      passenger: ride.passenger || null,
      vehicle: ride.vehicleDetails || null,
      createdAt: ride.createdAt
    }));

    res.json({
      success: true,
      rides: formattedRides
    });
  } catch (err) {
    console.error("Get driver rides error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching driver rides",
      error: err.message,
    });
  }
};