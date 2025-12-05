// routes/analytics.route.js
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const analytics = require('../controllers/analytics.controller');

// Worker performance analytics (protected)
router.get('/worker-performance/:userid', auth, analytics.getWorkerPerformance);

// Machine reliability report (protected)
router.get('/machine-reliability', auth, analytics.getMachineReliability);

// Department summary report (protected)
router.get('/department-summary', auth, analytics.getDepartmentSummary);

module.exports = router;
