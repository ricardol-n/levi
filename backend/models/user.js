const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: "User" },
  balance: { type: Number, default: 0 },
  depositAddresses: {
    type: Map,
    of: String,
    default: () => ({
     BTC: '',
     ETH: '',
     DOGE: '',
     TRON: '',
     XRP: ''
    })
  }

}, { timestamps: true });

// ✅ Don't redefine if already exists
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
