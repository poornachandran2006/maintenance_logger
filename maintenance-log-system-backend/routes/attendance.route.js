// backend/routes/attendance.route.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const attendanceController = require("../controllers/attendance.controller");

// GET all attendance (protected)
router.get("/get", auth, attendanceController.getAttendance);

// GET active attendance (protected)
router.get("/active", auth, attendanceController.getActiveAttendance);

// POST check-in (protected)
router.post("/checkin", auth, attendanceController.checkIn);

// PUT check-out (protected)
router.put("/checkout/:id", auth, attendanceController.checkOut);

// DELETE attendance (protected)
router.delete("/:id", auth, attendanceController.deleteAttendance);

module.exports = router;
