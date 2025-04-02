const bookingModel = require("../models/BookingModel");
const rideModel = require("../models/RidesModel");

const createBooking = async (req, res) => {
  try {
    const ride = await rideModel.findById(req.body.rideId);
    if (!ride) {
      return res.status(404).json({
        messege: "Ride not found"
      });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({
        messege: "No available seats"
      });
    }

    const newBooking = await bookingModel.create(req.body);
    
    // Update available seats
    ride.availableSeats -= 1;
    await ride.save();

    res.status(201).json({
      messege: "Booking created successfully",
      data: newBooking
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error creating booking",
      data: err
    });
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await bookingModel.find({ passengerId: req.params.userId })
      .populate("rideId")
      .populate("passengerId");
      
    res.json({
      messege: "Bookings fetched successfully",
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error fetching bookings",
      data: err
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const updatedBooking = await bookingModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({
      messege: "Booking status updated",
      data: updatedBooking
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error updating booking",
      data: err
    });
  }
};

module.exports = {
  createBooking,
  getBookingsByUser,
  updateBookingStatus
};
