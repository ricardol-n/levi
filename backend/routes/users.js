const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/user");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

/* =====================================================
   ✅ CREATE USER (PUBLIC REGISTER)
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: email === "ezelevi7@gmail.com" ? "admin" : "user",
      balance: 0,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ GET CURRENT USER (FOR OVERVIEW.JSX)
===================================================== */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const maturedProfit = Math.max(user.maturedProfit || 0, 0);
    const withdrawnProfit = Math.max(user.withdrawnProfit || 0, 0);

    const withdrawableProfit = Math.max(
      maturedProfit - withdrawnProfit,
      0
    );

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        balance: Math.max(user.balance || 0, 0),
        maturedProfit,
        withdrawableProfit,
      },
    });
  } catch (err) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ CURRENT USER DEPOSITS
===================================================== */
router.get("/me/deposits", verifyToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("Fetch deposits error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ CURRENT USER WITHDRAWALS
===================================================== */
router.get("/me/withdrawals", verifyToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: withdrawals });
  } catch (err) {
    console.error("Fetch withdrawals error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ CURRENT USER REFERRALS
===================================================== */
router.get("/me/referrals", verifyToken, async (req, res) => {
  try {
    const referrals = await User.find({
      referredBy: req.user._id,
    }).select("username email createdAt");

    res.json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (err) {
    console.error("Referral fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ ADMIN: GET ALL USERS
===================================================== */
router.get("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ ADMIN: GET SINGLE USER
===================================================== */
router.get("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ ADMIN: UPDATE USER
===================================================== */
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ ADMIN: DELETE USER
===================================================== */
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted",
      id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
