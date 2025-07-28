const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const { generateWallets, getDepositAddress } = require('../utils/tatumwallets');
const registerWebhook = require('../utils/registerWebhook');
// It's recommended to store this in .env file and use process.env.JWT_SECRET
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

    // 🎯 Only generate BTC wallet
    const wallets = await generateWallets(); // returns { BTC: { xpub: ... }, ... }

    // 📥 Get BTC deposit address from xpub
    const btcAddress = await getDepositAddress('bitcoin', wallets.BTC.xpub, 0);
    
    // 🔔 Register BTC webhook (optional, can be added later if rate limit is tight)
    await registerWebhook('BTC', btcAddress);

    const depositAddresses = {
      BTC: btcAddress,
    };

    // 👤 Create new user with BTC deposit address only
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      depositAddresses,
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

module.exports = router;

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Send token + user info
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


module.exports = { authRouter: router, SECRET_KEY };
