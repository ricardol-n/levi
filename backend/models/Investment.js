const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: String,
  amount: Number,
  startDate: Date,
  maturityDate: Date,
  status: String
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
