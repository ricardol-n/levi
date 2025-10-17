// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  balance: { type: Number, default: 0 },
  refreshToken: { type: String, default: null },

  // ✅ Referral system fields
  referralCode: { type: String, unique: true }, // unique link ID
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referralCount: { type: Number, default: 0 },
  referralBonus: { type: Number, default: 0 },
},
{
  timestamps: true
});

// ✅ Automatically generate referral code when new user is created
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = this._id.toString().slice(-6); // short code
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
