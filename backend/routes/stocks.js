const express = require("express");
const axios = require("axios");
const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// 📌 GET historical candles for TradingView
router.get("/candles/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    // Example: 1D candles, past 30 days
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60;

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;

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
