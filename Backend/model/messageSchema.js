const Conversation = require("../model/conversationModel");
const Message = require("../model/messageSchema");
const { getReceiverSocketId, io } = require("../Socket/socket");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Find or create conversation
    let chat = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Conversation.create({ participants: [senderId, receiverId] });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      conversationId: chat._id,
    });

    chat.messages.push(newMessage._id);

    await Promise.all([chat.save(), newMessage.save()]);

    // Emit message to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    // Emit message back to sender for instant UI update
    io.to(senderId.toString()).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages between sender and receiver
const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const chat = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      populate: { path: "senderId", select: "username profilepic" }
    });

    res.status(200).json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessage };
