const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  txType: { type: String, default: 'deposit' },
  currency: String,
  method: String,
  amount: Number,
  address: String,
  blockNumber: Number,
  date: { type: Date, default: Date.now }
 });

module.exports = mongoose.model('Transaction', transactionSchema);
