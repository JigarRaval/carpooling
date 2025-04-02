const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const JWT_SECRET =
  "3f8a7b2c5e9d1f4a6c9b2d8e3f7a5c1d2e6f4a9b8c3d5e7f1a0b4c6d8e2f5a7";

// Generate JWT token
const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// Driver Signup
exports.driverSignup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Basic validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        error: "All fields are required",
        required: ["name", "email", "password", "phoneNumber"],
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password using bcrypt (same as userController)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new driver user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "driver",
    });

    res.status(201).json({
      message: "Driver created successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error creating driver.",
      error: error.message,
    });
  }
};

// Driver Login
exports.driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with driver role
    const user = await User.findOne({ email, role: "driver" });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare passwords using bcrypt (same as userController)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
