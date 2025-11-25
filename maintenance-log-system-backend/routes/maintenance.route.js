// maintenance-log-system-backend/routes/maintenance.route.js

const express = require('express');
const router = express.Router();
// Renaming to maintenanceController for consistency
const maintenanceController = require('../controllers/maintenance.controller'); 

// Matches frontend: apiGet("/maintenance/get")
router.get('/get', maintenanceController.getAllLogs); // Renamed function

// Matches frontend: apiPost("/maintenance/create")
router.post('/create', maintenanceController.createLog); // Renamed function

// Matches frontend: apiPut("/maintenance/update/:id")
router.put('/update/:id', maintenanceController.updateLog); // Renamed function
router.patch('/update/:id', maintenanceController.updateLog); // Added patch for flexibility

// Matches frontend: apiDelete("/maintenance/:id")
router.delete('/:id', maintenanceController.deleteLog); // Renamed function

// Added standard GET by ID route for completeness
router.get('/:id', maintenanceController.getLogById); // Renamed function

module.exports = router;