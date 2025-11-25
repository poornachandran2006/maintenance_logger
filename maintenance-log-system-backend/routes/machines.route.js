const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/machines.controller');

router.post('/create', ctrl.createMachine);
router.get('/get', ctrl.getMachines);
router.get('/:id', ctrl.getMachineById);
router.put('/update/:id', ctrl.updateMachine);
router.delete('/:id', ctrl.deleteMachine);

module.exports = router;
