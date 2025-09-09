const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

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
      role: role || "user",
      depositAddresses: {
        BTC: "",
        DOGE: "",
        ETH: "",
        TRON: "",
        XRP: "",
      },
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User created", data: newUser });
  } catch (error) {
    console.error("❌ Create User Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Get user balance
router.get("/:id/balance", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const user = await User.findById(id).select("balance");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error("❌ Fetch balance error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get user's wallet addresses
router.get("/:id/wallets", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("depositAddresses");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.depositAddresses || Object.keys(user.depositAddresses).length === 0) {
      return res.status(404).json({ message: "No deposit wallets found" });
    }

    res.json({ success: true, depositAddresses: user.depositAddresses });
  } catch (error) {
    console.error("❌ Wallet fetch error:", error);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

// ✅ Get user's deposit logs
router.get("/:id/deposits", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deposits = await Deposit.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("❌ Fetch deposits error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get user's withdrawal logs
router.get("/:id/withdrawals", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const withdrawals = await Withdrawal.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (err) {
    console.error("❌ Fetch withdrawals error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
