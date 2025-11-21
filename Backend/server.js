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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`.bgMagenta));
