// backend/routes/2fa.js
const express = require("express");
const router = express.Router();
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/user"); // adjust if your model path differs

// 🔹 Generate 2FA secret + QR
router.post("/generate-2fa", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: "TXLA Advisory App", // change this to your app name
    });

    // Save secret to DB
    user.twoFASecret = secret.base32;
    await user.save();

    // Generate QR Code URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({ message: "Server error during 2FA setup" });
  }
});

// 🔹 Verify token
router.post("/verify-2fa", async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ message: "Missing data" });

    const user = await User.findById(userId);
    if (!user || !user.twoFASecret)
      return res.status(404).json({ message: "2FA not set up" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 2, // allow small time drift
    });

    if (verified) {
      user.is2FAEnabled = true;
      await user.save();
    }

    res.json({ success: verified });
  } catch (error) {
    console.error("2FA verify error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
