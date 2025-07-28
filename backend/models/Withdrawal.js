const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: String,
  amount: Number,
  date: Date,
  status: String // Pending, Approved, Rejected
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
