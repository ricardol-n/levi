const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  balance: { type: Number, default: 0 },
  depositAddressBTC: { BTC: String },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
