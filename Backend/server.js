const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const cors = require("cors");
const compression = require("compression");

require("dotenv").config(); // ✅ Load env ONCE

const connectDB = require("./DB/db");
const { app, server } = require("./Socket/socket");

// ================= DB =================
connectDB();

// ================= ENV CHECK =================
const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length) {
  console.error("❌ Missing ENV vars:", missingEnv.join(", ").red);
} else {
  console.log("✅ All critical environment variables loaded".green);
}

// ================= MIDDLEWARE =================
app.set("trust proxy", 1);
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= LOGGER =================
app.use((req, res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || "none"}`
  );
  next();
});

// ================= CORS (EXPRESS 5 SAFE) =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-system-puce-ten.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/api/auth", require("./Route/authUser"));
app.use("/api/message", require("./Route/messageRouter"));
app.use("/api/user", require("./Route/userRouter"));

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`.bgMagenta);
});

// ================= PROCESS SAFETY =================
process.on("uncaughtException", err => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
  console.error("❌ UNHANDLED REJECTION:", err);
});
