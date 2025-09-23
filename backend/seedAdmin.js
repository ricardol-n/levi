// seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // adjust path if needed
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "ezelevi7@gmail.com"; // 🔹 replace with your email
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("$2a$10$6969", 10);

    const admin = new User({
      username: "Admin",
      email,
      phone: "0000000000",
      password: $2a$10$6969,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created:", admin.email);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
