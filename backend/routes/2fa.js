const express = require("express");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const router = express.Router();

const User = require("../models/user");
const verifyToken = require("../middleware/verifyToken");

const { JWT_SECRET, REFRESH_SECRET } = require("../config/keys");

// =====================================================
// JWT HELPERS
// =====================================================

const signAccessToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
    },
    REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

// =====================================================
// LOGIN OTP VERIFY
// =====================================================

router.post("/login-verify", async (req, res) => {
  try {
    const { userId, token } = req.body;
    console.log("BODY:", req.body);
    const user = await User.findById(userId);

    if (!user || !user.twoFASecret) {
      return res.status(404).json({
        success: false,
        message: "2FA not configured",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: token.trim(),
      window: 10, // temporary
    });

    console.log("LOGIN 2FA USER:", user._id);
    console.log("DB SECRET:", user.twoFASecret);


    if (!verified) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication code",
      });
    }

    const serverCode = speakeasy.totp({
      secret: user.twoFASecret,
      encoding: "base32",
    });

    console.log("SERVER CODE:", serverCode);
    console.log("PHONE CODE :", token);
    console.log("VERIFIED:", verified);

    // reset security counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIP =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip;

    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    const accessToken = signAccessToken(user);

    return res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Verify Error:", err);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

// =====================================================
// GENERATE QR CODE
// =====================================================

router.post("/generate-2fa", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate fresh secret
    const secret = speakeasy.generateSecret({
      length: 20,
    });

    // Save secret
    user.twoFASecret = secret.base32;
    user.is2FAEnabled = false;

    await user.save();

    // Create proper otpauth URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: "TXLA Advisory",
      encoding: "base32",
    });

    console.log("NEW SECRET SAVED:", secret.base32);
    console.log("otpauth_url:", otpauthUrl);

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return res.json({
      success: true,
      qrCodeUrl,
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during 2FA setup",
    });
  }
});

// =====================================================
// ENABLE 2FA
// =====================================================

router.post("/verify-2fa", verifyToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Missing token",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || !user.twoFASecret) {
      return res.status(404).json({
        message: "2FA not set up",
      });
    }

    console.log("JWT USER:", req.user._id);
    console.log("DB SECRET:", user.twoFASecret);

    const serverCode = speakeasy.totp({
      secret: user.twoFASecret,
      encoding: "base32",
    });

    console.log("SERVER CODE:", serverCode);
    console.log("PHONE CODE :", token);

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: token.trim(),
      window: 20,
    });

    console.log("VERIFIED:", verified);

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    user.is2FAEnabled = true;

    await user.save();

    return res.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("2FA Verify Error:", error);

    return res.status(500).json({
      message: "Verification failed",
    });
  }
});

// =====================================================
// DISABLE 2FA
// =====================================================

router.post("/disable-2fa", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.twoFASecret = null;
    user.is2FAEnabled = false;

    await user.save();

    return res.json({
      success: true,
      message: "2FA disabled",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =====================================================
// DEBUG ROUTE
// =====================================================

router.get("/test", (req, res) => {
  res.json({
    message: "2FA route is live ✅",
  });
});

router.get("/debug-secret/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  const code = speakeasy.totp({
    secret: user.twoFASecret,
    encoding: "base32"
  });

  res.json({
    secret: user.twoFASecret,
    currentCode: code,
    serverTime: new Date()
  });
});

router.get("/status", verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    enabled: user.is2FAEnabled
  });
});

module.exports = router;