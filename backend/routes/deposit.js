const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { generateWallets, getDepositAddress } = require('../utils/tatumwallets');
const User = require('../models/user');
const Deposit = require('../models/Deposit');
const registerWebhook = require('../utils/registerWebhook');

const TATUM_API_KEY = process.env.TATUM_API_KEY;

// 🧠 Map frontend currency names to Tatum-supported blockchain IDs
const mapToTatumChain = (currency) => {
  const currencyMap = {
    "Bitcoin": "BTC",
    "Dogecoin": "DOGE",
    "Ethereum": "ETH",
    "USDT ERC20": "ETH",
    "USDT TRC20": "TRON",
    "XRP": "XRP",
  };
  return currencyMap[currency] || null;
};

// ✅ Save a pending deposit (optional pre-verification step)
router.post('/pending-deposit', async (req, res) => {
  const { userId, address, amount, currency } = req.body || {};

  if (!userId || !address || !amount || !currency) {
    return res.status(400).json({ success: false, message: "Missing deposit data" });
  }

  try {
    const newDeposit = new Deposit({
      userId,
      address,
      amount,
      currency,
      status: "pending",
    });

    await newDeposit.save();
    res.json({ success: true, message: "Pending deposit saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save deposit" });
  }
});

router.post('/generate-wallets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const wallets = await generateWallets();

    const depositAddresses = { BTC: btcAddress };


    // Derive addresses from xpub for each chain
    depositAddresses.Bitcoin = await getDepositAddress('bitcoin', wallets.Bitcoin.xpub);
    depositAddresses.Ethereum = await getDepositAddress('ethereum', wallets.Ethereum.xpub);
    depositAddresses.Dogecoin = await getDepositAddress('dogecoin', wallets.Dogecoin.xpub);
    depositAddresses.XRP = wallets.XRP.address; // XRP doesn't use xpub; use 'address'
    depositAddresses['USDT ERC20'] = depositAddresses.Ethereum;
    depositAddresses['USDT TRC20'] = await getDepositAddress('tron', wallets.TRON.xpub);

    // ✅ Register webhooks for each address
    await registerWebhook('BTC', depositAddresses.Bitcoin);
    await registerWebhook('ETH', depositAddresses.Ethereum);
    await registerWebhook('DOGE', depositAddresses.Dogecoin);
    await registerWebhook('XRP', depositAddresses.XRP);
    await registerWebhook('TRON', depositAddresses['USDT TRC20']); // USDT on TRON chain

    // save to user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { depositAddresses } },
      { new: true }
    );

    res.json({ success: true, wallets: depositAddresses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Webhook: Automatically confirm deposits when Tatum notifies

router.post('/tatum-deposit-webhook', async (req, res) => {
  // ✅ 0. Verify webhook secret
  const secret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.TATUM_WEBHOOK_SECRET;

  if (!secret || secret !== expectedSecret) {
    console.warn("🚨 Invalid or missing webhook secret:", secret);
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid webhook secret' });
  }

  try {
    const { address, amount, blockchain: chain, txId, type } = req.body;

    // ✅ 1. Validate incoming data
    if (!address || !amount || !chain || !txId || type !== 'incoming') {
      console.log("❌ Invalid webhook payload:", req.body);
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    // ✅ 2. Prevent double-processing by checking if txId already exists
    const existing = await Deposit.findOne({ txId });
    if (existing) {
      console.log(`🔁 Duplicate txId ignored: ${txId}`);
      return res.status(200).json({ success: true, message: 'Already processed' });
    }

    // ✅ 3. Match the address to a user’s wallet
    const user = await User.findOne({ [`depositAddresses.${chain.toUpperCase()}`]: address });

    if (!user) {
      console.log(`❌ No user found for ${chain} address: ${address}`);
      return res.status(404).json({ success: false, message: 'Address not linked to any user' });
    }

    // ✅ 4. Log the transaction in the deposit collection
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

    // ✅ 5. Credit the user’s balance
    await User.findByIdAndUpdate(
      user._id,
      { $inc: { balance: parseFloat(amount) } },
      { new: true }
    );

    console.log(`✅ Deposit credited: ${amount} ${chain.toUpperCase()} to ${user.email}`);
    return res.json({ success: true, message: 'Deposit recorded and user credited' });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// 📄 Retrieve user deposits
router.get('/deposits', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});


module.exports = router;
