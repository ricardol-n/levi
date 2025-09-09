const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");

const router = express.Router();

/**
 * 🔑 BTCPay webhook (BTC only)
 */
router.post("/btcpay", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["btcpay-sig"];
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;

    // ✅ Verify HMAC signature
    const computed =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (signature !== computed) {
      console.warn("❌ Invalid BTCPay signature");
      return res.status(403).send("Invalid signature");
    }

    const event = req.body;
    console.log("📩 BTCPay event:", event?.type);

    if (!event || !event.type || !event.invoiceId) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    if (event.type === "InvoiceSettled" || event.type === "InvoiceCompleted") {
      const invoice = event.data;
      const txId = invoice.id;
      const amount = parseFloat(invoice.amountPaid || invoice.amount);
      const userIdRaw = invoice?.metadata?.userId; // ✅ FIXED

      if (!userIdRaw || !amount || !txId) {
        console.error("❌ Missing invoice data:", invoice);
        return res
          .status(400)
          .json({ success: false, message: "Missing invoice data" });
      }

      // 🚨 Enforce BTC only
      if (invoice.currency && invoice.currency !== "BTC") {
        console.warn(`❌ Rejected non-BTC deposit: ${invoice.currency}`);
        return res
          .status(400)
          .json({ success: false, message: "Only BTC deposits are accepted" });
      }

      // ✅ Ensure valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userIdRaw)) {
        console.error("❌ Invalid userId format:", userIdRaw);
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId" });
      }
      const userId = new mongoose.Types.ObjectId(userIdRaw);

      // ✅ Prevent duplicate
      const existing = await Deposit.findOne({ txId });
      if (existing) {
        console.log("🔁 Duplicate invoice ignored:", txId);
        return res.status(200).json({ success: true, message: "Already processed" });
      }

      // ✅ Save deposit record
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

      // ✅ Update user balance
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
