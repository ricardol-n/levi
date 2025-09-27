const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");

const router = express.Router();

// ⚡ Use raw body for signature check
router.use("/btcpay", express.raw({ type: "*/*" }));

router.post("/btcpay", async (req, res) =>  {
  try {
    const rawBody = req.body.toString("utf8");
    const signature = req.headers["btcpay-sig"];
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;

    // 🔑 Verify HMAC
    const computed =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      
      // 🐛 DEBUG LOGGING
    console.log("📩 Raw BTCPay body:", rawBody);
    console.log("🔑 Received signature:", signature);
    console.log("🔑 Computed signature:", computed);

    if (signature !== computed) {
      console.warn("❌ Invalid BTCPay signature");
      return res.status(403).send("Invalid signature");
    }

    const event = JSON.parse(rawBody);
    console.log("📩 BTCPay event:", event?.type);

    const invoice = event?.data;
    if (!invoice || !invoice.id) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    if (event.type === "InvoiceSettled" || event.type === "InvoiceCompleted") {
      const txId = invoice.id;
      const amount = parseFloat(invoice.amountPaid || invoice.amount || 0);
      const userIdRaw = invoice?.metadata?.userId;

      if (!userIdRaw || !amount || !txId) {
        console.error("❌ Missing invoice data:", invoice);
        return res.status(400).json({ success: false, message: "Missing invoice data" });
      }

      // 🚨 BTC only
      if (invoice.currency?.toUpperCase() !== "BTC") {
        console.warn(`❌ Rejected non-BTC deposit: ${invoice.currency}`);
        return res.status(400).json({ success: false, message: "Only BTC deposits are accepted" });
      }

      // ✅ Validate user
      if (!mongoose.Types.ObjectId.isValid(userIdRaw)) {
        console.error("❌ Invalid userId format:", userIdRaw);
        return res.status(400).json({ success: false, message: "Invalid userId" });
      }
      const userId = new mongoose.Types.ObjectId(userIdRaw);

      // ✅ Prevent duplicate
      const existing = await Deposit.findOne({ txId });
      if (existing) {
        console.log("🔁 Duplicate invoice ignored:", txId);
        return res.status(200).json({ success: true, message: "Already processed" });
      }

      // ✅ Save deposit
      const newDeposit = new Deposit({
        userId,
        address: invoice.address,
        amount,
        currency: "BTC",
        txId,
        status: "confirmed",
        source: "btcpay",
      });
      await newDeposit.save();

      // ✅ Update balance
      await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });

      console.log(`✅ BTC deposit credited: ${amount} BTC → user ${userId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ BTCPay webhook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
