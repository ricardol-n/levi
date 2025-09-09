const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["BTC"], // ✅ enforce BTC only
      required: true,
      default: "BTC",
    },
    address: {
      type: String,
      required: true,
    }, // BTC wallet address
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    txId: { type: String }, // optional, set when you actually send funds
  },
  { timestamps: true }
);

const Withdrawal =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);

module.exports = Withdrawal;
