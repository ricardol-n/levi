const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// ✅ Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: email === "ezelevi7@gmail.com" ? "admin" : "user",
      balance: 0,
      depositAddressBTC: { BTC: "" },
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created",
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Create User Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Get all users (Admin Panel)
router.get("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users.map(u => ({ ...u.toObject(), id: u._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get user balance
router.get("/:id/balance", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔎 Balance request for userId param:", id);
    console.log("🔑 Token decoded user:", req.user);

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      console.log("❌ Forbidden: token user does not match param");
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findById(id).select("balance");
    console.log("📊 Balance in DB:", user?.balance);

    res.json({ success: true, balance: user?.balance ?? 0 });
  } catch (err) {
    console.error("❌ Balance fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get deposits
router.get("/:id/deposits", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const deposits = await Deposit.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("❌ Fetch deposits error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get withdrawals
router.get("/:id/withdrawals", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const withdrawals = await Withdrawal.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals.map(w => ({ ...w.toObject(), id: w._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Update user (Admin)
router.put("/:id",verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: { ...updated.toObject(), id: updated._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Delete user (Admin)
router.delete("/:id",verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted", id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Get referral stats for a user (dynamic)
router.get("/:id/referrals", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findById(id).select("referralCode referralBonus");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get all referred users dynamically
    const referredUsers = await User.find({ referredBy: id }).select("email username createdAt");

    const frontendBase =
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      "https://txlaadvisory.com";

    res.json({
      success: true,
      data: {
        referrals: referredUsers.length,
        bonus: user.referralBonus,
        referralLink: `${frontendBase.replace(/\/$/, "")}/register?ref=${user.referralCode}`,
        referredUsers,
      },
    });
  } catch (err) {
    console.error("Referral fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
              