const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================== REGISTER ==================
const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser)
      return res.status(400).json({ success: false, message: "Username or Email already exists" });

    const hashPassword = await bcrypt.hash(password, 10);

    let profilepicUrl = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    if (req.file) {
      console.log("📁 [UPLOAD] File uploaded:", req.file.filename);
      profilepicUrl = `/uploads/avatars/${req.file.filename}`;
      console.log("✅ [UPLOAD] Avatar URL:", profilepicUrl);
    } else {
      console.log("⚠️ [UPLOAD] No file uploaded, using default avatar");
    }

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashPassword,
      gender,
      profilepic: profilepicUrl
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please login!",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        profilepic: newUser.profilepic,
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ================== LOGIN ==================
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not registered" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.cookie("jwt", generateToken(user._id), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        gender: user.gender,
        profilepic: user.profilepic,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ================== LOGOUT ==================
const userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out" });
};

module.exports = { userRegister, userLogin, userLogout };
