// backend/controllers/shifts.controller.js
const Shift = require("../models/shift.model");

// GET /api/shifts/get
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ name: 1 });
    res.json(shifts);
  } catch (err) {
    console.error("getShifts error:", err);
    res.status(500).json({ message: "Failed to fetch shifts" });
  }
};

// Optional: respond 403 for create/update/delete (defence-in-depth)
exports.forbidModify = (req, res) => {
  res.status(403).json({ message: "Shifts are fixed and cannot be modified." });
};
