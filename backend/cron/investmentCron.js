// backend/cron/investmentCron.js
const cron = require("node-cron");
const Investment = require("../models/Investment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏳ Checking matured investments...");

  const now = new Date();

  try {
    // 1️⃣ Find all active investments that have matured
    const maturedInvestments = await Investment.find({
      status: "active",
      endDate: { $lte: now },
    });

    if (maturedInvestments.length === 0) {
      console.log("✅ No matured investments found at this time.");
      return;
    }

    for (const inv of maturedInvestments) {
      const user = await User.findById(inv.userId);
      if (!user) {
        console.warn(`⚠️ User not found for investment ${inv._id}`);
        continue;
      }

      // ✅ Credit principal + profit
      const profit = Number(inv.expectedReturn); // profit only
      const payout = Number(inv.amount) + profit;

      user.balance += payout;
      await user.save();

      // ✅ Update investment status
      inv.status = "completed";
      await inv.save();

      // ✅ Send Email Notification
      try {
        await sendEmail(
          user.email,
          "Your Investment Has Matured 🎉",
          `
            <h2>Hi ${user.username || user.email},</h2>
            <p>Your investment of <b>$${inv.amount}</b> in plan <b>${inv.name}</b> has matured.</p>
            <p>You earned a profit of <b>$${profit.toFixed(2)}</b>.</p>
            <p>Total credited to your balance: <b>$${payout.toFixed(2)}</b>.</p>
            <p>Thank you for trusting TXLA Finance 🚀</p>
          `
        );
        console.log(
          `✅ Investment ${inv._id} matured → Credited $${payout.toFixed(
            2
          )} & email sent to ${user.email}`
        );
      } catch (emailErr) {
        console.error(
          `❌ Failed to send email for ${inv._id}:`,
          emailErr.message
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in investmentCron:", err.message);
  }
});
