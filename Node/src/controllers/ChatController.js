const Chat = require('../models/ChatModel');

const getChatMessages = async (req, res) => {
  try {
    const messages = await Chat.find({ rideId: req.params.rideId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

const sendMessage = async (req, res) => {
  const { rideId, sender, message } = req.body;
  try {
    const newMessage = new Chat({ rideId, sender, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

module.exports = { getChatMessages, sendMessage };