const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// ✅ Load your API key from environment
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_API = "https://finnhub.io/api/v1";

// ✅ Define your stocks
const stockSymbols = [
  { id: "netflix", symbol: "NFLX", name: "Netflix" },
  { id: "spotify", symbol: "SPOT", name: "Spotify" },
  { id: "tesla", symbol: "TSLA", name: "Tesla" },
  { id: "meta", symbol: "META", name: "Facebook" },
  { id: "amazon", symbol: "AMZN", name: "Amazon" },
  { id: "google", symbol: "GOOGL", name: "Google" },
];

// ✅ Route: GET /api/stocks
router.get("/stocks", async (req, res) => {
  try {
    if (!FINNHUB_API_KEY) {
  console.error("❌ Missing FINNHUB_API_KEY in environment variables!");
  return res.status(500).json({
    success: false,
    message: "Stock API temporarily unavailable. Missing API key.",
  });
}

    const stocks = [];

    for (const stock of stockSymbols) {
      const url = `${FINNHUB_API}/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`;
      const { data } = await axios.get(url);

      stocks.push({
        ...stock,
        price: data.c ?? null, // ✅ price is null-safe
      });
    }

    res.json(stocks); // ✅ send as a clean array
  } catch (error) {
    console.error("❌ Error fetching stock prices:", error.message);
    res.status(500).json({ error: "Failed to fetch stock prices" });
  }
});


// ✅ Route: GET /api/candles/:symbol (for TradingView)
router.get("/candles/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60; // last 30 days

    if (!FINNHUB_API_KEY) {
      return res.status(500).json({ success: false, message: "Missing API key" });
    }

    const url = `${FINNHUB_API}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;
    const { data } = await axios.get(url);

    if (data.s !== "ok") {
      return res.status(400).json({ success: false, message: "Failed to fetch candles", details: data });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error fetching candles:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching candles" });
  }
});

module.exports = router;
