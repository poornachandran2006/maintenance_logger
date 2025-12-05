// backend/routes/shifts.route.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/shifts.controller");

// GET shifts (protected)
router.get("/get", auth, controller.getShifts);

// CREATE, UPDATE, DELETE blocked but still protected
router.post("/create", auth, controller.forbidModify);
router.put("/update/:id", auth, controller.forbidModify);
router.delete("/:id", auth, controller.forbidModify);

module.exports = router;
