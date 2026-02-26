// backend/cron/investmentCron.js
const cron = require("node-cron");
const Investment = require("../models/Investment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Run every 5 minutes
cron.schedule("* * * * *", async () => {
  console.log("⏳ Checking matured investments...");

  try {
    const now = new Date();

    const maturedInvestments = await Investment.find({
      status: "active",
      endDate: { $lte: now },
    });

    if (!maturedInvestments.length) {
      console.log("✅ No matured investments found.");
      return;
    }

    for (const inv of maturedInvestments) {
      const user = await User.findById(inv.userId);
      if (!user) {
        console.warn(`⚠️ User not found for investment ${inv._id}`);
        continue;
      }

      const principal = Number(inv.amount);
      const profit = Number(inv.expectedReturn);

      if (!profit || profit <= 0) {
        console.warn(`⚠️ Invalid profit for investment ${inv._id}`);
        continue;
      }

      // ✅ CREDIT USER (SOURCE OF TRUTH)
      user.balance += principal;
      user.maturedProfit += profit;
      await user.save();

      // ✅ CLOSE INVESTMENT
      inv.status = "completed";
      await inv.save();

      // ✅ SEND EMAIL (NON-BLOCKING)
      sendEmail(
        user.email,
        "Your Investment Has Matured 🎉",
        `
          <h2>Hi ${user.username || user.email},</h2>
          <p>Your investment of <b>$${principal}</b> in plan <b>${inv.name}</b> has matured.</p>
          <p>Profit earned: <b>$${profit.toFixed(2)}</b></p>
          <p>Principal returned to balance.</p>
          <p>You may now withdraw your profit.</p>
          <p>Thank you for trusting TXLA Finance 🚀</p>
        `
      ).catch(console.error);

      console.log(
        `✅ Settled investment ${inv._id}: balance +${principal}, maturedProfit +${profit}`
      );
    }

    console.log("🎯 Investment cron completed successfully");
  } catch (err) {
    console.error("❌ Investment cron failed:", err);
  }
});
