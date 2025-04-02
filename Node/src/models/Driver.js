const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleDetails: {
      make: String,
      model: String,
      year: Number,
      licensePlate: String,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
