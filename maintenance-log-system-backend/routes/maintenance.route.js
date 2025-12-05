// maintenance-log-system-backend/routes/maintenance.route.js

const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const maintenanceController = require('../controllers/maintenance.controller'); 

// GET all logs (protected)
router.get('/get', auth, maintenanceController.getAllLogs);

// CREATE log (protected)
router.post('/create', auth, maintenanceController.createLog);

// UPDATE log (protected)
router.put('/update/:id', auth, maintenanceController.updateLog);
router.patch('/update/:id', auth, maintenanceController.updateLog);

// DELETE log (protected)
router.delete('/:id', auth, maintenanceController.deleteLog);

// GET log by ID (protected)
router.get('/:id', auth, maintenanceController.getLogById);

module.exports = router;
