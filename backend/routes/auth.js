const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

const SECRET_KEY = process.env.JWT_SECRET || "mySuperSecretKey123";

// ✅ Registration Route
router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields (username, email, password) are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⛔️ No wallet generation here — handled during deposit process
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      depositAddresses: {}, // keep empty or default
    });

    await newUser.save();

    // 🔑 JWT Token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        depositAddresses: user.depositAddresses,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.SECRET_KEY = SECRET_KEY;
module.exports = router;
