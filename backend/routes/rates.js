// routes/rates.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/rates
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum,dogecoin,ripple,tether',
        vs_currencies: 'usd',
      }
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ CoinGecko API error:", err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch rates' });
  }
});

module.exports = router;
