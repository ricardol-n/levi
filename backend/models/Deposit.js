const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
  address: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }, // 'eth', 'btc', etc.
  status: { type: String,enum: ["pending", "confirmed"], default: 'pending' }, // 'pending' | 'confirmed'
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', DepositSchema);

module.exports = Deposit;
