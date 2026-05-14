const { consumer } = require('../config/kafka');
const Conversation = require("../model/conversationModel");
const Message = require("../model/messageSchema");

const startChatWorker = async () => {
  try {
    // We subscribe to the 'chat-messages' topic
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        
        try {
          // 1. Find or create conversation
          let chat = await Conversation.findOne({
            participants: { $all: [data.senderId, data.receiverId] },
          });

          if (!chat) {
            chat = await Conversation.create({ participants: [data.senderId, data.receiverId] });
          }

          // 2. Save message to MongoDB
          const newMessage = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            conversationId: chat._id,
          });

          chat.messages.push(newMessage._id);
          await Promise.all([chat.save(), newMessage.save()]);

          console.log(`✅ Message saved from ${data.senderId} to ${data.receiverId}`);
        } catch (error) {
          console.error("❌ Failed to process Kafka message into MongoDB", error);
        }
      },
    });
  } catch (error) {
    console.error("❌ Error running chat worker", error);
  }
};

module.exports = startChatWorker;
