const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const connectDB = require("./DB/db");

const authRouter = require("./Route/authUser");
const messageRouter = require("./Route/messageRouter");
const userRouter = require("./Route/userRouter");
const { app, server } = require("./Socket/socket");

dotenv.config();
connectDB();

// CORS configuration
// CORS configuration
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-system-oaeyfklx0-kunal-kumars-projects-c3b97c3f.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static uploads route - serves local files when Cloudinary is not configured
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`.bgMagenta));
