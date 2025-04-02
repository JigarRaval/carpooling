const vehicleModel = require("../models/VehicleModel");
const userModel = require("../models/UserModel");

const registerVehicle = async (req, res) => {
  try {
    const driver = await userModel.findById(req.body.driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({
        message: "Driver not found"
      });
    }

    const newVehicle = await vehicleModel.create(req.body);
    
    // Update driver's vehicle reference
    await userModel.findByIdAndUpdate(req.body.driverId, { 
      vehicle: newVehicle._id 
    });

    res.status(201).json({
      message: "Vehicle registered successfully",
      data: newVehicle
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering vehicle",
      error: err.message
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await vehicleModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedVehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }
    res.json({
      message: "Vehicle updated successfully",
      data: updatedVehicle
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating vehicle",
      error: err.message
    });
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }
    res.json({
      message: "Vehicle fetched successfully",
      data: vehicle
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching vehicle",
      error: err.message
    });
  }
};

const getDriverVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleModel.findOne({ driverId: req.params.driverId });
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found for this driver"
      });
    }
    res.json({
      message: "Driver vehicle fetched successfully",
      data: vehicle
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching driver vehicle",
      error: err.message
    });
  }
};

module.exports = {
  registerVehicle,
  updateVehicle,
  getVehicle,
  getDriverVehicle
};