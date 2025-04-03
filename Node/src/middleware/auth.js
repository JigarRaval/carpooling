const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/UserModel");

module.exports = async function (req, res, next) {
  try {
    // Get token from header, cookie, or query
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.cookies?.token ||
      req.query?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check expiration
    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Find user
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Check account status
    if (user.status !== "active" && user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    // Driver-specific checks
    if (req.path.startsWith("/driver") || req.path.startsWith("/api/driver")) {
      if (user.role !== "driver") {
        return res.status(403).json({
          success: false,
          message: "Driver privileges required.",
        });
      }

      if (!user.driverDetails?.licenseNumber) {
        return res.status(403).json({
          success: false,
          message: "Complete your driver profile to access this feature.",
        });
      }

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

    let message = "Authentication failed";
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
