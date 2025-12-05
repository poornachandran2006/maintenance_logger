// middleware/role.middleware.js
module.exports = function requiredRole(role) {
  return function (req, res, next) {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
      next();
    } catch (err) {
      console.error("Role middleware error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
};
