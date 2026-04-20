// server.js

const express      = require("express");
const cors         = require("cors");
const mongoose     = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv       = require("dotenv");
const cardRoutes = require("./routes/cardRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: [
      "https://oss-growth-tracker.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ─── Routes ──────────────────────────────────────────────────
const authRoutes        = require("./routes/authRoutes");
const userRoutes        = require("./routes/userRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

app.use("/auth", authRoutes);
app.use("/api",  userRoutes);
app.use("/api", cardRoutes);

app.use("/api",  leaderboardRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:    "OK",
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Database Connection ──────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);

    // ✅ Cron Job Start
    const { startSyncJob } = require("./jobs/syncJob");
    startSyncJob();
  });
});

module.exports = app;