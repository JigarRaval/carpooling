const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailUtil = require("../utils/MailUtil");
const jwt = require("jsonwebtoken");
const secret = "secret";
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body.email);


    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: "Email not found." });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful.",
      data: foundUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const signUp = async (req, res) => {
  try {
 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Remove confirmPassword from the request body
    delete req.body.confirmPassword;

    const createdUser = await userModel.create(req.body);
    res.status(201).json({
      message: "User created successfully.",
      data: createdUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user.", data: err });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({
      message: "Users fetched successfully.",
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    res.json({
      message: "User deleted successfully.",
      data: deletedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user." });
  }
};

const getUserById = async (req, res) => {
  try {
    const foundUser = await userModel.findById(req.params.id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      message: "User fetched successfully.",
      data: foundUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user." });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user data', error });
  }
};
const getUser = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  res.send(user);
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;
  const foundUser = await userModel.findOne({ email: email });

  if (foundUser) {
    const token = jwt.sign(foundUser.toObject(), secret);
    console.log(token);
    const url = `http://localhost:5173/resetpassword/${token}`;
    const mailContent = `<html>
                          <a href ="${url}">rest password</a>
                          </html>`;
    //email...
    await mailUtil.sendingMail(foundUser.email, "reset password", mailContent);
    res.json({
      message: "reset password link sent to mail.",
    });
  } else {
    res.json({
      message: "user not found register first..",
    });
  }
};

const resetpassword = async (req, res) => {
  const token = req.body.token; //decode --> email | id
  const newPassword = req.body.password;

  const userFromToken = jwt.verify(token, secret);
  //object -->email,id..
  //password encrypt...
  const salt = bcrypt.genSaltSync(10);
  const hashedPasseord = bcrypt.hashSync(newPassword,salt);

  const updatedUser = await userModel.findByIdAndUpdate(userFromToken._id, {
    password: hashedPasseord,
  });
  res.json({
    message: "password updated successfully..",
  });
};

module.exports = {
  getUser,
  deleteUser,
  getUserById,
  getAllUsers,
  signUp,
  loginUser,
  getUserProfile, updateUserProfile,resetpassword,forgotPassword
};




