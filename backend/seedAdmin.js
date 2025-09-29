// backend/seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // ✅ Connect using the same URI as server.js
    await mongoose.connect(process.env.MONGO_URI);

    const email = "ezelevi7@gmail.com"; // 👈 your admin email
    const password = "6969";            // 👈 plain text password

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      await mongoose.disconnect();
      process.exit(0);
    }

    // ✅ Hash password properly
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      username: "Admin",
      email,
      phone: "0000000000",
      password: hashedPassword,
      role: "admin",
      balance: 0,
    });

    await admin.save();
    console.log("✅ Admin user created:", admin.email);

    await mongoose.disconnect(); // ✅ clean exit
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
