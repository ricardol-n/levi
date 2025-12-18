// backend/models/Investment.js
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Investment amount must be at least $1"],
    },
    roi: {
      type: Number, // ROI %
      required: true,
      min: 1,
    },
    expectedReturn: {
      type: Number, // ✅ profit only (not principal)
      required: true,
    },
    
    withdrawnProfit: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "pending", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ✅ Automatically calculate expectedReturn (profit only)
investmentSchema.pre("validate", function (next) {
  if (!this.expectedReturn && this.amount && this.roi) {
    this.expectedReturn = this.amount * (this.roi / 100); // only profit
  }
  next();
});

module.exports = mongoose.model("Investment", investmentSchema);
