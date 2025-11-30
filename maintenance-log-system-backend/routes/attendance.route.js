// backend/routes/attendance.route.js
const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

// GET all attendance
router.get("/get", attendanceController.getAttendance);

// GET active (checked-in & not checked-out)
router.get("/active", attendanceController.getActiveAttendance);

// POST check-in
router.post("/checkin", attendanceController.checkIn);

// PUT check-out
router.put("/checkout/:id", attendanceController.checkOut);

// DELETE attendance
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;
