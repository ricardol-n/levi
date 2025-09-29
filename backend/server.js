const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const verifyToken = require("./middleware/auth");
const path = require("path");


const app = express();


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

require("./cron/investmentCron");

// ✅ Log env vars
console.log("ENV FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("ENV FRONTEND_URLS:", process.env.FRONTEND_URLS);


// ✅ CORS
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];


console.log("Allowed Origins:", allowedOrigins);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook/btcpay") {
    next(); // raw body handled inside webhook route
  } else {
    express.json()(req, res, next);
  }
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


// ✅ Start server
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

