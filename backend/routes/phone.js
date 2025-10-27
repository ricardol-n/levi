// backend/routes/phone.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

// 🔹 Proxy endpoint to 3CX config
router.get("/config", async (req, res) => {
  try {
    const response = await axios.get("https://1748.3cx.cloud/MyPhone/config/txla");
    res.json(response.data);
  } catch (error) {
    console.error("3CX Config Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to reach 3CX config" });
  }
});

// 🔹 Example proxy for another 3CX endpoint
router.get("/c2cinfo", async (req, res) => {
  const { c2cid } = req.query; // frontend can send ?c2cid=txla
  try {
    const response = await axios.get(`https://1748.3cx.cloud/ezelevi/MyPhone/c2cinfo?c2cid=${c2cid}`);
    res.json(response.data);
  } catch (error) {
    console.error("3CX c2cinfo Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to reach 3CX Cloud" });
  }
});

module.exports = router;
