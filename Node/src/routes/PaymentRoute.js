const router = require("express").Router();
const paymentController = require("../controllers/PaymentController");

router.post("/payment", paymentController.processPayment);
router.get("/payments/:userId", paymentController.getPaymentHistory);

module.exports = router;
