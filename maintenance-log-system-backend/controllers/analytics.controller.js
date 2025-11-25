// controllers/analytics.controller.js
const Maintenance = require('../models/maintenance.model');
const Machine = require('../models/machine.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// worker performance: simple metric -> total effective minutes vs expected
exports.getWorkerPerformance = async (req, res) => {
  try {
    const userId = req.params.userid;
    // find logs for this worker in last 30 days (or query range)
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const docs = await Maintenance.find({ reported_by: userId, reported_at: { $gte: from } }).lean().exec();

    const totalMinutes = docs.reduce((s, d) => s + (d.downtimeMinutes || (d.completed_at && d.reported_at ? Math.round((new Date(d.completed_at)-new Date(d.reported_at))/(60*1000)) : 0)), 0);

    // expected hours placeholder: 22 working days * 8 hours => 10560 minutes (customize)
    const expectedMinutes = (req.query.expectedHoursPerMonth ? Number(req.query.expectedHoursPerMonth)*60 : 22*8*60);
    const performancePercent = expectedMinutes ? Math.round((totalMinutes / expectedMinutes) * 10000)/100 : null;

    res.json({ userId, totalMinutes, expectedMinutes, performancePercent, logsCount: docs.length });
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
};

// machine reliability: uptime/downtime ratio over past X days
exports.getMachineReliability = async (req, res) => {
  try {
    const machineId = req.query.machine_id;
    const days = Number(req.query.days || 30);
    const from = new Date(); from.setDate(from.getDate() - days);

    const filter = { reported_at: { $gte: from } };
    if (machineId) filter.machine_id = mongoose.Types.ObjectId(machineId);

    const docs = await Maintenance.find(filter).lean().exec();

    const totalDowntime = docs.reduce((s, d) => s + (d.downtimeMinutes || (d.completed_at && d.reported_at ? Math.round((new Date(d.completed_at)-new Date(d.reported_at))/(60*1000)) : 0)), 0);

    // simple reliability: 1 - (downtime / (days*24*60))
    const periodMinutes = days * 24 * 60;
    const reliability = Math.max(0, Math.round((1 - (totalDowntime / periodMinutes)) * 10000)/100);

    res.json({ days, totalDowntime, reliability });
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
};

// department summary (group by department from user)
exports.getDepartmentSummary = async (req, res) => {
  try {
    const from = new Date();
    from.setDate(from.getDate() - (Number(req.query.days) || 30));
    const pipeline = [
      { $match: { reported_at: { $gte: from } } },
      { $lookup: { from: 'users', localField: 'reported_by', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: '$user.department',
        logs: { $sum: 1 },
        downtimeMinutes: { $sum: { $ifNull: ['$downtimeMinutes', 0] } }
      }},
      { $project: { department: '$_id', logs: 1, downtimeMinutes: 1, _id: 0 } }
    ];
    const report = await Maintenance.aggregate(pipeline).exec();
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
};
