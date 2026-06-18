// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  username: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: String,
  password: String,

  role: {
    type: String,
    enum: ["user","admin"],
    default: "user"
  },

  // NEW SECURITY FIELDS
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationCode: String,

  verificationExpires: Date,

  is2FAEnabled: {
  type: Boolean,
  default: false
},

twoFASecret: {
  type: String,
  default: null
},

failedLoginAttempts: {
  type: Number,
  default: 0
},

  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil:{
    type:Date,
    default:null
  },

  lastLoginAt: {
  type: Date
  },

  lastLoginIP: {
    type:String
  },
  isEmailVerified: {
  type: Boolean,
  default: false
},

emailVerificationToken: {
  type: String
},

  lastLoginAt: {
    type:Date
  },

  refreshToken: {
    type: String,
    default: null
  },

  balance: {
    type: Number,
    default: 0
  },

  maturedProfit: {
    type: Number,
    default: 0
  },

  withdrawnProfit: {
    type: Number,
    default: 0
  },

  referralCode: {
    type: String,
    unique: true
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  referralCount: {
    type: Number,
    default: 0
  },

  referralBonus: {
    type: Number,
    default: 0
  },
},
{ timestamps: true }
);

// 🔐 HARD LOCKS
userSchema.pre("save", function (next) {
  if (this.balance < 0) this.balance = 0;
  if (this.maturedProfit < 0) this.maturedProfit = 0;
  if (this.withdrawnProfit < 0) this.withdrawnProfit = 0;

  if (!this.referralCode) {
    this.referralCode = this._id.toString().slice(-6);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
