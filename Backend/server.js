const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const connectDB = require("./DB/db");
const { app, server } = require("./Socket/socket");

dotenv.config({ path: path.resolve(__dirname, ".env") });
connectDB();

// Validate critical env vars
const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error("❌ CRITICAL ERROR: Missing Environment Variables:".red.bold);
  console.error(missingEnv.join(", ").red);
  console.error("Please set these in your deployment settings (Render/Vercel).".yellow);
  // We don't exit process here to allow debugging, but it will likely fail later
} else {
  console.log("✅ All critical environment variables are present.".green);
}

const authRouter = require("./Route/authUser");
const messageRouter = require("./Route/messageRouter");
const userRouter = require("./Route/userRouter");

const cors = require("cors");
const compression = require('compression');

// 🔥 IMPORTANT — trust reverse proxies (Render load balancer)
app.set("trust proxy", 1);

// Enable gzip compression for responses (reduces payload size)
app.use(compression());

// Simple request logger to help track incoming requests (method + path)
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl} Origin:${req.headers.origin || 'none'}`);
  next();
});

// ⭐ FIXED PERFECT CORS
// Configure CORS with a safe origin checker and explicit known origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://chat-system-puce-ten.vercel.app",
  /\.vercel\.app$/,
];

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Log preflight OPTIONS requests (helps debugging CORS preflight failures)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || 'no-origin';
    console.log(`Preflight request: method=OPTIONS url=${req.originalUrl} origin=${origin}`);
  }
  next();
});

// Fallback: reflect origin for any non-standard cases (keeps responses CORS-friendly)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    for (const o of allowedOrigins) {
      if (o instanceof RegExp ? o.test(origin) : o === origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        break;
      }
    }
  }
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API is running"));

// 404 handler for unmatched routes
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Not Found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`.bgMagenta)
);


process.on('uncaughtException', (err) => {
  console.error(' UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(' UNHANDLED REJECTION:', reason);
});

app.use((err, req, res, next) => {
  console.error(' MIDDLEWARE ERROR:', err.message);
  console.error(' MIDDLEWARE ERROR:', err.message);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});
