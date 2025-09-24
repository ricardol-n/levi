const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const verifyToken = require("./middleware/auth");
const axios = require("axios");
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




// ✅ CORS
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];

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

app.use(express.json());

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("❌ MongoDB error:",err));



if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


// ✅ API to return stock list with prices
app.use("/api/auth", authRouter);
app.use("/api/rates", ratesRoutes);
app.use("/api/users", userRoutes);
app.use("/api", depositRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/investments", verifyToken, investmentRoutes);
app.use("/api/transactions", verifyToken, transactionRoutes);
app.use("/api/withdrawals", verifyToken, withdrawalRoutes);
app.use("/api", candlesRoute);



// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
