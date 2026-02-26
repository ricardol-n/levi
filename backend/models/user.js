// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    password: String,

    role: { type: String, enum: ["user", "admin"], default: "user" },

    // 🔒 WALLET (DO NOT MIX)
    balance: { type: Number, default: 0, min: 0 },          // reusable capital
    maturedProfit: { type: Number, default: 0, min: 0 },   // withdraw-only
    withdrawnProfit: { type: Number, default: 0, min: 0 }, // audit

    refreshToken: { type: String, default: null },

    // 🤝 Referral system
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralCount: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 }, // 👈 credit to BALANCE
  },
  { timestamps: true }
);

// 🔐 HARD LOCKS
userSchema.pre("save", function (next) {
  if (this.balance < 0) this.balance = 0;
  if (this.maturedProfit < 0) this.maturedProfit = 0;
  if (this.withdrawnProfit < 0) this.withdrawnProfit = 0;

  if (!this.referralCode) {
    this.referralCode = this._id.toString().slice(-6);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
