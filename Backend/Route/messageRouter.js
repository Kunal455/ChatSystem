const express = require('express');
const { sendMessage, getMessage } = require('../controller/messageController'); // ✅ destructure the two functions
const isLogin = require('../middleware/isLogin');
const router = express.Router();

// receiver id
router.post('/send/:id', isLogin, sendMessage);
router.get('/:id', isLogin, getMessage);

module.exports = router;
