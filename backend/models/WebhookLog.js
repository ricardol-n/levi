const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true },
    invoiceId: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "USD" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    signatureVerified: { type: Boolean, default: false },
    rawPayload: { type: Object },
    status: { type: String, enum: ["received", "processed", "failed"], default: "received" },
    message: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
