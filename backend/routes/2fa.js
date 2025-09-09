// routes/2fa.js
const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/user");

const router = express.Router();

// Generate secret and QR code
router.post("/generate-2fa", async (req, res) => {
  try {
    const { userId } = req.body;

    const secret = speakeasy.generateSecret({
      name: "YourAppName",
      length: 20,
    });

    // Save secret in DB (encrypted ideally)
    await User.findByIdAndUpdate(userId, {
      twoFASecret: secret.base32,
      is2FAEnabled: true,
    });

    // Generate QR code for Google Authenticator
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate 2FA secret" });
  }
});

// Verify token
router.post("/verify-2fa", async (req, res) => {
  const { userId, token } = req.body;

  const user = await User.findById(userId);

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid token" });
  }
});

module.exports = router;
