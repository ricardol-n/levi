const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

const verifyToken = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// ✅ Create a new user (admin or signup)
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
      role: email === "ezelevi7@gmail.com" ? "admin" : "user", // default "user"
      balance: 0,           // ✅ always initialize balance
      depositAddressBTC: { BTC: "" }, // ✅ single BTC wallet for BTCPay
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created",
      user: {
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

/**
 * 📌 Get all users (Admin Panel)
 */
router.get("/",verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(u => ({ ...u.toObject(), id: u._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Get user balance (always from DB)
router.get("/:id/balance",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow self or admin
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("balance");
    if (!user) {
      console.log("❌ User not found for ID:", id);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error("❌ Balance fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



/**
 * ✅ Get user's BTC deposit logs
 */
router.get("/:id/deposits",verifyToken, async (req, res) => {
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

/**
 * ✅ Get user's BTC withdrawal logs
 */
router.get("/:id/withdrawals",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
     if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const withdrawals = await Withdrawal.find({ userId: id }).sort({ createdAt: -1 });
    res.json(withdrawals.map(w => ({ ...w.toObject(), id: w._id })));
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 Update user (Admin edit)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ ...updated.toObject(), id: updated._id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📌 Delete user (Admin remove)
 */
router.delete("/:id", async (req, res) => {
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


module.exports = router;
