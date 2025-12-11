const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Investment = require("../models/Investment");
const Withdrawal = require("../models/Withdrawal");
const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

/**
 * 📌 USER: Submit a withdrawal request
 * ✅ Users can only withdraw matured profits (10% ROI)
 * ✅ Request logged for admin review
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { method, amount, address } = req.body;
    const userId = req.user._id;

    if (!method || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Calculate withdrawable profit (10% of completed investments)
    const maturedInvestments = await Investment.find({ userId, status: "completed" });
    const withdrawableProfit = maturedInvestments.reduce(
      (sum, inv) => sum + (inv.amount * 0.1), // 10% ROI profit only
      0
    );

    console.log(`💰 Withdrawable profit for ${user.email}: $${withdrawableProfit}`);

    if (amount > withdrawableProfit) {
      return res.status(400).json({
        success: false,
        message: `You can only withdraw up to your matured profit of $${withdrawableProfit.toFixed(2)}.`,
      });
    }

    // ✅ Create withdrawal request (pending)
    const withdrawal = new Withdrawal({
      userId,
      method,
      amount,
      address,
      status: "pending",
      createdAt: new Date(),
    });
    await withdrawal.save();

    console.log("📥 New withdrawal request logged:", {
      user: user.email,
      amount,
      method,
      status: withdrawal.status,
    });

    return res.status(201).json({
      success: true,
      message: "✅ Withdrawal request submitted! Please wait for admin confirmation within 24 hours.",
      data: withdrawal,
    });
  } catch (err) {
    console.error("❌ Withdrawal request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 ADMIN: View all withdrawals (React Admin)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? {}
      : { userId: req.user._id };

    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "email username")
      .sort({ createdAt: -1 });

    res.json(withdrawals.map(w => ({ ...w.toObject(), id: w._id })));
  } catch (err) {
    console.error("❌ Get withdrawals error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📌 ADMIN: Approve or Reject withdrawal (React Admin)
 * ✅ Handles balance deduction on approval
 */
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: "approved" | "rejected"

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal not found" });
    }

    // ✅ If admin approves, deduct from user balance
    if (status === "approved" && withdrawal.status === "pending") {
      const user = await User.findById(withdrawal.userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (user.balance < withdrawal.amount) {
        return res.status(400).json({ success: false, message: "Insufficient user balance" });
      }

      user.balance -= withdrawal.amount;
      await user.save();
    }

    withdrawal.status = status;
    await withdrawal.save();

    res.json({ success: true, message: `Withdrawal ${status} successfully`, withdrawal });
  } catch (err) {
    console.error("❌ Withdrawal update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
