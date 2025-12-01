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
  "https://chat-system-puce-ten.vercel.app",
  /\.vercel\.app$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    for (const o of allowedOrigins) {
      if (o instanceof RegExp) {
        if (o.test(origin)) return callback(null, true);
      } else if (o === origin) {
        return callback(null, true);
      }
    }
    // log rejected origin for debugging
    console.warn(`CORS rejection: origin=${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
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

// 404 handler for unmatched routes - logs and returns JSON for easier debugging
app.use((req, res) => {
  console.warn(`[404] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Not Found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`.bgMagenta)
);
