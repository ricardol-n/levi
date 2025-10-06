const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Investment = require("../models/Investment");
const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

// ✅ Create a new investment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, amount, roi, duration } = req.body;

    if (!name || !amount || !roi || !duration) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }

    user.balance -= amount;
    await user.save();

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    const profitOnly = amount * (roi / 100);

    const investment = new Investment({
      userId: req.user._id,
      name,
      amount,
      roi,
      expectedReturn: profitOnly,
      startDate,
      endDate,
      status: "active",
    });

    await investment.save();
    res.status(201).json({ success: true, investment, balance: user.balance });
  } catch (err) {
    console.error("❌ Investment creation error:", err.message);
    res.status(500).json({ success: false, message: "Server error creating investment." });
  }
});

// ✅ Get user investments
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("🔎 Investments request. Token user:", req.user);

    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });
     console.log("📊 Found investments:", investments.length);

    res.json({ success: true, data: investments });
  } catch (err) {
    console.error("❌ Error fetching investments:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching investments." });
  }
});

// ✅ Admin: get all investments
router.get("/all", verifyToken, adminOnly, async (req, res) => {
  try {
    const investments = await Investment.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.json({ success: true, data: investments });
  } catch (err) {
    console.error("❌ Error fetching all investments:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching all investments." });
  }
});

// ✅ Cancel investment
router.post("/cancel", verifyToken, async (req, res) => {
  try {
    const { investmentId } = req.body;
    const userId = req.user._id;

    if (!investmentId) {
      return res.status(400).json({ success: false, message: "Missing investmentId" });
    }

    const investment = await Investment.findOne({ _id: investmentId, userId });
    if (!investment) {
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    if (investment.status !== "active") {
      return res.status(400).json({ success: false, message: "Only active investments can be cancelled" });
    }

    const penalty = Number(investment.amount) * 0.2;
    const refund = Number(investment.amount) - penalty;

    investment.status = "cancelled";
    await investment.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: refund } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Investment cancelled with 20% penalty",
      refund,
      balance: user.balance,
    });
  } catch (err) {
    console.error("❌ Cancel investment error:", err);
    res.status(500).json({ success: false, message: "Server error cancelling investment." });
  }
});

module.exports = router;
