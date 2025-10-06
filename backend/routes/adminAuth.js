const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); 
const { JWT_SECRET, REFRESH_SECRET } = require("../config/keys");

// helpers
const signAccessToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });

const signRefreshToken = (user) =>
  jwt.sign({ _id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });

// ✅ Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // 2️⃣ Check role
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Not an admin." });
    }

    // 3️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // 4️⃣ Generate tokens
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Save refresh token in DB (so we can verify later)
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Refresh token route (for admins)
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ success: false, message: "No refresh token provided" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload._id);
    if (!user || user.role !== "admin" || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: "Refresh token mismatch" });
    }

    const newAccessToken = signAccessToken(user);
    res.json({ success: true, token: newAccessToken });
  } catch (err) {
    console.error("❌ Admin refresh error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Admin Logout (clear refresh token)
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "No refresh token provided" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.json({ success: true, message: "Logged out" });
    }

    const user = await User.findById(payload._id);
    if (user && user.role === "admin") {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("❌ Admin logout error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
