const express = require("express");
const mongoose = require("mongoose");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/user");

const router = express.Router();
// 📄 Admin approves or rejects withdrawal
router.post("/admin/update/:id", async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Withdrawal already processed" });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (status === "approved") {
      if (user.balance < withdrawal.amount) {
        return res.status(400).json({ success: false, message: "User has insufficient balance at approval time" });
      }

      // ✅ Deduct balance on approval
      user.balance -= withdrawal.amount;
      await user.save();

      withdrawal.status = "approved";
    } else if (status === "rejected") {
      withdrawal.status = "rejected";
    } else {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await withdrawal.save();

    res.json({
      success: true,
      message: `Withdrawal ${status}`,
      withdrawal,
    });
  } catch (error) {
    console.error("❌ Admin update withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server error updating withdrawal" });
  }
});

module.exports = router;