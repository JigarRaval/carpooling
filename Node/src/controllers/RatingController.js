const ratingModel = require("../models/RatingModel");

const submitRating = async (req, res) => {
  try {
    const newRating = await ratingModel.create(req.body);
    res.status(201).json({
      messege: "Rating submitted successfully",
      data: newRating
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error submitting rating",
      data: err
    });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const ratings = await ratingModel.find({ ratedTo: req.params.userId })
      .populate("ratedBy");
      
    res.json({
      messege: "Ratings fetched successfully",
      data: ratings
    });
  } catch (err) {
    res.status(500).json({
      messege: "Error fetching ratings",
      data: err
    });
  }
};

module.exports = {
  submitRating,
  getUserRatings
};
