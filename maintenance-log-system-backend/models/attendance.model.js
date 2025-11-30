// backend/models/attendance.model.js
const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    worker_id: { type: String, required: true },
    worker_name: { type: String, default: null },

    shift_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    machine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", default: null },

    check_in: { type: Date, default: Date.now },
    check_out: { type: Date, default: null },

    // computed fields
    effective_hours: { type: Number, default: null },
    expected_hours: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
