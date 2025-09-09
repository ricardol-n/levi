const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/user");
const mongoose = require("mongoose");

// 📌 Create a new withdrawal (user request)
router.post("/", async (req, res) => {
  try {
    const { userId, method, address, amount } = req.body;

    if (!userId || !address || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing withdrawal data" });
    }

    // ✅ Force BTC only
    if (!method || method !== "BTC") {
      return res
        .status(400)
        .json({ success: false, message: "Only BTC withdrawals are supported" });
    }

    if (amount < 1 ) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is $1",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.balance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance immediately (hold funds until approval)
    user.balance -= amount;
    await user.save();

    const withdrawal = new Withdrawal({
      userId,
      method: "BTC", // ✅ always set BTC
      address,
      amount,
      status: "pending",
    });

    await withdrawal.save();

    return res.json({
      success: true,
      message: "Withdrawal submitted and is pending approval.",
      withdrawal,
    });
  } catch (err) {
    console.error("❌ Withdrawal error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// 📌 Get user withdrawals (history)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const query = userId ? { userId, method: "BTC" } : { method: "BTC" };
    const withdrawals = await Withdrawal.find(query).sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error("❌ Fetch withdrawals error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📌 Approve withdrawal (admin action)
router.put("/:id/approve", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal already processed" });
    }

    withdrawal.status = "approved";
    withdrawal.txId = req.body.txId || null; // optional blockchain tx hash
    await withdrawal.save();

    res.json({ success: true, message: "Withdrawal approved", withdrawal });
  } catch (err) {
    console.error("❌ Approve withdrawal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📌 Reject withdrawal (admin action)
router.put("/:id/reject", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal already processed" });
    }

    // Refund balance since request is rejected
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.balance += withdrawal.amount;
      await user.save();
    }

    withdrawal.status = "rejected";
    await withdrawal.save();

    res.json({ success: true, message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    console.error("❌ Reject withdrawal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
