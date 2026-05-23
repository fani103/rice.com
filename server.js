require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));


// ✅ Health check at /api AND /api/health — must come BEFORE the 404 handler
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "🌾 Faneesh Rice Shop API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      products: "/api/products",
      orders:   "/api/orders",
      health:   "/api/health",
      seed:     "/api/products/seed"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🌾 Faneesh Rice Shop API is running!",
    timestamp: new Date().toISOString()
  });
});

// ✅ API 404 — catches any /api/* route that didn't match above
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

// ── Frontend static files ─────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Faneesh Rice Shop Server running on http://localhost:${PORT}`);
  console.log(`📦 API root:      http://localhost:${PORT}/api`);
  console.log(`❤️  Health check:  http://localhost:${PORT}/api/health`);
  console.log(`🌱 Seed products: http://localhost:${PORT}/api/products/seed\n`);
});

module.exports = app;