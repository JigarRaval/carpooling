const express = require("express");
const router = express.Router();
const {
  driverSignup,
  driverLogin,
 
} = require("../controllers/authController");
const protectDriver = require("../middleware/auth");
const Ride = require("../models/RidesModel");
const Earnings = require("../models/EarningsModel");
const Vehicle = require("../models/Vehicle");


router.post("/signup", driverSignup);
router.post("/login", driverLogin);

// Protected routes (require valid JWT and driver role)
router.use(protectDriver);
router.get("/dashboard", async (req, res) => {
  try {
    const driverId = req.user.id;

    // Get current vehicle
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
      rides,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

// Profile routes


module.exports = router;
