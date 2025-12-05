// backend/controllers/shifts.controller.js
const Shift = require("../models/shift.model");

/**
 * Default Shifts (from PDF)
 */
const DEFAULT_SHIFTS = [
  { name: "Shift 1", start: "06:00", end: "14:30" },
  { name: "Shift 2", start: "14:30", end: "23:00" },
  { name: "Shift 3", start: "23:00", end: "06:00" },
  { name: "General Shift", start: "08:30", end: "17:00" },
];

/**
 * 🔹 Auto-create default shifts when DB is empty
 */
async function ensureDefaultShifts() {
  const count = await Shift.countDocuments();

  if (count === 0) {
    console.log("⏳ No shifts found — creating default shift list...");

    await Shift.insertMany(DEFAULT_SHIFTS);

    console.log("✅ Default shifts created.");
  }
}

// GET /api/shifts/get
// GET /api/shifts/get
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ name: 1 });

    // Convert old shift fields → new structure
    const formatted = shifts.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      start_time: s.start_time || s.start || null, 
      end_time: s.end_time || s.end || null,
      break_minutes: s.break_minutes || 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getShifts error:", err);
    res.status(500).json({ message: "Failed to fetch shifts" });
  }
};


// Optional: respond 403 for create/update/delete (defence-in-depth)
exports.forbidModify = (req, res) => {
  res.status(403).json({ message: "Shifts are fixed and cannot be modified." });
};
