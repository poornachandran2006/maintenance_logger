// backend/routes/shifts.route.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/shifts.controller");
const Shift = require("../models/shift.model");

/* ------------------------------
   SEED OFFICIAL PDF SHIFTS (TEMP)
--------------------------------*/
router.get("/seed", async (req, res) => {
  try {
    const officialShifts = [
      { name: "Shift 1", start: "06:00", end: "14:30" },
      { name: "Shift 2", start: "14:30", end: "23:00" },
      { name: "Shift 3", start: "23:00", end: "06:00" },
    ];

    // delete old shifts (optional)
    await Shift.deleteMany({});

    // insert new ones
    await Shift.insertMany(officialShifts);

    res.json({
      message: "PDF shifts inserted successfully!",
      shifts: officialShifts,
    });
  } catch (err) {
    console.error("Shift seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET shifts (protected)
router.get("/get", auth, controller.getShifts);

// CREATE, UPDATE, DELETE blocked but still protected
router.post("/create", auth, controller.forbidModify);
router.put("/update/:id", auth, controller.forbidModify);
router.delete("/:id", auth, controller.forbidModify);

module.exports = router;
 