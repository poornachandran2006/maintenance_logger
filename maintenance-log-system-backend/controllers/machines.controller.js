// maintenance-log-system-backend/controllers/machines.controller.js

const Machine = require("../models/machine.model");
const MaintenanceLog = require("../models/maintenance.model"); // CRITICAL: Used for cascading delete
const mongoose = require("mongoose"); 

// CREATE MACHINE
exports.createMachine = async (req, res) => {
  try {
    const doc = await Machine.create({
      name: req.body.name,
      code: req.body.code || "",
      status: req.body.status || "idle",
      location: req.body.location || "",
      last_active_at: req.body.last_active_at || null,
      createdAt: new Date(), 
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL MACHINES
exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 }).lean();
    res.json(machines);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET SINGLE MACHINE
exports.getMachineById = async (req, res) => {
    try {
   const machine = await Machine.findById(req.params.id).lean();
    if (!machine) return res.status(404).json({ error: "Machine not found" });
    res.json(machine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE MACHINE
exports.updateMachine = async (req, res) => {
  try {
    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE MACHINE (FIXED: Implements Cascading Delete)
exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid machine ID format: ${id}` });
    }

    // 1. CRITICAL: Delete ALL associated Maintenance Logs first
    const logsResult = await MaintenanceLog.deleteMany({ machine_id: id });
    console.log(`Deleted ${logsResult.deletedCount} associated maintenance logs for machine ID: ${id}`);

    // 2. Delete the machine itself
    const removed = await Machine.findByIdAndDelete(id).exec();
    
    if (!removed) {
        return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({ 
        message: 'Machine and associated logs deleted successfully',
        deletedLogsCount: logsResult.deletedCount
    });
  } catch (err) {
    console.error('deleteMachine err', err);
    res.status(500).json({ error: err.message || String(err) });
  }
};