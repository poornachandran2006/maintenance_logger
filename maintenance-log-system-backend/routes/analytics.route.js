// routes/analytics.route.js
const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analytics.controller');

router.get('/worker-performance/:userid', analytics.getWorkerPerformance);
router.get('/machine-reliability', analytics.getMachineReliability);
router.get('/department-summary', analytics.getDepartmentSummary);

module.exports = router;
