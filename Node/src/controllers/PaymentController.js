const paymentModel = require("../models/PaymentModel");
const bookingModel = require("../models/BookingModel");

const processPayment = async (req, res) => {
  try {
    const booking = await bookingModel.findById(req.body.bookingId);
    if (!booking) {
      return res.status(404).json({
        messege: "Booking not found"
      });
    }

    const paymentData = {
      ...req.body,
      status: "completed"
    };

    const newPayment = await paymentModel.create(paymentData);
    
    // Update booking payment status
    booking.paymentStatus = true;
    await booking.save();

    res.status(201).json({
      messege: "Payment processed successfully",
      data: newPayment
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error processing payment",
      data: err
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentModel.find({ userId: req.params.userId })
      .populate("bookingId");
      
    res.json({
      messege: "Payment history fetched",
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error fetching payments",
      data: err
    });
  }
};

module.exports = {
  processPayment,
  getPaymentHistory
};
