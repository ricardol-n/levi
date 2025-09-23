const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

const { JWT_SECRET } = require("../config/keys");

// ✅ Registration Route
router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success:false, message: "All fields (username, email, password) are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

     // ✅ Only your email becomes admin
    const role = (email === "ezelevi7@gmail.com") ? "admin" : "user";

    // ⛔️ No wallet generation here — handled during deposit process
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // 🔑 JWT Token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ success: false, message: "Server error"  });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

   try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: "Login successful",
      token,
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


module.exports = router;
