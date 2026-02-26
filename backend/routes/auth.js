const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

const { JWT_SECRET,REFRESH_SECRET } = require("../config/keys");

// helper to sign tokens
const signAccessToken = (user) => jwt.sign(
  { _id: user._id, role: user.role },
  JWT_SECRET,
  { expiresIn: "15m" } // short-lived access token
);

const signRefreshToken = (user) => jwt.sign(
  { _id: user._id },
  REFRESH_SECRET,
  { expiresIn: "7d" } // longer-lived refresh token
);



// ✅ Registration Route (with referral support)
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password, referralCode } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "username, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Check if referred by someone
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        referrer.referralCount += 1;
        referrer.referralBonus += 10; // $10 reward
        referrer.balance += 10;
        await referrer.save();
      }
    }

    const user = new User({ username, email: email.toLowerCase(), phone, password: hashed, referredBy });
    await user.save();

    // issue tokens
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: "Registered successfully",
      token,
      refreshToken,
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Login Route
router.post('/login', async (req, res) => {
 

   try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    console.log("Entered password:", password);
    console.log("Stored hash:", user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Admins must log in via /api/admin/login" });
    }
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // persist refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    // verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // find user and check stored refresh token matches (simple single-token approach)
    const user = await User.findById(payload._id);
    if (!user || !user.refreshToken) return res.status(404).json({ success: false, message: "User not found" });
    if (user.refreshToken !== refreshToken) {
      // refresh token mismatch (replay attempt or logged out elsewhere)
      return res.status(401).json({ success: false, message: "Refresh token mismatch" });
    }

    // issue new access token (you could rotate refresh tokens here if desired)
    const newAccessToken = signAccessToken(user);

    res.json({ success: true, token: newAccessToken });
  } catch (err) {
    console.error("Refresh token route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------- Logout (revoke refresh token) -----------------
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "No refresh token provided" });

    // verify payload to get user id (optional)
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      // token invalid or expired — still safe to respond success
      return res.json({ success: true, message: "Logged out" });
    }

    const user = await User.findById(payload._id); 
    if (!user) return res.json({ success: true, message: "Logged out" });

    // clear persisted refresh token
    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
