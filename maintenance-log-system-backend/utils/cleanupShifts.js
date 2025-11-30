// backend/utils/cleanupShifts.js
const mongoose = require("mongoose");
require("dotenv").config();
const Shift = require("../models/shift.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const groups = await Shift.aggregate([
    { $group: { _id: "$name", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  for (const g of groups) {
    const toDelete = g.ids.slice(1); // keep first
    await Shift.deleteMany({ _id: { $in: toDelete } });
    console.log("Removed duplicates for", g._id, toDelete.length);
  }
  process.exit(0);
}

run().catch(err=>{console.error(err); process.exit(1)});
