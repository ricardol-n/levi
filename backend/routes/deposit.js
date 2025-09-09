const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/user");
const { createBTCPayInvoice } = require("../utils/btcpay"); // ✅ fixed import
const Deposit = require("../models/Deposit");


// ✅ Create BTC invoice only
router.post("/create-invoice", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ success: false, message: "Minimum deposit is $1" });
    }

    // Always force BTC
    const currency = "BTC";

    // Step 1: Create invoice in BTCPay
    const invoice = await createBTCPayInvoice({
      amount,
      currency,
      userId,
      redirectUrl: `${process.env.APP_BASE_URL}/depositconfirmationpage`,
    });

    // Step 2: Save pending deposit
    const newDeposit = new Deposit({
      userId,
      amount,
      currency: "BTC",
      txId: invoice.id,
      status: "pending",
      source: "btcpay",
    });

    await newDeposit.save();

    res.json({
      success: true,
      checkoutUrl: invoice.checkoutLink,
      deposit: newDeposit,
    });
  } catch (err) {
    console.error("❌ Create BTC invoice error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Server error creating invoice" });
  }
});


// 📄 Retrieve user deposits (BTC only)
router.get("/deposits", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    const query = mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId), currency: "BTC" }
      : { currency: "BTC" };

    const deposits = await Deposit.find(query).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    console.error("❌ Fetch deposits error:", error);
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});

module.exports = router;
