require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "fallbackSecretKey",
  REFRESH_SECRET: process.env.REFRESH_SECRET || "super_secret_refresh_key",
  MONGO_URI: process.env.MONGO_URI,
};
