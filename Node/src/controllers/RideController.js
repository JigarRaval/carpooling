const rideModel = require("../models/RidesModel");
const userModel = require("../models/UserModel");
const { validationResult } = require('express-validator');

const createRide = async (req, res) => {
  try {
    // Transform incoming data to match schema
    // console.log(req.body);
     
    const rideData = {
      driver: req.body.driverId, // Map driverId → driver
      passenger: req.body.passengerId, // Map passengerId → passenger
      pickupLocation: {
        address: req.body.departureLocation,
        coordinates: {
          type: "Point",
          coordinates: req.body.departureCoordinates // [lng, lat]
        }
      },
      dropoffLocation: {
        address: req.body.arrivalLocation,
        coordinates: {
          type: "Point",
          coordinates: req.body.arrivalCoordinates // [lng, lat]
        }
      },
      estimatedDistance: req.body.distance,
      estimatedDuration: req.body.duration,
      fare: {
        base: req.body.baseFare || 5,
        distance: req.body.distanceFare || 0,
        time: req.body.timeFare || 0,
        surge: req.body.surgeMultiplier || 1.0,
        total: req.body.totalFare
      },
      status: "pending",
      payment: {
        method: req.body.paymentMethod || "cash"
      }
    };



    const newRide = await rideModel.create(rideData);

    const populatedRide = await rideModel.findById(newRide._id)
      .populate('driver', 'name email')
      .populate('passenger', 'name email');

    res.status(201).json({
      success: true,
      message: "Ride created successfully",
      data: populatedRide, // This contains _id
      rideId: populatedRide._id // Explicitly send ID
    });

  } catch (err) {
    console.error("Error creating ride:", err);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors || err.message
    });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await rideModel.find()
      .populate("driverId", 'name email phone rating')
      .sort({ departureTime: 1 });

    res.json({
      success: true,
      message: "Rides fetched successfully",
      count: rides.length,
      data: rides
    });
  } catch (err) {
    console.error("Error fetching rides:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: err.message
    });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await rideModel.findById(req.params.id)
      .populate("driverId", 'name email phone rating');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    res.json({
      success: true,
      message: "Ride fetched successfully",
      data: ride
    });
  } catch (err) {
    console.error("Error fetching ride:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching ride",
      error: err.message
    });
  }
};

const getRidesByDriverId = async (req, res) => {
  try {
    const rides = await rideModel.find({ driver: req.params.id })
      .populate("driver", 'name email')
      .sort({ departureTime: -1 });

    if (!rides || rides.length === 0) {
      // console.log("error 1");

      return res.status(404).json({
        success: false,
        message: "No rides found for this driver"
      });
    }

    res.json({
      success: true,
      message: "Rides fetched successfully",
      count: rides.length,
      data: rides
    });
  } catch (err) {
    console.error("Error fetching driver rides:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: err.message
    });
  }
};

const updateRide = async (req, res) => {
  try {
    const updatedRide = await rideModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    ).populate("driverId", 'name email');

    if (!updatedRide) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    res.json({
      success: true,
      message: "Ride updated successfully",
      data: updatedRide
    });
  } catch (err) {
    console.error("Error updating ride:", err);
    res.status(500).json({
      success: false,
      message: "Error updating ride",
      error: err.message
    });
  }
};

const deleteRide = async (req, res) => {
  try {
    const deletedRide = await rideModel.findByIdAndDelete(req.params.id);

    if (!deletedRide) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    res.json({
      success: true,
      message: "Ride deleted successfully",
      data: deletedRide
    });
  } catch (err) {
    console.error("Error deleting ride:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting ride",
      error: err.message
    });
  }
};

const getAvailableRides = async (req, res) => {
  try {
    const rides = await rideModel.find({
      status: "pending",
      departureTime: { $gte: new Date() }
    })
      .populate("driverId", 'name rating')
      .sort({ departureTime: 1 });

    res.json({
      success: true,
      message: "Available rides fetched successfully",
      count: rides.length,
      data: rides
    });
  } catch (err) {
    console.error("Error fetching available rides:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching available rides",
      error: err.message
    });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;

    // Verify driver exists
    const driver = await userModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const ride = await rideModel.findByIdAndUpdate(
      rideId,
      {
        driverId,
        status: "accepted",
        updatedAt: new Date()
      },
      { new: true }
    ).populate("driverId", 'name email phone');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    res.json({
      success: true,
      message: "Ride accepted successfully",
      data: ride
    });
  } catch (err) {
    console.error("Error accepting ride:", err);
    res.status(500).json({
      success: false,
      message: "Error accepting ride",
      error: err.message
    });
  }
};

module.exports = {
  createRide,
  getAllRides,
  getRideById,
  getRidesByDriverId,
  updateRide,
  deleteRide,
  getAvailableRides,
  acceptRide
};