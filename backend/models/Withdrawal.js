const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["BTC", "USDT", "ETH", "BANK"],
      default: "BTC",
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Withdrawal amount must be at least 1"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Withdrawal ||
  mongoose.model("Withdrawal", withdrawalSchema);
