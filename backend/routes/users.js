
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/user");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");

const verifyToken = require("../middleware/verifyToken");
const adminOnly = require("../middleware/adminOnly");

const sendEmail = require("../utils/sendEmail");
const emailTemplate = require("../utils/emailTemplate");

const router = express.Router();

/* =====================================================
   HELPERS
===================================================== */

const isSuperAdmin = (req) => {
  return req.user?.role === "superadmin";
};

const isAdmin = (req) => {
  return (
    req.user?.role === "admin" ||
    req.user?.role === "superadmin"
  );
};

/*
  Check whether the logged-in admin is allowed
  to manage a particular user.
*/
const canManageUser = (req, user) => {
  if (!user) return false;

  // Superadmin can manage everyone
  if (isSuperAdmin(req)) {
    return true;
  }

  // Normal admin can only manage assigned users
  return (
    req.user?.role === "admin" &&
    user.assignedAdmin &&
    user.assignedAdmin.toString() === req.user._id.toString()
  );
};


/* =====================================================
   CREATE USER
   PUBLIC REGISTRATION
===================================================== */

router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
      IMPORTANT:
      Public registration can ONLY create normal users.

      Admins and superadmins should be created/promoted
      through protected admin functionality.
    */
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      balance: 0,
      assignedAdmin: null,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        assignedAdmin: newUser.assignedAdmin,
      },
    });

  } catch (err) {
    console.error("Create user error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   CURRENT USER
===================================================== */

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const maturedProfit = Math.max(
      Number(user.maturedProfit || 0),
      0
    );

    const withdrawnProfit = Math.max(
      Number(user.withdrawnProfit || 0),
      0
    );

    const withdrawableProfit = maturedProfit;

    return res.json({
      success: true,
      data: {
        ...user.toObject(),
        balance: Math.max(
          Number(user.balance || 0),
          0
        ),
        maturedProfit,
        withdrawnProfit,
        withdrawableProfit,
      },
    });

  } catch (err) {
    console.error("Fetch /me error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   CURRENT USER DEPOSITS
===================================================== */

router.get("/me/deposits", verifyToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: deposits,
    });

  } catch (err) {
    console.error("Fetch deposits error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   CURRENT USER WITHDRAWALS
===================================================== */

router.get("/me/withdrawals", verifyToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: withdrawals,
    });

  } catch (err) {
    console.error("Fetch withdrawals error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   CURRENT USER REFERRALS
===================================================== */

router.get("/me/referrals", verifyToken, async (req, res) => {
  try {
    const referrals = await User.find({
      referredBy: req.user._id,
    }).select("username email createdAt");

    return res.json({
      success: true,
      count: referrals.length,
      data: referrals,
    });

  } catch (err) {
    console.error("Referral fetch error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   ADMIN: GET USERS
===================================================== */

router.get("/", verifyToken, adminOnly, async (req, res) => {
  try {
    let users;

    /*
      SUPERADMIN
      ----------
      Can see all normal users.
    */
    if (isSuperAdmin(req)) {

      users = await User.find({
        role: "user",
      })
        .select("-password")
        .populate(
          "assignedAdmin",
          "username email role"
        )
        .sort({ createdAt: -1 });

    } else {

      /*
        NORMAL ADMIN
        ------------
        Only see users assigned to this admin.
      */

      users = await User.find({
        role: "user",
        assignedAdmin: req.user._id,
      })
        .select("-password")
        .populate(
          "assignedAdmin",
          "username email role"
        )
        .sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      data: users,
    });

  } catch (err) {
    console.error("Admin fetch users error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   SUPERADMIN: GET ALL ADMINS
===================================================== */

router.get("/admins", verifyToken, adminOnly, async (req, res) => {
  try {

    if (!isSuperAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Superadmin access required",
      });
    }

    const admins = await User.find({
      role: {
        $in: ["admin", "superadmin"],
      },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: admins,
    });

  } catch (err) {
    console.error("Fetch admins error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


/* =====================================================
   SUPERADMIN: ASSIGN USER TO ADMIN
===================================================== */

router.put(
  "/:id/assign-admin",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {
      const { id } = req.params;
      const { adminId } = req.body;

      /*
        Only superadmin can assign users.
      */
      if (!isSuperAdmin(req)) {
        return res.status(403).json({
          success: false,
          message: "Only a superadmin can assign users",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      /*
        adminId can be null if the superadmin
        wants to remove the assignment.
      */
      if (
        adminId !== null &&
        adminId !== undefined &&
        !mongoose.Types.ObjectId.isValid(adminId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid admin ID",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      /*
        Only normal users should be assigned
        to admins.
      */
      if (user.role !== "user") {
        return res.status(400).json({
          success: false,
          message: "Only normal users can be assigned to an admin",
        });
      }

      let assignedAdmin = null;

      if (adminId) {

        assignedAdmin = await User.findOne({
          _id: adminId,
          role: {
            $in: ["admin", "superadmin"],
          },
        });

        if (!assignedAdmin) {
          return res.status(404).json({
            success: false,
            message: "Admin not found",
          });
        }

        user.assignedAdmin = assignedAdmin._id;

      } else {

        user.assignedAdmin = null;
      }

      await user.save();

      const updatedUser = await User.findById(user._id)
        .select("-password")
        .populate(
          "assignedAdmin",
          "username email role"
        );

      return res.json({
        success: true,
        message: assignedAdmin
          ? "User assigned successfully"
          : "User unassigned successfully",
        data: updatedUser,
      });

    } catch (err) {
      console.error("Assign admin error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


/* =====================================================
   ADMIN: TOP UP USER BALANCE
===================================================== */

router.post(
  "/:id/topup",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {
      const { id } = req.params;
      const { amount, note } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Top-up amount must be greater than 0",
        });
      }

      if (numericAmount > 1000000) {
        return res.status(400).json({
          success: false,
          message: "Maximum top-up is $1,000,000",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      /*
        SECURITY CHECK
        --------------
        Superadmin → can top up anyone.

        Admin → can only top up assigned users.
      */
      if (!canManageUser(req, user)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to manage this user",
        });
      }

      const oldBalance = Number(
        user.balance || 0
      );

      user.balance =
        oldBalance + numericAmount;

      await user.save();

      const newBalance = Number(
        user.balance
      );

      /*
        Record transaction.
      */
      await Transaction.create({
        userId: user._id,
        type: "admin_topup",
        amount: numericAmount,
        date: new Date(),
      });


      /* =================================================
         BUILD TOP-UP EMAIL
      ================================================= */

      const emailHtml = emailTemplate({

        title: "Account Balance Updated",

        heading: "Your Account Has Been Credited",

        content: `

          <p>
            Hello
            <strong style="color:#ffffff;">
              ${user.username || "Valued Client"}
            </strong>,
          </p>

          <p>
            Your TXLA Advisory account has been
            successfully credited with a new top-up.
          </p>

          <div style="
            margin:30px 0;
            padding:25px;
            background:#111827;
            border:1px solid #1e293b;
            border-radius:12px;
          ">

            <p style="margin:0 0 12px;">

              <strong style="
                color:#94a3b8;
              ">
                Amount Credited
              </strong>

              <br>

              <span style="
                color:#22c55e;
                font-size:28px;
                font-weight:700;
              ">
                $${numericAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

            </p>


            <p style="margin:12px 0;">

              <strong style="
                color:#94a3b8;
              ">
                Previous Balance
              </strong>

              <br>

              <span style="
                color:#ffffff;
              ">
                $${oldBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

            </p>


            <p style="margin:12px 0 0;">

              <strong style="
                color:#94a3b8;
              ">
                New Balance
              </strong>

              <br>

              <span style="
                color:#22c55e;
                font-size:20px;
                font-weight:700;
              ">
                $${newBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

            </p>

          </div>


          ${
            note
              ? `

                <div style="
                  margin-top:25px;
                  padding:20px;
                  background:#0f172a;
                  border-left:3px solid #D4AF37;
                  border-radius:8px;
                ">

                  <p style="
                    margin:0 0 6px;
                    color:#94a3b8;
                    font-size:13px;
                  ">
                    Note from TXLA Advisory
                  </p>

                  <p style="
                    margin:0;
                    color:#ffffff;
                  ">
                    ${note}
                  </p>

                </div>

              `
              : ""
          }


          <p style="margin-top:30px;">

            Your updated balance is now
            available in your TXLA Advisory account.

          </p>
        `,

        buttonText: "View My Account",

        buttonUrl:
          "https://txlaadvisory.com/dashboard",
      });


      /* =================================================
         SEND EMAIL
      ================================================= */

      let emailSent = true;

      try {

        await sendEmail(
          user.email,
          "Your TXLA Advisory account has been credited",
          emailHtml
        );

      } catch (emailError) {

        emailSent = false;

        console.error(
          "❌ Top-up email failed:",
          emailError
        );
      }


      return res.json({

        success: true,

        message: emailSent
          ? "Balance topped up and email notification sent"
          : "Balance topped up, but email notification failed",

        emailSent,

        data: {
          userId: user._id,
          amount: numericAmount,
          balance: newBalance,
        },

      });

    } catch (err) {

      console.error(
        "❌ Top-up error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to top up balance",
      });
    }
  }
);


/* =====================================================
   ADMIN: GET SINGLE USER
===================================================== */

router.get(
  "/:id",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(id)
        .select("-password")
        .populate(
          "assignedAdmin",
          "username email role"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      /*
        SECURITY CHECK
        --------------
        Prevent Admin A from opening
        Admin B's user directly by ID.
      */
      if (!canManageUser(req, user)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this user",
        });
      }

      return res.json({
        success: true,
        data: user,
      });

    } catch (err) {

      console.error(
        "Fetch single user error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


/* =====================================================
   ADMIN: UPDATE USER
===================================================== */

router.put(
  "/:id",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      /*
        Admin can only update users
        they are responsible for.
      */
      if (!canManageUser(req, user)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to manage this user",
        });
      }

      /*
        SECURITY:
        Do NOT allow normal admins to modify
        role, balance or assignedAdmin.

        Those operations have dedicated endpoints.
      */
      const allowedFields = [
        "username",
        "phone",
        "isVerified",
        "isEmailVerified",
        "is2FAEnabled",
      ];

      /*
        Superadmin can also update the same
        safe user fields here.

        Role changes should eventually get
        their own dedicated endpoint.
      */
      const updateData = {};

      for (const field of allowedFields) {

        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          updateData[field] = req.body[field];
        }
      }

      const updated = await User.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select("-password")
        .populate(
          "assignedAdmin",
          "username email role"
        );

      return res.json({
        success: true,
        data: updated,
      });

    } catch (err) {

      console.error(
        "Update user error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


/* =====================================================
   ADMIN: DELETE USER
===================================================== */

router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      /*
        Admin can only delete assigned users.

        Superadmin can delete any normal user.
      */
      if (!canManageUser(req, user)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this user",
        });
      }

      /*
        Prevent admins from deleting
        another admin/superadmin.
      */
      if (user.role !== "user") {

        return res.status(403).json({
          success: false,
          message: "Admin accounts cannot be deleted here",
        });
      }

      await User.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "User deleted",
        id,
      });

    } catch (err) {

      console.error(
        "Delete user error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


module.exports = router;
