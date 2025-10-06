// routes/admin.js
const express = require("express");
const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// 📌 Approve a withdrawal
router.post("/withdrawals/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ success: false, message: "Withdrawal already processed" });

    // Update user balance
    const user = await User.findById(withdrawal.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.balance -= withdrawal.amount; // deduct amount from balance
    await user.save();

    // Update withdrawal status
    withdrawal.status = "approved";
    await withdrawal.save();

    res.json({ success: true, message: "Withdrawal approved", withdrawal });
  } catch (err) {
    console.error("❌ Approve withdrawal error:", err);
    res.status(500).json({ success: false, message: "Server error approving withdrawal" });
  }
});

// 📌 Reject a withdrawal
router.post("/withdrawals/:id/reject", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ success: false, message: "Withdrawal already processed" });

    // Simply mark as rejected (balance not deducted)
    withdrawal.status = "rejected";
    await withdrawal.save();

    res.json({ success: true, message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    console.error("❌ Reject withdrawal error:", err);
    res.status(500).json({ success: false, message: "Server error rejecting withdrawal" });
  }
});

module.exports = router;
