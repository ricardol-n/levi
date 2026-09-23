// backend/routes/btcpayWebhook.js
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user");
const Deposit = require("../models/Deposit");
const WebhookLog = require("../models/WebhookLog");
const sendDepositApprovedEmail = require("../emails/depositApproved");


const router = express.Router();

// ⚡ Use raw body for signature verification
router.use("/btcpay", express.raw({ type: "*/*" }));

router.post("/btcpay", async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("❌ Missing BTCPAY_WEBHOOK_SECRET");
      return res.status(500).send("Server misconfigured");
    }

    const signature =
      req.headers["btcpay-sig"] ||
      req.headers["Btcpay-Sig"] ||
      req.headers["BTCPAY-SIG"];

    const computed =
      "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    console.log("📩 BTCPay webhook received");

    // ✅ Only log mismatch if actually mismatched
    if (signature !== computed) {
      console.warn("❌ Invalid BTCPay signature");
      console.log("🔍 Signature mismatch:", { received: signature, computed });
      await WebhookLog.create({
        eventType: "InvalidSignature",
        rawPayload: {},
        signatureVerified: false,
        status: "failed",
        message: "Signature mismatch on BTCPay webhook"
      });

      return res.status(403).send("Invalid signature");
    }

    console.log("✅ Signature verified successfully");
    

    // ✅ Parse JSON body safely
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error("❌ Invalid JSON payload:", e.message);
      return res.status(400).send("Invalid JSON");
    }

    const invoice = event?.data;
    if (!invoice?.id) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }
    // 🧾 Log every webhook received (for monitoring and debugging)
  await WebhookLog.create({
     eventType: event.type,
     invoiceId: invoice.id,
     amount: Number(invoice.metadata?.amount || 0),
     currency: invoice.currency || "USD",
     userId: invoice.metadata?.userId,
     signatureVerified: signature === computed,
     rawPayload: event,
     status: "received",
     message: "Webhook received from BTCPay"
    });


    console.log("📩 BTCPay event type:", event?.type);

    const txId = invoice.id;
    
    const userIdRaw = invoice?.metadata?.userId;

    if (!userIdRaw || !mongoose.Types.ObjectId.isValid(userIdRaw)) {
      console.error("❌ Invalid or missing userId:", userIdRaw);
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

      const userId = new mongoose.Types.ObjectId(userIdRaw);


  if (
  event.type === "InvoiceSettled" ||
  event.type === "InvoiceCompleted"
) {

  // Validate amount first
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    console.error("❌ Invalid deposit amount:", amountUsd);

    return res.status(400).json({
      success: false,
      message: "Invalid deposit amount",
    });
  }

  const session = await mongoose.startSession();

  let user;

  try {

    session.startTransaction();

  const deposit = await Deposit.findOneAndUpdate(
  {
    txId,
    userId,
    status: "pending",
  },
  {
    $set: {
      status: "confirmed",
      address: invoice.address || undefined,
    },
  },
  {
    new: true,
    session,
  }
);

if (!deposit) {
  await session.abortTransaction();
  
  console.log(`🔁 Duplicate webhook ignored: ${txId}`);

  return res.status(200).json({
    success: true,
    message: "Already processed",
  });
}

// Use the amount already stored in your database
const amountUsd = Number(deposit.amount);

if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
  throw new Error(`Invalid deposit amount: ${deposit.amount}`);
}

    // ==========================================
    // CREDIT USER BALANCE
    // ==========================================

    user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          balance: amountUsd,
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!user) {
      throw new Error(
        `User not found: ${userId}`
      );
    }

    // ==========================================
    // REFERRAL BONUS
    // ==========================================

    const depositedUser = await User.findById(
      userId
    ).session(session);

    if (depositedUser?.referredBy) {

      const referrer = await User.findById(
        depositedUser.referredBy
      ).session(session);

      if (
        referrer &&
        !deposit.referralRewardProcessed
      ) {

        const BONUS_AMOUNT = 10;

        await User.findByIdAndUpdate(
          referrer._id,
          {
            $inc: {
              balance: BONUS_AMOUNT,
              referralBonus: BONUS_AMOUNT,
            },
          },
          {
            session,
          }
        );

        deposit.referralRewardProcessed = true;

        await deposit.save({
          session,
        });

        console.log(
          `🎁 $${BONUS_AMOUNT} referral bonus credited`
        );
      }
    }

    // ==========================================
    // COMMIT FINANCIAL CHANGES
    // ==========================================

    await session.commitTransaction();

    console.log(
      `✅ Deposit credited: $${amountUsd} → ${user.email}`
    );

  } catch (err) {

    await session.abortTransaction();

    console.error(
      "❌ Deposit transaction failed:",
      err
    );

    throw err;

  } finally {

    await session.endSession();
  }

  // ==========================================
  // 📧 SEND EMAIL AFTER COMMIT
  // ==========================================

  try {

    await sendDepositApprovedEmail({
      email: user.email,
      username: user.username,
      amount: amountUsd,
      currency: "USD",
      method: "Bitcoin",
      balance: user.balance,
    });

    console.log(
      `📧 Deposit email sent to ${user.email}`
    );

  } catch (emailError) {

    console.error(
      "❌ Deposit email failed:",
      emailError.message
    );
  }

  // ==========================================
  // MARK WEBHOOK PROCESSED
  // ==========================================

  await WebhookLog.findOneAndUpdate(
    { invoiceId: invoice.id },
    {
      status: "processed",
      message:
        `Deposit of $${amountUsd} credited successfully`,
      signatureVerified: true,
    }
  );
}
    // ❕ Other BTCPay event types — log but don’t process
    else {
      await WebhookLog.findOneAndUpdate(
        { invoiceId: invoice.id },
        { status: "ignored", message: `Event type ${event.type} not processed` }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ BTCPay webhook error:", err);
    await WebhookLog.create({
      eventType: "ServerError",
      signatureVerified: false,
      rawPayload: {},
      status: "failed",
      message: err.message,
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
