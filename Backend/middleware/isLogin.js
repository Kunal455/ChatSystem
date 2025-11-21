const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = isLogin;
