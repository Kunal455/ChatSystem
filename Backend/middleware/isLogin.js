const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // 🔴 BLOCK UNVERIFIED USERS
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};

module.exports = isLogin;
