const router = require("express").Router();
const ratingController = require("../controllers/RatingController");

router.post("/rating", ratingController.submitRating);
router.get("/ratings/:userId", ratingController.getUserRatings);

module.exports = router;

