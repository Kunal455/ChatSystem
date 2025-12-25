const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationCode, WelcomeEmail, ResetPasswordEmail } = require('../middleware/Email');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generate6DigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ================== REGISTER ==================
const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
  if (!existingUser.isVerified) {
    return res.status(400).json({
      success: false,
      message: "Email already registered. Please verify your email or resend OTP."
    });
  }

  return res.status(400).json({
    success: false,
    message: "Email already in use. Please login."
  });
}


    const hashPassword = await bcrypt.hash(password, 10);
    const verificationCode = generate6DigitCode();

    let profilepicUrl = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    if (req.file) profilepicUrl = req.file.path;

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashPassword,
      gender,
      profilepic: profilepicUrl,
      verificationCode,
      otpExpires: Date.now() + 10 * 60 * 1000 // OTP valid for 10 minutes
    });

    // LOG CODE FOR MANUAL VERIFICATION (Since Mailjet is blocked)
    console.log("==========================================");
    console.log("MANUAL VERIFICATION CODE:", verificationCode);
    console.log("==========================================");

    await newUser.save();

    // Send Email Once
    try {
      await sendVerificationCode(newUser.email, verificationCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
      // Continue registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        profilepic: newUser.profilepic,
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ================== LOGIN ==================
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not registered"
      });
    }

    // 🔴 BLOCK UNVERIFIED USERS
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};


// ================== LOGOUT ==================
const userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out" });
};

// ================== VERIFY EMAIL ==================
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ verificationCode: code });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired code" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "Code expired, request a new one" });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    WelcomeEmail(user.email, user.fullname).catch(() => { });

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// ================== FORGOT PASSWORD ==================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    const resetCode = generate6DigitCode();

    user.verificationCode = resetCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await ResetPasswordEmail(email, resetCode);

    res.status(200).json({
      success: true,
      message: "Reset code sent to email"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ================== RESET PASSWORD ==================
const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    const user = await User.findOne({ verificationCode: code });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired code" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "Code expired, request again" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.verificationCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ================== RESEND OTP ==================
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3️⃣ Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. Please login."
      });
    }

    // 4️⃣ Cooldown (60 seconds)
    // ⏱️ Resend cooldown (ONLY in production)
if (
  process.env.NODE_ENV === "production" &&
  user.otpExpires &&
  user.otpExpires > Date.now() - 60 * 1000
) {
  return res.status(429).json({
    success: false,
    message: "Please wait 60 seconds before requesting another code"
  });
}


    // 5️⃣ Generate OTP
    const newCode = generate6DigitCode();

    user.verificationCode = newCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 6️⃣ Send email (DO NOT crash if email fails)
    try {
      await sendVerificationCode(user.email, newCode);
    } catch (mailError) {
      console.error("Email send failed (OTP still valid):", mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Verification code resent successfully"
    });

  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationCode
};
