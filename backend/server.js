const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
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



const app = express();

require("./cron/investmentCron");

// ✅ Log env vars
console.log("ENV FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("ENV FRONTEND_URLS:", process.env.FRONTEND_URLS);


// ✅ CORS

const allowedOrigins = [
  "http://localhost:5173",             // local dev
  "https://levi-indol.vercel.app",     // your Vercel deployment
  "https://admin-backend-qyhk.onrender.com", // your backend (self-call safety)
  process.env.FRONTEND_URL,            // single domain (optional)
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
    : []),
].filter(Boolean);

// ✅ Log once on startup
console.log("🟢 Allowed origins for CORS:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("❌ MongoDB error:",err));
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


app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend running successfully!" });
});
// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));

