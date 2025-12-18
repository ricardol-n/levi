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
 * ✅ Users can ONLY withdraw matured profits (10% ROI)
 * ✅ Profit cannot be withdrawn twice
 * ✅ Request logged for admin review
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { method, amount, address } = req.body;
    const userId = req.user._id;

    // 🔒 Validate input
    if (!method || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔒 Get completed investments only
    const maturedInvestments = await Investment.find({
      userId,
      status: "completed",
    });

    // 🔒 Calculate REMAINING withdrawable profit
    const withdrawableProfit = maturedInvestments.reduce((sum, inv) => {
      const totalProfit = inv.amount * 0.1; // 10% ROI
      const withdrawn = inv.withdrawnProfit || 0;
      const remainingProfit = totalProfit - withdrawn;
      return sum + Math.max(remainingProfit, 0);
    }, 0);

    console.log(
      `💰 Withdrawable profit for ${user.email}: $${withdrawableProfit.toFixed(2)}`
    );

    // ❌ Block over-withdraw
    if (amount > withdrawableProfit) {
      return res.status(400).json({
        success: false,
        message: `You can only withdraw up to your matured profit of $${withdrawableProfit.toFixed(
          2
        )}.`,
      });
    }

    // 📥 Create withdrawal request (PENDING)
    const withdrawal = new Withdrawal({
      userId,
      method,
      amount,
      address,
      status: "pending",
      createdAt: new Date(),
    });

    await withdrawal.save();

    console.log("📥 Withdrawal request submitted:", {
      user: user.email,
      amount,
      method,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Your withdrawal is pending. Please wait for admin confirmation within 24 hours.",
      data: withdrawal,
    });
  } catch (err) {
    console.error("❌ Withdrawal request error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 ADMIN / USER: View withdrawals
 * - Admin sees all
 * - User sees own
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { userId: req.user._id };

    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "email username")
      .sort({ createdAt: -1 });

    return res.json(
      withdrawals.map((w) => ({ ...w.toObject(), id: w._id }))
    );
  } catch (err) {
    console.error("❌ Get withdrawals error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * 📌 ADMIN: Approve or Reject withdrawal
 * ✅ Balance deducted ONLY on approval
 * ✅ Profit locked to prevent double withdrawal
 */
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" | "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Withdrawal already processed",
      });
    }

    // ✅ APPROVAL FLOW
    if (status === "approved") {
      const user = await User.findById(withdrawal.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (user.balance < withdrawal.amount) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient user balance" });
      }

      // 🔻 Deduct balance
      user.balance -= withdrawal.amount;
      await user.save();

      // 🔒 Lock withdrawn profit from investments
      let remaining = withdrawal.amount;

      const investments = await Investment.find({
        userId: withdrawal.userId,
        status: "completed",
      }).sort({ createdAt: 1 });

      for (const inv of investments) {
        if (remaining <= 0) break;

        const totalProfit = inv.amount * 0.1;
        const withdrawn = inv.withdrawnProfit || 0;
        const availableProfit = totalProfit - withdrawn;

        if (availableProfit <= 0) continue;

        const deduct = Math.min(availableProfit, remaining);
        inv.withdrawnProfit += deduct;
        remaining -= deduct;

        await inv.save();
      }
    }

    // ✅ Update withdrawal status
    withdrawal.status = status;
    await withdrawal.save();

    return res.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      withdrawal,
    });
  } catch (err) {
    console.error("❌ Withdrawal update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
