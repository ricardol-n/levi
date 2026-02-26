// backend/models/Investment.js
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    amount: { type: Number, required: true, min: 1 },
    roi: { type: Number, required: true },
    expectedReturn: { type: Number, required: true }, // PROFIT ONLY

    status: {
      type: String,
      enum: ["active", "completed", "cancelled","processing"],
      default: "active",
    },

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

// 🔒 Profit is ALWAYS profit only
investmentSchema.pre("validate", function (next) {
  this.expectedReturn = this.amount * (this.roi / 100);
  next();
});

module.exports = mongoose.model("Investment", investmentSchema);
