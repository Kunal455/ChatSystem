const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationCode, WelcomeEmail, ResetPasswordEmail } = require('../middleware/Email');


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
    const verificationCode = Math.floor(10000 + Math.random() * 900000).toString()

    let profilepicUrl = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    if (req.file) {
      console.log("📁 [UPLOAD] File uploaded to Cloudinary:", req.file.path);
      profilepicUrl = req.file.path;
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
      profilepic: profilepicUrl,
      verificationCode
    });

    await newUser.save();
    await newUser.save();

    // Send verification email
    try {
      await sendVerificationCode(newUser.email, verificationCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Optional: Delete user if email fails, or just warn
      // await User.findByIdAndDelete(newUser._id);
      // return res.status(500).json({ success: false, message: "Failed to send verification email. Please try again." });
    }

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

    if (!user.isVerified)
      return res.status(400).json({ success: false, message: "Please verify your email first" });

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

const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body
    const user = await User.findOne({
      verificationCode: code
    })
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or Expired Code" })
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();


    try {
      await WelcomeEmail(user.email, user.fullname);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "internal server error" })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = resetCode;
    await user.save();

    try {
      await ResetPasswordEmail(email, resetCode);
    } catch (emailError) {
      console.error("Failed to send reset password email:", emailError);
      return res.status(500).json({ success: false, message: "Failed to send reset email" });
    }

    res.status(200).json({
      success: true,
      message: "Reset code sent to email"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    const user = await User.findOne({ verificationCode: code });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired code" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { userRegister, userLogin, userLogout, verifyEmail, forgotPassword, resetPassword };
