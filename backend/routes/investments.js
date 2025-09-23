const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Investment = require("../models/Investment");
const verifyToken = require("../middleware/auth"); // ensure user is logged in

// ✅ Create a new investment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, amount, roi, duration } = req.body;

    if (!name || !amount || !roi || !duration) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);


    // Deduct from user balance BEFORE saving investment
    const user = await User.findById(req.user._id);
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    user.balance -= amount;
    await user.save();

    const investment = new Investment({
      userId: req.user._id, // from auth middleware
      name,
      amount,
      roi,                 // save ROI separately too
      startDate,
      endDate,
      status:"active",
    });

    await investment.save();
    res.status(201).json({ investment, balance: user.balance });
  } catch (err) {
    console.error("❌ Investment creation error:", err.message);
    res.status(500).json({ message: "Server error creating investment." });
  }
});


// ✅ Get all investments of the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: investments });
  } catch (err) {
    console.error("❌ Error fetching investments:", err.message);
    res.status(500).json({ message: "Server error fetching investments." });
  }
});

// ✅ Admin route: get all investments (optional, for admin panel)
router.get("/all", verifyToken, async (req, res) => {
  try {
    // Optionally check if req.user.role === 'admin'
    const investments = await Investment.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.json({ data: investments });
  } catch (err) {
    console.error("❌ Error fetching all investments:", err.message);
    res.status(500).json({ message: "Server error fetching all investments." });
  }
});

// Cancel investment
// Cancel investment
router.post("/cancel", verifyToken, async (req, res) => {
  try {
    const { investmentId } = req.body;
    const userId = req.user._id; // ✅ from token

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

    // ✅ Apply 20% penalty
    const penalty = Number(investment.amount) * 0.2;
    const refund = Number(investment.amount) - penalty;

    // Mark investment as cancelled
    investment.status = "cancelled";
    await investment.save();

    // Refund user balance & return updated user
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: refund } },
      { new: true } // return updated user
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
