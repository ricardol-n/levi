const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
    }, // optional — BTCPay may not always provide one
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      enum: ["BTC"], // ✅ enforce BTC only
      default: "BTC",
    },
    txId: {
      type: String,
      unique: true,
      required: true,
    }, // invoice id from BTCPay
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["btcpay"],
      default: "btcpay",
    },
  },
  { timestamps: true }
);

const Deposit =
  mongoose.models.Deposit || mongoose.model("Deposit", DepositSchema);

module.exports = Deposit;
