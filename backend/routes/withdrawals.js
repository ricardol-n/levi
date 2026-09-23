const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");

const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

const ALLOWED_METHODS = [
  "BTC",
  "ETH",
  "USDT_ERC20",
  "USDT_TRC20",
  "XRP",
  "DOGE",
];

const MIN_WITHDRAWAL = 5000;

/**
 * =====================================================
 * USER: REQUEST WITHDRAWAL
 * =====================================================
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { method, amount, address } = req.body;

    // IMPORTANT:
    // Never trust a userId supplied by the frontend.
    const userId = req.user._id;

    // ---------------------------------------------
    // Validate method
    // ---------------------------------------------

    if (!ALLOWED_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal method",
      });
    }

    // ---------------------------------------------
    // Validate amount
    // ---------------------------------------------

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    if (numericAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is $${MIN_WITHDRAWAL}`,
      });
    }

    // ---------------------------------------------
    // Validate address
    // ---------------------------------------------

    const cleanAddress =
      typeof address === "string"
        ? address.trim()
        : "";

    if (!cleanAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (cleanAddress.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    // ---------------------------------------------
    // Find authenticated user
    // ---------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const maturedProfit = Number(user.maturedProfit || 0);

    if (
      !Number.isFinite(maturedProfit) ||
      maturedProfit < numericAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Available profit: $${maturedProfit.toFixed(2)}`,
      });
    }

    // ---------------------------------------------
    // Prevent multiple pending withdrawals
    // ---------------------------------------------

    const pending = await Withdrawal.findOne({
      userId,
      status: {
        $in: ["pending", "processing"],
      },
    });

    if (pending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending withdrawal",
      });
    }

    // ---------------------------------------------
    // Create withdrawal
    // ---------------------------------------------

    const withdrawal = await Withdrawal.create({
      userId,
      method,
      amount: numericAmount,
      address: cleanAddress,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: withdrawal,
    });

  } catch (err) {
    console.error("❌ Withdrawal request error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/**
 * =====================================================
 * USER / ADMIN: VIEW WITHDRAWALS
 * =====================================================
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    let query;

    // Superadmin can see every withdrawal
    if (req.user.role === "superadmin") {
      query = {};
    }

    // Normal admin can only see withdrawals
    // belonging to users assigned to them
    else if (req.user.role === "admin") {
      const assignedUsers = await User.find({
        role: "user",
        assignedAdmin: req.user._id,
      }).select("_id");

      const userIds = assignedUsers.map((user) => user._id);

      query = {
        userId: { $in: userIds },
      };
    }

    // Normal user can only see their own withdrawals
    else {
      query = {
        userId: req.user._id,
      };
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "email username assignedAdmin")
      .sort({ createdAt: -1 });

    return res.json(
      withdrawals.map((withdrawal) => ({
        ...withdrawal.toObject(),
        id: withdrawal._id,
      }))
    );

  } catch (err) {
    console.error("❌ Get withdrawals error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/**
 * =====================================================
 * ADMIN: APPROVE / REJECT
 * =====================================================
 */
router.put("/:id", verifyToken, adminOnly, async (req, res) => {

  const session = await mongoose.startSession();

  try {

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal status",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal ID",
      });
    }

    /*
      =====================================================
      FIRST: CHECK WITHDRAWAL OWNERSHIP
      =====================================================
    */

    const existingWithdrawal = await Withdrawal.findById(
      req.params.id
    );

    if (!existingWithdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    const withdrawalUser = await User.findById(
      existingWithdrawal.userId
    );

    if (!withdrawalUser) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal user not found",
      });
    }

    /*
      SUPERADMIN
      ----------
      Can process any user's withdrawal.
    */

    if (req.user.role === "superadmin") {
      // Allowed
    }

    /*
      NORMAL ADMIN
      ------------
      Can only process withdrawals belonging
      to users assigned to them.
    */

    else if (req.user.role === "admin") {

      const assignedToThisAdmin =
        withdrawalUser.assignedAdmin &&
        withdrawalUser.assignedAdmin.toString() ===
          req.user._id.toString();

      if (!assignedToThisAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to manage this withdrawal",
        });
      }

    }

    /*
      Any other role is not allowed.
    */

    else {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }


    /*
      =====================================================
      START TRANSACTION
      =====================================================
    */

    session.startTransaction();


    /*
      =====================================================
      ATOMICALLY CLAIM PENDING WITHDRAWAL
      =====================================================
    */

    const withdrawal = await Withdrawal.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "pending",
      },
      {
        $set: {
          status: "processing",
        },
      },
      {
        new: true,
        session,
      }
    );


    if (!withdrawal) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Withdrawal already processed",
      });
    }


    /*
      =====================================================
      REJECT
      =====================================================
    */

    if (status === "rejected") {

      withdrawal.status = "rejected";

      await withdrawal.save({
        session,
      });

      await session.commitTransaction();

      return res.json({
        success: true,
        message: "Withdrawal rejected",
      });
    }


    /*
      =====================================================
      APPROVE
      =====================================================
    */

    const user = await User.findById(
      withdrawal.userId
    ).session(session);


    if (!user) {
      throw new Error("User not found");
    }


    /*
      SECURITY CHECK AGAIN
      --------------------
      This is intentional.

      We verify ownership again after entering
      the transaction in case the user's assignment
      changed between the first check and now.
    */

    if (req.user.role === "admin") {

      const assignedToThisAdmin =
        user.assignedAdmin &&
        user.assignedAdmin.toString() ===
          req.user._id.toString();

      if (!assignedToThisAdmin) {
        throw new Error(
          "You are no longer authorized to manage this withdrawal"
        );
      }
    }


    const withdrawalAmount =
      Number(withdrawal.amount);

    const maturedProfit =
      Number(user.maturedProfit || 0);


    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      throw new Error(
        "Invalid withdrawal amount"
      );
    }


    if (maturedProfit < withdrawalAmount) {
      throw new Error(
        "Insufficient matured profit"
      );
    }


    /*
      =====================================================
      DEDUCT MATURED PROFIT
      =====================================================
    */

    user.maturedProfit =
      maturedProfit - withdrawalAmount;

    user.withdrawnProfit =
      Number(user.withdrawnProfit || 0) +
      withdrawalAmount;


    await user.save({
      session,
    });


    /*
      =====================================================
      MARK APPROVED
      =====================================================
    */

    withdrawal.status = "approved";

    await withdrawal.save({
      session,
    });


    /*
      =====================================================
      COMMIT
      =====================================================
    */

    await session.commitTransaction();


    console.log(
      `✅ Withdrawal approved: $${withdrawalAmount} → ${user.email}`
    );


    return res.json({
      success: true,
      message: "Withdrawal approved",
    });


  } catch (err) {

    try {
      await session.abortTransaction();
    } catch {}


    console.error(
      "❌ Withdrawal processing error:",
      err
    );


    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Withdrawal processing failed",
    });


  } finally {

    await session.endSession();

  }
});


module.exports = router;