
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");

async function createSuperadmin() {
  // Change these values before running the script.
  const email = "supertxlaadmin@tech.com";
  const username = "supertxla";
  const password = "supertxlasupertxla@";

  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from your .env file"
      );
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    // Check whether the email already exists.
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("");
      console.log("A user with this email already exists.");
      console.log("---------------------------------");
      console.log("ID:", existingUser._id.toString());
      console.log("Username:", existingUser.username);
      console.log("Email:", existingUser.email);
      console.log("Role:", existingUser.role);
      console.log("---------------------------------");

      if (existingUser.role !== "superadmin") {
        console.log(
          "This account is NOT a superadmin."
        );
        console.log(
          "No changes were made."
        );
      } else {
        console.log(
          "This account is already a superadmin."
        );
      }

      return;
    }

    // Hash password.
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const superadmin = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,

      role: "superadmin",

      assignedAdmin: null,

      // Allow immediate admin-panel login.
      isVerified: true,
      isEmailVerified: true,

      // Enable later if your login flow requires 2FA.
      is2FAEnabled: false,
      twoFASecret: null,

      balance: 0,
      maturedProfit: 0,
      withdrawnProfit: 0,

      failedLoginAttempts: 0,
      loginAttempts: 0,
      lockUntil: null,

      refreshToken: null,
    });

    await superadmin.save();

    console.log("");
    console.log("====================================");
    console.log("       SUPERADMIN CREATED");
    console.log("====================================");
    console.log("ID:", superadmin._id.toString());
    console.log("Username:", superadmin.username);
    console.log("Email:", superadmin.email);
    console.log("Role:", superadmin.role);
    console.log("====================================");
    console.log("");
    console.log(
      "You can now log in through /admin"
    );
    console.log("");
    console.log(
      "IMPORTANT: Change the temporary password"
    );
    console.log(
      "after confirming that the account works."
    );
    console.log("");

  } catch (error) {
    console.error("");
    console.error(
      "Failed to create Superadmin:"
    );
    console.error(error.message);
    console.error("");

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

createSuperadmin();
