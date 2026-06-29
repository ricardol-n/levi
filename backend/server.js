require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const verifyToken = require("./middleware/verifyToken"); // normal users
const verifyAdmin = require("./middleware/verifyAdmin"); // admins
const path = require("path");




// ✅ Import routes
const authRouter = require("./routes/auth");
const ratesRoutes = require("./routes/rates");
const userRoutes = require("./routes/users");
const investmentRoutes = require("./routes/investments");
const transactionRoutes = require("./routes/transactions");
const withdrawalRoutes = require("./routes/withdrawals");
const depositRoutes = require("./routes/deposit");
const webhookRoutes = require("./routes/btcpayWebhook");
const candlesRoute = require("./routes/stocks");
const adminAuthRoutes = require("./routes/adminAuth");
const adminWithdrawalsRoutes = require("./routes/admin");
const twoFARoutes = require("./routes/2fa");
const phoneRoutes = require("./routes/phone");




const app = express();



// ✅ Log env vars
console.log("ENV FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("ENV FRONTEND_URLS:", process.env.FRONTEND_URLS);

console.log("JWT_SECRET:", process.env.JWT_SECRET);



// ✅ CORS — Safe for production (Vercel + Render + Localhost)
const allowedOrigins = [
  "http://localhost:5173","http://localhost:5175",
  "https://admin-backend-qyhk.onrender.com", // backend self-calls
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
    : []),
].filter(Boolean);

console.log("🟢 Allowed origins (exact):", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server (no origin)
      if (!origin) return callback(null, true);

      // ✅ Whitelist regex patterns
      const allowedPatterns = [
        /\.vercel\.app$/,           // all Vercel preview domains
        /\.onrender\.com$/,         // backend self-requests
        /localhost/,                // local dev
      ];

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isPatternAllowed = allowedPatterns.some((p) => p.test(origin));

      if (isExplicitlyAllowed || isPatternAllowed) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook/btcpay") next();
  else express.json()(req, res, next);
});

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    // 👇 ADD THIS LINE
    console.log("Connected to DB:", mongoose.connection.name);

    // start cron AFTER connection
    require("./cron/investmentCron");
  })
  .catch((err) => console.error("❌ MongoDB error:", err));


// ✅ API to return stock list with prices
// ✅ Debug logs before mounting each route
console.log("Mounting /api/auth");
app.use("/api/auth", authRouter);

console.log("Mounting /api/rates");
app.use("/api/rates", ratesRoutes);

console.log("Mounting /api/users");
app.use("/api/users", userRoutes);

console.log("Mounting /api (deposit)");
app.use("/api", depositRoutes);

console.log("Mounting /api/webhook");
app.use("/api/webhook", webhookRoutes);

console.log("Mounting /api/investments");
app.use("/api/investments", verifyToken, investmentRoutes);

console.log("Mounting /api/transactions");
app.use("/api/transactions", verifyToken, transactionRoutes);

console.log("Mounting /api/withdrawals");
app.use("/api/withdrawals", verifyToken, withdrawalRoutes);

console.log("Mounting /api (candles)");
app.use("/api", candlesRoute);

app.use("/api/admin/auth",adminAuthRoutes);

app.use("/api/admin/action", verifyAdmin, adminWithdrawalsRoutes);

app.use("/api/2fa", twoFARoutes);

app.use("/api/phone", phoneRoutes);





app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend running successfully!" });
});
// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));

