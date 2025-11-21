const express = require("express");
const { userRegister, userLogin, userLogout } = require("../controller/userController");
const upload = require("../middleware/upload");


const router = express.Router();

router.post('/register',upload.single("profilepic"),userRegister)

router.post('/login', userLogin)

router.post('/logout', userLogout)

module.exports = router




