const earningsModel = require("../models/EarningsModel");
const rideModel = require("../models/RidesModel");

const recordEarning = async (req, res) => {
  try {
    const ride = await rideModel.findById(req.body.rideId);
    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    const newEarning = await earningsModel.create({
      ...req.body,
      driverId: ride.driverId
    });

    res.status(201).json({
      message: "Earning recorded successfully",
      data: newEarning
    });
  } catch (err) {
    res.status(500).json({
      message: "Error recording earning",
      error: err.message
    });
  }
};

const getDriverEarnings = async (req, res) => {
  try {
    const earnings = await earningsModel.find({ driverId: req.params.driverId });
    res.json({
      message: "Driver earnings fetched successfully",
      data: earnings
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching driver earnings",
      error: err.message
    });
  }
};

const getEarningsSummary = async (req, res) => {
  try {
    const summary = await earningsModel.aggregate([
      {
        $match: { driverId: mongoose.Types.ObjectId(req.params.driverId) }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
          totalRides: { $count: {} },
          averageEarning: { $avg: "$amount" }
        }
      }
    ]);
    
    res.json({
      message: "Earnings summary fetched successfully",
      data: summary[0] || {}
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching earnings summary",
      error: err.message
    });
  }
};

module.exports = {
  recordEarning,
  getDriverEarnings,
  getEarningsSummary
};