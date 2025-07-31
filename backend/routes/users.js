const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Deposit = require('../models/Deposit');

// ✅ Create a new user (admin or user)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "User",
      depositAddresses: {
        BTC: '',
        DOGE: '',
        ETH: '',
        TRON: '',
        XRP: ''
      }
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User created", data: newUser });

  } catch (error) {
    console.error("❌ Create User Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


// ✅ Webhook handler for deposit confirmation
router.post('/webhook/deposit', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.TATUM_WEBHOOK_SECRET;

    if (!secret || secret !== expectedSecret) {
      console.warn("🚨 Unauthorized webhook attempt");
      return res.status(403).json({ success: false, message: 'Forbidden: Invalid webhook secret' });
    }

    const { address, amount, blockchain: chain, txId, type } = req.body;

    if (!address || !amount || !chain || !txId || type !== 'incoming') {
      console.log("❌ Invalid webhook payload:", req.body);
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    const existing = await Deposit.findOne({ txId });
    if (existing) {
      console.log(`🔁 Duplicate txId ignored: ${txId}`);
      return res.status(200).json({ success: true, message: 'Already processed' });
    }

    const user = await User.findOne({ [`depositAddresses.${chain.toUpperCase()}`]: address });
    if (!user) {
      console.log(`❌ No user found for ${chain.toUpperCase()} address: ${address}`);
      return res.status(404).json({ success: false, message: 'Address not linked to any user' });
    }

    const newDeposit = new Deposit({
      userId: user._id,
      address,
      amount: parseFloat(amount),
      currency: chain.toUpperCase(),
      txId,
      status: 'confirmed',
      source: 'webhook',
    });
    await newDeposit.save();

    await User.findByIdAndUpdate(
      user._id,
      { $inc: { balance: parseFloat(amount) } },
      { new: true }
    );

    console.log(`✅ Deposit credited: ${amount} ${chain.toUpperCase()} to ${user.email}`);
    return res.json({ success: true, message: 'Deposit recorded and user credited' });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// ✅ GET user's wallet addresses
// Get deposit wallets for a user
router.get('/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('depositAddresses');

        if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.depositAddresses || Object.keys(user.depositAddresses).length === 0) {
      return res.status(404).json({ success: false, message: 'Wallets missing for user' });
    }

    console.log("🎯 User deposit addresses:", user.depositAddresses);


    return res.json({ success: true, depositAddresses: user.depositAddresses });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
});



// ✅ GET user's deposit logs
router.get('/:id/deposits', async (req, res) => {
  const userId = req.params.id;

  try {
    const deposits = await Deposit.find({ userId }).sort({ date: -1 });
    res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("❌ Fetch deposits error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
