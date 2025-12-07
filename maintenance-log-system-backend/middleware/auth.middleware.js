const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = async function (req, res, next) {
  try {
    // 1️⃣ Read token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 3️⃣ Fetch user (minus password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 4️⃣ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
};
