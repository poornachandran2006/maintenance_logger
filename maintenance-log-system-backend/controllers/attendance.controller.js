// backend/controllers/attendance.controller.js
const Attendance = require("../models/attendance.model");
const Shift = require("../models/shift.model");
const User = require("../models/user.model");
const Machine = require("../models/machine.model");

/* -----------------------------------------
   HELPERS
----------------------------------------- */
const computeEff = (checkIn, checkOut, breakMin) => {
  if (!checkIn || !checkOut) return null;
  const diffMinutes = (new Date(checkOut) - new Date(checkIn)) / 60000;
  const eff = Math.max(0, diffMinutes - (Number(breakMin) || 0));
  return Math.round((eff / 60) * 100) / 100;
};

const computeExpected = (shift) => {
  if (!shift) return null;
  const [sh, sm] = (shift.start_time || "00:00").split(":").map(Number);
  const [eh, em] = (shift.end_time || "00:00").split(":").map(Number);

  let start = sh * 60 + sm;
  let end = eh * 60 + em;

  if (end <= start) end += 24 * 60;

  const total = end - start;
  const effective = Math.max(0, total - (Number(shift.break_minutes) || 0));

  return Math.round((effective / 60) * 100) / 100;
};

const mapAttendance = (a) => ({
  id: a._id.toString(),
  worker_id: a.worker_id?._id?.toString() || null,
  worker_name: a.worker_id?.name || a.worker_name || null,
  shift_id: a.shift_id?._id?.toString() || null,
  shift_name: a.shift_id?.name || null,
  machine_id: a.machine_id?._id?.toString() || null,
  machine_name: a.machine_id?.name || null,
  check_in: a.check_in,
  check_out: a.check_out,
  expected_hours: a.expected_hours,
  effective_hours: a.effective_hours,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

/* -----------------------------------------
   GET ALL ATTENDANCE
----------------------------------------- */
exports.getAttendance = async (req, res) => {
  try {
    const rows = await Attendance.find()
      .sort({ createdAt: -1 })
      .populate("worker_id", "name")
      .populate("machine_id", "name")
      .populate("shift_id", "name start_time end_time break_minutes");

    res.json(rows.map(mapAttendance));
  } catch (err) {
    console.error("attendance.getAttendance error:", err);
    res.status(500).json({ error: String(err) });
  }
};

/* -----------------------------------------
   GET ACTIVE ATTENDANCE
----------------------------------------- */
exports.getActiveAttendance = async (req, res) => {
  try {
    const rows = await Attendance.find({ check_out: null })
      .sort({ check_in: -1 })
      .populate("worker_id", "name")
      .populate("machine_id", "name")
      .populate("shift_id", "name start_time end_time break_minutes");

    res.json(rows.map(mapAttendance));
  } catch (err) {
    console.error("attendance.getActiveAttendance error:", err);
    res.status(500).json({ error: String(err) });
  }
};

/* -----------------------------------------
   CHECK IN
----------------------------------------- */
exports.checkIn = async (req, res) => {
  try {
    let { worker_id, shift_id, machine_id, check_in } = req.body;

    if (!worker_id || typeof worker_id !== "string")
      return res.status(400).json({ message: "Worker name required" });

    if (!shift_id)
      return res.status(400).json({ message: "Shift is required" });

    // Find worker by name
    let worker = await User.findOne({ name: worker_id }).lean();

    // Auto-create worker if not exists
    if (!worker) {
      worker = await User.create({
        name: worker_id,
        email: `${worker_id.toLowerCase().replace(/\s+/g, "")}@auto.com`,
      });
    }

    const workerObjectId = worker._id;

    // Create record
    const created = await Attendance.create({
      worker_id: workerObjectId,
      shift_id,
      machine_id: machine_id || null,
      check_in: check_in || new Date(),
      worker_name: worker.name,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Failed check-in", error: err.message });
  }
};

/* -----------------------------------------
   CHECK OUT
----------------------------------------- */
exports.checkOut = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id required" });

    const doc = await Attendance.findById(id).populate("shift_id");
    if (!doc) return res.status(404).json({ error: "attendance not found" });

    const out = new Date();
    doc.check_out = out;

    const breakMin = doc.shift_id?.break_minutes || 0;
    doc.effective_hours = computeEff(doc.check_in, out, breakMin);

    await doc.save();

    const populated = await Attendance.findById(doc._id)
      .populate("worker_id", "name")
      .populate("machine_id", "name")
      .populate("shift_id", "name start_time end_time break_minutes");

    res.json(mapAttendance(populated));
  } catch (err) {
    console.error("attendance.checkOut error:", err);
    res.status(500).json({ error: String(err) });
  }
};

/* -----------------------------------------
   DELETE ATTENDANCE
----------------------------------------- */
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("attendance.deleteAttendance error:", err);
    res.status(500).json({ error: String(err) });
  }
};
