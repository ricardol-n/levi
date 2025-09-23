// backend/routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ Fetch BTC price in USD
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );

    // ⚡ Return data in the same format your frontend expects
    res.json({ data: response.data });
  } catch (err) {
    console.error("BTC price fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch BTC price" });
  }
});

module.exports = router;
