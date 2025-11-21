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
  receiverId: receiverId, // fix typo
  message,
  conversationId: chat._id,
});


    chat.messages.push(newMessage._id);

    await Promise.all([chat.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

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

