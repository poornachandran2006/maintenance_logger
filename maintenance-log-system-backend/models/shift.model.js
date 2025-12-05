// backend/models/shift.model.js
const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Shift 1 (06:00 – 14:30)

  start_time: { type: String, required: true }, // "06:00"
  end_time: { type: String, required: true },   // "14:30"

  break_minutes: { type: Number, default: 0 },  // break duration in minutes

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

ShiftSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports =
  mongoose.models.Shift || mongoose.model("Shift", ShiftSchema);
