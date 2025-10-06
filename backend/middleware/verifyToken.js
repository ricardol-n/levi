// backend/middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");

module.exports = (req, res, next) => {
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization ||
    req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {_id: payload._id, role: payload.role};
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "jwt expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
