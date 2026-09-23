function adminOnly(req, res, next) {
  if (
    !req.user ||
    !["admin", "superadmin"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  next();
}

module.exports = adminOnly;