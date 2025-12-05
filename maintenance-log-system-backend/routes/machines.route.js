// routes/machines.route.js
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const ctrl = require('../controllers/machines.controller');

// CREATE Machine (protected)
router.post('/create', auth, ctrl.createMachine);

// GET all machines (protected)
router.get('/get', auth, ctrl.getMachines);

// GET machine by ID (protected)
router.get('/:id', auth, ctrl.getMachineById);

// UPDATE Machine (protected)
router.put('/update/:id', auth, ctrl.updateMachine);

// DELETE Machine (protected)
router.delete('/:id', auth, ctrl.deleteMachine);

module.exports = router;
