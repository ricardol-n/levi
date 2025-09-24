// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Load env variables
require("dotenv").config();

// ✅ Fetch BTC price in USD
router.get("/", async (req, res) => {
  try {
    // Use env variable instead of hardcoded URL
    const url = `${process.env.COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`;

    const response = await axios.get(url);

    // ⚡ Return data in the same format your frontend expects
    res.json({ data: response.data });
  } catch (err) {
    console.error("BTC price fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch BTC price" });
  }
});

module.exports = router;
