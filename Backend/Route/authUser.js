const express = require("express");
const { userRegister, userLogin, userLogout, verifyEmail, forgotPassword, resetPassword } = require("../controller/userController");
const upload = require("../middleware/upload");


const router = express.Router();

router.post('/register',upload.single("profilepic"),userRegister)

router.post('/login', userLogin)

router.post('/logout', userLogout)

router.post('/verifyemail', verifyEmail)

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router




