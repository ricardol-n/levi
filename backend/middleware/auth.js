// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // adjust path if needed
const { JWT_SECRET } = require("../config/keys"); // make sure SECRET_KEY is exported

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }

  try {
    // Decode token payload
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB (safer than trusting token alone)
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach full user object to request
    req.user = user;

    next();
  } catch (err) {
    console.error("❌ verifyToken error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
