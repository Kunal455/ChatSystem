const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
  "http://localhost:5173",
  /\.vercel\.app$/
],
credentials: true
  }
});


const userSocketMap = {};

// Handle socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // join user's room
  }

  // Send online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper to get receiver socket ID
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

module.exports = { app, io, server, getReceiverSocketId };
