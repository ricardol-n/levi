// backend/routes/btcpayWebhook.js
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");

const router = express.Router();

// ⚡ Use raw body for signature verification
router.use("/btcpay", express.raw({ type: "*/*" }));

router.post("/btcpay", async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("❌ Missing BTCPAY_WEBHOOK_SECRET");
      return res.status(500).send("Server misconfigured");
    }

    const signature =
      req.headers["btcpay-sig"] ||
      req.headers["Btcpay-Sig"] ||
      req.headers["BTCPAY-SIG"];

    const computed =
      "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    console.log("📩 BTCPay webhook received");
    console.log("🔑 Received:", signature);
    console.log("🔑 Computed:", computed);

    if (signature !== computed) {
      console.warn("❌ Invalid BTCPay signature");
      return res.status(403).send("Invalid signature");
    }

    // ✅ Parse JSON body safely
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error("❌ Invalid JSON payload:", e.message);
      return res.status(400).send("Invalid JSON");
    }

    const invoice = event?.data;
    if (!invoice?.id) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    console.log("📩 BTCPay event type:", event?.type);

    if (event.type === "InvoiceSettled" || event.type === "InvoiceCompleted") {
      const txId = invoice.id;
      const amountUsd = Number(invoice.metadata?.amount || 0);
      const userIdRaw = invoice?.metadata?.userId;

      if (!userIdRaw || !mongoose.Types.ObjectId.isValid(userIdRaw)) {
        console.error("❌ Invalid or missing userId:", userIdRaw);
        return res.status(400).json({ success: false, message: "Invalid userId" });
      }

      const userId = new mongoose.Types.ObjectId(userIdRaw);

      // 🔁 Prevent duplicate deposits
      const existing = await Deposit.findOne({ txId });
      if (existing) {
        console.log("🔁 Duplicate invoice ignored:", txId);
        return res.status(200).json({ success: true, message: "Already processed" });
      }

      // ✅ Save deposit
      const newDeposit = new Deposit({
        userId,
        address: invoice.address,
        amount: amountUsd,
        currency: "USD",
        txId,
        status: "confirmed",
        source: "btcpay",
      });
      await newDeposit.save();

      // ✅ Update balance
      await User.findByIdAndUpdate(userId, { $inc: { balance: amountUsd } });

      console.log(`✅ Deposit credited: $${amountUsd} USD → user ${userId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ BTCPay webhook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
