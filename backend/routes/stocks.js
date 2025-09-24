const express = require("express");
const axios = require("axios");
const router = express.Router();

// Load env variables
require("dotenv").config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_API = process.env.FINNHUB_API;

const stockSymbols = [
  { id: "netflix", symbol: "NFLX", name: "Netflix" },
  { id: "spotify", symbol: "SPOT", name: "Spotify" },
  { id: "tesla", symbol: "TSLA", name: "Tesla" },
  { id: "meta", symbol: "META", name: "Facebook" },
  { id: "amazon", symbol: "AMZN", name: "Amazon" },
  { id: "google", symbol: "GOOGL", name: "Google" },
];

// ✅ GET stock list with prices
router.get("/stocks", async (req, res) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    const results = {};

    for (const stock of stockSymbols) {
       const url = `${FINNHUB_API}/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`;
      const { data } = await axios.get(url);

      results[stock.symbol] = {
        ...stock,
        price: data.c || null,
      };
    }

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching stock prices:", error.message);
    res.status(500).json({ error: "Failed to fetch stock prices" });
  }
});

// 📌 GET historical candles for TradingView
router.get("/candles/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    // Example: 1D candles, past 30 days
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60;

    // ✅ Use .env-based API
    const url = `${FINNHUB_API}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;

    const { data } = await axios.get(url);

    if (data.s !== "ok") {
      return res.status(400).json({ error: "Failed to fetch candles", details: data });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching candles:", err.message);
    res.status(500).json({ error: "Server error fetching candles" });
  }
});

module.exports = router;
