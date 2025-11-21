// Backend/Route/userRouter.js
const express = require("express");
const { getUser, getcurrentchatters } = require("../controller/getuserController");
const isLogin = require("../middleware/isLogin");
const { getUserById } = require("../controller/getUserById");
const router = express.Router();

// ✅ All routes have valid functions
router.get("/search", isLogin, getUser);
router.get("/currentchatters", isLogin, getcurrentchatters);
router.get("/:id", isLogin, getUserById);

module.exports = router;
