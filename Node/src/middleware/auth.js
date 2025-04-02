const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables
const User = require("../models/UserModel");

module.exports = async function (req, res, next) {
  // Get token from header or cookie
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  try {
    // Verify token using environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Find user and exclude password
    const user = await User.findById(decoded.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    // Driver-specific checks
    if (req.path.startsWith("/driver")) {
      if (user.role !== "driver") {
        return res.status(403).json({
          success: false,
          message: "Driver privileges required for this action.",
        });
      }

      // Check if driver profile is complete
      if (!user.driverDetails || !user.driverDetails.licenseNumber) {
        return res.status(403).json({
          success: false,
          message: "Complete your driver profile to access this feature.",
        });
      }

      // Attach driver details to request
      req.driver = {
        licenseNumber: user.driverDetails.licenseNumber,
        vehicleDetails: user.driverDetails.vehicleDetails,
      };
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);

    // Clear invalid token cookie if exists
    if (req.cookies?.token) {
      res.clearCookie("token");
    }

    let message = "Invalid authentication token";
    if (err.name === "TokenExpiredError") {
      message = "Session expired. Please log in again.";
    } else if (err.name === "JsonWebTokenError") {
      message = "Invalid authentication token";
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};
