// maintenance-log-system-backend/controllers/maintenance.controller.js

const mongoose = require('mongoose');
const MaintenanceLog = require('../models/maintenance.model'); 
const Machine = require('../models/machine.model');

// ===================================
// UTILITY HELPERS
// ===================================

// Helper function to format the log for the frontend (_id -> id, durationMinutes)
const formatLog = (log) => {
    if (!log) return null;

    // Use .toObject() if available (for Mongoose Documents), otherwise handle as plain object
    const rawLog = log.toObject ? log.toObject({ virtuals: true }) : { ...log };
    
    // Explicitly ensure machine_id is a string or null
    rawLog.machine_id = rawLog.machine_id ? rawLog.machine_id.toString() : null;
    
    // Map internal downtimeMinutes to frontend durationMinutes (for consistency)
    rawLog.durationMinutes = rawLog.downtimeMinutes; 
    
    // Ensure `id` is present
    if (!rawLog.id && rawLog._id) {
        rawLog.id = rawLog._id.toString();
    }

    // Clean up internal MongoDB keys
    delete rawLog._id;
    delete rawLog.__v;
    
    return rawLog;
};

// Helper function to validate and normalize incoming data (Prevents CastError)
const normalizeLogData = async (data) => {
    const { machine_id, reading_value, completed_at, reported_at, ...rest } = data;
    const normalized = { ...rest };

    // 1. Validate machine_id (Fixes "Cast to ObjectId failed" error)
    if (machine_id && mongoose.Types.ObjectId.isValid(machine_id)) {
        normalized.machine_id = new mongoose.Types.ObjectId(machine_id);
        
        // Look up machine_name (for denormalization)
        const machine = await Machine.findById(machine_id).select('name').lean(); 
        normalized.machine_name = machine ? machine.name : null;
        
    } else if (machine_id === "" || machine_id === null || machine_id === undefined) {
        normalized.machine_id = null;
        normalized.machine_name = null;
    } else {
        throw new Error(`Invalid machine_id provided: "${machine_id}". Must be a valid ObjectId or empty.`);
    }

    // 2. Parse reading_value safely
    if (reading_value) {
        if (typeof reading_value === 'string' && reading_value.trim()) {
            try {
                normalized.reading_value = JSON.parse(reading_value);
            } catch (e) {
                normalized.reading_value = reading_value; 
            }
        } else {
            normalized.reading_value = reading_value;
        }
    } else {
        normalized.reading_value = null;
    }
    
    // 3. Handle Dates and Status
    if (completed_at && !isNaN(new Date(completed_at).getTime())) {
        normalized.completed_at = new Date(completed_at);
    } else {
        normalized.completed_at = null;
    }

    if (reported_at && !isNaN(new Date(reported_at).getTime())) {
        normalized.reported_at = new Date(reported_at);
    } else if (!normalized.reported_at) { 
        normalized.reported_at = new Date();
    }
    
    // Update status if completed_at is provided/removed
    if (normalized.completed_at && normalized.status === 'pending') {
         normalized.status = 'completed';
    } else if (!normalized.completed_at && normalized.status === 'completed') {
        normalized.status = 'pending'; 
    }

    return normalized;
};


// ===================================
// CRUD LOGIC
// ===================================

// GET all maintenance logs (Stabilized against CastErrors/Corrupted data)
exports.getAllLogs = async (req, res) => {
    try {
        const q = {};
        if (req.query.type) q.type = req.query.type;
        if (req.query.machine_id && mongoose.Types.ObjectId.isValid(req.query.machine_id)) {
            q.machine_id = new mongoose.Types.ObjectId(req.query.machine_id);
        }
        if (req.query.reported_by) q.reported_by = req.query.reported_by;

        const docs = await MaintenanceLog.find(q)
            .sort({ reported_at: -1 })
            .exec(); 

        let formattedLogs = [];
        for (const doc of docs) {
            try {
                formattedLogs.push(formatLog(doc));
            } catch (e) {
                if (e.name === 'CastError') {
                    console.warn(`Skipping corrupted log with ID ${doc._id}: ${e.message}`);
                } else {
                    throw e; 
                }
            }
        }
        
        res.json(formattedLogs);
    } catch (error) {
        console.error('getAllLogs err', error);
        res.status(500).json({ message: 'Error fetching maintenance logs', error: error.message });
    }
};

// CREATE a new maintenance log
exports.createLog = async (req, res) => {
    try {
        const normalizedData = await normalizeLogData(req.body);
        
        const newLog = new MaintenanceLog(normalizedData);
        await newLog.save();

        res.status(201).json(formatLog(newLog));
    } catch (error) {
        if (error.message.includes('Invalid machine_id')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        console.error("Error creating maintenance log:", error);
        res.status(500).json({ message: 'Error creating maintenance log', error: error.message });
    }
};

// GET log by ID (Fixes View/Edit modal loading)
exports.getLogById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid log ID format: ${id}` });
        }
        
        const doc = await MaintenanceLog.findById(id).exec(); 
        if (!doc) return res.status(404).json({ message: 'Log not found' });
        
        res.json(formatLog(doc));
    } catch (err) {
        console.error('getLogById err', err);
        res.status(500).json({ message: 'Error fetching log', error: err.message });
    }
};

// UPDATE a maintenance log
exports.updateLog = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid log ID format: ${id}` });
        }
        
        // Fetch existing log's reported_at for accurate downtime calculation
        const existingLog = await MaintenanceLog.findById(id).select('reported_at').lean(); 
        if (!existingLog) {
            return res.status(404).json({ message: 'Log not found' });
        }

        const incomingData = { ...req.body, reported_at: existingLog.reported_at };
        const normalizedData = await normalizeLogData(incomingData);

        // Find and update the log (Mongoose Document returned)
        const updatedLog = await MaintenanceLog.findByIdAndUpdate(
            id, 
            { $set: normalizedData }, 
            { new: true, runValidators: true }
        ).exec(); 

        if (!updatedLog) return res.status(404).json({ message: 'Log not found' });
        
        res.json(formatLog(updatedLog));
    } catch (error) {
         if (error.message.includes('Invalid machine_id')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        console.error('updateLog err', error);
        res.status(500).json({ message: 'Error updating log', error: error.message });
    }
};

// DELETE a maintenance log
exports.deleteLog = async (req, res) => {
    try {
        const { id } = req.params;
         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid log ID format: ${id}` });
        }
        
        const removed = await MaintenanceLog.findByIdAndDelete(id).exec();
        
        if (!removed) return res.status(404).json({ message: 'Log not found' });
        
        res.json({ message: 'Log deleted successfully' });
    } catch (err) {
        console.error('deleteLog err', err);
        res.status(500).json({ message: 'Error deleting log', error: err.message });
    }
};