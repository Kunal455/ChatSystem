const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./DB/db");
const { app, server } = require("./Socket/socket");

dotenv.config({ path: path.resolve(__dirname, ".env") });
connectDB();

const authRouter = require("./Route/authUser");

// MINIMAL SETUP
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log requests
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
    console.log("GET / hit");
    res.send("API running");
});

// Error handler
app.use((err, req, res, next) => {
    console.error("[ERROR]", err.message);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`✅ Server running on port ${PORT}`)
);
