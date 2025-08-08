const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const User = require('../models/user');
const Deposit = require('../models/Deposit');

// ✅ Save a pending deposit
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

// ✅ Create BTCPay invoice
router.post('/create-invoice', async (req, res) => {
  const { amount, currency = "BTC", userId } = req.body;

  if (!amount || !userId) {
    return res.status(400).json({ success: false, message: "Missing amount or userId" });
  }

  try {
    const response = await axios.post(
      `${process.env.BTCPAY_HOST}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices`,
      {
        amount,
        currency,
        metadata: {
          userId,
          purpose: "wallet deposit",
        },
        checkout: {
          speedPolicy: "HighSpeed",
        },
      },
      {
        headers: {
          Authorization: `token ${process.env.BTCPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const invoice = response.data;
    res.json({
      success: true,
      invoiceId: invoice.id,
      checkoutUrl: invoice.checkoutLink,
    });

  } catch (err) {
    console.error("❌ Failed to create BTCPay invoice:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to create invoice" });
  }
});

// ✅ Webhook from BTCPay
router.post('/btcpay-webhook', express.json(), async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['btcpay-sig'];
  const secret = process.env.BTCPAY_WEBHOOK_SECRET;

  // ✅ Verify webhook signature
  const computedSig = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  if (signature !== computedSig) {
    console.warn("⚠️ Invalid BTCPay signature");
    console.warn("Expected:", computedSig);
    console.warn("Received:", signature);
    console.log("Expected:", computedSig);
    console.log("Received:", signature);

    return res.status(403).send("Invalid signature");
  }

  const event = req.body;
  console.log('📩 BTCPay Webhook Event:', event?.type);

  if (!event || !event.type || !event.invoiceId) {
    return res.status(400).json({ success: false, message: "Invalid webhook payload" });
  }

  try {
    if (event.type === "InvoiceSettled" || event.type === "InvoiceCompleted") {
      const invoice = event.data;
      const metadata = invoice.metadata || {};
      const userId = metadata.userId;
      const txId = invoice.id;
      const amount = parseFloat(invoice.amountPaid || invoice.amount);

      if (!userId || !amount || !txId) {
        console.error("❌ Missing invoice data:", invoice);
        return res.status(400).json({ success: false, message: "Missing invoice data" });
      }

      const existing = await Deposit.findOne({ txId });
      if (existing) {
        console.log(`🔁 Duplicate invoiceId ignored: ${txId}`);
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      const user = await User.findById(userId);
      if (!user) {
        console.log(`❌ No user found for invoice: ${userId}`);
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const newDeposit = new Deposit({
        userId,
        address: invoice.address,
        amount,
        currency: invoice.currency || "BTC",
        txId,
        status: "confirmed",
        source: "btcpay",
      });
      await newDeposit.save();

      await User.findByIdAndUpdate(userId, {
        $inc: { balance: amount },
      });

      console.log(`✅ BTCPay deposit credited: ${amount} BTC to user ${userId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ BTCPay webhook error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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
