const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Investment = require("../models/Investment"); // ✅ needed for profits
const Withdrawal = require("../models/Withdrawal");

/**
 * 📌 User requests a withdrawal
 * ✅ Only allows matured profits (not full balance)
 * ✅ Does NOT deduct balance immediately
 */
router.post("/", async (req, res) => {
  try {
    const { userId, method, amount, address } = req.body;

    if (!userId || !method || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Calculate withdrawable profit from matured investments
    const maturedInvestments = await Investment.find({ userId, status: "completed" });
    const withdrawableProfit = maturedInvestments.reduce(
      (sum, inv) => sum + ((inv.expectedReturn || 0) - (inv.amount || 0)),
      0
    );

    if (amount > withdrawableProfit) {
      return res.status(400).json({
        success: false,
        message: `You can only withdraw matured profits. Max available: $${withdrawableProfit.toFixed(
          2
        )}`,
      });
    }

    // ✅ Just log withdrawal request (don’t deduct yet)
    const withdrawal = new Withdrawal({
      userId,
      method,
      amount,
      address,
      status: "pending",
    });
    await withdrawal.save();

    return res.status(201).json({ success: true, withdrawal });
  } catch (err) {
    console.error("❌ Withdrawal request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 Admin approves withdrawal
 * ✅ Deducts balance only at approval
 */
router.post("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal || withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invalid or already processed withdrawal" });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.balance < withdrawal.amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance at approval" });
    }

    // ✅ Deduct on approval
    user.balance -= withdrawal.amount;
    await user.save();

    withdrawal.status = "approved";
    await withdrawal.save();

    res.json({ success: true, message: "Withdrawal approved", withdrawal, balance: user.balance });
  } catch (err) {
    console.error("❌ Approve withdrawal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 Admin rejects withdrawal
 * ✅ No balance change, just mark rejected
 */
router.post("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal || withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invalid or already processed withdrawal" });
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
