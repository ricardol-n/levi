// backend/scripts/fixInvestments.js
const mongoose = require("mongoose");
const User = require("../models/user");
const Investment = require("../models/Investment");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";

async function fixInvestments() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    const investments = await Investment.find({ status: "completed" }).sort({ endDate: 1 });

    console.log(`🔎 Found ${investments.length} completed investments`);

    for (const inv of investments) {
      const user = await User.findById(inv.userId);
      if (!user) {
        console.warn(`⚠️ User not found for investment ${inv._id}`);
        continue;
      }

      const principal = Number(inv.amount || 0);
      const profit = Number(inv.expectedReturn || 0);

      // Compute expected user values
      const expectedBalance = principal; // principal should be credited back if not already
      const expectedMaturedProfit = profit;

      // Check if user's current balances include the investment
      let needUpdate = false;

      if (!user.balance || user.balance < principal) {
        needUpdate = true;
      }

      if (!user.maturedProfit || user.maturedProfit < profit) {
        needUpdate = true;
      }

      if (needUpdate) {
        await User.updateOne(
          { _id: user._id },
          { $inc: { balance: expectedBalance, maturedProfit: expectedMaturedProfit } }
        );
        console.log(
          `✅ Fixed user ${user._id} → +${expectedBalance} balance, +${expectedMaturedProfit} maturedProfit`
        );
      } else {
        console.log(`ℹ️ User ${user._id} already correct for investment ${inv._id}`);
      }
    }

    console.log("🎯 All completed investments audited and fixed where necessary.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error fixing investments:", err);
    await mongoose.disconnect();
  }
}

fixInvestments();
