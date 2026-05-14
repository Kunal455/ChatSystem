const Conversation = require("../model/conversationModel");
const Message = require("../model/messageSchema");
const { getReceiverSocketId, io } = require("../Socket/socket");
const { producer } = require("../config/kafka");
const { v4: uuidv4 } = require("uuid");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Create a temporary ID for immediate UI feedback
    const tempMessageId = uuidv4();

    const messagePayload = {
      tempId: tempMessageId,
      senderId,
      receiverId,
      message,
      timestamp: new Date().toISOString()
    };

    // 1. Send the message immediately via Socket.io (Optimistic delivery)
    // Here we wrap in a format the frontend expects (like a mongoose document)
    io.to(receiverId.toString()).emit("newMessage", {
      _id: tempMessageId,
      senderId,
      receiverId,
      message,
      createdAt: messagePayload.timestamp,
    });

    // 2. Publish to Kafka Topic for asynchronous processing
    await producer.send({
      topic: 'chat-messages',
      messages: [
        { 
          key: receiverId.toString(), // Keep ordering for the same receiver
          value: JSON.stringify(messagePayload) 
        },
      ],
    });

    // 3. Respond to the API request immediately (Don't wait for DB!)
    res.status(202).json({
      _id: tempMessageId,
      senderId,
      receiverId,
      message,
      createdAt: messagePayload.timestamp,
      status: 'processing'
    });
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

