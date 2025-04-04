const express = require("express");
const router = express.Router();
const {
  driverSignup,
  driverLogin,
  getDriverProfile,
  updateDriverProfile,
  // getDriverRides,
} = require("../controllers/authController");
const protectDriver = require("../middleware/auth");
const Ride = require("../models/RidesModel");
const Earnings = require("../models/EarningsModel");
const Vehicle = require("../models/Vehicle");
const {
  getDriverRides, // Add this import
  updateRide,
  deleteRide,
} = require("../controllers/RideController");

router.post("/signup", driverSignup);
router.post("/login", driverLogin);

router.get("/my-rides", getDriverRides);
router.use(protectDriver);

router.put("/rides/:id", updateRide);
router.delete("/rides/:id", deleteRide);
router.get("/dashboard", async (req, res) => {
  try {
    const driverId = req.user.id;

    const vehicle = await Vehicle.findOne({ driver: driverId });

    // Get ride stats
    const rideStats = await Ride.aggregate([
      { $match: { driver: driverId } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          completedRides: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          cancelledRides: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
          totalEarnings: {
            $sum: "$fare.total",
          },
        },
      },
    ]);

    // Get recent rides
    const recentRides = await Ride.find({ driver: driverId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("passenger", "name phoneNumber");

    // Get weekly earnings
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEarnings = await Earnings.aggregate([
      {
        $match: {
          driverId: driverId,
          paymentStatus: "completed",
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$netEarnings" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      vehicle,
      stats: rideStats[0] || {
        totalRides: 0,
        completedRides: 0,
        cancelledRides: 0,
        totalEarnings: 0,
      },
      recentRides,
      weeklyEarnings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Ride management routes
// Add this route to your existing driverRoutes.js
router.get("/rides", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { driver: req.user.id };

    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("passenger", "name phoneNumber");

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      rides,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Add this to your existing driverRoutes.js
router.get("/my-rides", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const driverId = req.user.id;

    const query = { driver: driverId };
    if (status) query.status = status;

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("passenger", "name phoneNumber profilePhoto");

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Rides fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rides",
      error: error.message,
    });
  }
});

// Earnings routes
router.get("/earnings", async (req, res) => {
  try {
    const { page = 1, limit = 10, period } = req.query;
    const query = { driverId: req.user.id, paymentStatus: "completed" };

    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.createdAt = { $gte: oneWeekAgo };
    } else if (period === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.createdAt = { $gte: oneMonthAgo };
    }

    const earnings = await Earnings.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("rideId");

    const total = await Earnings.countDocuments(query);

    const totalEarnings = await Earnings.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$netEarnings" } } },
    ]);

    res.json({
      earnings,
      total,
      totalEarnings: totalEarnings[0]?.total || 0,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Vehicle routes
router.get("/vehicle", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ driver: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ message: "No vehicle found" });
    }
    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/vehicle", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { driver: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/vehicle", async (req, res) => {
  try {
    const { make, model, year, color, licensePlate, vehicleType } = req.body;

    // Validate input
    if (!make || !model || !year || !color || !licensePlate) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newVehicle = await Vehicle.create({
      driver: req.user.id,
      make,
      model,
      year,
      color,
      licensePlate,
      vehicleType: vehicleType || "sedan",
    });

    // Update user's vehicle reference
    await User.findByIdAndUpdate(req.user.id, {
      "driverDetails.vehicleDetails": {
        make,
        model,
        year,
        color,
        licensePlate,
      },
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ message: "License plate already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Update vehicle
router.put("/vehicle/:id", async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, driver: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Update user's vehicle reference
    await User.findByIdAndUpdate(req.user.id, {
      "driverDetails.vehicleDetails": {
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        color: updatedVehicle.color,
        licensePlate: updatedVehicle.licensePlate,
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete vehicle
router.delete("/vehicle/:id", async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      driver: req.user.id,
    });

    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Remove vehicle reference from user
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { "driverDetails.vehicleDetails": 1 },
    });

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
