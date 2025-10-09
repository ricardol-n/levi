// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ Default API and cache variables
const COINGECKO_API = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";
let lastKnownPrice = 0;
let lastUpdatedAt = null;

/**
 * @route   GET /api/rates
 * @desc    Fetch BTC price in USD — now optional, for display only
 */
router.get("/", async (req, res) => {
  try {
    // ✅ Serve cached value if under 1 hour old
    const oneHour = 60 * 60 * 1000;
    if (lastKnownPrice && Date.now() - new Date(lastUpdatedAt).getTime() < oneHour) {
      return res.json({
        success: true,
        source: "cache",
        updatedAt: lastUpdatedAt,
        data: { bitcoin: { usd: lastKnownPrice } },
      });
    }

    // ✅ Fetch fresh price from Coingecko
    const cgRes = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
    const btcUsd = cgRes.data?.bitcoin?.usd;

    if (!btcUsd) throw new Error("Invalid Coingecko response");

    lastKnownPrice = btcUsd;
    lastUpdatedAt = new Date();

    return res.json({
      success: true,
      source: "coingecko",
      updatedAt: lastUpdatedAt,
      data: { bitcoin: { usd: btcUsd } },
    });
  } catch (cgErr) {
    console.warn("⚠️ Coingecko failed:", cgErr.message);

    // ✅ Fallback to Binance
    try {
      const binance = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      const btcUsd = parseFloat(binance.data.price);
      lastKnownPrice = btcUsd;
      lastUpdatedAt = new Date();

      return res.json({
        success: true,
        source: "binance",
        updatedAt: lastUpdatedAt,
        data: { bitcoin: { usd: btcUsd } },
      });
    } catch (err2) {
      console.error("❌ Binance fallback failed:", err2.message);

      return res.json({
        success: true,
        source: "fallback",
        updatedAt: new Date(),
        data: { bitcoin: { usd: lastKnownPrice || 0 } },
        message: "Rate service temporarily unavailable — using last known price.",
      });
    }
  }
});

module.exports = router;
