const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  method: { type: String, default: "BTC" },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
