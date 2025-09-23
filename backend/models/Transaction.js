const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  amount: Number,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
