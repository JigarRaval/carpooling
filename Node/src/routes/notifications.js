const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    try {
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
