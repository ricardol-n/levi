const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");

const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

/**
 * =====================================================
 * USER: REQUEST WITHDRAWAL (MATURED PROFIT ONLY)
 * =====================================================
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { method, amount, address } = req.body;
    const userId = req.user._id;

    if (!method || !amount || !address || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.maturedProfit < amount) {
      return res.status(400).json({
        success: false,
        message: `Available profit: $${user.maturedProfit.toFixed(2)}`,
      });
    }

    // 🔒 Prevent multiple pending withdrawals
    const pending = await Withdrawal.findOne({
      userId,
      status: "pending",
    });

    if (pending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending withdrawal",
      });
    }

    const withdrawal = await Withdrawal.create({
      userId,
      method,
      amount,
      address,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: withdrawal,
    });
  } catch (err) {
    console.error("❌ Withdrawal request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * =====================================================
 * USER / ADMIN: VIEW WITHDRAWALS
 * =====================================================
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user._id };

    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "email username")
      .sort({ createdAt: -1 });

    res.json(withdrawals.map(w => ({ ...w.toObject(), id: w._id })));
  } catch (err) {
    console.error("❌ Get withdrawals error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * =====================================================
 * ADMIN: APPROVE / REJECT (LOCKED & ATOMIC)
 * =====================================================
 */
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      throw new Error("Invalid status");
    }

    // 🔒 Lock withdrawal first
    const withdrawal = await Withdrawal.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { status: "processing" },
      { new: true, session }
    );

    if (!withdrawal) throw new Error("Withdrawal already processed");

    if (status === "approved") {
      const user = await User.findById(withdrawal.userId).session(session);
      if (!user) throw new Error("User not found");

      if (user.maturedProfit < withdrawal.amount) {
        throw new Error("Insufficient matured profit");
      }

      user.maturedProfit -= withdrawal.amount;
      user.withdrawnProfit += withdrawal.amount;

      await user.save({ session });
    }

    withdrawal.status = status;
    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: `Withdrawal ${status}` });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Withdrawal approval error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
