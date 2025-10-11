const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/user");
const { createBTCPayInvoice, getBTCPayInvoice } = require("../utils/btcpay"); // ✅ fixed import
const Deposit = require("../models/Deposit");
const TEST_MODE = process.env.TEST_MODE === "true";

// ✅ Create BTC invoice only

router.post("/create-invoice", async (req, res) => {
  try {
    console.log("📩 /create-invoice called with body:", req.body);
    const { userId, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ success: false, message: "Minimum deposit is $1" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 🟢 TEST MODE SHORTCUT
    if (TEST_MODE) {
      const newDeposit = new Deposit({
        userId,
        amount,
        currency: "USD",
        txId: "mock-invoice-" + Date.now(),
        status: "pending", // always pending until confirmed by status-checker
        source: "test-mode",
      });

      await newDeposit.save();

      return res.json({
        success: true,
        testMode: true,
        message: "✅ TEST_MODE deposit created (will auto-confirm in status check)",
        checkoutUrl: `${process.env.FRONTEND_URL}/depositconfirmationpage`,
        deposit: newDeposit,
      });
    }

    // Step 1: Create invoice in BTCPay
   const invoice = await createBTCPayInvoice({
      amount,
      userId,
      redirectUrl: `${process.env.FRONTEND_URL}/depositconfirmationpage`,
    });

    console.log("🧾 Invoice from BTCPay util:", invoice);

    if (!invoice || !invoice.id || !invoice.checkoutLink) {
      console.error("❌ Invoice missing id or checkoutLink:", invoice);
      return res.status(502).json({ success: false, message: "Failed to create invoice with BTCPay", invoice });
    }

    // Step 2: Save pending deposit
    const newDeposit = new Deposit({
      userId,
      amount,
      currency: "USD",
      txId: invoice.id,
      checkoutUrl: invoice.checkoutLink,
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

    if (!userId) return res.status(400).json({ message: "User ID missing" });

  try {
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    console.error("❌ Fetch deposits error:", err);
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});
// 📄 Admin: list all deposits
router.get("/deposits/all", async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("❌ Fetch all deposits error:", err);
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});

// 📄 Check deposit status (READ-ONLY)
router.get("/deposit-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid deposit ID" });
    }

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    // 🟢 TEST MODE: auto-confirm
    if (TEST_MODE) {
      return res.json({
        success: true,
        status: deposit.status === "confirmed" ? "confirmed" : "pending",
        testMode: true,
        deposit,
      });
    }

    // 🔎 Fetch from BTCPay
    const invoice = await getBTCPayInvoice(deposit.txId);
    res.json({
      success: true,
      status: deposit.status,   // actual DB status
      deposit,
      btcpayStatus: invoice?.status || "unknown",
    });
  } catch (error) {
    console.error("❌ Deposit status error:", error);
    res.status(500).json({ success: false, message: "Server error checking deposit" });
  }
});



module.exports = router;
