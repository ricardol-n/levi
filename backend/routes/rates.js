// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ Fetch BTC price in USD
router.get("/", async (req, res) => {
  try {
    // Use Coingecko public API directly
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

    const response = await axios.get(url);
    const btcPrice = response.data?.bitcoin?.usd;

    if (!btcPrice) {
      throw new Error("BTC price not found in API response");
    }

    res.json({ success: true, BTC_USD: btcPrice });
  } catch (err) {
    console.error("❌ BTC price fetch error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to fetch BTC price" });
  }
});

module.exports = router;
