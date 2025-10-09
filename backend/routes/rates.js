// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const COINGECKO_API = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";

let lastKnownPrice = null;
let lastUpdatedAt = null;

router.get("/", async (req, res) => {
  try {
    // Use cache if it's fresh (<30 min old)
    if (lastKnownPrice && Date.now() - new Date(lastUpdatedAt).getTime() < 30 * 60 * 1000) {
      return res.json({
        success: true,
        source: "cache",
        updatedAt: lastUpdatedAt,
        data: { bitcoin: { usd: lastKnownPrice } },
      });
    }

    // Fetch from Coingecko
    const cg = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
    const btcUsd = cg.data?.bitcoin?.usd;
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
    console.warn("⚠️ Coingecko failed, switching to Binance:", cgErr.message);

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
    } catch (binanceErr) {
      console.error("❌ Binance fallback failed:", binanceErr.message);

      if (lastKnownPrice) {
        console.log("🟡 Using cached BTC price:", lastKnownPrice);
        return res.json({
          success: true,
          source: "cache",
          updatedAt: lastUpdatedAt,
          data: { bitcoin: { usd: lastKnownPrice } },
        });
      }

      // 🩹 No cache available — return dummy data instead of 500
      return res.json({
        success: false,
        source: "none",
        updatedAt: new Date(),
        data: { bitcoin: { usd: 0 } },
        message: "Rate service temporarily unavailable",
      });
    }
  }
});

module.exports = router;
