// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const COINGECKO_API = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";

// 🧠 Cache to store last known BTC price
let lastKnownPrice = null;
let lastUpdatedAt = null;

// ✅ Unified endpoint for BTC price in USD
router.get("/", async (req, res) => {
  try {
    // Try Coingecko first
    const url = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`;
    const cg = await axios.get(url);
    const btcUsd = cg.data?.bitcoin?.usd;

    if (!btcUsd) throw new Error("Invalid Coingecko response");

    // ✅ Cache the price
    lastKnownPrice = btcUsd;
    lastUpdatedAt = new Date();

    return res.json({
      success: true,
      source: "coingecko",
      updatedAt: lastUpdatedAt,
      data: { bitcoin: { usd: btcUsd } },
    });
  } catch (cgErr) {
    console.warn("⚠️ Coingecko failed, switching to Binance:", cgErr.message);

    try {
      // Fallback: Binance API
      const binance = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      const btcUsd = parseFloat(binance.data.price);

      // ✅ Cache the price
      lastKnownPrice = btcUsd;
      lastUpdatedAt = new Date();

      return res.json({
        success: true,
        source: "binance",
        updatedAt: lastUpdatedAt,
        data: { bitcoin: { usd: btcUsd } },
      });
    } catch (binanceErr) {
      console.error("❌ Binance fallback failed:", binanceErr.message);

      // ⚠️ Final fallback: use last known cached price
      if (lastKnownPrice) {
        console.log("🟡 Using cached BTC price:", lastKnownPrice);
        return res.json({
          success: true,
          source: "cache",
          updatedAt: lastUpdatedAt,
          data: { bitcoin: { usd: lastKnownPrice } },
        });
      }

      // ❌ No cache? Return failure
      return res.status(500).json({ error: "Failed to fetch BTC price" });
    }
  }
});

module.exports = router;
