// backend/cron/investmentCron.js
const cron = require("node-cron");
const Investment = require("../models/Investment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Run every 5 minutes (instead of once per hour)
cron.schedule("*/5 * * * *", async () => {
  console.log("⏳ Checking matured investments...");

  const now = new Date();

 try {
    // 1️⃣ Find all active investments that have matured
    const maturedInvestments = await Investment.find({
      status: "active",
      endDate: { $lte: now }
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

         user.balance += inv.expectedReturn;
         await user.save();

        // ✅ Update investment status safely
        inv.status = "completed";
        await inv.save();

        // ✅ Send Email Notification (safe try/catch)
        try {
          await sendEmail(
            user.email,
            "Your Investment Has Matured 🎉",
            `
              <h2>Hi ${user.username || user.email},</h2>
              <p>Your investment of <b>$${inv.amount}</b> in plan <b>${inv.name}</b> has matured.</p>
              <p>We have credited your balance with <b>$${inv.expectedReturn.toFixed(2)}</b>.</p>
              <p>Thank you for trusting TXLA Finance 🚀</p>
            `
          );
        console.log(
          `✅ Investment ${inv._id} matured → Credited & email sent to ${user.email}`
        );
      } catch (emailErr) {
        console.error(`❌ Failed to send email for ${inv._id}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error("❌ Error in investmentCron:", err.message);
  }
});