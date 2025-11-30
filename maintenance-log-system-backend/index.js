// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* -------------------------------------------------------
   CORS CONFIG
------------------------------------------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "https://appointment-booking-frontend-three.vercel.app",
  "https://maintenance-log-system-frontend.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------
   HELPER: SAFE ROUTE LOADING
------------------------------------------------------- */

function safeLoadRoute(path) {
  try {
    return require(path);
  } catch (err) {
    console.log("⚠️ Route not found:", path);
    return null;
  }
}

/* -------------------------------------------------------
   LOAD ROUTES SAFELY
------------------------------------------------------- */

const maintenanceRoutes = safeLoadRoute("./routes/maintenance.route");
const machinesRoutes = safeLoadRoute("./routes/machines.route");
const analyticsRoutes = safeLoadRoute("./routes/analytics.route");
const authRoutes = safeLoadRoute("./routes/auth.route");
const fileRoutes = safeLoadRoute("./routes/file.route");
const usersRoutes = safeLoadRoute("./routes/users.route");
const shiftsRoutes = safeLoadRoute("./routes/shifts.route.js");;
const attendanceRoutes = safeLoadRoute("./routes/attendance.route");

/* -------------------------------------------------------
   DEBUG ROUTE LOG
------------------------------------------------------- */

console.log("ROUTE LOADING STATUS:");
console.log("maintenanceRoutes:", !!maintenanceRoutes);
console.log("machinesRoutes:", !!machinesRoutes);
console.log("analyticsRoutes:", !!analyticsRoutes);
console.log("authRoutes:", !!authRoutes);
console.log("fileRoutes:", !!fileRoutes);
console.log("usersRoutes:", !!usersRoutes);
console.log("shiftsRoutes:", !!shiftsRoutes);
console.log("attendanceRoutes:", !!attendanceRoutes);

/* -------------------------------------------------------
   ROUTER VALIDATOR
------------------------------------------------------- */

function checkRouter(name, router) {
  if (!router || typeof router !== "function" || !router.use || !router.get) {
    console.log("❌ BROKEN ROUTE:", name);
    return false;
  }
  console.log("✅ ROUTE OK:", name);
  return true;
}

/* -------------------------------------------------------
   SAFE ROUTE MOUNTING
------------------------------------------------------- */

if (maintenanceRoutes && checkRouter("maintenanceRoutes", maintenanceRoutes))
  app.use("/api/maintenance", maintenanceRoutes);

if (machinesRoutes && checkRouter("machinesRoutes", machinesRoutes))
  app.use("/api/machines", machinesRoutes);

if (analyticsRoutes && checkRouter("analyticsRoutes", analyticsRoutes))
  app.use("/api/analytics", analyticsRoutes);

if (authRoutes && checkRouter("authRoutes", authRoutes))
  app.use("/api/auth", authRoutes);

if (fileRoutes && checkRouter("fileRoutes", fileRoutes))
  app.use("/api/file", fileRoutes);

if (usersRoutes && checkRouter("usersRoutes", usersRoutes))
  app.use("/api/users", usersRoutes);

if (shiftsRoutes && checkRouter("shiftsRoutes", shiftsRoutes))
 app.use("/api/shifts", shiftsRoutes);


if (attendanceRoutes && checkRouter("attendanceRoutes", attendanceRoutes))
  app.use("/api/attendance", attendanceRoutes);

/* -------------------------------------------------------
   HEALTH CHECK
------------------------------------------------------- */

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

/* -------------------------------------------------------
   DATABASE + SERVER START
------------------------------------------------------- */

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

  console.log("Loaded shiftsRoutes =", shiftsRoutes ? "OK" : "FAILED");
