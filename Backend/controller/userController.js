const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  sendVerificationCode,
  WelcomeEmail,
  ResetPasswordEmail
} = require("../middleware/Email");

// ================= HELPERS =================
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generate6DigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds

// ================= REGISTER =================
const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already registered. Please verify or resend OTP."
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email already in use. Please login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generate6DigitCode();

    const profilepic =
      req.file?.path ||
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    const user = await User.create({
      fullname,
      username,
      email,
      gender,
      password: hashedPassword,
      profilepic,
      verificationCode: otp,
      otpExpires: Date.now() + OTP_EXPIRY,
      lastOtpSentAt: Date.now()
    });

    const sent = await sendVerificationCode(email, otp);
    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email"
      });
    }

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email."
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= LOGIN =================
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not registered" });

    if (!user.isVerified)
      return res.status(403).json({
        success: false,
        message: "Please verify your email first"
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.cookie("jwt", generateToken(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= LOGOUT =================
const userLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const inputCode = String(code).trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: "Email already verified" });

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please resend."
      });
    }

    if (user.verificationCode !== inputCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please use the latest code."
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentAt = undefined;

    await user.save();
    WelcomeEmail(user.email, user.fullname).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Email not found" });

    const otp = generate6DigitCode();

    user.verificationCode = otp;
    user.otpExpires = Date.now() + OTP_EXPIRY;
    user.lastOtpSentAt = Date.now();
    await user.save();

    const sent = await ResetPasswordEmail(email, otp);
    if (!sent)
      return res.status(500).json({ success: false, message: "Failed to send reset OTP" });

    res.status(200).json({
      success: true,
      message: "Reset OTP sent to email"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const inputCode = String(code).trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid request" });

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please resend."
      });
    }

    if (user.verificationCode !== inputCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationCode = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= RESEND OTP =================
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });

    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt < RESEND_COOLDOWN
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before resending OTP"
      });
    }

    const otp = generate6DigitCode();

    user.verificationCode = otp;
    user.otpExpires = Date.now() + OTP_EXPIRY;
    user.lastOtpSentAt = Date.now();
    await user.save();

    const sent = await sendVerificationCode(email, otp);
    if (!sent)
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP"
      });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully. Use the latest code."
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= EXPORTS =================
module.exports = {
  userRegister,
  userLogin,
  userLogout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationCode
};
