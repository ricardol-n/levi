require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Deposit = require("./models/Deposit");
const Withdrawal = require("./models/Withdrawal");
const Investment = require("./models/Investment");

(async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2. Fetch all users
    const users = await User.find();
    console.log(`🔎 Found ${users.length} users`);

    for (const user of users) {
      // 3. Get confirmed deposits
      const deposits = await Deposit.find({ userId: user._id, status: "confirmed" });
      const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

      // 4. Get completed withdrawals
      const withdrawals = await Withdrawal.find({ userId: user._id, status: "completed" });
      const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);

      // 5. Get active investments
      const investments = await Investment.find({ userId: user._id, status: { $in: ["active", "cancelled", "completed"] } });
      const totalInvested = investments
        .filter(inv => inv.status === "active") // only lock active funds
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

      // 6. Calculate balance
      const newBalance = totalDeposits - totalWithdrawals - totalInvested;

      // 7. Update user balance in DB
      user.balance = newBalance;
      await user.save();

      console.log(`👤 User ${user.email}: Deposits=${totalDeposits}, Withdrawals=${totalWithdrawals}, Invested=${totalInvested}, Final Balance=${newBalance}`);
    }

    console.log("🎉 Balance recalculation complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error recalculating balances:", err);
    process.exit(1);
  }
})();
