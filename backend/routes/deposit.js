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

    const { userId, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }
    if (!amount || Number(amount) < 0) {
      return res.status(400).json({ success: false, message: "Minimum deposit is $1" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // 🟢 TEST MODE SHORTCUT
    if (TEST_MODE) {
      const newDeposit = new Deposit({
        userId,
        amount,
        currency: "BTC",
        txId: "mock-invoice-" + Date.now(),
        status: "confirmed", // instantly confirmed
        source: "test-mode",
      });

      await newDeposit.save();

      // update balance immediately
      await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });

      return res.json({
        success: true,
        testMode: true,
        message: "✅ TEST_MODE deposit confirmed instantly",
        checkoutUrl: `${process.env.APP_BASE_URL}/depositconfirmationpage`,
        deposit: newDeposit,
      });
    }

    // Step 1: Create invoice in BTCPay
    const invoice = await createBTCPayInvoice({
      amount,
      currency:"USD",
      userId,
      redirectUrl: `${process.env.APP_BASE_URL}/depositconfirmationpage`,
    });

    // Step 2: Save pending deposit
    const newDeposit = new Deposit({
      userId,
      amount,
      currency: "BTC",
      txId: invoice.id,
      checkoutUrl:invoice.checkoutLink,
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
    const deposits = await Deposit.find({ userId, currency: "BTC" }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    console.error("❌ Fetch deposits error:", err);
    res.status(500).json({ message: "Failed to fetch deposits" });
  }
});
// 📄 Check deposit status by ID
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
    
     // 🟢 TEST MODE: Always return confirmed
    if (TEST_MODE) {
      return res.json({
        success: true,
        status: "confirmed",
        testMode: true,
        message: "✅ TEST_MODE deposit confirmed",
        deposit,
      });
    }


    // Check invoice from BTCPay
    const invoice = await getBTCPayInvoice(deposit.txId);

    if (invoice && invoice.status === "Settled" && deposit.status !== "confirmed") {
      // ✅ Mark as confirmed
      deposit.status = "confirmed";
      await deposit.save();

      // ✅ Update user balance
      await User.findByIdAndUpdate(deposit.userId, {
        $inc: { balance: deposit.amount },
      });
    }

    res.json({ success: true, status: deposit.status, deposit });
  } catch (error) {
    console.error("❌ Deposit status error:", error);
    res.status(500).json({ success: false, message: "Server error checking deposit" });
  }
});

module.exports = router;
