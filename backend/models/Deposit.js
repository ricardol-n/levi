const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "BTC" },
  txId: { type: String, required: true },
  checkoutUrl: { type: String }, // ✅ add this
  status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
  source: { type: String, default: "btcpay" },
}, { timestamps: true });

module.exports = mongoose.model("Deposit", depositSchema);
