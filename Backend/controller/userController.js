const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });``
};

// Register
const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: "Username or Email already exists" });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, username, email, password: hashPassword, gender, profilepic: req.file?.path });
    await newUser.save();

    res.cookie("jwt", generateToken(newUser._id), { httpOnly: true });
    res.status(201).json({ success: true, message: "Registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Email not registered" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.cookie("jwt", generateToken(user._id), { httpOnly: true });
    res.status(200).json({ success: true, message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
const userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out" });
};

module.exports = { userRegister, userLogin, userLogout };
