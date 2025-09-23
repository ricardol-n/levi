const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");
/**
 * 📌 Request withdrawal (User)
 * ✅ Only allow profit withdrawals, not full balance
 */
router.post("/", async (req, res) => {
  try {
    const { userId, method, amount, address } = req.body;

    if (!userId || !method || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const user = await User.findById(userId).populate("investments");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Calculate withdrawable profit (only matured investments)
    const withdrawableProfit = (user.investments || [])
      .filter(inv => inv.status === "matured")
      .reduce((sum, inv) => sum + (inv.expectedReturn || 0), 0);

    if (amount > withdrawableProfit) {
      return res.status(400).json({
        success: false,
        message: `You can only withdraw matured profits. Max available: $${withdrawableProfit}`,
      });
    }

    // ✅ Deduct balance (profit-only, not principal)
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }
    user.balance -= amount;
    await user.save();

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

module.exports = router;
