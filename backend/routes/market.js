const express = require("express");
const axios = require("axios");

const router = express.Router();

const BINANCE_API = "https://api.binance.com";

/**
 * Test Binance connectivity
 *
 * GET /api/market/test
 */
router.get("/test", async (req, res) => {
  try {
    console.log("🔵 Testing Binance connectivity...");

    const response = await axios.get(`${BINANCE_API}/api/v3/ping`, {
      timeout: 15000,
    });

    console.log("🟢 Binance responded:", response.data);

    res.json({
      success: true,
      provider: "binance",
      response: response.data,
    });
  } catch (error) {
    console.error("🔴 Binance connectivity failed");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);

    res.status(502).json({
      success: false,
      provider: "binance",
      error: error.message,
      code: error.code || null,
      providerStatus: error.response?.status || null,
      providerResponse: error.response?.data || null,
    });
  }
});

module.exports = router;