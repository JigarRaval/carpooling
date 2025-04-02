const router = require("express").Router();
const bookingController = require("../controllers/BookingController");

router.post("/booking", bookingController.createBooking);
router.get("/bookings/:userId", bookingController.getBookingsByUser);
router.put("/booking/:id", bookingController.updateBookingStatus);

module.exports = router;