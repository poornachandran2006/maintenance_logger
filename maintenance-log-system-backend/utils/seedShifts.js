// backend/utils/seedShifts.js
const mongoose = require("mongoose");
require("dotenv").config();
const Shift = require("../models/shift.model");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove everything first (optional)
  await Shift.deleteMany({});

  const shifts = [
    { name: "Shift 1", start_time: "06:00:00", end_time: "14:30:00", break_minutes: 45 },
    { name: "Shift 2", start_time: "14:30:00", end_time: "23:00:00", break_minutes: 45 },
    { name: "Shift 3", start_time: "23:00:00", end_time: "06:00:00", break_minutes: 15 },
    { name: "General Shift", start_time: "08:30:00", end_time: "17:00:00", break_minutes: 60 },
  ];

  await Shift.insertMany(shifts);
  console.log("Shifts seeded");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
