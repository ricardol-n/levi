const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Transaction = require('../models/Transaction'); // your transaction model
const axios = require('axios');

router.post('/tatum-deposit-webhook', async (req, res) => {
  try {
    const { address, currency, amount, blockNumber } = req.body;

    if (!address || !currency || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Find user who owns this address
    const user = await User.findOne({ [`depositAddresses.${currency}`]: address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with this deposit address' });
    }

    // Avoid duplicate records (optional, recommended)
    const existing = await Transaction.findOne({
      address,
      txType: 'deposit',
      currency,
      blockNumber,
    });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already recorded' });
    }

    // Log the transaction
    const tx = new Transaction({
      user: user._id,
      amount: parseFloat(amount),
      currency,
      method: currency,
      txType: 'deposit',
      date: new Date(),
      address,
      blockNumber
    });

    await tx.save();

    // Optional: auto-credit to dashboard balance
    user.balance += parseFloat(amount); // Only if using wallet balance
    await user.save();

    return res.status(200).json({ success: true, message: 'Deposit logged' });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
