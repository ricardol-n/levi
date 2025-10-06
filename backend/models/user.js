// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true , required: true},
  phone: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  balance: { type: Number, default: 0 },
  refreshToken: { type: String, default: null },
},
{
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
