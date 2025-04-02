const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10,15}$/, "is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["driver", "passenger", "admin"],
      required: true,
      default: "passenger",
    },
    driverDetails: {
      licenseNumber: {
        type: String,
        required: function () {
          return this.role === "driver";
        },
      },
      vehicleDetails: {
        make: String,
        model: String,
        year: Number,
        color: String,
        licensePlate: String,
      },
      status: {
        type: String,
        enum: ["pending_verification", "approved", "rejected", "suspended"],
        default: "pending_verification",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
