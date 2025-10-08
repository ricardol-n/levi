// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// ✅ Define fallback URL if env missing
const COINGECKO_API = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";

// ✅ Fetch BTC price in USD
router.get("/", async (req, res) => {
  try {
    const url = `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`;
    console.log("🔍 Fetching BTC price from:", url);

    const response = await axios.get(url);
    console.log("✅ BTC price response:", response.data);

    res.json({ data: response.data });
  } catch (err) {
    console.error("❌ BTC price fetch error:");
    console.error("  • Message:", err.message);

    // If Axios error has a response (from Coingecko)
    if (err.response) {
      console.error("  • Status:", err.response.status);
      console.error("  • Response data:", err.response.data);
    }

    // If Axios error has request (but no response)
    if (err.request) {
      console.error("  • No response received from API");
    }

    // Send user-friendly response
    res.status(500).json({ error: "Failed to fetch BTC price", details: err.message });
  }
});

module.exports = router;
