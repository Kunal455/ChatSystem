const Conversation = require("../model/conversationModel");
const Message = require("../model/messageSchema");
const { getReceiverSocketId, io } = require("../Socket/socket");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let chat = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Conversation.create({ participants: [senderId, receiverId] });
    }

    const newMessage = new Message({
      senderId,
      receiverId: receiverId,
      message,
      conversationId: chat._id,
    });


    chat.messages.push(newMessage._id);

    await Promise.all([chat.save(), newMessage.save()]);

    // Emit to receiver's room
    io.to(receiverId.toString()).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const chat = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) return res.status(200).json([]);

    // Fetch recent messages directly from Message collection with pagination
    // Use lean() to return plain objects (faster) and limit to the most recent 50 messages
    const messages = await Message.find({ conversationId: chat._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "username profilepic")
      .lean();

    // Return messages in chronological order (oldest first)
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessage };

