// controllers/auth.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper - build cookie options depending on environment / origin
function buildCookieOptions(req) {
  const isProd = process.env.NODE_ENV === "production";

  // If running locally, we must avoid Secure:true because localhost is not https.
  // However: Cross-origin cookie behavior (different port) on localhost is tricky:
  // - Browsers treat different ports as different origins.
  // - SameSite=None requires Secure in browsers. So in local development you cannot
  //   reliably set SameSite=None + Secure:false. Therefore we use SameSite:lax for local.
  //
  // Recommended dev approach (more reliable): proxy your API under the same origin
  // (eg. use Next.js rewrites or run frontend and backend on same domain/port).
  //
  // This function uses:
  // - production: { sameSite: "none", secure: true }
  // - local/dev:   { sameSite: "lax",  secure: false }
  //
  // Keep `path: "/"` so cookie is available site-wide, and `httpOnly: true` for security.

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,                       // true in production (https), false in local
    sameSite: isProd ? "none" : "lax",    // None required for cross-site in prod, Lax acceptable for local
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
    path: "/",
  };

  return cookieOptions;
}

/* =========================================================
   REGISTER
========================================================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

/* =========================================================
   LOGIN  — Sets JWT as HttpOnly Cookie
========================================================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Build cookie options based on env
    const cookieOptions = buildCookieOptions(req);

    // IMPORTANT: If you're using a frontend on a different origin (different port),
    // the browser will treat the cookie as cross-site. For production (https), we
    // use SameSite=None + Secure=true (so cookie is accepted by browser).
    //
    // For local dev we use SameSite=lax + Secure=false. If your frontend is on a
    // different origin (localhost:3000) and backend is localhost:5001, some browsers
    // may limit cookie sharing — recommended approach for development is to proxy
    // the backend under the same origin as the frontend.
    //
    // Set the cookie:
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

/* =========================================================
   RETURN LOGGED-IN USER
========================================================= */
exports.me = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};

/* =========================================================
   LOGOUT — Clears the HttpOnly Cookie
========================================================= */
exports.logout = (req, res) => {
  // Clear cookie with matching options (path, httpOnly, sameSite, secure)
  const cookieOptions = buildCookieOptions(req);

  // For clearing, set sameSite & secure same as when set; some browsers require same path.
  res.clearCookie("token", {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};
