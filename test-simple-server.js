const express = require("express");
const http = require("http");
const { Server: SocketServer } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: "*", credentials: true }
});

// Test middleware
app.use((req, res, next) => {
  console.log("[LOG] Request:", req.method, req.url);
  next();
});

// Test route
app.post("/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("OK");
});

server.listen(3333, () => {
  console.log("Test server on 3333");
});

// Error handling
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err);
});
