// Backend/Route/userRouter.js
const express = require("express");
const { getUser, getcurrenttalkio, getCurrentUser } = require("../controller/getuserController");
const isLogin = require("../middleware/isLogin");
const { getUserById } = require("../controller/getUserById");
const router = express.Router();

// ✅ All routes have valid functions
router.get("/me", isLogin, getCurrentUser); // Get current logged-in user
router.get("/search", isLogin, getUser);
router.get("/currenttalkio", isLogin, getcurrenttalkio);
router.get("/:id", isLogin, getUserById);

module.exports = router;
