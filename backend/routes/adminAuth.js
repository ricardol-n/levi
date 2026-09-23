
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/keys");

const ADMIN_ROLES = ["admin", "superadmin"];

const signAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Both admin and superadmin can use the admin panel
    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    return res.json({
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

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =====================================================
// ADMIN REFRESH TOKEN
// =====================================================

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    let payload;

    try {
      payload = jwt.verify(
        refreshToken,
        REFRESH_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(payload._id);

    if (
      !user ||
      !ADMIN_ROLES.includes(user.role) ||
      user.refreshToken !== refreshToken
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = signAccessToken(user);

    return res.json({
      success: true,
      token: newAccessToken,
    });

  } catch (err) {
    console.error("❌ Admin refresh error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =====================================================
// ADMIN LOGOUT
// =====================================================

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.json({
        success: true,
        message: "Logged out",
      });
    }

    let payload;

    try {
      payload = jwt.verify(
        refreshToken,
        REFRESH_SECRET
      );
    } catch {
      return res.json({
        success: true,
        message: "Logged out",
      });
    }

    const user = await User.findById(payload._id);

    if (
      user &&
      ADMIN_ROLES.includes(user.role) &&
      user.refreshToken === refreshToken
    ) {
      user.refreshToken = null;
      await user.save();
    }

    return res.json({
      success: true,
      message: "Logged out",
    });

  } catch (err) {
    console.error("❌ Admin logout error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;
