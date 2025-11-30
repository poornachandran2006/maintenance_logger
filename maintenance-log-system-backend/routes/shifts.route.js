// backend/routes/shifts.route.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/shifts.controller");

// Only allow GET
router.get("/get", controller.getShifts);

// If you previously had create/update/delete endpoints,
// route them to forbidModify (safe fallback)
router.post("/create", controller.forbidModify);
router.put("/update/:id", controller.forbidModify);
router.delete("/:id", controller.forbidModify);

module.exports = router;
