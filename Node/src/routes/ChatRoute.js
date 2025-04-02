const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage } = require('../controllers/ChatController');

router.get('/:rideId', getChatMessages);
router.post('/', sendMessage);

module.exports = router;