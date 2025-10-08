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
    // Check for API key
    if (!FINNHUB_API_KEY) {
      console.error("❌ FINNHUB_API_KEY is missing in environment variables!");
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration: missing Finnhub API key.",
      });
    }

    // Fetch all stock quotes in parallel
    const requests = stockSymbols.map(async (stock) => {
      const url = `${FINNHUB_API}/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`;
      const { data } = await axios.get(url);
      return {
        ...stock,
        price: data.c || 0,
        change: data.d || 0,
        percentChange: data.dp || 0,
      };
    });

    const results = await Promise.all(requests);

    res.json({
      success: true,
      data: results, // ✅ return as array for frontend
    });
  } catch (error) {
    console.error("❌ Error fetching stock prices:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock prices",
      error: error.message,
    });
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
