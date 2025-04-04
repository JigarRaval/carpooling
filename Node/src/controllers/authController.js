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
exports.getDriverRides = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const driverId = req.user.id;

    const query = { driver: driverId };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "driver", select: "name email phone profilePhoto" },
        { path: "passenger", select: "name email phone profilePhoto" },
      ],
    };

    const rides = await rideModel.paginate(query, options);

    res.json({
      success: true,
      data: {
        rides: rides.docs,
        pagination: {
          total: rides.totalDocs,
          pages: rides.totalPages,
          page: rides.page,
          limit: rides.limit,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching driver rides:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: err.message,
    });
  }
};
exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id)
      .select("-password -__v")
      .lean();

    if (!driver || driver.role !== "driver") {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update driver profile
exports.updateDriverProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow role or email changes
    if (updateData.role || updateData.email) {
      return res.status(400).json({
        success: false,
        message: "Cannot change role or email",
      });
    }

    // Handle password updates separately if needed
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedDriver = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver profile updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating driver data",
      error: error.message,
    });
  }
};
